import type { NavItem } from '@/types/content'

// Single source for section order (App renders in this order) and header nav labels.
export const sections: NavItem[] = [
  { id: 'hero', label: 'Home', inNav: false },
  { id: 'about', label: 'About', inNav: true },
  { id: 'experience', label: 'Experience', inNav: true },
  { id: 'projects', label: 'Projects', inNav: true },
  { id: 'agents', label: 'Workflows', inNav: true },
  { id: 'skills', label: 'Skills', inNav: true },
  { id: 'showcase', label: 'Showcase', inNav: true },
  { id: 'contact', label: 'Contact', inNav: true },
]

export const navItems: NavItem[] = sections.filter((s) => s.inNav)

/** Heading id for a section: `aria-labelledby` target. */
export const headingId = (id: NavItem['id']): string => `${id}-title`
