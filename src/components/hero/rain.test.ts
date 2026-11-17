import { describe, expect, it } from 'vitest'

import {
  canvasScale,
  createColumns,
  expireCells,
  FADE_STEPS,
  pointerBoost,
  rainConfig,
  seeded,
  stepColumns,
} from './rain'

describe('rainConfig', () => {
  it('uses a 14px cell below 640px and 16px from 640px', () => {
    expect(rainConfig(639, 800).cell).toBe(14)
    expect(rainConfig(640, 800).cell).toBe(16)
    expect(rainConfig(1440, 900)).toEqual({ cell: 16, columns: 90, rows: 57 })
  })

  it('never exceeds 120 columns; the cell grows instead', () => {
    for (const w of [1920, 2560, 3840, 7680]) {
      const cfg = rainConfig(w, 900)
      expect(cfg.columns).toBeLessThanOrEqual(120)
      expect(cfg.columns * cfg.cell).toBeGreaterThanOrEqual(w)
    }
    expect(rainConfig(3840, 900).cell).toBe(32)
  })
})

describe('canvasScale', () => {
  it('never exceeds 2 or the 4,000,000 pixel cap', () => {
    for (const [w, h, dpr] of [
      [360, 800, 3],
      [1440, 900, 2],
      [2560, 1440, 2],
      [3840, 2160, 1],
      [1280, 720, 1.5],
    ] as const) {
      const s = canvasScale(w, h, dpr)
      expect(s).toBeLessThanOrEqual(2)
      expect(s).toBeLessThanOrEqual(dpr)
      expect(w * h * s * s).toBeLessThanOrEqual(4_000_001)
    }
    expect(canvasScale(360, 800, 3)).toBe(2)
    expect(canvasScale(1280, 720, 1.5)).toBe(1.5)
  })
})

describe('stepColumns', () => {
  const cfg = rainConfig(800, 600)

  it('is deterministic with a seeded rand', () => {
    const run = () => {
      const rand = seeded(42)
      const cols = createColumns(cfg, rand)
      const draws = Array.from({ length: 200 }, () => stepColumns(cols, cfg, rand))
      return { draws, heads: cols.heads }
    }
    expect(run()).toEqual(run())
  })

  it('only moves heads down, except a column past the bottom, which restarts above the top', () => {
    const rand = seeded(7)
    const cols = createColumns(cfg, rand)
    let restarts = 0
    for (let s = 0; s < 400; s++) {
      const before = [...cols.heads]
      stepColumns(cols, cfg, rand)
      cols.heads.forEach((head, c) => {
        const prev = before[c] ?? 0
        if (head < prev) {
          restarts++
          expect(Math.floor(prev + 0.6)).toBeGreaterThanOrEqual(cfg.rows)
          expect(head).toBeLessThanOrEqual(0)
          expect(head).toBeGreaterThanOrEqual(-cfg.rows)
        } else {
          expect(head).toBeGreaterThan(prev)
        }
      })
    }
    expect(restarts).toBeGreaterThan(0)
  })

  it('restarts a column that leaves the bottom', () => {
    const rand = seeded(1)
    const cols = createColumns(cfg, rand)
    cols.heads[0] = cfg.rows - 0.01
    cols.speeds[0] = 0.5
    stepColumns(cols, cfg, rand)
    expect(cols.heads[0]).toBeLessThanOrEqual(0)
    expect(cols.speeds[0]).toBeGreaterThanOrEqual(0.25)
    expect(cols.speeds[0]).toBeLessThanOrEqual(0.6)
  })

  it('multiplies speed by boost', () => {
    const make = () => {
      const rand = seeded(3)
      const cols = createColumns(cfg, rand)
      cols.heads.fill(1)
      return { rand, cols }
    }
    const a = make()
    const b = make()
    stepColumns(a.cols, cfg, a.rand)
    stepColumns(b.cols, cfg, b.rand, () => 1.8)
    a.cols.heads.forEach((head, c) => {
      expect((b.cols.heads[c] ?? 0) - 1).toBeCloseTo((head - 1) * 1.8)
    })
  })

  it('draws a new head in head colour and redraws it in rain colour on the next step', () => {
    const rand = seeded(9)
    const cols = createColumns(cfg, rand)
    cols.heads[0] = 2.9
    cols.speeds[0] = 0.5
    const first = stepColumns(cols, cfg, rand).filter((d) => d.column === 0 && d.head)
    expect(first).toEqual([expect.objectContaining({ row: 3, head: true })])
    const next = stepColumns(cols, cfg, rand).filter((d) => d.column === 0 && d.row === 3)
    expect(next[0]).toEqual({ column: 0, row: 3, bit: first[0]?.bit, head: false })
  })

  it('emits only 0 and 1 glyphs inside the grid', () => {
    const rand = seeded(11)
    const cols = createColumns(cfg, rand)
    for (let s = 0; s < 300; s++) {
      for (const d of stepColumns(cols, cfg, rand)) {
        expect([0, 1]).toContain(d.bit)
        expect(d.row).toBeGreaterThanOrEqual(0)
        expect(d.row).toBeLessThan(cfg.rows)
      }
    }
  })
})

describe('expireCells', () => {
  it('clears each drawn cell exactly FADE_STEPS steps after its last draw, so no ghost lattice remains', () => {
    const cfg = rainConfig(800, 600)
    const rand = seeded(13)
    const cols = createColumns(cfg, rand)
    const lastDraw = new Map<number, number>()
    for (let s = 0; s < 600; s++) {
      for (const d of stepColumns(cols, cfg, rand)) lastDraw.set(d.row * cfg.columns + d.column, s)
      for (const i of expireCells(cols)) {
        expect(s - (lastDraw.get(i) ?? -Infinity)).toBe(FADE_STEPS - 1)
        lastDraw.delete(i)
      }
    }
    // Every cell still on screen was drawn within the fade window.
    for (const s of lastDraw.values()) expect(600 - 1 - s).toBeLessThan(FADE_STEPS - 1)
  })
})

describe('pointerBoost', () => {
  it('speeds up columns within 72px of the pointer by 1.8x', () => {
    const cfg = rainConfig(800, 600)
    expect(pointerBoost(cfg, null)).toBeUndefined()
    const boost = pointerBoost(cfg, 400)
    expect(boost?.(24)).toBe(1.8) // centre 392
    expect(boost?.(30)).toBe(1) // centre 488
  })
})

describe('seeded', () => {
  it('repeats for the same seed and stays in [0, 1)', () => {
    const a = seeded(5)
    const b = seeded(5)
    for (let i = 0; i < 100; i++) {
      const x = a()
      expect(x).toBe(b())
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })
})
