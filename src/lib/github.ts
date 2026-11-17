// The only module that talks to GitHub. Components never call fetch; they use the hooks in
// src/hooks, which call this. Rules: docs/SECURITY.md sections 4 to 6.
//
// Types mirror GitHub's own field names on purpose: the parser is then idempotent, so the exact
// same parser validates both API responses and cached entries (a tampered cache degrades to a
// refetch, never to rendering unchecked data).

import { arr, isoDate, isRecord, num, str } from './guards'
import { GITHUB_LINK_HOSTS, isGithubLogin, safeUrl } from './url'

export { isGithubLogin }

const API = 'https://api.github.com'
const CACHE_PREFIX = 'pf:v1:'
const BACKOFF_KEY = `${CACHE_PREFIX}backoff`
const TTL_MS = 60 * 60 * 1000
const MAX_CACHE_CHARS = 200_000
const TIMEOUT_MS = 8000
const RETRY_DELAY_MS = 2000
const MAX_REPOS = 100

export interface GithubRepo {
  name: string
  description: string | null
  /** Validated github.com URL. */
  html_url: string
  /** Validated https URL on github.com / *.github.io, else null. Render unknown hosts as text. */
  homepage: string | null
  language: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  pushed_at: string | null
  fork: boolean
}

/** What a fetch returns. `stale` = served from an expired cache because GitHub was unavailable. */
export interface GithubResult<T> {
  data: T
  stale: boolean
  /** Epoch ms when the data was fetched from GitHub. */
  savedAt: number
}

export type GithubErrorKind = 'rate-limit' | 'not-found' | 'network' | 'http' | 'invalid'

export class GithubError extends Error {
  readonly kind: GithubErrorKind
  readonly status: number | null
  /** When the rate limit lifts, if known. */
  readonly resetAt: Date | null

  constructor(
    kind: GithubErrorKind,
    message: string,
    status: number | null = null,
    resetAt: Date | null = null,
  ) {
    super(message)
    this.name = 'GithubError'
    this.kind = kind
    this.status = status
    this.resetAt = resetAt
  }
}

// ---------- parsers (untrusted -> typed). Return null when the shape is unusable. ----------

function parseRepo(x: unknown): GithubRepo | null {
  if (!isRecord(x)) return null
  const name = str(x.name, 100)
  const html_url = safeUrl(x.html_url, GITHUB_LINK_HOSTS)
  if (!name || !html_url) return null
  return {
    name,
    description: str(x.description, 300),
    html_url,
    homepage: safeUrl(x.homepage, GITHUB_LINK_HOSTS),
    language: str(x.language, 40),
    topics: arr(x.topics, 10)
      .map((t) => str(t, 40))
      .filter((t): t is string => t !== null),
    stargazers_count: num(x.stargazers_count),
    forks_count: num(x.forks_count),
    pushed_at: isoDate(x.pushed_at),
    fork: x.fork === true,
  }
}

/** Drops malformed entries; null only when the input is not an array. */
export function parseRepos(x: unknown): GithubRepo[] | null {
  if (!Array.isArray(x)) return null
  return arr(x, MAX_REPOS)
    .map(parseRepo)
    .filter((r): r is GithubRepo => r !== null)
}

// ---------- localStorage cache ----------

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null // disabled storage throws on access
  }
}

function forget(key: string): void {
  try {
    storage()?.removeItem(key)
  } catch {
    /* nothing to do */
  }
}

/** Validated cached entry or null. `allowExpired` is for fallback when GitHub is unavailable. */
export function readCache<T>(
  name: string,
  parse: (x: unknown) => T | null,
  allowExpired = false,
  now = Date.now(),
): { data: T; savedAt: number } | null {
  const key = CACHE_PREFIX + name
  try {
    const raw = storage()?.getItem(key)
    if (!raw) return null
    if (raw.length > MAX_CACHE_CHARS) throw new Error('oversized')
    const entry: unknown = JSON.parse(raw)
    if (!isRecord(entry) || entry.v !== 1 || typeof entry.t !== 'number') throw new Error('shape')
    const age = now - entry.t
    if (age < 0) throw new Error('future-dated')
    if (age > TTL_MS && !allowExpired) return null
    const data = parse(entry.data)
    if (data === null) throw new Error('data')
    return { data, savedAt: entry.t }
  } catch {
    forget(key)
    return null
  }
}

