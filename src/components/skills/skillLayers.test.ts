import { describe, expect, it } from 'vitest'

import { projects, systems } from '@/content/projects'
import { skills } from '@/content/skills'

import { buildSkillLinks, SKILL_LAYERS, skillKey } from './skillLayers'

describe('skill layers', () => {
  it('only names skills that exist in content', () => {
    const known = new Set(
      [...skills.flatMap((g) => g.items), ...[...projects, ...systems].flatMap((p) => p.stack)].map(
        skillKey,
      ),
    )
    const missing = SKILL_LAYERS.flatMap((l) => l.items).filter((s) => !known.has(skillKey(s)))
    expect(missing).toEqual([])
  })

  it('keys Express.js and Express the same, but not Next.js', () => {
    expect(skillKey('Express.js')).toBe(skillKey('Express'))
    expect(skillKey('Next.js')).not.toBe(skillKey('Express'))
    expect(skillKey('C++')).not.toBe(skillKey('C'))
  })

  it('links a skill to the first project that lists it', () => {
    const links = buildSkillLinks([
      { id: 'a', name: 'A', stack: ['Express', 'LangGraph'] },
      { id: 'b', name: 'B', stack: ['LangGraph', 'Go'] },
    ])
    expect(links.get(skillKey('Express.js'))).toEqual({ href: '#project-a', title: 'Used in A' })
    expect(links.get(skillKey('LangGraph'))?.href).toBe('#project-a')
    expect(links.get(skillKey('Go'))?.href).toBe('#project-b')
    expect(links.has(skillKey('Redis'))).toBe(false)
  })
})
