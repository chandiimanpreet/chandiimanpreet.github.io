import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { headingId } from '@/content/nav'
import { profile } from '@/content/profile'

import ContactSection from './ContactSection'

describe('ContactSection', () => {
  it('is the contact landmark labelled by its heading', () => {
    render(<ContactSection />)
    const section = screen.getByRole('region', { name: "Let's build something" })
    expect(section.id).toBe('contact')
    expect(section.getAttribute('aria-labelledby')).toBe(headingId('contact'))
  })

  it('links the email as mailto built from profile.email, with a Copy button', () => {
    render(<ContactSection />)
    expect(screen.getByRole('link', { name: profile.email }).getAttribute('href')).toBe(
      `mailto:${profile.email}`,
    )
    expect(screen.getByRole('button', { name: 'Copy email address' })).toBeTruthy()
  })

  it.each([
    ['GitHub', 'https://github.com/chandiimanpreet'],
    ['LinkedIn', 'https://www.linkedin.com/in/chandiimanpreet/'],
  ])('opens %s in a new tab', (label, href) => {
    render(<ContactSection />)
    const a = screen.getByRole('link', { name: new RegExp(`^${label}\\b`) })
    expect(a.getAttribute('href')).toBe(href)
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('has no tel: link and no 10-digit run in its text', () => {
    const { container } = render(<ContactSection />)
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    expect(container.textContent).not.toMatch(/\d{10}/)
  })
})
