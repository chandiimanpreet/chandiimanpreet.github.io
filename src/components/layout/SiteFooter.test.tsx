import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { profile } from '@/content/profile'

import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the copyright line with the current year and a Back to top link', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2031-06-15T12:00:00Z'))
    render(<SiteFooter />)
    const footer = screen.getByRole('contentinfo')
    expect(footer.textContent).toContain(
      `© 2031 ${profile.name}. Built with React, TypeScript and Tailwind CSS.`,
    )
    expect(screen.getByRole('link', { name: 'Back to top' }).getAttribute('href')).toBe('#main')
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
