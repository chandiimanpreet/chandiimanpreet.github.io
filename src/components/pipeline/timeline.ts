// Pure geometry for WorkflowTimeline, kept out of the component file so it can be tested
// (and so the component file exports only components, for fast refresh).

const clampPct = (n: number) => Math.min(100, Math.max(0, n))

/** Percent of `totalMs` at `ms`, clamped to 0..100. 0 when `totalMs` is not positive. */
export function pct(ms: number, totalMs: number): number {
  return totalMs > 0 ? clampPct((ms / totalMs) * 100) : 0
}

/** Bar placement in percent of `totalMs`. A running span (`endMs === null`) reaches `clockMs`. */
export function barGeometry(
  startMs: number,
  endMs: number | null,
  clockMs: number,
  totalMs: number,
): { left: number; width: number } {
  const left = pct(startMs, totalMs)
  const right = pct(endMs ?? Math.max(startMs, clockMs), totalMs)
  return { left, width: Math.max(0, right - left) }
}

/** Replay milliseconds as seconds with one decimal: 1900 -> "1.9s". */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}
