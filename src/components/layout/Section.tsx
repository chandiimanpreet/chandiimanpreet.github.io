import type { ComponentProps, ReactNode } from 'react'

import { headingId } from '@/content/nav'
import { cn } from '@/lib/utils'
import type { SectionId } from '@/types/content'

export interface SectionProps extends Omit<ComponentProps<'section'>, 'id' | 'title'> {
  id: SectionId
  /** Mono request line above the heading, e.g. `GET /projects`. Decoration, hidden from AT. */
  eyebrow: string
  /** Visible h2 text. */
  title: ReactNode
}

/** Landmark wrapper for every section below the hero: id, aria-labelledby, eyebrow and h2. */
export function Section({ id, eyebrow, title, className, children, ...rest }: SectionProps) {
  return (
    <section
      {...rest}
      id={id}
      aria-labelledby={headingId(id)}
      className={cn('reveal mx-auto w-full max-w-content px-gutter py-section', className)}
    >
      <p aria-hidden="true" className="font-mono text-code text-muted-foreground">
        {eyebrow}
      </p>
      <h2 id={headingId(id)} className="mt-3 font-display text-h2">
        {title}
      </h2>
      {children}
    </section>
  )
}
