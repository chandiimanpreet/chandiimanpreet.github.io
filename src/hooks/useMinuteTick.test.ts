import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useMinuteTick } from './useMinuteTick'

describe('useMinuteTick', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-17T09:02:15Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('ticks on the minute boundary, pauses while hidden, and refreshes on return', () => {
    const { result, unmount } = renderHook(() => useMinuteTick())
    expect(result.current.toISOString()).toBe('2026-11-17T09:02:15.000Z')

    act(() => vi.advanceTimersByTime(44_999))
    expect(result.current.toISOString()).toBe('2026-11-17T09:02:15.000Z')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.toISOString()).toBe('2026-11-17T09:03:00.000Z')

    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    act(() => vi.advanceTimersByTime(180_000))
    expect(result.current.toISOString()).toBe('2026-11-17T09:03:00.000Z')
    expect(vi.getTimerCount()).toBe(0)

    hidden.mockReturnValue(false)
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.toISOString()).toBe('2026-11-17T09:06:00.000Z')

    unmount()
    expect(vi.getTimerCount()).toBe(0)
    hidden.mockRestore()
  })
})
