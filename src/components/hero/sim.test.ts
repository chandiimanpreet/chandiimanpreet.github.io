import { describe, expect, it } from 'vitest'

import type { ScenarioId } from './contracts'
import { LAYOUTS } from './geometry'
import { compile, frameAt, SCENARIOS, STILL_T_MS } from './sim'

const sweep = Array.from({ length: 40000 / 50 + 1 }, (_, k) => k * 50)

describe('compile', () => {
  it.each<[ScenarioId, number]>([
    ['cache-hit', 2880],
    ['cache-miss', 3800],
    ['enqueue', 4080],
    ['workflow-retry', 7900],
  ])('%s lasts %i ms', (id, ms) => {
    expect(compile(SCENARIOS[id]).durationMs).toBe(ms)
  })

  it('only moves packets along edges that exist in both layouts', () => {
    for (const scenario of Object.values(SCENARIOS)) {
      for (const { from, to } of compile(scenario).segments) {
        for (const layout of Object.values(LAYOUTS)) {
          const edge = layout.edges[`${from}-${to}`] ?? layout.edges[`${to}-${from}`]
          expect(edge, `${scenario.id}: ${from}-${to}`).toBeDefined()
        }
      }
    }
  })
})

describe('frameAt', () => {
  it('is deterministic, caps packets at 8 and the log at 3 lines', () => {
    for (const t of sweep) {
      const frame = frameAt(t)
      expect(frameAt(t)).toEqual(frame)
      expect(frame.packets.length).toBeLessThanOrEqual(8)
      expect(frame.log.length).toBeLessThanOrEqual(3)
    }
  })

  it('keeps every log line short enough for the 320px trace log', () => {
    for (const t of sweep)
      for (const l of frameAt(t).log)
        expect(`${l.traceId} ${l.text}`.length).toBeLessThanOrEqual(36)
  })

  it('shows the workflow failing, backing off, then succeeding in the retry run', () => {
    // Run 2 is the first workflow-retry; it starts at 2 * 2200.
    const states: string[] = []
    for (let t = 4400; t < 4400 + 9000; t += 10) {
      const s = frameAt(t).nodes.workflow
      if ((s === 'failed' || s === 'backoff' || s === 'ok') && states.at(-1) !== s) states.push(s)
    }
    expect(states).toEqual(['failed', 'backoff', 'ok'])
  })

  it('tells the retry story in the reduced-motion still frame', () => {
    const frame = frameAt(STILL_T_MS)
    expect(frame.packets.some((p) => p.kind === 'retry')).toBe(true)
    expect(frame.nodes.api).toBe('active')
    expect(frame.tags.workflow).toBe('attempt 2')
    const failed = frame.log.findIndex((l) => l.tone === 'failed')
    expect(failed).toBeGreaterThanOrEqual(0)
    expect(failed).toBeLessThan(frame.log.length - 1)
  })
})
