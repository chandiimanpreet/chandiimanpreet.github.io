import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { profile } from '@/content/profile'

import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the footer landmark with links, stack line and year', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2031-06-15T12:00:00Z'))
    const { container } = render(<SiteFooter />)
    expect(screen.getByRole('contentinfo')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(
      `https://github.com/${profile.githubLogin}`,
    )
    expect(screen.getByRole('link', { name: profile.email }).getAttribute('href')).toBe(
      `mailto:${profile.email}`,
    )
    expect(screen.getByRole('link', { name: 'Back to top' }).getAttribute('href')).toBe('#main')
    const text = container.textContent ?? ''
    for (const s of ['Vite', 'React 19', 'TypeScript', 'Tailwind CSS', 'shadcn/ui']) {
      expect(text).toContain(s)
    }
    expect(text).toContain(`© 2031 ${profile.name}`)
  })

  it('renders the rail end node as hidden decoration with no content', () => {
    const { container } = render(<SiteFooter />)
    const node = container.querySelector('[data-rail-end]')
    expect(node?.getAttribute('aria-hidden')).toBe('true')
    expect(node?.textContent).toBe('')
    expect(node?.querySelector('a, button, [tabindex]')).toBeNull()
  })
})
