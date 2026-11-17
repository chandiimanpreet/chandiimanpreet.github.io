import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { projects } from '@/content/projects'
import {
  NODES,
  SCENARIOS,
  STAGES,
  finishedRun,
  idleRun,
  reduce,
  type NodeId,
  type ScenarioId,
} from './trace'
import { useTraceRun } from './useTraceRun'

const ids = Object.keys(NODES) as NodeId[]
const scenarios = Object.keys(SCENARIOS) as ScenarioId[]

describe('trace model', () => {
  it('finished retry run: every step done, resume on attempt 2, exactly one failed span', () => {
    const run = finishedRun('retry')
    expect(run.status).toBe('done')
    expect(run.clockMs).toBe(6200)
    for (const id of ids) expect(run.nodes[id].state).toBe('done')
    expect(run.nodes.resume.attempt).toBe(2)
    expect(run.spans.filter((s) => s.outcome === 'failed')).toEqual([
      { node: 'resume', attempt: 1, startMs: 0, endMs: 1000, outcome: 'failed' },
    ])
    expect(run.log.at(-1)?.message).toBe('Recommendation ready. Workflow completed.')
  })

  it('clean run has no failed span and every step done on attempt 1', () => {
    const run = finishedRun('clean')
    expect(run.spans.some((s) => s.outcome === 'failed')).toBe(false)
    for (const id of ids) expect(run.nodes[id]).toEqual({ state: 'done', attempt: 1 })
  })

  it.each(scenarios)('%s: events sorted, last at totalMs', (s) => {
    const { events, totalMs } = SCENARIOS[s]
    expect(events.map((e) => e.at)).toEqual([...events.map((e) => e.at)].sort((a, b) => a - b))
    expect(events.at(-1)?.at).toBe(totalMs)
  })

  it.each(scenarios)('%s: reduce is pure and idempotent for the same clock', (s) => {
    for (const t of [0, 999, 1000, 1900, 3200, 5000, 99_999]) {
      const idle = idleRun(s)
      const snapshot = structuredClone(idle)
      const once = reduce(idle, t)
      expect(idle).toEqual(snapshot)
      expect(reduce(once, t)).toEqual(once)
      expect(reduce(idleRun(s), t)).toEqual(once)
    }
  })

  it.each(scenarios)('%s: spans never overlap per node, at any clock', (s) => {
    for (let t = 0; t <= SCENARIOS[s].totalMs; t += 100) {
      const { spans } = reduce(idleRun(s), t)
      for (const id of ids) {
        const mine = spans.filter((sp) => sp.node === id)
        expect(mine.filter((sp) => sp.endMs === null).length).toBeLessThanOrEqual(1)
        mine.slice(1).forEach((cur, i) => {
          const prev = mine[i]
          expect(prev?.endMs ?? Infinity).toBeLessThanOrEqual(cur.startMs)
          expect(cur.attempt).toBe((prev?.attempt ?? 0) + 1)
        })
      }
    }
  })

  it('stays consistent with the Natalie agentGraph and stack', () => {
    const natalie = projects.find((p) => p.id === 'natalie')
    const graphLabels = natalie?.agentGraph?.nodes.map((n) => n.label) ?? []
    expect(graphLabels.length).toBeGreaterThan(0)
    for (const id of ids) {
      for (const t of NODES[id].tech) expect(natalie?.stack).toContain(t)
      if (id !== 'recommendation')
        expect(graphLabels.some((l) => l.startsWith(NODES[id].label))).toBe(true)
    }
    expect(STAGES.flatMap((st) => st.nodes).sort()).toEqual([...ids].sort())
    for (const st of STAGES)
      for (const id of st.nodes) expect(NODES[id].stage).toBe(STAGES.indexOf(st))
  })

  // The memo boundary in AgentsSection relies on this: a frame with no event keeps the
  // nodes/spans/log references, so memoised PipelineGraph and TraceLog skip the re-render.
  it('keeps nodes, spans and log identity when the clock moves without an event', () => {
    const a = reduce(idleRun('clean'), 100)
    const b = reduce(a, 200)
    expect(b.clockMs).toBe(200)
    expect(b.nodes).toBe(a.nodes)
    expect(b.spans).toBe(a.spans)
    expect(b.log).toBe(a.log)
    expect(reduce(b, 1200).nodes).not.toBe(b.nodes) // JD extraction completes at 1200
  })
})

describe('useTraceRun', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('starts on the finished retry run', () => {
    const { result } = renderHook(() => useTraceRun())
    expect(result.current.status).toBe('done')
    expect(result.current.scenario).toBe('retry')
    expect(result.current.cursor).toBe(SCENARIOS.retry.events.length)
  })

  it('step() advances exactly one event, even when events share a timestamp', () => {
    const { result } = renderHook(() => useTraceRun())
    act(() => result.current.step())
    expect(result.current.cursor).toBe(1)
    expect(result.current.status).toBe('paused')
    act(() => result.current.step())
    expect(result.current.cursor).toBe(2) // both events at 0ms, applied one at a time
    expect(result.current.log).toHaveLength(2)
  })

  it('reset and setScenario return to the finished state', () => {
    const { result } = renderHook(() => useTraceRun())
    act(() => result.current.step())
    act(() => result.current.setScenario('clean'))
    expect(result.current).toMatchObject(finishedRun('clean'))
    act(() => result.current.step())
    act(() => result.current.reset())
    expect(result.current).toMatchObject(finishedRun('clean'))
  })

  it('plays on one rAF loop, pauses, finishes, and cancels its frame on unmount', () => {
    vi.useFakeTimers()
    const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame')
    const { result, unmount } = renderHook(() => useTraceRun('clean'))

    act(() => result.current.play())
    expect(result.current.status).toBe('running')
    expect(result.current.cursor).toBe(0)
    act(() => vi.advanceTimersByTime(1500))
    expect(result.current.clockMs).toBeGreaterThan(1000)
    expect(result.current.nodes.jd.state).toBe('done')

    act(() => result.current.pause())
    const pausedAt = result.current.clockMs
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.clockMs).toBe(pausedAt)
    expect(vi.getTimerCount()).toBe(0)

    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.status).toBe('done')
    expect(vi.getTimerCount()).toBe(0)

    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(100))
    expect(vi.getTimerCount()).toBe(1)
    cancel.mockClear()
    unmount()
    expect(cancel).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pauses when the document becomes hidden', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTraceRun())
    act(() => result.current.play())
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    hidden.mockRestore()
    expect(result.current.status).toBe('paused')
    expect(vi.getTimerCount()).toBe(0)
  })
})
