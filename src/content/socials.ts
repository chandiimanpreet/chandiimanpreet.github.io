import type { Social } from '@/types/content'

import { profile } from './profile'

export const socials: readonly Social[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/chandiimanpreet' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/chandiimanpreet/' },
  { id: 'email', label: 'Email', href: `mailto:${profile.email}` },
]
