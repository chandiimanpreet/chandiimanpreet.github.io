import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

import type { DateRange, YearMonth } from '@/types/content'

// tailwind-merge must know our custom font-size tokens, otherwise it treats `text-hero`
// as a colour and drops it when merged with `text-foreground`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['hero', 'h2', 'h3', 'lead', 'code'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/** "3 days ago", "last month", "now". Accepts a Date or an ISO string. */
export function relativeTime(date: Date | string, now: Date = new Date()): string {
  const seconds = (new Date(date).getTime() - now.getTime()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

const monthYear = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2025-09" -> "Sep 2025". */
export function formatYearMonth(ym: YearMonth): string {
  return monthYear.format(new Date(`${ym}-01T00:00:00Z`))
}

/** { start: "2025-09", end: null } -> "Sep 2025 – Present". */
export function formatPeriod({ start, end }: DateRange): string {
  return `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : 'Present'}`
}
