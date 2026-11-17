import { useCallback, useEffect, useState } from 'react'

import { prefersReducedMotion } from './motionPreference'
import { applyNext, finishedRun, idleRun, reduce, type RunState, type ScenarioId } from './trace'

export interface TraceRun extends RunState {
  play(): void
  pause(): void
  step(): void
  reset(): void
  setScenario(s: ScenarioId): void
}

/**
 * Replay state plus stable controls. While running it sets state once per frame, but `reduce`
 * keeps `nodes`, `spans` and `log` referentially equal between events, so memoised consumers
 * of those props re-render only when an event lands (trace.test.ts checks this).
 */
export function useTraceRun(initial: ScenarioId = 'retry'): TraceRun {
  const [run, setRun] = useState(() => finishedRun(initial))
  const running = run.status === 'running'

  // One rAF loop, alive only while running. Ends on pause/done (status change), unmount, or hidden tab.
  useEffect(() => {
    if (!running) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      const dt = last === null ? 0 : now - last
      last = now
      setRun((r) => (r.status === 'running' ? reduce(r, r.clockMs + dt) : r))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const onVisibility = () => {
      if (document.hidden) setRun((r) => (r.status === 'running' ? { ...r, status: 'paused' } : r))
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [running])

  const play = useCallback(() => {
    setRun((r) => {
      if (r.status === 'running') return r
      if (prefersReducedMotion()) return finishedRun(r.scenario)
      return { ...(r.status === 'paused' ? r : idleRun(r.scenario)), status: 'running' }
    })
  }, [])
  const pause = useCallback(() => {
    setRun((r) => (r.status === 'running' ? { ...r, status: 'paused' } : r))
  }, [])
  const step = useCallback(() => {
    setRun((r) => {
      const from = r.status === 'done' ? idleRun(r.scenario) : r
      const next = applyNext(from)
      return next.status === 'done' ? next : { ...next, status: 'paused' }
    })
  }, [])
  const reset = useCallback(() => setRun((r) => finishedRun(r.scenario)), [])
  const setScenario = useCallback((s: ScenarioId) => setRun(finishedRun(s)), [])

  return { ...run, play, pause, step, reset, setScenario }
}
