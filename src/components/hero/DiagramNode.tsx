import { cn } from '@/lib/utils'

import type { LayoutId, NodeId, Point } from './contracts'

export interface DiagramNodeProps {
  id: NodeId
  center: Point
  size: { w: number; h: number }
  fontSize: number
  /** Tag placement differs per layout (DESIGN-V3 5.5). */
  layout: LayoutId
}

type Side = 'right' | 'left' | 'below-right' | 'below-left'

// Sub-label and tag size per layout, chosen to render at >= 9px at each layout's narrowest screen
// (wide at 640px is drawn at 0.9x, tall at 320px at 0.88x).
const SMALL: Record<LayoutId, number> = { wide: 10, tall: 10.5 }
const GAP = 8
// "Below" labels sit this far either side of the box centre, where a vertical edge leaves the box:
// clears the edge and a retry ring (r 8 plus stroke) travelling on it by 4 units.
const BELOW_OFFSET = 13
const CLIENT_R = 9

// Sides are picked so no tag or sub-label touches an edge, another box or the viewBox edge (wide is
// 640 wide, so the right column's labels go left or below).
const SUB_LABELS: Record<LayoutId, Partial<Record<NodeId, { text: string; side: Side }>>> = {
  wide: {
    auth: { text: 'rate limit', side: 'below-right' },
    workflow: { text: 'durable', side: 'below-right' },
    agent: { text: 'llm', side: 'left' },
  },
  tall: {
    auth: { text: 'rate limit', side: 'below-left' },
    workflow: { text: 'durable', side: 'below-right' },
    agent: { text: 'llm', side: 'right' },
  },
}

const TAG_SIDES: Record<LayoutId, Partial<Record<NodeId, Side>>> = {
  wide: { cache: 'right', db: 'below-right', queue: 'left', workflow: 'below-left', agent: 'left' },
  tall: {
    cache: 'left',
    db: 'below-right',
    queue: 'below-right',
    workflow: 'left',
    agent: 'right',
  },
}

function place(side: Side, c: Point, half: { w: number; h: number }, small: number) {
  const below = c.y + half.h + GAP + small / 2
  switch (side) {
    case 'right':
      return { x: c.x + half.w + GAP, y: c.y, anchor: 'start' as const }
    case 'left':
      return { x: c.x - half.w - GAP, y: c.y, anchor: 'end' as const }
    case 'below-right':
      return { x: c.x + BELOW_OFFSET, y: below, anchor: 'start' as const }
    case 'below-left':
      return { x: c.x - BELOW_OFFSET, y: below, anchor: 'end' as const }
  }
}

const NODE_CLASS =
  'group/node text-border-strong transition-colors duration-120 ease-brand data-[state=idle]:duration-240 data-[state=active]:text-primary data-[state=ok]:text-ok data-[state=failed]:text-destructive data-[state=backoff]:text-primary'

// Stroke colour comes from the group's text colour (currentColor) so one transition drives every outline.
const OUTLINE_CLASS =
  'fill-transparent stroke-current transition-colors duration-120 ease-brand group-data-[state=idle]/node:duration-240 group-data-[state=active]/node:fill-primary/10 group-data-[state=active]/node:stroke-2 group-data-[state=ok]/node:stroke-2 group-data-[state=failed]/node:stroke-2 group-data-[state=failed]/node:[stroke-dasharray:4_3] group-data-[state=backoff]/node:[stroke-dasharray:2_4]'

// Labels outside the boxes sit over the trace field: a background-coloured stroke under the glyphs keeps them clean.
const HALO = 'stroke-background [paint-order:stroke] [stroke-linejoin:round]'
const HALO_WIDTH = 3

const TAG_CLASS = cn(
  HALO,
  'fill-muted-foreground group-data-[state=ok]/node:fill-ok group-data-[state=failed]/node:fill-destructive',
)

/** One node. `data-state` and the tag's text are written imperatively by SystemDiagram. */
export function DiagramNode({ id, center, size, fontSize, layout }: DiagramNodeProps) {
  const isClient = id === 'client'
  const half = isClient ? { w: CLIENT_R, h: CLIENT_R } : { w: size.w / 2, h: size.h / 2 }
  const small = SMALL[layout]
  const sub = SUB_LABELS[layout][id]
  const tagSide = TAG_SIDES[layout][id] ?? 'right'
  const tag = place(tagSide, center, half, small)
  const subAt = sub ? place(sub.side, center, half, small) : null
  // Agent has its tag and its sub-label on the same side: stack them instead of overlapping.
  const stacked = sub?.side === tagSide ? small * 0.7 : 0
  const left = center.x - half.w
  const top = center.y - half.h
  const stroke = { strokeWidth: 1.5, vectorEffect: 'non-scaling-stroke' } as const

  return (
    <g data-node={id} data-state="idle" className={NODE_CLASS}>
      {isClient ? (
        <>
          <circle cx={center.x} cy={center.y} r={CLIENT_R} className="fill-card" />
          <circle cx={center.x} cy={center.y} r={CLIENT_R} className={OUTLINE_CLASS} {...stroke} />
          <text
            x={center.x}
            y={center.y + CLIENT_R + GAP}
            fontSize={fontSize}
            textAnchor="middle"
            dominantBaseline="hanging"
            strokeWidth={HALO_WIDTH}
            className={cn(HALO, 'fill-foreground')}
          >
            client
          </text>
        </>
      ) : (
        <>
          <rect x={left} y={top} width={size.w} height={size.h} rx={4} className="fill-card" />
          <rect
            x={left}
            y={top}
            width={size.w}
            height={size.h}
            rx={4}
            className={OUTLINE_CLASS}
            {...stroke}
          />
          {id === 'db' && (
            <line
              x1={left}
              x2={left + size.w}
              y1={top + 4}
              y2={top + 4}
              className="stroke-current"
              {...stroke}
            />
          )}
          <text
            x={center.x}
            y={center.y}
            fontSize={fontSize}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground"
          >
            {id === 'db' ? 'database' : id}
          </text>
        </>
      )}
      {sub && subAt && (
        <text
          x={subAt.x}
          y={subAt.y + stacked}
          fontSize={small}
          textAnchor={subAt.anchor}
          dominantBaseline="central"
          strokeWidth={HALO_WIDTH}
          className={cn(HALO, 'fill-muted-foreground')}
        >
          {sub.text}
        </text>
      )}
      <text
        data-tag=""
        x={tag.x}
        y={tag.y - stacked}
        fontSize={small}
        textAnchor={tag.anchor}
        dominantBaseline="central"
        strokeWidth={HALO_WIDTH}
        className={TAG_CLASS}
      />
    </g>
  )
}
