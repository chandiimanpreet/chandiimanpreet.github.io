// Status-code tokens and the log-tail ticker drawn over the binary rain. Pure: randomness is injected, no DOM.
// Times are in rain steps (STEP_MS = 50ms).

import { seeded, type RainConfig } from './rain'

/** A token is redrawn for 1.2s, then left to the rain's trail fade and cell expiry. */
export const TOKEN_HOLD_STEPS = 24
/** A failed request (429 / 5xx) is retried at the same cell 1.4s later, and the retry succeeds. */
export const RETRY_STEPS = 28
/** One log line per 1.6s. */
export const TICKER_STEPS = 32
const TICKER_FADE_STEPS = 4
/** Viewport from which the hero is two columns (Tailwind `xl`); also where the ticker has a free strip. */
export const WIDE_VIEWPORT = 1280
export const MOBILE_VIEWPORT = 640
/** Header plus its top fade. */
const TOP_CLEAR = 120
/** The hero's 96px bottom fade, which the ticker line straddles. */
const BOTTOM_CLEAR = 104
/**
 * Two columns: the text column is the left half (its right edge sits at `width / 2 - 119px` once the container is
 * centred, so a fixed 42% would reach under the chips from about 1600px). Stacked: the text is the top half.
 */
const WIDE_CLEAR_LEFT = 0.5
const STACKED_CLEAR_TOP = 0.55
const TICKER_LEFT = 0.56

/** Weighted towards 2xx; 500 and 503 are rare. Weights sum to 100. */
const CODES: readonly (readonly [string, number])[] = [
  ['200', 40],
  ['201', 12],
  ['202', 14],
  ['204', 10],
  ['301', 5],
  ['404', 7],
  ['429', 5],
  ['500', 3],
  ['503', 4],
]

export interface StatusToken {
  /** Three digits, one per cell. */
  code: string
  /** Leftmost cell of the token. */
  column: number
  row: number
  /** Step at which the token appears. */
  start: number
}

export interface TokenState {
  step: number
  next: number
  /** Live and pending tokens; bounded by the spawn interval (at most about three at once). */
  tokens: StatusToken[]
}

/** Cells a token may start in (inclusive), or null when nothing is free. */
export interface TokenArea {
  minColumn: number
  maxColumn: number
  minRow: number
  maxRow: number
}

export const isFailure = (code: string) => code === '429' || code.startsWith('5')

export function tokenArea(cfg: RainConfig, w: number, h: number, viewportW = w): TokenArea | null {
  const { cell } = cfg
  const wide = viewportW >= WIDE_VIEWPORT
  const area = {
    minColumn: wide ? Math.ceil((w * WIDE_CLEAR_LEFT) / cell) : 0,
    maxColumn: Math.floor(w / cell) - 3,
    minRow: Math.ceil(Math.max(TOP_CLEAR, wide ? 0 : h * STACKED_CLEAR_TOP) / cell),
    maxRow: Math.floor((h - BOTTOM_CLEAR) / cell) - 1,
  }
  return area.maxColumn >= area.minColumn && area.maxRow >= area.minRow ? area : null
}

/** Steps until the next event: 1.5 to 2.5s, or 3 to 5s on a phone. */
const rollInterval = (rand: () => number, mobile: boolean) =>
  Math.round((mobile ? 60 : 30) * (1 + (rand() * 2) / 3))

export function createTokens(rand: () => number, mobile = false): TokenState {
  return { step: 0, next: rollInterval(rand, mobile), tokens: [] }
}

export function pickCode(rand: () => number): string {
  let r = rand() * 100
  for (const [code, weight] of CODES) {
    r -= weight
    if (r < 0) return code
  }
  return '200'
}

export function placeToken(area: TokenArea, rand: () => number): { column: number; row: number } {
  return {
    column: area.minColumn + Math.floor(rand() * (area.maxColumn - area.minColumn + 1)),
    row: area.minRow + Math.floor(rand() * (area.maxRow - area.minRow + 1)),
  }
}

/** Advances one step (mutates `state`): drops finished tokens and spawns the next event when it is due. */
export function stepTokens(
  state: TokenState,
  area: TokenArea | null,
  rand: () => number,
  mobile = false,
): void {
  const step = ++state.step
  const { tokens } = state
  let n = 0
  for (const t of tokens) if (t.start + TOKEN_HOLD_STEPS > step) tokens[n++] = t
  tokens.length = n
  if (step < state.next) return
  state.next = step + rollInterval(rand, mobile)
  if (!area) return
  const code = pickCode(rand)
  const at = placeToken(area, rand)
  tokens.push({ code, ...at, start: step })
  if (isFailure(code)) tokens.push({ code: '200', ...at, start: step + RETRY_STEPS })
}

/**
 * Where the ticker sits: right of the scroll cue, at the top edge of the bottom fade (any lower and the fade hides
 * it; any higher and it crowds the diagram's trace log at 1280x720). Two-column hero only: when stacked, the
 * diagram runs into the bottom fade and there is no free strip.
 */
export function tickerSlot(
  w: number,
  h: number,
  viewportW = w,
): { x: number; y: number; maxWidth: number } | null {
  if (viewportW < WIDE_VIEWPORT) return null
  const x = Math.round(w * TICKER_LEFT)
  return { x, y: h - 100, maxWidth: Math.min(w * 0.7, w - x - 24) }
}

const LOG: readonly ((id: number) => string)[] = [
  () => 'INFO  POST /v1/jobs 202 queued',
  (id) => `INFO  worker.dequeue job ${id}`,
  () => 'WARN  agent.call timeout, retry 1/3',
  () => 'INFO  agent.call ok, attempt 2',
  () => 'INFO  workflow.job.process completed',
  (id) => `INFO  GET /v1/jobs/${id} 200 cache miss`,
  (id) => `INFO  GET /v1/jobs/${id} 200 cache hit`,
]

/** Log line shown at `step`; one pass of the pool follows one decorative job id. */
export function tickerLine(step: number): string {
  const index = Math.floor(step / TICKER_STEPS)
  const cycle = Math.floor(index / LOG.length)
  const id = 100 + Math.floor(seeded(cycle + 1)() * 900)
  return LOG[index % LOG.length]?.(id) ?? ''
}

/** Opacity multiplier for the ticker: a short fade in and out around each line. */
export function tickerFade(step: number): number {
  const k = step % TICKER_STEPS
  return Math.min(1, (k + 1) / TICKER_FADE_STEPS, (TICKER_STEPS - k) / TICKER_FADE_STEPS)
}
