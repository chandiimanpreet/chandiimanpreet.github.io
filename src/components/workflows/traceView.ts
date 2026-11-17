import type { NodeId, RunState, Span } from '@/components/pipeline/trace'

/** Replay clock as mm:ss.t, e.g. 3200 -> "00:03.2". Replay time only, never a production figure. */
export function formatReplayClock(ms: number): string {
  const tenths = Math.floor(Math.max(0, ms) / 100)
  const mm = String(Math.floor(tenths / 600)).padStart(2, '0')
  const ss = String(Math.floor(tenths / 10) % 60).padStart(2, '0')
  return `${mm}:${ss}.${tenths % 10}`
}

/**
 * The Run button changes its label instead of using aria-pressed (DESIGN-V2 section 8).
 * `touched` separates the default finished view ("Run trace") from a run the visitor finished.
 */
export function runLabel(status: RunState['status'], touched: boolean): string {
  if (status === 'running') return 'Pause'
  if (status === 'paused') return 'Resume'
  return status === 'done' && touched ? 'Run again' : 'Run trace'
}

/** How many attempts of a step failed so far. */
export function failedAttempts(spans: Span[], node: NodeId): number {
  return spans.filter((s) => s.node === node && s.outcome === 'failed').length
}

/**
 * Live-region text: every entry `log` added on top of `prev` (several events can share a frame),
 * or only the newest entry when `log` is a different run (reset, scenario switch).
 */
export function announcement(prev: RunState['log'], log: RunState['log']): string {
  const continues =
    log.length > prev.length && (prev.length === 0 || log[prev.length - 1] === prev.at(-1))
  return (continues ? log.slice(prev.length) : log.slice(-1)).map((e) => e.message).join(' ')
}
