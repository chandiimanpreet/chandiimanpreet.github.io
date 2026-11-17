import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

export interface FrameLoopOptions {
  target: RefObject<Element | null>
  paused: boolean
  startDelayMs?: number
}

const MIN_FRAME_MS = 15
const MAX_DT_MS = 100

/**
 * DESIGN-V3 4.8: the page's only rAF loop. Runs while `target` is on screen, the tab is visible and
 * not `paused` (callers fold reduced motion into `paused`). `tMs` is accumulated running time after
 * `startDelayMs`, never wall-clock, and `dtMs` is clamped, so resuming never jumps ahead.
 */
export function useFrameLoop(
  onFrame: (tMs: number, dtMs: number) => void,
  { target, paused, startDelayMs = 0 }: FrameLoopOptions,
): void {
  const callback = useRef(onFrame)
  useLayoutEffect(() => {
    callback.current = onFrame
  })
  // Survives pauses and re-runs of the effect below.
  const runningMs = useRef(0)

  useEffect(() => {
    if (paused) return
    const el = target.current
    const observable = el !== null && typeof IntersectionObserver === 'function'
    // Without an observer (old browsers, jsdom) assume the hero is on screen.
    let intersecting = !observable
    let raf = 0
    let last: number | null = null

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (last === null) {
        last = now
        return
      }
      const elapsed = now - last
      if (elapsed < MIN_FRAME_MS) return
      last = now
      const dt = Math.min(elapsed, MAX_DT_MS)
      runningMs.current += dt
      const t = runningMs.current - startDelayMs
      if (t >= 0) callback.current(t, dt)
    }

    function sync() {
      const run = intersecting && document.visibilityState === 'visible'
      if (run && raf === 0) {
        last = null
        raf = requestAnimationFrame(loop)
      } else if (!run && raf !== 0) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const io = observable
      ? new IntersectionObserver((entries) => {
          intersecting = entries.at(-1)?.isIntersecting ?? false
          sync()
        })
      : null
    if (io && el) io.observe(el)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      io?.disconnect()
      document.removeEventListener('visibilitychange', sync)
      cancelAnimationFrame(raf)
    }
  }, [paused, target, startDelayMs])
}
