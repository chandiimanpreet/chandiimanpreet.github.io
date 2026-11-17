import { describe, expect, it } from 'vitest'

import { experience } from '@/content/experience'

import { toChanges } from './changelog'

describe('toChanges', () => {
  it('keeps every bullet verbatim', () => {
    for (const entry of experience) {
      const texts = toChanges(entry.highlights).map((c) => c.text)
      expect([...texts].sort()).toEqual([...entry.highlights].sort())
    }
  })

  it('puts Go first and agent work last', () => {
    const changes = toChanges([
      'Developed WhatsApp and voice AI agents.',
      'Engineered AI-driven CI/CD pipelines using agentic AI.',
      'Architected a multi-agent pipeline.',
      'Implemented a Go microservice.',
    ])
    expect(changes.map((c) => c.text)).toEqual([
      'Implemented a Go microservice.',
      'Engineered AI-driven CI/CD pipelines using agentic AI.',
      'Developed WhatsApp and voice AI agents.',
      'Architected a multi-agent pipeline.',
    ])
  })

  it('types migrations and improvements as Changed, analysis as Reviewed, the rest as Added', () => {
    const bullets = ['Migrated 5 things.', 'Improved X.', 'Analyzed Z.', 'Set up W.', 'Built Y.']
    expect(toChanges(bullets).map((c) => c.type)).toEqual([
      'Changed',
      'Changed',
      'Reviewed',
      'Added',
      'Added',
    ])
  })
})
