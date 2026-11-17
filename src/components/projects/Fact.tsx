import type { ReactNode } from 'react'

import { projectGridClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

export interface FactProps {
  term: string
  children: ReactNode
}

/**
 * One term/detail pair inside a project's `<dl>`; term above the detail below `md`. From `md` it
 * shares the row trigger's columns, so the detail starts under the row description.
 */
export function Fact({ term, children }: FactProps) {
  return (
    <div className={cn('grid gap-1', projectGridClass)}>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="max-w-measure space-y-3 text-muted-foreground md:col-span-2">{children}</dd>
    </div>
  )
}
