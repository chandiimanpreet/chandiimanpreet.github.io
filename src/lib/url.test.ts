import { describe, expect, it } from 'vitest'

import { GITHUB_LINK_HOSTS, githubProfileUrl, isGithubLogin, safeUrl } from './url'

describe('safeUrl', () => {
  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '//evil.com',
    'http://github.com',
    'https://user:pw@github.com',
    'data:text/html,<script>alert(1)</script>',
    'blob:https://github.com/x',
    '/relative',
    '',
    42,
    null,
  ])('rejects %s', (input) => {
    expect(safeUrl(input)).toBeNull()
  })

  it('accepts https and normalises', () => {
    expect(safeUrl(' https://github.com/tj ')).toBe('https://github.com/tj')
  })

  it('enforces the host allowlist', () => {
    expect(safeUrl('https://tj.github.io/x', GITHUB_LINK_HOSTS)).toBe('https://tj.github.io/x')
    expect(safeUrl('https://github.com.evil.com', GITHUB_LINK_HOSTS)).toBeNull()
    expect(safeUrl('https://evilgithub.io', GITHUB_LINK_HOSTS)).toBeNull()
  })
})

describe('github logins', () => {
  it('accepts real usernames and rejects path tricks', () => {
    expect(isGithubLogin('kelseyhightower')).toBe(true)
    expect(isGithubLogin('a-b1')).toBe(true)
    for (const bad of ['', '-x', '../evil', 'a/b', 'x'.repeat(40), 'a b'])
      expect(isGithubLogin(bad)).toBe(false)
  })

  it('builds a profile URL only for valid logins', () => {
    expect(githubProfileUrl('antirez')).toBe('https://github.com/antirez')
    expect(githubProfileUrl('../evil')).toBeNull()
  })
})