function writeCache(name: string, data: unknown, now = Date.now()): void {
  try {
    const raw = JSON.stringify({ v: 1, t: now, data })
    if (raw.length <= MAX_CACHE_CHARS) storage()?.setItem(CACHE_PREFIX + name, raw)
  } catch {
    /* quota or disabled: the page still works, it just refetches next time */
  }
}

function backoffUntil(): number {
  try {
    const n = Number(storage()?.getItem(BACKOFF_KEY))
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

// ---------- network ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function send(path: string, retry = true): Promise<Response> {
  try {
    return await fetch(API + path, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    if (!retry) throw new GithubError('network', 'Could not reach GitHub.')
    await sleep(RETRY_DELAY_MS)
    return send(path, false)
  }
}

async function request(path: string): Promise<unknown> {
  if (backoffUntil() > Date.now()) {
    throw new GithubError(
      'rate-limit',
      'GitHub rate limit reached.',
      null,
      new Date(backoffUntil()),
    )
  }
  const res = await send(path)
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset'))
    // Secondary limits may omit the reset header: back off a minute.
    const resetMs = reset ? reset * 1000 : Date.now() + 60_000
    try {
      storage()?.setItem(BACKOFF_KEY, String(resetMs))
    } catch {
      /* ignore */
    }
    throw new GithubError('rate-limit', 'GitHub rate limit reached.', res.status, new Date(resetMs))
  }
  if (res.status === 404) throw new GithubError('not-found', 'Not found on GitHub.', 404)
  if (!res.ok) throw new GithubError('http', `GitHub answered ${res.status}.`, res.status)
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new GithubError('invalid', 'GitHub sent something other than JSON.', res.status)
  }
  const body: unknown = await res.json()
  return body
}

// One request per endpoint per page load, shared by every caller.
const inflight = new Map<string, Promise<GithubResult<unknown>>>()

function load<T>(
  name: string,
  path: string,
  parse: (x: unknown) => T | null,
): Promise<GithubResult<T>> {
  // Safe: every key embeds its endpoint ("repos:<login>") and each endpoint always uses the same
  // parser, so the promise stored under `name` was created by this same call shape with this T.
  const existing = inflight.get(name) as Promise<GithubResult<T>> | undefined
  if (existing) return existing
  const p = (async (): Promise<GithubResult<T>> => {
    const fresh = readCache(name, parse)
    if (fresh) return { ...fresh, stale: false }
    try {
      const data = parse(await request(path))
      if (data === null) throw new GithubError('invalid', 'GitHub sent an unexpected shape.')
      const savedAt = Date.now()
      writeCache(name, data, savedAt)
      return { data, savedAt, stale: false }
    } catch (err) {
      const old = readCache(name, parse, true)
      if (old) return { ...old, stale: true }
      throw err instanceof GithubError ? err : new GithubError('network', 'Could not reach GitHub.')
    }
  })()
  inflight.set(name, p)
  return p
}

function assertLogin(login: string): string {
  if (!isGithubLogin(login)) throw new GithubError('invalid', `Not a GitHub username: ${login}`)
  return login
}

const byStarsThenPush = (a: GithubRepo, b: GithubRepo): number =>
  b.stargazers_count - a.stargazers_count ||
  Date.parse(b.pushed_at ?? '0') - Date.parse(a.pushed_at ?? '0')

/** Public non-fork repos, most starred first, ties broken by most recent push. */
// ponytail: one page of 100 (sorted by push); users with >100 repos may miss an old starred one.
export async function fetchRepos(login: string): Promise<GithubResult<GithubRepo[]>> {
  const l = assertLogin(login)
  return load(`repos:${l.toLowerCase()}`, `/users/${l}/repos?per_page=100&sort=pushed`, (x) => {
    const repos = parseRepos(x)
    return repos && repos.filter((r) => !r.fork).sort(byStarsThenPush)
  })
}

/** Test hook: forget per-page-load memoisation. */
export function resetGithubForTests(): void {
  inflight.clear()
}
