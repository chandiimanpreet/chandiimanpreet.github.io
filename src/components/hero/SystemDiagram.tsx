import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from 'react'

import { cn } from '@/lib/utils'

import type {
  DiagramLayout,
  EdgeId,
  Frame,
  FrameHandle,
  LayoutId,
  LogLine,
  NodeId,
} from './contracts'
import { DiagramNode } from './DiagramNode'
import { LAYOUTS, pointOnEdge } from './geometry'
import { frameAt, STILL_T_MS } from './sim'
import { TraceLog } from './TraceLog'

export interface SystemDiagramProps {
  ref: Ref<FrameHandle>
  still: boolean
  className?: string
}

const NODE_IDS: readonly NodeId[] = [
  'client',
  'gateway',
  'auth',
  'api',
  'cache',
  'db',
  'queue',
  'worker',
  'workflow',
  'agent',
]

const EDGE_IDS: readonly EdgeId[] = [
  'client-gateway',
  'gateway-auth',
  'auth-api',
  'api-cache',
  'api-db',
  'api-queue',
  'queue-worker',
  'worker-workflow',
  'workflow-agent',
  'workflow-db',
]
const EDGE_SET = new Set<EdgeId>(EDGE_IDS)

const POOL = 8
const POOL_SLOTS = Array.from({ length: POOL }, (_, i) => i)

const WIDE_QUERY = '(min-width: 40rem)'

