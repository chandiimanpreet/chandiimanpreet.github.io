import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import HeroSection from './HeroSection'

// DESIGN-V3 5.9, verbatim.
const CAPTION =
  'Diagram of a backend system handling simulated requests. A request enters through an API gateway, passes authentication and rate limiting, and reaches the API service. Reads are answered from a cache, or from the database when the cache misses. Writes are placed on a queue and picked up by a worker, which runs a durable workflow. One workflow step calls an agent service, fails once, waits, and is retried before the result is committed to the database.'

describe('HeroSection', () => {
  it('has one h1, a new-tab resume link, and the 5.9 figcaption', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('ManpreetSingh')
    const resume = screen.getByRole('link', { name: /resume/i })
    expect(resume.getAttribute('href')).toMatch(/^https:\/\/drive\.google\.com\//)
    expect(resume.getAttribute('target')).toBe('_blank')
    expect(screen.getByRole('link', { name: /view projects/i }).getAttribute('href')).toBe(
      '#projects',
    )
    expect(container.querySelector('figcaption')?.textContent).toBe(CAPTION)
  })

  it('has one decorative canvas and the core tools list', () => {
    const { container } = render(<HeroSection />)
    const canvases = container.querySelectorAll('canvas')
    expect(canvases).toHaveLength(1)
    expect(canvases[0]?.getAttribute('aria-hidden')).toBe('true')
    expect(canvases[0]?.querySelector('a, button, [tabindex]')).toBeNull()
    const tools = screen.getByRole('list', { name: 'Core tools' })
    expect(tools.querySelectorAll('li')).toHaveLength(7)
  })

  it('has no pause control (the owner removed it)', () => {
    render(<HeroSection />)
    expect(screen.queryByRole('button', { name: /pause/i })).toBeNull()
  })
})
