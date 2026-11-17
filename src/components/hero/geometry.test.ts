import { describe, expect, it } from 'vitest'

import { LAYOUTS, pointAt, pointOnEdge } from './geometry'

describe('pointAt', () => {
  const line = [
    { x: 0, y: 0 },
    { x: 30, y: 0 },
    { x: 30, y: 10 },
  ]

  it('returns the ends at 0 and 1', () => {
    expect(pointAt(line, 0)).toEqual({ x: 0, y: 0 })
    expect(pointAt(line, 1)).toEqual({ x: 30, y: 10 })
  })

  it('reaches the corner of an L-shaped polyline at its length fraction', () => {
    expect(pointAt(line, 0.75)).toEqual({ x: 30, y: 0 })
    expect(pointAt(line, 0.875)).toEqual({ x: 30, y: 5 })
  })

  it('clamps out-of-range fractions', () => {
    expect(pointAt(line, -1)).toEqual({ x: 0, y: 0 })
    expect(pointAt(line, 2)).toEqual({ x: 30, y: 10 })
  })
})

describe('pointOnEdge', () => {
  it('runs reverse travel along the stored polyline backwards', () => {
    const layout = LAYOUTS.wide
    expect(pointOnEdge(layout, 'api', 'cache', 0)).toEqual({ x: 346, y: 152 })
    expect(pointOnEdge(layout, 'cache', 'api', 0)).toEqual({ x: 346, y: 76 })
  })
})

describe('LAYOUTS', () => {
  it('has the ten edges of the spec in both layouts', () => {
    for (const layout of Object.values(LAYOUTS)) expect(Object.keys(layout.edges)).toHaveLength(10)
  })
})
