import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ExternalLink } from './ExternalLink'

describe('ExternalLink', () => {
  it('renders safe links with noopener noreferrer', () => {
    render(<ExternalLink href="https://github.com/tj">tj</ExternalLink>)
    const a = screen.getByRole('link', { name: 'tj' })
    expect(a.getAttribute('href')).toBe('https://github.com/tj')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders unsafe hrefs as plain text and hostile text literally', () => {
    const hostile = '<img src=x onerror=alert(1)>'
    const { container } = render(<ExternalLink href="javascript:alert(1)">{hostile}</ExternalLink>)
    expect(screen.queryByRole('link')).toBeNull()
    expect(container.textContent).toBe(hostile)
    expect(container.querySelector('img')).toBeNull()
  })
})
