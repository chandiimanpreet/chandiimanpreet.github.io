// Hand-written guards for untrusted JSON (GitHub API, localStorage). No zod: two shapes do not
// justify a dependency (docs/SECURITY.md section 4).

export function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

// C0 controls and bidi overrides/isolates: layout and spoofing abuse in remote text.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u001f\u007f‪-‮⁦-⁩]/g

/** Trimmed, cleaned string capped at `max` chars, or null when not a non-empty string. */
export function str(x: unknown, max = 300): string | null {
  if (typeof x !== 'string') return null
  const s = x.replace(UNSAFE_CHARS, '').trim()
  return s ? s.slice(0, max) : null
}

/** Finite non-negative number, else 0. */
export function num(x: unknown): number {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0 ? x : 0
}

/** The array (capped at `max`), or [] when not an array. */
export function arr(x: unknown, max = 100): unknown[] {
  return Array.isArray(x) ? x.slice(0, max) : []
}

/** ISO date string that parses, else null. */
export function isoDate(x: unknown): string | null {
  return typeof x === 'string' && !Number.isNaN(Date.parse(x)) ? x : null
}
