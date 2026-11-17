// Pure helpers for the Showcase section: no DOM, no network, so they are unit-tested.

import { GITHUB_AVATAR_HOSTS, githubProfileUrl, isGithubLogin, safeUrl } from '@/lib/url'

const AVATAR_PX = 48

export interface Person {
  login: string
  name: string | null
  /** null renders a visible <Todo>. */
  reason: string | null
  profileUrl: string
  /** Validated https://avatars.githubusercontent.com/... */
  avatarUrl: string
}

/** Static avatar URL derived from the login (2x for retina); null when the login is invalid. */
export function avatarUrl(login: string): string | null {
  if (!isGithubLogin(login)) return null
  return safeUrl(
    `https://avatars.githubusercontent.com/${login}?s=${AVATAR_PX * 2}`,
    GITHUB_AVATAR_HOSTS,
  )
}

/** Normalises a content login; null drops logins that would not make a valid URL. */
export function toPerson(login: string): Person | null {
  const avatar = avatarUrl(login)
  const profileUrl = githubProfileUrl(login)
  if (!avatar || !profileUrl) return null
  // name and reason are not in content yet (content/showcase.ts is logins only): null renders a <Todo>.
  return { login, name: null, reason: null, profileUrl, avatarUrl: avatar }
}

/** "Kelsey Hightower" -> "KH", "antirez" -> "A". */
export function initials(text: string): string {
  return text
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

type Box = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>

/** Pointer position relative to the card, clamped to it, for the --mx / --my spotlight vars. */
export function spotlightPosition(clientX: number, clientY: number, box: Box) {
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max)
  return { x: clamp(clientX - box.left, box.width), y: clamp(clientY - box.top, box.height) }
}
