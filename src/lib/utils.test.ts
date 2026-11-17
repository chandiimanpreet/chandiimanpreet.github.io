import { describe, expect, it } from 'vitest'

import { formatPeriod, formatYearMonth, relativeTime } from './utils'

describe('relativeTime', () => {
  const now = new Date('2026-06-15T12:00:00Z')
  it.each([
    ['2026-06-15T11:59:30Z', 'just now'],
    ['2026-06-15T11:55:00Z', '5 minutes ago'],
    ['2026-06-12T12:00:00Z', '3 days ago'],
    ['2026-06-14T12:00:00Z', 'yesterday'],
    ['2026-05-15T12:00:00Z', 'last month'],
    ['2024-06-15T12:00:00Z', '2 years ago'],
    ['2026-06-15T15:00:00Z', 'in 3 hours'],
  ])('%s -> %s', (date, expected) => {
    expect(relativeTime(date, now)).toBe(expected)
  })

  it('accepts a Date', () => {
    expect(relativeTime(new Date('2026-06-08T12:00:00Z'), now)).toBe('last week')
  })
})

describe('formatYearMonth / formatPeriod', () => {
  it('formats in UTC, so no month shifts by time zone', () => {
    expect(formatYearMonth('2025-01')).toBe('Jan 2025')
    expect(formatYearMonth('2025-12')).toBe('Dec 2025')
  })

  it('renders an open range as Present', () => {
    expect(formatPeriod({ start: '2025-09', end: null })).toBe('Sep 2025 – Present')
    expect(formatPeriod({ start: '2024-02', end: '2025-08' })).toBe('Feb 2024 – Aug 2025')
  })
})
