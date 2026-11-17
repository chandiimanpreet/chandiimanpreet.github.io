import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TerminalLine } from './TerminalLine'

const TEXT = 'designing APIs, orchestrating workflows.'

const visual = (c: HTMLElement) => c.querySelector('p > span[aria-hidden="true"]:last-child')
const typed = (c: HTMLElement) => visual(c)?.firstElementChild?.textContent

describe('TerminalLine', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('gives screen readers the full text on first render and hides the visual copy', () => {
    const { container } = render(<TerminalLine text={TEXT} instant={false} />)
    expect(container.querySelector('.sr-only')?.textContent).toBe(TEXT)
    expect(visual(container)?.textContent).toContain(TEXT.slice(1)) // typed + invisible rest
    expect(typed(container)).toBe('')
  })

  it('types at constant speed after the start delay and clears its timer', () => {
    const { container } = render(<TerminalLine text={TEXT} instant={false} />)
    // Ticks land on multiples of 28ms, so 5 characters are visible from 500 + 5 * 28 rounded up a tick.
    act(() => vi.advanceTimersByTime(500 + 28 * 6))
    expect(typed(container)).toBe(TEXT.slice(0, 5))
    act(() => vi.advanceTimersByTime(28 * TEXT.length))
    expect(typed(container)).toBe(TEXT)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('instant shows everything and creates no timer', () => {
    const { container } = render(<TerminalLine text={TEXT} instant />)
    expect(typed(container)).toBe(TEXT)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('completes at once when switched to instant mid-typing and stays complete', () => {
    const { container, rerender } = render(<TerminalLine text={TEXT} instant={false} />)
    act(() => vi.advanceTimersByTime(600))
    rerender(<TerminalLine text={TEXT} instant />)
    expect(typed(container)).toBe(TEXT)
    rerender(<TerminalLine text={TEXT} instant={false} />)
    expect(typed(container)).toBe(TEXT)
    expect(vi.getTimerCount()).toBe(0)
  })
})
