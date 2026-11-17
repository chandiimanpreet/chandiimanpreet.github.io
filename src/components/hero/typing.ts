import { useEffect, useState } from 'react'

export interface TypewriterOptions {
  msPerChar?: number
  startDelayMs?: number
  instant: boolean
}

/** Characters visible after `elapsedMs` of typing, clamped to `0..total`. */
export function typedLength(elapsedMs: number, total: number, msPerChar: number): number {
  if (msPerChar <= 0) return total
  return Math.min(total, Math.max(0, Math.floor(elapsedMs / msPerChar)))
}

/**
 * DESIGN-V3 4.3: constant-speed typing on one self-clearing interval. `instant` (reduced motion, or the
 * pause button) completes it at once and it stays complete, so un-pausing never retypes the line.
 */
export function useTypewriter(
  text: string,
  { msPerChar = 28, startDelayMs = 500, instant }: TypewriterOptions,
): { count: number; done: boolean } {
  const total = text.length
  const [typed, setTyped] = useState(() => (instant ? total : 0))
  // Adjusting state during render (not in an effect) so the completed text shows on this same render.
  if (instant && typed < total) setTyped(total)
  const done = typed >= total

  useEffect(() => {
    if (instant || done) return
    const start = Date.now()
    const id = setInterval(() => {
      const next = typedLength(Date.now() - start - startDelayMs, total, msPerChar)
      setTyped(next)
      if (next >= total) clearInterval(id)
    }, msPerChar)
    return () => clearInterval(id)
  }, [instant, done, total, msPerChar, startDelayMs])

  return { count: Math.min(typed, total), done }
}
