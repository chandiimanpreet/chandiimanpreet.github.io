/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { projects } from './projects'
import { sections } from './nav'
import { profile } from './profile'
import { socials } from './socials'
import { GITHUB_LINK_HOSTS, resumeHref, safeUrl } from '@/lib/url'

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
    const hits = ['src', 'public', 'docs', 'index.html']
      .flatMap((d) => (d.includes('.') ? [join(ROOT, d)] : textFiles(join(ROOT, d))))
      .filter((f) => phone.test(readFileSync(f, 'utf8')))
    expect(hits).toEqual([])
  })

  it('runtime-assembled email is a real address', () => {
    expect(profile.email).toMatch(/^manpreetchandi555@gmail\.com$/)
  })

  it('socials are https or mailto', () => {
    for (const s of socials)
      expect(s.href.startsWith('mailto:') || safeUrl(s.href) !== null, s.id).toBe(true)
  })

  it('resumeUrl is null or an allowed resume link', () => {
    if (profile.resumeUrl !== null) expect(resumeHref(profile.resumeUrl)).not.toBeNull()
  })

  it('tagline does not include the prompt sign', () => {
    expect(profile.tagline.startsWith('$')).toBe(false)
  })
})

describe('projects', () => {
  it('ids are unique', () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length)
  })

  it('every repoUrl is a GitHub https URL and every liveUrl is https', () => {
    for (const p of projects) {
      expect(safeUrl(p.repoUrl, GITHUB_LINK_HOSTS), p.id).not.toBeNull()
      if (p.liveUrl !== undefined) expect(safeUrl(p.liveUrl), p.id).not.toBeNull()
    }
  })

  it('at most 6 stack items each', () => {
    for (const p of projects) expect(p.stack.length, p.id).toBeLessThanOrEqual(6)
  })
})

describe('content integrity', () => {
  it('section ids are unique', () => {
    expect(new Set(sections.map((s) => s.id)).size).toBe(sections.length)
  })

  it('theme-color matches --background of .dark in index.css', () => {
    const css = readFileSync(join(ROOT, 'src', 'index.css'), 'utf8')
    const dark = /^\.dark \{[^}]*?--background:\s*([^;]+);/m.exec(css)?.[1]?.trim()
    expect(dark).toMatch(/^#[0-9a-f]{6}$/i)
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
    expect(/<meta name="theme-color" content="([^"]+)"/.exec(html)?.[1]).toBe(dark)
  })
})
