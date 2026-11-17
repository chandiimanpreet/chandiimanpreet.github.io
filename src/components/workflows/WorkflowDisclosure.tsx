import { ArrowRight } from 'lucide-react'
import { memo } from 'react'

import { temporalGives } from '@/content/workflow'

/** Native disclosure: what Temporal gives this workflow. */
export const WorkflowDisclosure = memo(function WorkflowDisclosure() {
  return (
    <details className="group rounded-md border border-border">
      <summary className="flex min-h-target cursor-pointer list-none items-center gap-2 px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <ArrowRight
          aria-hidden
          className="size-4 text-primary transition-transform duration-120 group-open:rotate-90"
        />
        What Temporal gives this workflow
      </summary>
      <dl className="space-y-2 px-4 pb-4 text-sm">
        {temporalGives.map(({ term, detail }) => (
          <div key={term}>
            <dt className="inline font-medium">{term}: </dt>
            <dd className="inline text-muted-foreground">{detail}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
})
