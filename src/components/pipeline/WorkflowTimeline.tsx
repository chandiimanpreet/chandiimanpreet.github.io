import { useId } from 'react'

import { spanView } from '@/components/pipeline/nodeState'
import { barGeometry, formatSeconds, pct } from '@/components/pipeline/timeline'
import { NODES, type NodeId, type NodeState, type Span } from '@/components/pipeline/trace'
import { cn } from '@/lib/utils'

export interface WorkflowTimelineProps {
  spans: Span[]
  clockMs: number
  totalMs: number
  selected?: NodeId
  onSelect?(id: NodeId): void
}

const TICK_MS = 2000

const BAR: Record<Span['outcome'], string> = {
  done: 'bg-foreground',
  running: 'bg-primary',
  // Hollow and dashed, so a failed attempt differs by shape, not only by colour.
  failed: 'border-2 border-dashed border-destructive',
}

// Attempt chip border per state: dashed for failed and retried attempts (shape, not only colour).
const CHIP: Record<NodeState, string> = {
  idle: 'border-input',
  running: 'border-primary',
  retrying: 'border-dashed border-primary',
  failed: 'border-dashed border-destructive',
  done: 'border-input',
}

// Below md the table's rows become stacked grids. Changing `display` on table elements makes
// some browsers drop table semantics, so the roles are restated explicitly.
const CELL = 'block md:table-cell md:px-3 md:py-2 md:align-middle'
const HEAD = cn(CELL, 'font-medium md:align-bottom')
// Fixed layout with set widths (Outcome takes the rest), so 'not yet' and 'waiting' placeholders
// never shift the columns as values land during a replay.
const NARROW = cn(HEAD, 'md:w-24')
const MINI_LABEL = 'block text-xs text-muted-foreground md:hidden'

export function WorkflowTimeline({
  spans,
  clockMs,
  totalMs,
  selected,
  onSelect,
}: WorkflowTimelineProps) {
  const noteId = useId()
  const ticks = Array.from({ length: Math.floor(totalMs / TICK_MS) + 1 }, (_, i) => i * TICK_MS)
  const playhead = clockMs < totalMs ? pct(clockMs, totalMs) : null

  return (
    <div>
      <table
        role="table"
        aria-describedby={noteId}
        className="block w-full text-sm md:table md:table-fixed"
      >
        {/* Block below md: inside a block-display table the caption would shrink to min-content. */}
        <caption className="mb-2 block text-left font-semibold md:table-caption">
          Workflow execution
        </caption>
        <thead role="rowgroup" className="sr-only md:not-sr-only">
          <tr role="row" className="text-left text-muted-foreground">
            <th role="columnheader" scope="col" className={cn(HEAD, 'md:w-40')}>
              Step
            </th>
            <th role="columnheader" scope="col" className={NARROW}>
              Attempts
            </th>
            <th role="columnheader" scope="col" className={HEAD}>
              Outcome
              <span
                aria-hidden="true"
                className="relative mt-1 block h-4 font-mono text-xs font-normal"
              >
                {ticks.map((t) => (
                  <span key={t} className="absolute" style={{ left: `${pct(t, totalMs)}%` }}>
                    {t / 1000}s
                  </span>
                ))}
              </span>
            </th>
            <th role="columnheader" scope="col" className={NARROW}>
              Started
            </th>
            <th role="columnheader" scope="col" className={NARROW}>
              Ended
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="block md:table-row-group">
          {Object.values(NODES).map((node) => {
            const own = spans
              .filter((s) => s.node === node.id)
              .sort((a, b) => a.attempt - b.attempt)
            const first = own[0]
            const last = own.at(-1)
            const isSelected = selected === node.id
            return (
              <tr
                key={node.id}
                role="row"
                data-selected={isSelected || undefined}
                className={cn(
                  'grid grid-cols-3 gap-x-4 gap-y-2 border-t border-border px-3 py-3 md:table-row md:p-0',
                  isSelected && 'bg-accent ring-2 ring-ring ring-inset',
                )}
              >
                <th
                  role="rowheader"
                  scope="row"
                  className={cn(CELL, 'col-span-3 text-left font-medium md:whitespace-nowrap')}
                >
                  {onSelect ? (
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(node.id)}
                      className="min-h-target w-full rounded-sm text-left transition-colors duration-120 hover:text-primary"
                    >
                      {node.label}
                    </button>
                  ) : (
                    node.label
                  )}
                </th>
                <td role="cell" className={cn(CELL, 'font-mono')}>
                  <span aria-hidden="true" className={MINI_LABEL}>
                    Attempts
                  </span>
                  {own.length}
                </td>
                <td role="cell" className={cn(CELL, 'col-span-3 row-start-2')}>
                  <span aria-hidden="true" className="relative block h-4">
                    {own.slice(1).map((s, i) => {
                      // Backoff gap between an attempt and the retry that follows it.
                      const g = barGeometry(own[i]?.endMs ?? s.startMs, s.startMs, clockMs, totalMs)
                      return (
                        <span
                          key={`gap-${s.attempt}`}
                          className="absolute top-1/2 border-t-2 border-dotted border-input"
                          style={{ left: `${g.left}%`, width: `${g.width}%` }}
                        />
                      )
                    })}
                    {own.map((s) => {
                      const g = barGeometry(s.startMs, s.endMs, clockMs, totalMs)
                      return (
                        <span
                          key={s.attempt}
                          data-outcome={s.outcome}
                          className={cn(
                            'absolute top-1 h-2 min-w-1 origin-left rounded-sm transition-transform duration-240 ease-brand starting:scale-x-0',
                            BAR[s.outcome],
                          )}
                          style={{ left: `${g.left}%`, width: `${g.width}%` }}
                        />
                      )
                    })}
                    {playhead !== null && (
                      <span
                        data-playhead
                        className="absolute inset-y-0 w-0.5 bg-primary"
                        style={{ left: `${playhead}%` }}
                      />
                    )}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    {own.length === 0 && <span className="text-muted-foreground">waiting</span>}
                    {own.map((s, i) => {
                      const view = spanView(s)
                      const Icon = view.icon
                      return (
                        <span
                          key={s.attempt}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-sm border px-1.5 font-mono text-xs',
                            CHIP[view.state],
                          )}
                        >
                          {i > 0 && <span className="sr-only">, </span>}
                          {Icon && (
                            <Icon aria-hidden="true" className={cn('size-3', view.iconClass)} />
                          )}
                          {own.length > 1 ? `attempt ${s.attempt} ${s.outcome}` : s.outcome}
                        </span>
                      )
                    })}
                  </span>
                </td>
                <td role="cell" className={cn(CELL, 'font-mono')}>
                  <span aria-hidden="true" className={MINI_LABEL}>
                    Started
                  </span>
                  {first ? formatSeconds(first.startMs) : 'not yet'}
                </td>
                <td role="cell" className={cn(CELL, 'font-mono')}>
                  <span aria-hidden="true" className={MINI_LABEL}>
                    Ended
                  </span>
                  {last?.endMs != null ? formatSeconds(last.endMs) : 'not yet'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p id={noteId} className="mt-2 text-sm text-muted-foreground">
        Simulated replay. Started and Ended are replay seconds, not production timings.
      </p>
    </div>
  )
}
