import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PipelineGraph } from './PipelineGraph'
import { finishedRun, idleRun, reduce } from './trace'

describe('PipelineGraph', () => {
  it('compact renders spans, no buttons, every step done', () => {
    const { container } = render(<PipelineGraph compact />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    const steps = container.querySelectorAll('span[data-state]')
    expect(steps).toHaveLength(6)
    steps.forEach((s) => expect(s.getAttribute('data-state')).toBe('done'))
    expect(screen.getByText('Recommendation').closest('[data-state]')?.textContent).toContain(
      'done, attempt 1',
    )
    expect(screen.getByRole('link', { name: 'Run it below.' }).getAttribute('href')).toBe('#agents')
  })

  it('renders three stages of named step buttons', () => {
    render(<PipelineGraph nodes={finishedRun('retry').nodes} />)
    const lists = screen.getAllByRole('list')
    // outer <ol> plus one <ul> per stage; connectors are aria-hidden
    expect(lists).toHaveLength(4)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'JD extraction, done, attempt 1',
      'Resume parsing, done, attempt 2',
      'Skill evaluator, done, attempt 1',
      'Experience evaluator, done, attempt 1',
      'Education evaluator, done, attempt 1',
      'Recommendation, done, attempt 1',
    ])
    buttons.forEach((b) => expect(b.getAttribute('data-state')).toBe('done'))
    expect(
      within(screen.getByRole('list', { name: 'Evaluate' })).getAllByRole('button'),
    ).toHaveLength(3)
  })

  it('names idle, failed and retrying steps with a word', () => {
    const resume = () => screen.getByRole('button', { name: /^Resume parsing/ })
    const { rerender } = render(<PipelineGraph nodes={idleRun('retry').nodes} />)
    const rec = screen.getByRole('button', { name: /^Recommendation/ })
    expect(rec.getAttribute('aria-label')).toBe('Recommendation, waiting, attempt 1')
    expect(rec.getAttribute('data-state')).toBe('idle')
    expect(rec.textContent).toContain('waiting')
    rerender(<PipelineGraph nodes={reduce(idleRun('retry'), 1000).nodes} />)
    expect(resume().getAttribute('aria-label')).toBe('Resume parsing, failed, attempt 1')
    expect(resume().textContent).toContain('failed')
    rerender(<PipelineGraph nodes={reduce(idleRun('retry'), 1900).nodes} />)
    expect(resume().getAttribute('aria-label')).toBe('Resume parsing, retrying, attempt 2')
    expect(resume().textContent).toContain('attempt 2')
    // Visible icon for non-idle states, so state is never colour-only.
    expect(resume().querySelector('svg')).not.toBeNull()
  })

  it('fires onSelect and marks the selected step', () => {
    const onSelect = vi.fn()
    render(<PipelineGraph selected="skill" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: /^JD extraction/ }))
    expect(onSelect).toHaveBeenCalledWith('jd')
    const pressed = screen
      .getAllByRole('button')
      .filter((b) => b.getAttribute('aria-pressed') === 'true')
    expect(pressed.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Skill evaluator, done, attempt 1',
    ])
  })

  it('draws a connector once the next stage has left idle', () => {
    const drawn = (c: HTMLElement) =>
      [...c.querySelectorAll('li[aria-hidden="true"]')].map((li) =>
        li.querySelector('[data-drawn]')?.getAttribute('data-drawn'),
      )
    const { container, rerender } = render(<PipelineGraph nodes={idleRun('clean').nodes} />)
    expect(drawn(container)).toEqual(['false', 'false'])
    rerender(<PipelineGraph nodes={reduce(idleRun('clean'), 1800).nodes} />)
    expect(drawn(container)).toEqual(['true', 'false'])
  })
})