function subscribeLayout(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {}
  const mql = window.matchMedia(WIDE_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

const readLayout = (): LayoutId =>
  typeof window.matchMedia !== 'function' || window.matchMedia(WIDE_QUERY).matches ? 'wide' : 'tall'

const canonical = (from: NodeId, to: NodeId): EdgeId =>
  EDGE_SET.has(`${from}-${to}`) ? `${from}-${to}` : `${to}-${from}`

/** Writes only when the DOM differs, so an unchanged frame costs reads and no writes. */
function attr(el: Element, name: string, value: string | null) {
  if (el.getAttribute(name) === value) return
  if (value === null) el.removeAttribute(name)
  else el.setAttribute(name, value)
}

interface Els {
  nodes: SVGGElement[]
  tags: SVGTextElement[]
  edges: SVGPolylineElement[]
  packets: SVGGElement[]
}

function collect(svg: SVGSVGElement): Els {
  return {
    nodes: [...svg.querySelectorAll<SVGGElement>('[data-node]')],
    tags: [...svg.querySelectorAll<SVGTextElement>('[data-tag]')],
    edges: [...svg.querySelectorAll<SVGPolylineElement>('[data-edge]')],
    packets: [...svg.querySelectorAll<SVGGElement>('[data-packet]')],
  }
}

function applyFrame(els: Els, layout: DiagramLayout, frame: Frame) {
  els.nodes.forEach((g, i) => {
    const id = g.dataset.node as NodeId
    attr(g, 'data-state', frame.nodes[id])
    const tag = els.tags[i]
    const text = frame.tags[id] ?? ''
    if (tag && tag.textContent !== text) tag.textContent = text
  })

  const active = new Set(frame.edges.map((id) => canonical(...(id.split('-') as [NodeId, NodeId]))))
  const retry = new Set(
    frame.packets.filter((p) => p.kind === 'retry').map((p) => canonical(p.from, p.to)),
  )
  for (const el of els.edges) {
    const id = el.dataset.edge as EdgeId
    attr(el, 'data-active', active.has(id) ? '' : null)
    attr(el, 'data-retry', retry.has(id) ? '' : null)
  }

  els.packets.forEach((g, i) => {
    const p = frame.packets[i]
    if (!p) return attr(g, 'display', 'none')
    const at = pointOnEdge(layout, p.from, p.to, p.progress) // progress arrives eased (sim.ts)
    attr(g, 'transform', `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)})`)
    attr(g, 'data-kind', p.kind)
    attr(g, 'display', null)
  })
}

// Literal class names so Tailwind can see them: each part shows only for its packet kinds (5.4).
const HALO =
  'hidden group-data-[kind=request]/packet:inline group-data-[kind=event]/packet:inline fill-primary/25'
const DOT = 'hidden group-data-[kind=request]/packet:inline fill-primary'
const RING = 'hidden group-data-[kind=response]/packet:inline fill-background stroke-primary'
const DIAMOND =
  'hidden group-data-[kind=event]/packet:inline group-data-[kind=retry]/packet:inline fill-primary'
const RETRY_RING = 'hidden group-data-[kind=retry]/packet:inline fill-none stroke-primary'

/**
 * The system map. Driven from outside through `frame(tMs)`; it never runs its own loop and never
 * re-renders per frame (React state changes only when a new trace log line arrives).
 */
export function SystemDiagram({ ref, still, className }: SystemDiagramProps) {
  const layoutId = useSyncExternalStore(subscribeLayout, readLayout)
  const layout = LAYOUTS[layoutId]
  const wide = layoutId === 'wide'
  const svgRef = useRef<SVGSVGElement>(null)
  const els = useRef<Els | null>(null)
  const lastT = useRef<number | null>(null)
  const lastLogKey = useRef<string | undefined>(undefined)
  const [log, setLog] = useState<readonly LogLine[]>([])

  const draw = useCallback(
    (tMs: number) => {
      const svg = svgRef.current
      if (!svg) return
      lastT.current = tMs
      els.current ??= collect(svg)
      const frame = frameAt(tMs)
      applyFrame(els.current, layout, frame)
      const key = frame.log.at(-1)?.key
      if (key !== lastLogKey.current) {
        lastLogKey.current = key
        setLog(frame.log)
      }
    },
    [layout],
  )

  useImperativeHandle(ref, () => ({ frame: (tMs) => draw(tMs) }), [draw])

  // Still mode draws once; a layout switch redraws the last frame so packets land on the new geometry.
  useLayoutEffect(() => {
    const t = still ? STILL_T_MS : lastT.current
    if (t !== null) draw(t)
  }, [still, draw])

  const { w, h } = layout.viewBox
  const stroke = { strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' } as const

  return (
    <div aria-hidden="true" className={className}>
      <div className={cn('relative', wide ? 'aspect-[640/400]' : 'aspect-[328/392]')}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto w-full overflow-visible font-mono"
        >
          {EDGE_IDS.map((id) => (
            <polyline
              key={id}
              data-edge={id}
              points={(layout.edges[id] ?? []).map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              className="stroke-border-strong data-[active]:stroke-primary/60 data-[retry]:[stroke-dasharray:4_4]"
              {...stroke}
            />
          ))}
          {NODE_IDS.map((id) => (
            <DiagramNode
              key={id}
              id={id}
              center={layout.nodes[id]}
              size={layout.box}
              fontSize={layout.fontSize}
              layout={layoutId}
            />
          ))}
          {POOL_SLOTS.map((i) => (
            <g key={i} data-packet="" display="none" className="group/packet">
              <circle r={8} className={HALO} />
              <circle r={4} className={DOT} />
              <circle r={4} strokeWidth={1.5} className={RING} />
              <rect
                x={-3.5}
                y={-3.5}
                width={7}
                height={7}
                transform="rotate(45)"
                className={DIAMOND}
              />
              <circle r={8} strokeWidth={1.5} strokeDasharray="3 3" className={RETRY_RING} />
            </g>
          ))}
        </svg>
        {/* 62% stays clear of the agent's left-hand tag (x >= 481 of 640) and fits a full line at 640px. */}
        {wide && <TraceLog lines={log} max={3} className="absolute bottom-0 left-0 max-w-[62%]" />}
      </div>
      {/* 12px keeps a full 43-character line on a 360px screen; min-h reserves both lines (no layout shift). */}
      {!wide && <TraceLog lines={log} max={2} className="mt-1 min-h-10 text-xs" />}
    </div>
  )
}
