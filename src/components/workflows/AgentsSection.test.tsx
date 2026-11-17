import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AgentsSection from '@/sections/AgentsSection'

describe('AgentsSection', () => {
  it('opens on the finished retry run and steps from the start', () => {
    const { container } = render(<AgentsSection />)
    expect(screen.getByRole('button', { name: 'Fail one step' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByText(/event 14 of 14/)).toBeTruthy()
    const live = container.querySelector('[aria-live="polite"]')
    expect(live?.textContent).toBe('Recommendation ready. Workflow completed.')

    fireEvent.click(screen.getByRole('button', { name: 'Step' }))
    expect(screen.getByText(/event 1 of 14/)).toBeTruthy()
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Clean run' }))
    expect(screen.getByText(/event 12 of 12/)).toBeTruthy()
  })

  it('Step mid-run pauses and advances exactly one event', () => {
    render(<AgentsSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Run trace' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
    expect(screen.getByText(/event 0 of 14/)).toBeTruthy()

    const step = screen.getByRole('button', { name: 'Step' })
    expect(step.hasAttribute('disabled')).toBe(false)
    fireEvent.click(step)
    expect(screen.getByText(/event 1 of 14/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Resume' })).toBeTruthy()
  })
})
