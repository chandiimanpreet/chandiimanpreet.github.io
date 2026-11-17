// Binary rain model (docs/DESIGN-V3.md section 6). Pure: randomness is injected, no DOM.

export const STEP_MS = 50
export const STILL_STEPS = 160
export const STILL_SEED = 0x5eed
export const TRAIL_ALPHA = 0.1
/**
 * Steps after which a cell is repainted with solid background. A 10% fade stalls a few 8-bit levels
 * above the background and would leave a faint static 0/1 lattice; by 40 steps (2s) a glyph is at
 * 0.9^40 = 1.5%, so the repaint is invisible.
 */
export const FADE_STEPS = 40
const EMPTY = 255

const MAX_COLUMNS = 120
const MAX_PIXELS = 4_000_000
const MAX_DPR = 2
const SHIMMER_CHANCE = 0.02
const SHIMMER_ROWS = 6
const SPEED_MIN = 0.25
const SPEED_MAX = 0.6
const POINTER_RADIUS = 72
const POINTER_BOOST = 1.8

export interface RainConfig {
  /** Cell size in CSS px; the glyph is `cell - 2` px. */
  cell: number
  columns: number
  rows: number
}

export interface RainColumns {
  /** Head row per column (fractional; negative = above the top). */
  heads: number[]
  /** Rows per step per column. */
  speeds: number[]
  /** Row of the glyph drawn as a head on the last step, or -1. */
  lastHead: number[]
  /** Bit currently shown in each cell, row-major. */
  bits: Uint8Array
  /** Steps since each cell was drawn, row-major; 255 = empty. */
  age: Uint8Array
}

/** One fillText: `head` picks `--rain-head`, otherwise `--rain`. */
export interface RainDraw {
  column: number
  row: number
  bit: number
  head: boolean
}

export function rainConfig(w: number, h: number, viewportW = w): RainConfig {
  let cell = viewportW >= 640 ? 16 : 14
  let columns = Math.ceil(w / cell)
  if (columns > MAX_COLUMNS) {
    columns = MAX_COLUMNS
    cell = w / MAX_COLUMNS
  }
  return { cell, columns, rows: Math.ceil(h / cell) }
}

const rollSpeed = (rand: () => number) => SPEED_MIN + rand() * (SPEED_MAX - SPEED_MIN)
const rollStart = (rows: number, rand: () => number) => -rand() * rows

export function createColumns(cfg: RainConfig, rand: () => number): RainColumns {
  const heads: number[] = []
  const speeds: number[] = []
  for (let c = 0; c < cfg.columns; c++) {
    heads.push(rollStart(cfg.rows, rand))
    speeds.push(rollSpeed(rand))
  }
  return {
    heads,
    speeds,
    lastHead: heads.map(() => -1),
    bits: new Uint8Array(cfg.columns * cfg.rows),
    age: new Uint8Array(cfg.columns * cfg.rows).fill(EMPTY),
  }
}

/** Advances every column one step (mutates `cols`) and returns the glyphs to draw this step. */
export function stepColumns(
  cols: RainColumns,
  cfg: RainConfig,
  rand: () => number,
  boost?: (column: number) => number,
): RainDraw[] {
  const draws: RainDraw[] = []
  const { heads, speeds, lastHead, bits, age } = cols
  const emit = (d: RainDraw) => {
    draws.push(d)
    age[d.row * cfg.columns + d.column] = 0
  }
  for (let c = 0; c < cfg.columns; c++) {
    const prev = lastHead[c] ?? -1
    if (prev >= 0) {
      emit({ column: c, row: prev, bit: bits[prev * cfg.columns + c] ?? 0, head: false })
      lastHead[c] = -1
    }

    const before = Math.floor(heads[c] ?? 0)
    const head = (heads[c] ?? 0) + (speeds[c] ?? 0) * (boost?.(c) ?? 1)
    const row = Math.floor(head)
    if (row >= cfg.rows) {
      heads[c] = rollStart(cfg.rows, rand)
      speeds[c] = rollSpeed(rand)
      continue
    }
    heads[c] = head

    if (row > before && row >= 0) {
      const bit = rand() < 0.5 ? 0 : 1
      bits[row * cfg.columns + c] = bit
      emit({ column: c, row, bit, head: true })
      lastHead[c] = row
    }

    if (rand() < SHIMMER_CHANCE) {
      const r = row - 1 - Math.floor(rand() * SHIMMER_ROWS)
      if (r >= 0) {
        const i = r * cfg.columns + c
        const bit = bits[i] ? 0 : 1
        bits[i] = bit
        emit({ column: c, row: r, bit, head: false })
      }
    }
  }
  return draws
}

/** Ages every drawn cell one step; returns the cells (row-major index) that just faded out and must be cleared. */
export function expireCells(cols: RainColumns): number[] {
  const { age } = cols
  const out: number[] = []
  for (let i = 0; i < age.length; i++) {
    const a = age[i] ?? EMPTY
    if (a === EMPTY) continue
    if (a + 1 >= FADE_STEPS) {
      age[i] = EMPTY
      out.push(i)
    } else age[i] = a + 1
  }
  return out
}

/** Speed multiplier per column for a pointer at `x` (canvas px), or none without a pointer. */
export function pointerBoost(
  cfg: RainConfig,
  x: number | null,
): ((column: number) => number) | undefined {
  if (x === null) return undefined
  return (c) => (Math.abs((c + 0.5) * cfg.cell - x) <= POINTER_RADIUS ? POINTER_BOOST : 1)
}

/** Backing-store scale: DPR capped at 2, then lowered so the canvas stays within 4,000,000 pixels. */
export function canvasScale(w: number, h: number, dpr: number): number {
  const scale = Math.min(dpr, MAX_DPR)
  const area = w * h
  return area * scale * scale > MAX_PIXELS ? Math.sqrt(MAX_PIXELS / area) : scale
}

/** mulberry32: small seeded generator so the reduced-motion still frame is the same every visit. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
