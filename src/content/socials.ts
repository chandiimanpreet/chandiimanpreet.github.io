import { githubProfileUrl } from '@/lib/url'
import type { Social } from '@/types/content'

import { profile } from './profile'

export const socials: Social[] = [
  { id: 'github', label: 'GitHub', href: githubProfileUrl(profile.githubLogin) ?? '' },
  { id: 'email', label: 'Email', href: `mailto:${profile.email}` },
  // TODO(owner): real LinkedIn and LeetCode URLs. Placeholders must not render as links.
  { id: 'linkedin', label: 'LinkedIn', href: '', placeholder: true },
  { id: 'leetcode', label: 'LeetCode', href: '', placeholder: true },
  ...(profile.resumeUrl
    ? [{ id: 'resume' as const, label: 'Resume (PDF)', href: profile.resumeUrl }]
    : []),
]
