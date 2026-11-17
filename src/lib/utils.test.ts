import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('keeps a custom font-size token next to a text colour', () => {
    expect(cn('text-hero', 'text-foreground')).toBe('text-hero text-foreground')
    expect(cn('text-h2', 'text-lead')).toBe('text-lead')
  })
})
