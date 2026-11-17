import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchRepos, GithubError, readCache, resetGithubForTests, parseRepos } from './github'

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  })

const repo = (
  name: string,
  stars: number,
  pushed: string,
  extra: Record<string, unknown> = {},
) => ({
  name,
  html_url: `https://github.com/u/${name}`,
  stargazers_count: stars,
  pushed_at: pushed,
  ...extra,
})

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  localStorage.clear()
  resetGithubForTests()
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('fetchRepos', () => {
  it('skips forks, sorts by stars then push, sanitises URLs, and caches', async () => {
    fetchMock.mockResolvedValueOnce(
      json([
        repo('old', 5, '2024-01-01T00:00:00Z'),
        repo('forked', 99, '2026-01-01T00:00:00Z', { fork: true }),
        repo('new', 5, '2026-01-01T00:00:00Z', { homepage: 'javascript:alert(1)' }),
        repo('top', 10, '2020-01-01T00:00:00Z'),
        { name: 'broken' }, // no html_url: dropped
      ]),
    )
    const { data, stale } = await fetchRepos('u')
    expect(stale).toBe(false)
    expect(data.map((r) => r.name)).toEqual(['top', 'new', 'old'])
    expect(data[1]?.homepage).toBeNull()

    resetGithubForTests() // new page load
    expect((await fetchRepos('u')).data).toHaveLength(3)
    expect(fetchMock).toHaveBeenCalledTimes(1) // second load came from cache
  })

  it('on rate limit, backs off and serves the expired cache as stale', async () => {
    const twoHoursAgo = Date.now() - 2 * 3600_000
    localStorage.setItem(
      'pf:v1:repos:u',
      JSON.stringify({ v: 1, t: twoHoursAgo, data: [repo('cached', 1, '2025-01-01T00:00:00Z')] }),
    )
    const reset = Math.floor(Date.now() / 1000) + 600
    fetchMock.mockResolvedValueOnce(
      json({ message: 'rate limited' }, 403, {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(reset),
      }),
    )
    const result = await fetchRepos('u')
    expect(result.stale).toBe(true)
    expect(result.data[0]?.name).toBe('cached')

    // Next page load inside the backoff window: no request at all.
    resetGithubForTests()
    localStorage.removeItem('pf:v1:repos:u')
    await expect(fetchRepos('u')).rejects.toMatchObject({ kind: 'rate-limit' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid usernames without a request', async () => {
    await expect(fetchRepos('../evil')).rejects.toBeInstanceOf(GithubError)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('readCache', () => {
  const now = Date.now()
  it.each([
    ['not JSON', '{oops'],
    ['wrong version', JSON.stringify({ v: 2, t: now, data: [] })],
    ['future-dated', JSON.stringify({ v: 1, t: now + 60_000, data: [] })],
    ['bad data', JSON.stringify({ v: 1, t: now, data: { x: 1 } })],
    ['oversized', JSON.stringify({ v: 1, t: now, data: [], pad: 'x'.repeat(200_001) })],
  ])('drops a tampered entry: %s', (_label, raw) => {
    localStorage.setItem('pf:v1:repos:u', raw)
    expect(readCache('repos:u', parseRepos, false, now)).toBeNull()
    expect(localStorage.getItem('pf:v1:repos:u')).toBeNull()
  })
})
