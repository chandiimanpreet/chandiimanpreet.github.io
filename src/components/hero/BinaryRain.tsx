import { useEffect, useImperativeHandle, useRef, type Ref, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import type { FrameHandle } from './contracts'
import {
  createTokens,
  MOBILE_VIEWPORT,
  placeToken,
  stepTokens,
  tickerFade,
  tickerLine,
  tickerSlot,
  tokenArea,
  TICKER_STEPS,
  TOKEN_HOLD_STEPS,
  type TokenArea,
  type TokenState,
} from './events'
import {
  canvasScale,
  createColumns,
  expireCells,
  pointerBoost,
  rainConfig,
  seeded,
  STEP_MS,
  STILL_SEED,
  STILL_STEPS,
  stepColumns,
  TRAIL_ALPHA,
  type RainColumns,
  type RainConfig,
} from './rain'

export interface BinaryRainProps {
  ref: Ref<FrameHandle>
  still: boolean
  pointerX?: RefObject<number | null>
  className?: string
}

// Status tokens sit above the rain; the ticker reads as faint foreground through the hero scrim.
const TOKEN_ALPHA = 0.85
const TICKER_ALPHA = 0.6
const TICKER_FONT_PX = 12

/**
 * Hero rain canvas (DESIGN-V3 section 6) with occasional HTTP status tokens and a one-line log tail.
 * Driven by the hero frame loop through `frame()`; no loop of its own.
 */
export function BinaryRain({ ref, still, pointerX, className }: BinaryRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paintRef = useRef<((steps: number) => void) | null>(null)
  const accRef = useRef(0)

  useImperativeHandle(
    ref,
    () => ({
      frame(_tMs, dtMs) {
        accRef.current += dtMs
        const steps = Math.floor(accRef.current / STEP_MS)
        if (steps === 0) return
        accRef.current -= steps * STEP_MS
        paintRef.current?.(steps)
      },
    }),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return

    let colors = { rain: '', head: '', bg: '', ok: '', fail: '', text: '' }
    let font = ''
    let rainFont = ''
    let tickerFont = ''
    let w = 0
    let h = 0
    let left = 0
    let cfg: RainConfig | null = null
    let cols: RainColumns | null = null
    let area: TokenArea | null = null
    let tokens: TokenState | null = null
    let ticker: ReturnType<typeof tickerSlot> = null
    let tickerText = ''
    let tickerIndex = -1
    let tickerW = 0
    let mobile = false
    let rand = Math.random
    let fontsReady = false
    let cancelled = false

    const readColors = () => {
      const cs = getComputedStyle(canvas)
      colors = {
        rain: cs.getPropertyValue('--rain'),
        head: cs.getPropertyValue('--rain-head'),
        bg: cs.getPropertyValue('--background'),
        ok: cs.getPropertyValue('--primary'),
        fail: cs.getPropertyValue('--destructive'),
        text: cs.getPropertyValue('--foreground'),
      }
      font = cs.getPropertyValue('--font-mono') || 'monospace'
      tickerFont = `400 ${TICKER_FONT_PX}px ${font}`
    }

    const clear = () => {
      ctx.globalAlpha = 1
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const drawToken = (code: string, column: number, row: number) => {
      if (!cfg || !cols) return
      const { cell, columns } = cfg
      ctx.fillStyle = colors.bg
      ctx.fillRect(column * cell, row * cell, 3 * cell, cell)
      ctx.globalAlpha = TOKEN_ALPHA
      ctx.fillStyle = code[0] === '2' ? colors.ok : code[0] === '3' ? colors.head : colors.fail
      // Set as one word, centred on its three cells, so it reads as a status code rather than three bits.
      ctx.fillText(code, (column + 1.5) * cell, row * cell)
      ctx.globalAlpha = 1
      // Fresh age while held, so the rain's own cell expiry clears the token once it has faded.
      const i = row * columns + column
      cols.age.fill(0, i, i + 3)
    }

    const drawTicker = (step: number) => {
      if (!ticker) return
      const { x, y, maxWidth } = ticker
      ctx.fillStyle = colors.bg
      ctx.fillRect(x - 2, y - 2, tickerW + 4, TICKER_FONT_PX + 4)
      ctx.font = tickerFont
      ctx.textAlign = 'left'
      const index = Math.floor(step / TICKER_STEPS)
      if (index !== tickerIndex) {
        tickerIndex = index
        tickerText = tickerLine(step)
        tickerW = Math.min(ctx.measureText(tickerText).width, maxWidth)
      }
      ctx.globalAlpha = TICKER_ALPHA * tickerFade(step)
      ctx.fillStyle = colors.text
      ctx.fillText(tickerText, x, y, maxWidth)
      ctx.globalAlpha = 1
      ctx.font = rainFont
      ctx.textAlign = 'center'
    }

    const paint = (steps: number, live = true) => {
      if (!cfg || !cols) return
      for (let s = 0; s < steps; s++) {
        const px = pointerX?.current ?? null
        const draws = stepColumns(
          cols,
          cfg,
          rand,
          pointerBoost(cfg, px === null ? null : px - left),
        )
        ctx.globalAlpha = TRAIL_ALPHA
        ctx.fillStyle = colors.bg
        ctx.fillRect(0, 0, w, h)
        ctx.globalAlpha = 1
        const dead = expireCells(cols)
        if (dead.length > 0) {
          // One path, one fill: clears what the alpha fade cannot reach in 8 bits.
          ctx.beginPath()
          for (const i of dead) {
            const { cell, columns } = cfg
            ctx.rect((i % columns) * cell, Math.floor(i / columns) * cell, cell, cell)
          }
          ctx.fill()
        }
        for (const d of draws) {
          ctx.fillStyle = d.head ? colors.head : colors.rain
          ctx.fillText(d.bit ? '1' : '0', (d.column + 0.5) * cfg.cell, d.row * cfg.cell)
        }
        if (!live || !tokens) continue
        stepTokens(tokens, area, rand, mobile)
        for (const t of tokens.tokens) {
          if (t.start <= tokens.step && t.start + TOKEN_HOLD_STEPS > tokens.step) {
            drawToken(t.code, t.column, t.row)
          }
        }
        drawTicker(tokens.step)
      }
    }

    const reset = () => {
      if (!fontsReady || w === 0 || h === 0) return
      const scale = canvasScale(w, h, window.devicePixelRatio || 1)
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      // Resizing the backing store resets the context, so font and alignment are set here, once per resize.
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      const viewportW = window.innerWidth
      cfg = rainConfig(w, h, viewportW)
      rainFont = `400 ${cfg.cell - 2}px ${font}`
      ctx.font = rainFont
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      clear()
      accRef.current = 0
      rand = still ? seeded(STILL_SEED) : Math.random
      cols = createColumns(cfg, rand)
      mobile = viewportW < MOBILE_VIEWPORT
      area = tokenArea(cfg, w, h, viewportW)
      tokens = createTokens(rand, mobile)
      ticker = tickerSlot(w, h, viewportW)
      tickerW = 0
      tickerIndex = -1
      if (still) {
        // One status token, no ticker: a log line that never changes would read as stuck.
        paint(STILL_STEPS, false)
        if (area) {
          const at = placeToken(area, rand)
          drawToken('200', at.column, at.row)
        }
      }
    }

    readColors()
    clear() // an opaque canvas starts black; paint the page colour before fonts load

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      w = entry.contentRect.width
      h = entry.contentRect.height
      left = canvas.getBoundingClientRect().left
      reset()
    })
    resizeObserver.observe(canvas)

    const themeObserver = new MutationObserver(() => {
      readColors()
      if (still) reset()
      else clear()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    void document.fonts.ready.then(() => {
      if (cancelled) return
      fontsReady = true
      reset()
    })

    paintRef.current = still ? null : paint

    return () => {
      cancelled = true
      paintRef.current = null
      resizeObserver.disconnect()
      themeObserver.disconnect()
    }
  }, [still, pointerX])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-20 size-full',
        'animate-in fade-in fill-mode-both duration-900 ease-brand motion-reduce:animate-none',
        className,
      )}
    />
  )
}
