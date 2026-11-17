import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFrameLoop } from './useFrameLoop'

// Manual rAF: `tick(ms)` advances the clock and runs the one pending callback.
let now = 0
let pending: FrameRequestCallback | null = null
const tick = (ms: number) => {
  now += ms
  const cb = pending
  pending = null
  cb?.(now)
}
let visibility: DocumentVisibilityState = 'visible'

beforeEach(() => {
  now = 0
  pending = null
  visibility = 'visible'
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    pending = cb
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {
    pending = null
  })
  vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const target = { current: document.body }
const setup = (paused = false, startDelayMs = 0) => {
  const onFrame = vi.fn<(t: number, dt: number) => void>()
  const hook = renderHook(({ p }) => useFrameLoop(onFrame, { target, paused: p, startDelayMs }), {
    initialProps: { p: paused },
  })
  return { onFrame, ...hook }
}

describe('useFrameLoop', () => {
  it('passes accumulated running time after the start delay', () => {
    const { onFrame } = setup(false, 50)
    tick(0) // first callback only records the timestamp
    tick(20)
    tick(20)
    expect(onFrame).not.toHaveBeenCalled() // 40ms < 50ms delay
    tick(20)
    expect(onFrame).toHaveBeenLastCalledWith(10, 20)
  })

  it('skips callbacks closer than 15ms and clamps dt to 100ms', () => {
    const { onFrame } = setup()
    tick(0)
    tick(10)
    expect(onFrame).not.toHaveBeenCalled()
    tick(5000)
    expect(onFrame).toHaveBeenLastCalledWith(100, 100)
  })

  it('runs nothing while paused, and resumes without jumping', () => {
    const { onFrame, rerender } = setup(true)
    expect(pending).toBeNull()
    rerender({ p: false })
    tick(0)
    tick(20)
    expect(onFrame).toHaveBeenLastCalledWith(20, 20)
    rerender({ p: true })
    expect(pending).toBeNull()
    now += 60_000
    rerender({ p: false })
    tick(0)
    tick(16)
    expect(onFrame).toHaveBeenLastCalledWith(36, 16)
  })

  it('stops while the document is hidden', () => {
    const { onFrame } = setup()
    visibility = 'hidden'
    document.dispatchEvent(new Event('visibilitychange'))
    expect(pending).toBeNull()
    visibility = 'visible'
    document.dispatchEvent(new Event('visibilitychange'))
    tick(0)
    tick(20)
    expect(onFrame).toHaveBeenCalledTimes(1)
  })

  it('cancels on unmount', () => {
    const { onFrame, unmount } = setup()
    unmount()
    tick(0)
    tick(20)
    expect(onFrame).not.toHaveBeenCalled()
  })
})
