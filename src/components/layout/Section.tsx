import { useContext, type ComponentProps, type ReactNode } from 'react'

import { headingId } from '@/content/nav'
import { cn } from '@/lib/utils'
import type { SectionId } from '@/types/content'

import { RailNode } from './Rail'
import {
  FORK_SECTION_PL,
  FORK_X_IN_SECTION,
  H2_LINE_Y,
  RAIL_X_IN_SECTION,
  SECTION_PL,
} from './railGeometry'
import { ActiveSectionContext } from './useActiveSection'

export interface SectionProps extends Omit<ComponentProps<'section'>, 'id' | 'title'> {
  id: SectionId
  /** Visible h2 text. Plain sentence case, no eyebrow (DESIGN.md section 1). */
  title: ReactNode
  /** Extra classes for the h2. */
  titleClassName?: string
  /** `fork`: steel node and bracket off the rail (Showcase only). */
  variant?: 'main' | 'fork'
  /** Beside the h2, e.g. the branch tag. Mark it aria-hidden if it is decoration. */
  aside?: ReactNode
}

/** Landmark wrapper every section uses: correct id, aria-labelledby, h2 and its rail node. */
export function Section({
  id,
  title,
  titleClassName,
  variant = 'main',
  aside,
  className,
  children,
  ...rest
}: SectionProps) {
  const active = useContext(ActiveSectionContext) === id
  const fork = variant === 'fork'
  const heading = (
    <h2 id={headingId(id)} className={cn('font-display text-h2 text-foreground', titleClassName)}>
      {title}
    </h2>
  )

  return (
    <section
      {...rest}
      id={id}
      aria-labelledby={headingId(id)}
      className={cn(
        'relative mx-auto w-full max-w-content pr-gutter py-section',
        fork ? FORK_SECTION_PL : SECTION_PL,
        className,
      )}
    >
      {fork && (
        <>
          {/* md+: bracket leaves the rail at the heading and merges back at the section's end. */}
          <span
            aria-hidden="true"
            data-fork=""
            className={cn(
              'absolute bottom-0 hidden w-fork -translate-y-px rounded-r-md border-y-2 border-r-2 border-branch md:block',
              RAIL_X_IN_SECTION,
              H2_LINE_Y,
            )}
          />
          {/* Below md there is no room to branch sideways: this rail segment turns dashed steel. */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-y-0 block w-rail-line -translate-x-1/2 border-l-2 border-dashed border-branch bg-background md:hidden',
              RAIL_X_IN_SECTION,
            )}
          />
        </>
      )}
      <RailNode
        active={active}
        fork={fork}
        className={cn(fork ? FORK_X_IN_SECTION : RAIL_X_IN_SECTION, H2_LINE_Y)}
      />
      {aside ? (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          {heading}
          {aside}
        </div>
      ) : (
        heading
      )}
      {children}
    </section>
  )
}
