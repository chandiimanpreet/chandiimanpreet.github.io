import type {
  EdgeId,
  Frame,
  Hop,
  LogEvent,
  LogLine,
  NodeId,
  NodeState,
  PacketFrame,
  Pulse,
  Scenario,
  ScenarioId,
  Segment,
  Timeline,
} from './contracts'
import { LAYOUTS } from './geometry'

// Timing constants from DESIGN-V3 section 5.5 (ms).
const TRAVEL = 340
const RETURN = 200
export const SPAWN = 2200
const FAIL_HOLD = 300
const BACKOFF = 900
const FLASH = 400
const TAG_LINGER = 400

const WORK: Record<NodeId, number> = {
  client: 0,
  gateway: 140,
  auth: 200,
  api: 240,
  cache: 140,
  queue: 180,
  worker: 300,
  workflow: 260,
  agent: 640,
  db: 380,
}

/** Picked so the reduced-motion frame tells the whole retry story (pinned by sim.test.ts). */
export const STILL_T_MS = 10300

export const SEQUENCE: readonly ScenarioId[] = [
  'cache-miss',
  'cache-hit',
  'workflow-retry',
  'cache-hit',
  'enqueue',
  'cache-miss',
]

const INGRESS: readonly Hop[] = [
  { to: 'gateway', kind: 'request' },
  { to: 'auth', kind: 'request' },
  { to: 'api', kind: 'request' },
]
const EGRESS: readonly Hop[] = [
  { to: 'auth', kind: 'response' },
  { to: 'gateway', kind: 'response' },
  { to: 'client', kind: 'response' },
]
const ENQUEUE: readonly Hop[] = [
  ...INGRESS,
  { to: 'queue', kind: 'request', tag: 'queued' },
  { to: 'api', kind: 'response' },
  ...EGRESS,
]
const FORK_AT_QUEUE = { track: 0, afterHop: INGRESS.length }
const TO_WORKFLOW: readonly Hop[] = [
  { to: 'worker', kind: 'event' },
  { to: 'workflow', kind: 'event' },
]
const COMMIT: Hop = { to: 'db', kind: 'event', tag: 'commit', result: 'ok' }

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  'cache-hit': {
    id: 'cache-hit',
    tracks: [
      {
        from: 'client',
        hops: [
          ...INGRESS,
          { to: 'cache', kind: 'request', tag: 'HIT', result: 'ok' },
          { to: 'api', kind: 'response' },
          ...EGRESS,
        ],
      },
    ],
  },
  'cache-miss': {
    id: 'cache-miss',
    tracks: [
      {
        from: 'client',
        hops: [
          ...INGRESS,
          { to: 'cache', kind: 'request', tag: 'MISS' },
          { to: 'api', kind: 'response' },
          { to: 'db', kind: 'request', tag: 'read' },
          { to: 'api', kind: 'response' },
          ...EGRESS,
        ],
      },
    ],
  },
  enqueue: {
    id: 'enqueue',
    tracks: [
      { from: 'client', hops: ENQUEUE },
      { from: 'queue', forkFrom: FORK_AT_QUEUE, hops: [...TO_WORKFLOW, COMMIT] },
    ],
  },
  'workflow-retry': {
    id: 'workflow-retry',
    tracks: [
      { from: 'client', hops: ENQUEUE },
      {
        from: 'queue',
        forkFrom: FORK_AT_QUEUE,
        hops: [
          ...TO_WORKFLOW,
          { to: 'agent', kind: 'event', result: 'failed', tag: 'timeout ✕' },
          {
            to: 'workflow',
            kind: 'response',
            holds: [
              { state: 'failed', ms: FAIL_HOLD, tag: 'attempt 1 ✕' },
              { state: 'backoff', ms: BACKOFF, tag: 'backoff' },
            ],
          },
          // A retry hop's tag belongs to the node that retries (see compile).
          { to: 'agent', kind: 'retry', tag: 'attempt 2' },
          { to: 'workflow', kind: 'response', work: WORK.workflow },
          COMMIT,
        ],
      },
    ],
  },
}

