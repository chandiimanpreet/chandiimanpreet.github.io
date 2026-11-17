/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { mailTemplates } from './contact'
import { experience } from './experience'
import { heroPicks } from './hero'
import { projects, systems } from './projects'
import { sections } from './nav'
import { profile } from './profile'
import { showcase } from './showcase'
import { socials } from './socials'
import { requestPath, temporalGives } from './workflow'
import { isGithubLogin, safeUrl } from '@/lib/url'

const ROOT = process.cwd() // vitest runs from the repo root
const TEXT = /\.(ts|tsx|js|css|html|json|md|txt|svg)$/

function textFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return textFiles(p)
    return TEXT.test(name) ? [p] : []
  })
}

describe('personal data', () => {
  it('no phone number anywhere in src/, public/ or docs/', () => {
    // Built from parts so this file never matches itself: country code or a 10-digit Indian mobile.
    const phone = new RegExp(['\\', '+9', '1', '|(?<!\\d)[6-9]\\d{9}(?!\\d)'].join(''))
    const hits = ['src', 'public', 'docs', '_legacy', 'index.html']
      .flatMap((d) => (d.includes('.') ? [join(ROOT, d)] : textFiles(join(ROOT, d))))
      .filter((f) => phone.test(readFileSync(f, 'utf8')))
    expect(hits).toEqual([])
  })

  it('runtime-assembled email is a real address', () => {
    expect(profile.email).toMatch(/^manpreetchandi555@gmail\.com$/)
  })

  it('placeholder socials have no href; real ones are https or mailto', () => {
    for (const s of socials) {
      if (s.placeholder) expect(s.href).toBe('')
      else
        expect(
          s.href.startsWith('mailto:') || s.href.startsWith('/') || safeUrl(s.href) !== null,
        ).toBe(true)
    }
  })
})

describe('content integrity', () => {
  it('every agent-graph edge references an existing node', () => {
    for (const p of projects) {
      if (!p.agentGraph) continue
      const ids = new Set(p.agentGraph.nodes.map((n) => n.id))
      expect(ids.size).toBe(p.agentGraph.nodes.length) // unique ids
      for (const e of p.agentGraph.edges) {
        expect(ids, `${p.id}: ${e.from} -> ${e.to}`).toContain(e.from)
        expect(ids, `${p.id}: ${e.from} -> ${e.to}`).toContain(e.to)
      }
    }
  })

  it('every system flow step references a node, max 3 flows x 6 steps', () => {
    for (const s of systems) {
      const ids = new Set(s.nodes.map((n) => n.id))
      expect(s.flows.length).toBeLessThanOrEqual(3)
      for (const f of s.flows) {
        expect(f.steps.length).toBeLessThanOrEqual(6)
        for (const step of f.steps) expect(ids, `${s.id}/${f.label}`).toContain(step.node)
      }
    }
  })

  it('experience systemIds resolve', () => {
    const ids = new Set(systems.map((s) => s.id))
    for (const e of experience) for (const id of e.systemIds ?? []) expect(ids).toContain(id)
  })

  it('every metric number appears in docs/RESUME.md (no invented numbers)', () => {
    const resume = readFileSync(join(ROOT, 'docs', 'RESUME.md'), 'utf8')
    const metrics = [...experience, ...projects, ...systems].flatMap((x) => x.metrics)
    for (const m of metrics) {
      for (const n of m.value.match(/\d+/g) ?? [])
        expect(resume, `${m.value} ${m.label}`).toContain(n)
    }
  })

  it('every hero pick resolves to an existing metric', () => {
    const sources = [...projects, ...systems]
    for (const p of heroPicks)
      expect(sources.find((s) => s.id === p.from)?.metrics[p.index], p.from).toBeDefined()
  })

  it('workflow and contact copy invents no numbers', () => {
    const resume = readFileSync(join(ROOT, 'docs', 'RESUME.md'), 'utf8')
    const copy = [
      ...requestPath.flatMap((h) => [h.label, h.via ?? '']),
      ...temporalGives.flatMap((g) => [g.term, g.detail]),
      ...mailTemplates.flatMap((t) => [t.label, t.subject, t.body ?? '']),
    ]
    for (const text of copy)
      for (const n of text.match(/\d+/g) ?? []) expect(resume, text).toContain(n)
  })

  it('showcase has at most 8 unique valid logins', () => {
    expect(showcase.length).toBeLessThanOrEqual(8)
    expect(new Set(showcase).size).toBe(showcase.length)
    for (const login of showcase) expect(isGithubLogin(login), login).toBe(true)
  })

  it('section ids are unique', () => {
    expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length)
  })

  it('theme-color literals match --background in index.css for both themes', () => {
    const css = readFileSync(join(ROOT, 'src', 'index.css'), 'utf8')
    const background = (selector: string) =>
      new RegExp(`^${selector} \\{[^}]*?--background:\\s*([^;]+);`, 'm').exec(css)?.[1]?.trim()
    const light = background(':root')
    const dark = background('\\.dark')
    expect(light).toMatch(/^#[0-9a-f]{6}$/i)
    expect(dark).toMatch(/^#[0-9a-f]{6}$/i)

    const init = readFileSync(join(ROOT, 'public', 'theme-init.js'), 'utf8')
    const pair = /theme === 'dark' \? '([^']+)' : '([^']+)'/.exec(init)
    expect(pair?.slice(1)).toEqual([dark, light])

    const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
    expect(/<meta name="theme-color" content="([^"]+)"/.exec(html)?.[1]).toBe(dark)
  })
})
