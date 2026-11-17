import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { profile } from '@/content/profile'

import { SiteHeader } from '../SiteHeader'
import { ActiveSectionContext } from '../useActiveSection'

describe('SiteHeader', () => {
  const currentLinks = () =>
    screen.getAllByRole('navigation', { name: 'Primary' })[0]!.querySelectorAll('[aria-current]')

  it('marks the active section link as current, and none over the hero', () => {
    const { rerender } = render(
      <ActiveSectionContext value="hero">
        <SiteHeader />
      </ActiveSectionContext>,
    )
    expect(currentLinks()).toHaveLength(0)

    rerender(
      <ActiveSectionContext value="projects">
        <SiteHeader />
      </ActiveSectionContext>,
    )
    const current = currentLinks()
    expect(current).toHaveLength(1)
    expect(current[0]!.textContent).toBe('/projects')
    expect(current[0]!.getAttribute('aria-current')).toBe('location')
  })

  const original = profile.resumeUrl
  afterEach(() => {
    profile.resumeUrl = original
  })

  it('has the section nav links, a disabled Resume while resumeUrl is null, and no menu', () => {
    profile.resumeUrl = null
    const { container } = render(<SiteHeader />)
    const links = screen.getByRole('navigation', { name: 'Primary' }).querySelectorAll('a')
    expect([...links].map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['/about', '#about'],
      ['/projects', '#projects'],
      ['/contact', '#contact'],
    ])
    expect(screen.queryByRole('link', { name: /resume/ })).toBeNull()
    expect(container.querySelector('[aria-disabled="true"]')?.textContent).toMatch(/resume/)
    expect(container.querySelector('dialog')).toBeNull()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('shows a new-tab Resume link when resumeUrl is set', () => {
    profile.resumeUrl = '/resume/test.pdf'
    render(<SiteHeader />)
    const resume = screen.getByRole('link', { name: /resume/ })
    expect(resume.getAttribute('href')).toBe('/resume/test.pdf')
    expect(resume.getAttribute('target')).toBe('_blank')
    expect(screen.getByRole('navigation', { name: 'Primary' }).contains(resume)).toBe(false)
  })

  it('names the brand link with its visible text first and links it to the top', () => {
    render(<SiteHeader />)
    const brandLink = screen.getByRole('link', { name: /^manpreetSingh: .+ Back to top$/ })
    expect(brandLink.getAttribute('href')).toBe('#main')
    expect(brandLink.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
  })

  it('renders one decorative scroll-progress hairline', () => {
    const { container } = render(<SiteHeader />)
    const progress = container.querySelectorAll('.scroll-progress')
    expect(progress).toHaveLength(1)
    expect(progress[0]!.getAttribute('aria-hidden')).toBe('true')
  })
})
