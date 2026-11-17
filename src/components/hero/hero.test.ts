/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { heroPicks } from '@/content/hero'
import { projects, systems } from '@/content/projects'
import { formatClock, msUntilNextMinute } from '@/lib/time'
import { heroStats } from './stats'

describe('formatClock', () => {
  it('formats 24-hour time in Asia/Kolkata (UTC+5:30)', () => {
    expect(formatClock(new Date('2026-11-17T09:02:59Z'), 'Asia/Kolkata')).toBe('14:32')
    expect(formatClock(new Date('2026-11-17T18:45:00Z'), 'Asia/Kolkata')).toBe('00:15')
  })
})

describe('msUntilNextMinute', () => {
  it('waits for the next whole minute', () => {
    const t = Date.parse('2026-11-17T09:02:15.250Z')
    expect(msUntilNextMinute(t)).toBe(44_750)
    expect(msUntilNextMinute(Date.parse('2026-11-17T09:03:00Z'))).toBe(60_000)
  })
})

describe('heroStats', () => {
  it('resolves every pick to its content metric, in pick order', () => {
    const sources = [...projects, ...systems]
    const expected = heroPicks.map(({ from, index, tag }) => {
      const metric = sources.find((s) => s.id === from)?.metrics[index]
      if (!metric) throw new Error(`hero pick ${from}[${index}] has no metric in content`)
      return { value: metric.value, label: metric.label, tag }
    })
    expect(heroStats()).toEqual(expected)
    for (const s of expected) expect(s.value).not.toBe('')
  })

  it('shows four short numeric values, each verbatim in docs/RESUME.md', () => {
    const resume = readFileSync(join(process.cwd(), 'docs', 'RESUME.md'), 'utf8')
    const stats = heroStats()
    expect(stats).toHaveLength(4)
    for (const { value } of stats) {
      // A phrase value ("Hours → minutes") would not fit text-h2 in a quarter column.
      expect(value).toMatch(/^\d+(%|x|\+|%\+)$/)
      expect(resume).toContain(value)
    }
  })
})
