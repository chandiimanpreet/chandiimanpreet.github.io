import { ArrowDown, ArrowRight } from 'lucide-react'
import { memo } from 'react'

import { Todo } from '@/components/shared/Todo'
import { requestPath } from '@/content/workflow'
import { cn } from '@/lib/utils'

export interface RequestPathProps {
  /** A run is playing or paused: the workflow box is highlighted. */
  inProgress: boolean
}

// [CONFIRM] DESIGN-V2 section 10: hops the resume does not spell out, named in one marker.
const unconfirmed = requestPath
  .filter((hop) => hop.confirm)
  .map((hop) => `${hop.via} → ${hop.label}`)
  .join(' and ')

/** Reads "Client; HTTP, Express API; starts, Temporal workflow; SSE progress, Client". */
// Memoised: one boolean prop, so replay frames skip it.
export const RequestPath = memo(function RequestPath({ inProgress }: RequestPathProps) {
  return (
    <div>
      <h3 className="text-h3">Request path</h3>
      <ol className="mt-4 flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center">
        {requestPath.map((hop, i) => (
          <li key={i} className="flex flex-col items-start gap-2 md:flex-row md:items-center">
            {hop.via && (
              <span className="flex flex-wrap items-center gap-1.5 font-mono text-code text-muted-foreground">
                <ArrowDown aria-hidden className="size-4 md:hidden" />
                {hop.via}
                <span className="sr-only">,</span>
                <ArrowRight aria-hidden className="hidden size-4 md:inline" />
              </span>
            )}
            <span
              className={cn(
                'rounded-md border border-input bg-card px-3 py-2 text-sm font-medium transition-colors duration-120',
                hop.workflow && inProgress && 'border-primary',
              )}
            >
              {hop.label}
            </span>
          </li>
        ))}
      </ol>
      {/* One marker below the strip, so the strip stays on one line. */}
      {unconfirmed && (
        <div className="mt-3">
          <Todo what={`confirm the ${unconfirmed} hops`} />
        </div>
      )}
      <p className="mt-4 max-w-measure text-sm text-muted-foreground">
        The API hands the job to Temporal on a priority-tiered task queue, so one user&apos;s batch
        cannot starve another&apos;s.
      </p>
    </div>
  )
})
