import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { profile } from '@/content/profile'

import { ResumeLink } from './ResumeLink'

describe('ResumeLink', () => {
  const original = profile.resumeUrl
  afterEach(() => {
    profile.resumeUrl = original
  })

  it('renders a disabled non-link while resumeUrl is null', () => {
    profile.resumeUrl = null
    const { container } = render(<ResumeLink>Resume</ResumeLink>)
    expect(container.querySelector('a')).toBeNull()
    expect(container.querySelector('[aria-disabled="true"]')?.textContent).toMatch(/coming soon/)
  })

  it('renders a new-tab link to the PDF path', () => {
    profile.resumeUrl = '/resume/test.pdf'
    render(<ResumeLink>Resume</ResumeLink>)
    const a = screen.getByRole('link', { name: /^Resume ?\(PDF, opens in a new tab\)$/ })
    expect(a.getAttribute('href')).toBe('/resume/test.pdf')
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
