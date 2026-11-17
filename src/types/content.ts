// Shapes for everything in src/content. Content files are the single source of truth;
// sections import data from there and types from here. No numbers that are not on the resume.

export interface Profile {
  name: string
  /** Job title shown in the hero and meta. "Backend Engineer". */
  role: string
  /** The hero's typed prompt, without the leading `$` (rendered separately). */
  tagline: string
  /** One short paragraph for the About section. */
  about: string
  /** Tech chips for the About section (all named on the resume). */
  stack: readonly string[]
  email: string
  githubLogin: string
  /** '/resume/x.pdf' (under public/) or an https Google Drive link. null = controls show disabled. */
  resumeUrl: string | null
}

export type SocialId = 'github' | 'linkedin' | 'email'

export interface Social {
  id: SocialId
  label: string
  href: string
}

export interface Project {
  /** Stable key and DOM id suffix. Lowercase, hyphens. */
  id: string
  /** Repository name as it should be displayed. */
  name: string
  /** One or two sentences. Plain text. */
  description: string
  /** 0 to 6 short tech names, most important first. */
  stack: readonly string[]
  /** https://github.com/... (validated with safeUrl + GITHUB_LINK_HOSTS). */
  repoUrl: string
  /** Optional deployed URL, https only. */
  liveUrl?: string
  /** True for a reserved slot: dashed border and a "coming soon" tag. Remove when the repo is real. */
  placeholder?: true
}

/** Section ids double as DOM ids and URL hashes. */
export type SectionId = 'hero' | 'about' | 'projects' | 'contact'

export interface NavItem {
  id: SectionId
  label: string
  /** False keeps the section rendered but out of the header nav. */
  inNav: boolean
}
