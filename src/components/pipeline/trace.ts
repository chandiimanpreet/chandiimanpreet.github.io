// Pure model of the simulated Natalie workflow replay (DESIGN-V2 sections 5.5 and 6).
// Labels and tech match the Natalie agentGraph in @/content/projects; trace.test.ts checks it.

export type NodeId = 'jd' | 'resume' | 'skill' | 'experience' | 'education' | 'recommendation'
export type NodeState = 'idle' | 'running' | 'failed' | 'retrying' | 'done'
export type ScenarioId = 'clean' | 'retry'
export interface PipelineNode {
  id: NodeId
  label: string
  role: string
  tech: string[]
  stage: 0 | 1 | 2
}
export interface TraceEvent {
  at: number
  node: NodeId
  type: 'start' | 'fail' | 'retry' | 'complete'
  attempt: number
}
/** `events` are sorted by `at`. */
export interface Scenario {
  id: ScenarioId
  label: string
  totalMs: number
  events: TraceEvent[]
}
export interface Span {
  node: NodeId
  attempt: number
  startMs: number
  endMs: number | null
  outcome: 'running' | 'failed' | 'done'
}
export interface RunState {
  scenario: ScenarioId
  status: 'idle' | 'running' | 'paused' | 'done'
  clockMs: number
  /** Events applied so far. */
  cursor: number
  nodes: Record<NodeId, { state: NodeState; attempt: number }>
  spans: Span[]
  log: { at: number; message: string }[]
}

const evaluator = (id: NodeId, word: string, label: string): PipelineNode => ({
  id,
  label,
  role: `Scores the candidate's ${word} against the job description.`,
  tech: ['LangGraph', 'Zod'],
  stage: 1,
})

export const NODES: Record<NodeId, PipelineNode> = {
  jd: {
    id: 'jd',
    label: 'JD extraction',
    role: 'Extracts the requirements from the job description. Runs in parallel with resume parsing.',
    tech: ['LangGraph', 'AWS Bedrock'],
    stage: 0,
  },
  resume: {
    id: 'resume',
    label: 'Resume parsing',
    role: "Parses the candidate's resume. Runs in parallel with JD extraction.",
    tech: ['LangGraph', 'AWS Bedrock'],
    stage: 0,
  },
  skill: evaluator('skill', 'skills', 'Skill evaluator'),
  experience: evaluator('experience', 'experience', 'Experience evaluator'),
  education: evaluator('education', 'education', 'Education evaluator'),
  recommendation: {
    id: 'recommendation',
    label: 'Recommendation',
    role: 'Returns an explainable shortlist or reject recommendation. Outputs are Zod-validated and the run is traced in LangSmith.',
    tech: ['Zod', 'LangSmith'],
    stage: 2,
  },
}

export const STAGES: { label: string; nodes: NodeId[] }[] = [
  { label: 'Parse (parallel)', nodes: ['jd', 'resume'] },
  { label: 'Evaluate', nodes: ['skill', 'experience', 'education'] },
  { label: 'Recommend', nodes: ['recommendation'] },
]

const ev = (at: number, node: NodeId, type: TraceEvent['type'], attempt = 1): TraceEvent => ({
  at,
  node,
  type,
  attempt,
})
const evaluate = (at: number, attempt = 1) =>
  (['skill', 'experience', 'education'] as const).map((n) => ev(at, n, 'start', attempt))
// Stable sort keeps the written order for ties (a completion before the starts it unblocks).
const byTime = (events: TraceEvent[]) => [...events].sort((a, b) => a.at - b.at)

