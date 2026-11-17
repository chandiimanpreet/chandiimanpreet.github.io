import { ArrowRight } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { projectGridClass } from '@/lib/styles'
import { cn } from '@/lib/utils'
import type { Metric } from '@/types/content'

export interface ProjectRowProps {
  /** Accordion item value; the project or system id. */
  value: string
  /** DOM id on the row, the target of in-page links from other sections. */
  anchorId: string
  /** Second DOM id, on the name, for rows that two sections link to under different ids. */
  nameAnchorId?: string
  name: string
  summary: string
  metrics: Metric[]
  /** Right-hand mono meta, e.g. a period. */
  meta?: ReactNode
  /** Open content, usually a `<dl>` of `<Fact>`s (same columns as the trigger). */
  children: ReactNode
}

// Hash targets clear the sticky header.
const ANCHOR_OFFSET = 'scroll-mt-4'

/** One accordion row. Radix renders the trigger inside an h3, so the row is the heading. */
export function ProjectRow({
  value,
  anchorId,
  nameAnchorId,
  name,
  summary,
  metrics,
  meta,
  children,
}: ProjectRowProps) {
  return (
    <AccordionItem value={value} id={anchorId} className={cn('border-border', ANCHOR_OFFSET)}>
      <AccordionTrigger className="items-start gap-4 rounded-md px-3 py-4 font-normal transition-colors duration-120 ease-brand hover:bg-card hover:no-underline [&>[data-slot=accordion-trigger-icon]]:hidden!">
        <span className={cn('grid flex-1 gap-1', projectGridClass)}>
          <span
            id={nameAnchorId}
            className={cn(
              'font-display text-h3 text-foreground transition-colors duration-120 group-hover/accordion-trigger:text-primary',
              ANCHOR_OFFSET,
            )}
          >
            {name}
          </span>
          <span className="flex flex-col gap-1 text-base text-muted-foreground">
            <span>{summary}</span>
            {metrics.length > 0 && (
              <span className="font-medium text-foreground">
                {metrics.map((m, i) => (
                  <Fragment key={m.label}>
                    {i > 0 && ' '}
                    {/* One unit per metric: wraps between metrics, inside one only if it cannot fit a
                        line. The separator trails its metric, so a line never starts with a dot. */}
                    <span className="inline-block hyphens-manual">
                      {m.value} {m.label}
                      {i < metrics.length - 1 && <span aria-hidden="true">{'\u00a0·'}</span>}
                    </span>
                  </Fragment>
                ))}
              </span>
            )}
          </span>
          {meta && (
            <span className="font-mono text-sm text-muted-foreground md:text-right">{meta}</span>
          )}
        </span>
        {/* One h3 line tall, so the arrow sits centred on the name line. */}
        <span aria-hidden="true" className="flex h-lh shrink-0 items-center text-h3">
          <ArrowRight className="size-4 text-muted-foreground transition-transform duration-240 ease-brand group-aria-expanded/accordion-trigger:rotate-90" />
        </span>
      </AccordionTrigger>
      {/* border-x matches the trigger's transparent 1px border, so both grids start at the same x. */}
      <AccordionContent className="border-x border-transparent px-3 pt-2 pb-8 text-base">
        {children}
      </AccordionContent>
    </AccordionItem>
  )
}
