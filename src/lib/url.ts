// URL allowlist for anything that becomes an href or src (docs/SECURITY.md section 3).
// An entry is an exact host ("github.com") or a suffix starting with "." (".github.io").

export const GITHUB_LINK_HOSTS = ['github.com', '.github.io'] as const
export const RESUME_HOSTS = ['drive.google.com', 'docs.google.com'] as const

function hostAllowed(host: string, allowed: readonly string[]): boolean {
  return allowed.some((h) => (h.startsWith('.') ? host.endsWith(h) : host === h))
}

/**
 * Returns the normalised URL when it is https, has no credentials and (if `allowedHosts` is given)
 * its host is allowed. Otherwise null. Use null as "render as plain text / no image".
 */
export function safeUrl(value: unknown, allowedHosts?: readonly string[]): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null // relative and protocol-relative ("//evil.com") inputs land here
  }
  if (url.protocol !== 'https:' || url.username || url.password) return null
  if (allowedHosts && !hostAllowed(url.hostname, allowedHosts)) return null
  return url.href
}

/**
 * The href for the resume control: a PDF served from this site (`/resume/*.pdf`) or an https
 * Google Drive link (so the file can be replaced in Drive without a redeploy). Anything else is null.
 */
export function resumeHref(value: string | null): string | null {
  if (value === null) return null
  if (/^\/resume\/[\w.-]+\.pdf$/.test(value)) return value
  return safeUrl(value, RESUME_HOSTS)
}

const GITHUB_LOGIN_RE = /^[a-z\d](?:[a-z\d-]{0,38})$/i

/** GitHub's username rule: 1 to 39 letters, digits or hyphens, not starting with a hyphen. */
export function isGithubLogin(value: string): boolean {
  return GITHUB_LOGIN_RE.test(value)
}

/** `https://github.com/<login>`, or null when `login` is not a valid GitHub username. */
export function githubProfileUrl(login: string): string | null {
  return isGithubLogin(login) ? safeUrl(`https://github.com/${login}`, GITHUB_LINK_HOSTS) : null
}