/**
 * Lays hops end to end: travel, then work on arrival, then the result flash and any holds.
 * Tags sit on the work pulse, except a failure's tag, which sits on the failed flash it explains.
 * Two rules from the spec go beyond single hops: the workflow stays active from first arrival
 * to final departure, and a retrying node shows the retry's tag until that departure, then
 * flashes ok with the tag plus a check mark when its track completes.
 */
export function compile(s: Scenario): Timeline {
  const segments: Segment[] = []
  const pulses: Pulse[] = []
  const events: LogEvent[] = []
  const hopEnds: number[][] = []
  const retries: { node: NodeId; startMs: number; tag: string; track: number }[] = []
  const trackEnds: number[] = []

  s.tracks.forEach((track, k) => {
    const fork = track.forkFrom
    let t = fork ? (hopEnds[fork.track]?.[fork.afterHop] ?? 0) : 0
    let at = track.from
    const ends: number[] = []
    for (const hop of track.hops) {
      const travel = hop.kind === 'response' ? RETURN : TRAVEL
      segments.push({
        from: at,
        to: hop.to,
        kind: hop.kind,
        startMs: t,
        endMs: t + travel,
        track: k,
      })
      if (hop.kind === 'retry' && hop.tag)
        retries.push({ node: at, startMs: t, tag: hop.tag, track: k })
      t += travel

      const work = hop.work ?? (hop.kind === 'response' ? 0 : WORK[hop.to])
      const workTag = hop.result === 'failed' || hop.kind === 'retry' ? undefined : hop.tag
      if (work > 0) pulses.push(pulse(hop.to, 'active', t, t + work, workTag))
      t += work

      if (hop.result) {
        pulses.push(
          pulse(hop.to, hop.result, t, t + FLASH, hop.result === 'failed' ? hop.tag : undefined),
        )
        if (hop.result === 'failed') events.push({ atMs: t, kind: 'failed' })
      }
      for (const hold of hop.holds ?? []) {
        pulses.push(pulse(hop.to, hold.state, t, t + hold.ms, hold.tag))
        t += hold.ms
      }
      ends.push(t)
      at = hop.to
    }
    hopEnds.push(ends)
    trackEnds.push(t)
    if (track.hops.length > 0)
      events.push({ atMs: t, kind: at === 'client' ? 'response' : 'completed' })
  })

  const lastDeparture = (node: NodeId) =>
    Math.max(...segments.filter((g) => g.from === node).map((g) => g.startMs))
  const arrivals = segments.filter((g) => g.to === 'workflow').map((g) => g.endMs)
  if (arrivals.length > 0) {
    pulses.push(pulse('workflow', 'active', Math.min(...arrivals), lastDeparture('workflow')))
  }
  for (const r of retries) {
    pulses.push(pulse(r.node, 'active', r.startMs, lastDeparture(r.node), r.tag))
    const end = trackEnds[r.track] ?? 0
    pulses.push(pulse(r.node, 'ok', end, end + FLASH, `${r.tag} ✓`))
  }

  events.sort((a, b) => a.atMs - b.atMs)
  return { durationMs: Math.max(0, ...trackEnds), segments, pulses, events }
}

function pulse(
  node: NodeId,
  state: NodeState,
  startMs: number,
  endMs: number,
  tag?: string,
): Pulse {
  return { node, state, startMs, endMs, tag }
}

export const TIMELINES: Record<ScenarioId, Timeline> = {
  'cache-hit': compile(SCENARIOS['cache-hit']),
  'cache-miss': compile(SCENARIOS['cache-miss']),
  enqueue: compile(SCENARIOS.enqueue),
  'workflow-retry': compile(SCENARIOS['workflow-retry']),
}

// With durations under 8s and a spawn every 2.2s, runs older than this have
// nothing alive and at least three newer log events, so they can be skipped.
const LOOKBACK_RUNS = 10

