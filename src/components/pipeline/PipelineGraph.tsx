import { Fragment, memo, useId } from 'react'

import { Badge } from '@/components/ui/badge'
import { linkClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

import { NODE_STATE } from './nodeState'
import { finishedRun, NODES, STAGES, type NodeId, type NodeState, type RunState } from './trace'

export interface PipelineGraphProps {
  /** Omitted: every step renders as done (hero). */
  nodes?: RunState['nodes']
  /** Hero: steps are <span>, no state labels, smaller type. */
  compact?: boolean
  selected?: NodeId
  onSelect?(id: NodeId): void
}

// Box styling per state; word and icon come from the shared NODE_STATE.
const BOX: Record<NodeState, string> = {
  idle: 'border-dashed border-input bg-transparent text-muted-foreground',
  running: 'border-2 border-primary bg-card',
  failed: 'border-dashed border-destructive',
  retrying: 'border-2 border-dashed border-primary',
  done: 'border-foreground bg-card',
}

const ALL_DONE = finishedRun('clean').nodes

const HOT: NodeState[] = ['running', 'retrying']

const EDGE =
  'fill-none stroke-2 [stroke-dasharray:1] [stroke-dashoffset:1] data-[drawn=true]:[stroke-dashoffset:0] transition-[stroke-dashoffset] duration-240 ease-brand'

/** Vertical centres (in %) of `n` evenly spaced steps. */
const centres = (n: number) => Array.from({ length: n }, (_, k) => ((k + 0.5) / n) * 100)

interface ConnectorProps {
  from: number
  to: number
  drawn: boolean
  hot: boolean
}

// Lines with % coordinates instead of a stretched viewBox, so stroke widths never distort.
function Connector({ from, to, drawn, hot }: ConnectorProps) {
  const a = centres(from)
  const b = centres(to)
  const all = [...a, ...b]
  const line = (x1: string, y1: number, x2: string, y2: number, key: string) => (
    <line
      key={key}
      x1={x1}
      y1={`${y1}%`}
      x2={x2}
      y2={`${y2}%`}
      pathLength={1}
      className={EDGE}
      data-drawn={drawn}
    />
  )
  return (
    <li
      aria-hidden="true"
      className={cn('flex justify-center md:pt-8', hot ? 'stroke-primary' : 'stroke-input')}
    >
      <svg viewBox="0 0 24 32" className="h-8 w-6 md:hidden">
        <path d="M12 0 V30" pathLength={1} className={EDGE} data-drawn={drawn} />
        <path d="M6 24 L12 31 L18 24" pathLength={1} className={EDGE} data-drawn={drawn} />
      </svg>
      <svg className="hidden h-full w-full md:block">
        {a.map((y, k) => line('0%', y, '50%', y, `a${k}`))}
        {line('50%', Math.min(...all), '50%', Math.max(...all), 'bar')}
        {b.map((y, k) => line('50%', y, '100%', y, `b${k}`))}
      </svg>
    </li>
  )
}

// Memoised: AgentsSection re-renders every frame during a replay, but `nodes` keeps its identity
// between events (see useTraceRun) and `onSelect` is a state setter, so this re-renders per event.
export const PipelineGraph = memo(function PipelineGraph({
  nodes = ALL_DONE,
  compact = false,
  selected,
  onSelect,
}: PipelineGraphProps) {
  const uid = useId()

  return (
    <figure>
      <ol className="grid gap-2 md:grid-cols-[1fr_3rem_1fr_3rem_1fr] md:gap-0">
        {STAGES.map((stage, i) => {
          const next = STAGES[i + 1]
          const labelId = `${uid}-stage-${i}`
          return (
            <Fragment key={stage.label}>
              <li className="flex flex-col">
                <p
                  id={labelId}
                  className="mb-2 h-6 text-sm leading-6 font-medium text-muted-foreground"
                >
                  {stage.label}
                </p>
                <ul
                  aria-labelledby={labelId}
                  className={cn(
                    'flex-1 gap-2 md:flex md:flex-col md:justify-around md:gap-0',
                    // Below md the two parallel parsers sit side by side (DESIGN-V2 5.5, 320 layout).
                    stage.nodes.length === 2 ? 'grid grid-cols-2' : 'flex flex-col',
                  )}
                >
                  {stage.nodes.map((id) => {
                    const { state, attempt } = nodes[id]
                    const meta = NODE_STATE[state]
                    const Icon = meta.icon
                    // Idle steps report attempt 0; the attempt they are waiting for is the first.
                    const name = `${NODES[id].label}, ${meta.word}, attempt ${Math.max(attempt, 1)}`
                    const box = cn(
                      'flex w-full items-center gap-x-2 gap-y-1 rounded-md border text-left transition-colors duration-120 ease-brand',
                      BOX[state],
                    )
                    return (
                      <li key={id} className="md:py-1">
                        {compact ? (
                          <span data-state={state} className={cn(box, 'px-2 py-1.5 text-xs')}>
                            {Icon && (
                              <Icon
                                aria-hidden="true"
                                className={cn('size-3.5 shrink-0', meta.iconClass)}
                              />
                            )}
                            <span>{NODES[id].label}</span>
                            <span className="sr-only">
                              , {meta.word}, attempt {Math.max(attempt, 1)}
                            </span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            aria-label={name}
                            aria-pressed={selected === id}
                            data-state={state}
                            onClick={() => onSelect?.(id)}
                            className={cn(
                              box,
                              // Same shape for every step: label row, then the state badge below it.
                              'min-h-target flex-col items-start px-3 py-2 text-sm hover:bg-accent',
                              // Selection is a fill plus an underline bar; focus keeps the global outline.
                              selected === id &&
                                'bg-secondary shadow-[inset_0_-3px_0_var(--primary)]',
                            )}
                          >
                            <span>{NODES[id].label}</span>
                            <Badge variant="secondary" className="rounded-sm font-mono">
                              {Icon && <Icon aria-hidden="true" className={meta.iconClass} />}
                              {state === 'retrying' ? `attempt ${attempt}` : meta.word}
                            </Badge>
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </li>
              {next && (
                <Connector
                  from={stage.nodes.length}
                  to={next.nodes.length}
                  drawn={next.nodes.some((id) => nodes[id].state !== 'idle')}
                  hot={next.nodes.some((id) => HOT.includes(nodes[id].state))}
                />
              )}
            </Fragment>
          )
        })}
      </ol>
      <figcaption className="mt-4 text-sm text-muted-foreground">
        {compact ? (
          <>
            One Temporal workflow from Natalie, my hiring platform.{' '}
            <a href="#agents" className={linkClass}>
              Run it below.
            </a>
          </>
        ) : (
          'The steps are LLM agents built with LangGraph on AWS Bedrock.'
        )}
      </figcaption>
    </figure>
  )
})