// [CONFIRM] evaluators run concurrently (DESIGN-V2 section 10).
export const SCENARIOS: Record<ScenarioId, Scenario> = {
  clean: {
    id: 'clean',
    label: 'Clean run',
    totalMs: 4800,
    events: byTime([
      ev(0, 'jd', 'start'),
      ev(0, 'resume', 'start'),
      ev(1200, 'jd', 'complete'),
      ev(1800, 'resume', 'complete'),
      ...evaluate(1800),
      ev(3000, 'education', 'complete'),
      ev(3200, 'skill', 'complete'),
      ev(3600, 'experience', 'complete'),
      ev(3600, 'recommendation', 'start'),
      ev(4800, 'recommendation', 'complete'),
    ]),
  },
  retry: {
    id: 'retry',
    label: 'Fail one step',
    totalMs: 6200,
    events: byTime([
      ev(0, 'jd', 'start'),
      ev(0, 'resume', 'start'),
      ev(1000, 'resume', 'fail'),
      ev(1200, 'jd', 'complete'),
      ev(1900, 'resume', 'retry', 2),
      ev(3200, 'resume', 'complete', 2),
      ...evaluate(3200),
      ev(4400, 'education', 'complete'),
      ev(4600, 'skill', 'complete'),
      ev(5000, 'experience', 'complete'),
      ev(5000, 'recommendation', 'start'),
      ev(6200, 'recommendation', 'complete'),
    ]),
  },
}

const NODE_IDS = Object.keys(NODES) as NodeId[]

export function idleRun(s: ScenarioId): RunState {
  return {
    scenario: s,
    status: 'idle',
    clockMs: 0,
    cursor: 0,
    nodes: Object.fromEntries(
      NODE_IDS.map((id) => [id, { state: 'idle', attempt: 0 }]),
    ) as RunState['nodes'],
    spans: [],
    log: [],
  }
}

function message(e: TraceEvent): string {
  const label = NODES[e.node].label
  switch (e.type) {
    case 'start':
      return `${label} started.`
    case 'fail':
      return `${label} failed (simulated). Temporal retries it automatically.`
    case 'retry':
      return `${label} retrying, attempt ${e.attempt}.`
    case 'complete':
      return e.node === 'recommendation'
        ? 'Recommendation ready. Workflow completed.'
        : `${label} completed.`
  }
}

/** Applies the next event (at `cursor`); pure. */
export function applyNext(run: RunState): RunState {
  const events = SCENARIOS[run.scenario].events
  const e = events[run.cursor]
  if (!e) return run
  const opens = e.type === 'start' || e.type === 'retry'
  const state: NodeState =
    e.type === 'start'
      ? 'running'
      : e.type === 'retry'
        ? 'retrying'
        : e.type === 'fail'
          ? 'failed'
          : 'done'
  const spans = opens
    ? [
        ...run.spans,
        {
          node: e.node,
          attempt: e.attempt,
          startMs: e.at,
          endMs: null,
          outcome: 'running' as const,
        },
      ]
    : run.spans.map((s) =>
        s.node === e.node && s.endMs === null
          ? {
              ...s,
              endMs: e.at,
              outcome: e.type === 'fail' ? ('failed' as const) : ('done' as const),
            }
          : s,
      )
  const cursor = run.cursor + 1
  return {
    ...run,
    status: cursor === events.length ? 'done' : run.status,
    clockMs: Math.max(run.clockMs, e.at),
    cursor,
    nodes: { ...run.nodes, [e.node]: { state, attempt: e.attempt } },
    spans,
    log: [...run.log, { at: e.at, message: message(e) }],
  }
}

/** Pure: applies every event with `at <= toClockMs` and advances the clock (never backwards). */
export function reduce(run: RunState, toClockMs: number): RunState {
  const { events, totalMs } = SCENARIOS[run.scenario]
  let next = run
  while ((events[next.cursor]?.at ?? Infinity) <= toClockMs) next = applyNext(next)
  const clockMs = Math.min(Math.max(next.clockMs, toClockMs), totalMs)
  return clockMs === next.clockMs ? next : { ...next, clockMs }
}

export function finishedRun(s: ScenarioId): RunState {
  return reduce(idleRun(s), SCENARIOS[s].totalMs)
}