const PRIORITY: Record<NodeState, number> = { idle: 0, ok: 1, active: 2, backoff: 3, failed: 4 }

const NODE_IDS = Object.keys(LAYOUTS.wide.nodes) as NodeId[]

function edgeId(a: NodeId, b: NodeId): EdgeId {
  return LAYOUTS.wide.edges[`${a}-${b}`] ? `${a}-${b}` : `${b}-${a}`
}

function easeInOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

// Lines stay short enough to fit untruncated in the tall layout's log at 320px (about 37 characters with the id).
function logText(id: ScenarioId, kind: LogEvent['kind'], i: number) {
  const ms = { 'cache-hit': 3, 'cache-miss': 17, enqueue: 6, 'workflow-retry': 6 }[id] + (i % 3)
  const n = 100 + ((i * 37) % 900)
  const retry = id === 'workflow-retry'
  if (kind === 'failed') return { text: 'job attempt 1 failed, retrying', tone: 'failed' as const }
  if (kind === 'completed') {
    return {
      text: `job ${retry ? 'attempt 2 ' : ''}completed`,
      status: 'completed',
      tone: 'ok' as const,
    }
  }
  if (id === 'cache-hit' || id === 'cache-miss') {
    const outcome = id === 'cache-hit' ? 'hit' : 'miss'
    return {
      text: `GET /v1/jobs/${n} 200 ${outcome} ${ms}ms`,
      status: '200',
      tone: 'info' as const,
    }
  }
  return { text: `POST /v1/jobs 202 queued ${ms}ms`, status: '202', tone: 'info' as const }
}

export function frameAt(tMs: number): Frame {
  const nodes = Object.fromEntries(NODE_IDS.map((id) => [id, 'idle'])) as Record<NodeId, NodeState>
  const tags: Partial<Record<NodeId, string>> = {}
  const tagStart: Partial<Record<NodeId, number>> = {}
  const packets: PacketFrame[] = []
  const edges = new Set<EdgeId>()
  const log: { atMs: number; line: LogLine }[] = []

  const newest = tMs < 0 ? -1 : Math.floor(tMs / SPAWN)
  for (let i = Math.max(0, newest - LOOKBACK_RUNS); i <= newest; i++) {
    const id = SEQUENCE[i % SEQUENCE.length] ?? 'cache-hit'
    const start = i * SPAWN
    const local = tMs - start
    const timeline = TIMELINES[id]
    const traceId = (((i + 1) * 40503) & 0xffff).toString(16).padStart(4, '0')

    timeline.segments.forEach((g, j) => {
      if (local < g.startMs || local >= g.endMs) return
      const progress = easeInOut((local - g.startMs) / (g.endMs - g.startMs))
      packets.push({ key: `${i}.${j}`, from: g.from, to: g.to, progress, kind: g.kind })
      edges.add(edgeId(g.from, g.to))
    })

    for (const p of timeline.pulses) {
      if (local >= p.startMs && local < p.endMs && PRIORITY[p.state] > PRIORITY[nodes[p.node]]) {
        nodes[p.node] = p.state
      }
      const absStart = start + p.startMs
      if (p.tag !== undefined && local >= p.startMs && local < p.endMs + TAG_LINGER) {
        // The most recently started tag wins, so a new state's tag replaces a lingering one.
        if (absStart >= (tagStart[p.node] ?? -Infinity)) {
          tags[p.node] = p.tag
          tagStart[p.node] = absStart
        }
      }
    }

    timeline.events.forEach((e, j) => {
      if (e.atMs > local) return
      log.push({
        atMs: start + e.atMs,
        line: { key: `${i}.${j}`, traceId, ...logText(id, e.kind, i) },
      })
    })
  }

  log.sort((a, b) => a.atMs - b.atMs)
  return {
    packets,
    nodes,
    tags,
    edges: [...edges],
    log: log.slice(-3).map((e) => e.line),
  }
}
