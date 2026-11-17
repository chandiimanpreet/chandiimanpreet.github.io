import { describe, expect, it } from 'vitest'

import { typedLength } from './typing'

describe('typedLength', () => {
  it('clamps to 0..total', () => {
    expect(typedLength(-500, 10, 28)).toBe(0)
    expect(typedLength(0, 10, 28)).toBe(0)
    expect(typedLength(28 * 4 + 5, 10, 28)).toBe(4)
    expect(typedLength(1e9, 10, 28)).toBe(10)
  })

  it('shows everything for a non-positive speed', () => {
    expect(typedLength(0, 10, 0)).toBe(10)
  })
})
