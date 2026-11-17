import { describe, expect, it } from 'vitest'

import {
  createTokens,
  isFailure,
  pickCode,
  RETRY_STEPS,
  stepTokens,
  TICKER_STEPS,
  tickerFade,
  tickerLine,
  tickerSlot,
  tokenArea,
  TOKEN_HOLD_STEPS,
  type StatusToken,
} from './events'
import { rainConfig, seeded } from './rain'

/** Every token ever spawned over `steps` steps. */
function run(seed: number, steps: number, w = 1440, h = 900, viewportW = w) {
  const cfg = rainConfig(w, h, viewportW)
  const area = tokenArea(cfg, w, h, viewportW)
  const rand = seeded(seed)
  const mobile = viewportW < 640
  const state = createTokens(rand, mobile)
  const seen = new Map<StatusToken, true>()
  let maxLive = 0
  for (let s = 0; s < steps; s++) {
    stepTokens(state, area, rand, mobile)
    for (const t of state.tokens) seen.set(t, true)
    maxLive = Math.max(maxLive, state.tokens.length)
  }
  return { cfg, area, tokens: [...seen.keys()], maxLive }
}

describe('pickCode', () => {
  it('is mostly 2xx, with 500 and 503 rare', () => {
    const rand = seeded(1)
    const counts = new Map<string, number>()
    const n = 20_000
    for (let i = 0; i < n; i++) {
      const c = pickCode(rand)
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    const share = (pred: (c: string) => boolean) =>
      [...counts].filter(([c]) => pred(c)).reduce((a, [, k]) => a + k, 0) / n
    expect(share((c) => c.startsWith('2'))).toBeGreaterThan(0.7)
    expect(share((c) => c.startsWith('5'))).toBeLessThan(0.1)
    expect([...counts.keys()].sort()).toEqual(
      ['200', '201', '202', '204', '301', '404', '429', '500', '503'].sort(),
    )
  })
})

describe('tokenArea', () => {
  it('keeps clear of the left half on a two-column hero, the header and the bottom fade', () => {
    for (const [w, h] of [
      [1280, 720],
      [1440, 900],
      [1920, 1080],
      [2560, 1440],
    ] as const) {
      const cfg = rainConfig(w, h)
      const a = tokenArea(cfg, w, h)
      expect(a).not.toBeNull()
      if (!a) continue
      // The text column ends at width / 2 - 119px once the container is centred.
      expect(a.minColumn * cfg.cell).toBeGreaterThanOrEqual(w / 2)
      expect((a.maxColumn + 3) * cfg.cell).toBeLessThanOrEqual(w)
      expect(a.minRow * cfg.cell).toBeGreaterThanOrEqual(120)
      expect((a.maxRow + 1) * cfg.cell).toBeLessThanOrEqual(h - 100)
    }
  })

  it('keeps clear of the top half of a stacked hero', () => {
    const cfg = rainConfig(360, 1066)
    const a = tokenArea(cfg, 360, 1066)
    expect(a?.minColumn).toBe(0)
    expect((a?.minRow ?? 0) * cfg.cell).toBeGreaterThanOrEqual(1066 * 0.55)
  })

  it('returns null when nothing is free', () => {
    expect(tokenArea(rainConfig(360, 200), 360, 200)).toBeNull()
  })
})

describe('stepTokens', () => {
  it('is deterministic with a seeded rand', () => {
    const tokens = (seed: number) => run(seed, 2000).tokens.map((t) => ({ ...t }))
    expect(tokens(4)).toEqual(tokens(4))
  })

  it('places every token inside the area', () => {
    const { area, tokens } = run(5, 4000)
    expect(tokens.length).toBeGreaterThan(50)
    for (const t of tokens) {
      expect(t.column).toBeGreaterThanOrEqual(area?.minColumn ?? 0)
      expect(t.column).toBeLessThanOrEqual(area?.maxColumn ?? 0)
      expect(t.row).toBeGreaterThanOrEqual(area?.minRow ?? 0)
      expect(t.row).toBeLessThanOrEqual(area?.maxRow ?? 0)
    }
  })

  it('spawns one event every 1.5 to 2.5s on desktop and less often on a phone', () => {
    const steps = 6000 // 300s
    const firsts = (ts: StatusToken[]) =>
      ts.filter(
        (t) =>
          !ts.some(
            (u) =>
              u !== t &&
              u.start === t.start - RETRY_STEPS &&
              u.column === t.column &&
              u.row === t.row,
          ),
      )
    const desk = firsts(run(6, steps).tokens).length
    expect(desk).toBeGreaterThanOrEqual(300 / 2.5 - 2)
    expect(desk).toBeLessThanOrEqual(300 / 1.5 + 2)
    const phone = firsts(run(6, steps, 360, 1066).tokens).length
    expect(phone).toBeLessThan(desk * 0.7)
  })

  it('follows every 429 / 5xx with a 200 at the same cell 1.4s later', () => {
    const { tokens } = run(8, 6000)
    const failures = tokens.filter((t) => isFailure(t.code))
    expect(failures.length).toBeGreaterThan(0)
    for (const f of failures) {
      expect(tokens).toContainEqual({
        code: '200',
        column: f.column,
        row: f.row,
        start: f.start + RETRY_STEPS,
      })
    }
  })

  it('keeps the token list small and drops tokens once their hold ends', () => {
    const { maxLive } = run(9, 6000)
    expect(maxLive).toBeLessThanOrEqual(4)
    const rand = seeded(10)
    const cfg = rainConfig(1440, 900)
    const state = createTokens(rand)
    const area = tokenArea(cfg, 1440, 900)
    while (state.tokens.length === 0) stepTokens(state, area, rand)
    const first = state.tokens[0]
    for (let s = 1; s < TOKEN_HOLD_STEPS; s++) stepTokens(state, area, rand)
    expect(state.tokens).toContain(first)
    stepTokens(state, area, rand)
    expect(state.tokens).not.toContain(first)
  })

  it('still advances, but spawns nothing, without an area', () => {
    const rand = seeded(11)
    const state = createTokens(rand)
    for (let s = 0; s < 500; s++) stepTokens(state, null, rand)
    expect(state.step).toBe(500)
    expect(state.tokens).toEqual([])
  })
})

describe('ticker', () => {
  it('shows one line per 1.6s, cycling through a fixed pool', () => {
    expect(tickerLine(0)).toBe('INFO  POST /v1/jobs 202 queued')
    expect(tickerLine(TICKER_STEPS - 1)).toBe(tickerLine(0))
    expect(tickerLine(TICKER_STEPS)).not.toBe(tickerLine(0))
    expect(tickerLine(2 * TICKER_STEPS)).toBe('WARN  agent.call timeout, retry 1/3')
    const lines = new Set(Array.from({ length: 200 }, (_, i) => tickerLine(i * TICKER_STEPS)))
    for (const line of lines) {
      expect(line).toMatch(/^(INFO|WARN) {2}\S/)
      expect(line.length).toBeLessThanOrEqual(40)
    }
  })

  it('is a pure function of the step', () => {
    for (const s of [0, 100, 1234, 99_999]) expect(tickerLine(s)).toBe(tickerLine(s))
  })

  it('fades in and out within each line', () => {
    expect(tickerFade(0)).toBeLessThan(0.5)
    expect(tickerFade(TICKER_STEPS / 2)).toBe(1)
    expect(tickerFade(TICKER_STEPS - 1)).toBeLessThan(0.5)
    for (let s = 0; s < 3 * TICKER_STEPS; s++) {
      expect(tickerFade(s)).toBeGreaterThan(0)
      expect(tickerFade(s)).toBeLessThanOrEqual(1)
    }
  })

  it('sits in the two-column hero only, within 70% of the width', () => {
    expect(tickerSlot(1279, 800)).toBeNull()
    expect(tickerSlot(360, 1066)).toBeNull()
    for (const [w, h] of [
      [1280, 720],
      [1440, 900],
      [2560, 1440],
    ] as const) {
      const slot = tickerSlot(w, h)
      expect(slot).not.toBeNull()
      if (!slot) continue
      expect(slot.x).toBeGreaterThan(w / 2)
      expect(slot.maxWidth).toBeLessThanOrEqual(w * 0.7)
      expect(slot.x + slot.maxWidth).toBeLessThanOrEqual(w)
      expect(slot.y + 12).toBeLessThanOrEqual(h - 84) // at most 12px into the 96px fade
    }
  })
})
