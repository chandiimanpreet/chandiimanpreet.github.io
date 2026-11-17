import { useContext, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { HEAD_Y, RAIL_X_IN_MAIN } from './railGeometry'
import { ActiveSectionContext } from './useActiveSection'

export interface RailNodeProps {
  active: boolean
  fork?: boolean
  /** Position classes (the node is absolutely positioned and centred on its point). */
  className?: string
}

/** One commit node. Decoration only; state is mirrored in `data-active` for tests and styling. */
export function RailNode({ active, fork = false, className }: RailNodeProps) {
  return (
    <span
      aria-hidden="true"
      data-rail-node=""
      data-active={active}
      className={cn(
        'absolute block size-node-sm -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background transition-colors duration-240 md:size-node',
        fork ? 'border-branch' : 'border-input',
        active && (fork ? 'bg-branch' : 'border-primary bg-primary'),
        className,
      )}
    />
  )
}

/**
 * The git-history line down the left of <main> plus the HEAD node beside the hero. Draws once on
 * load (scale-y over 900ms); reduced motion shows it finished. Render as the first child of <main>.
 */
export function Rail() {
  const active = useContext(ActiveSectionContext)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div aria-hidden="true" data-rail="">
      {/* -bottom-12 reaches the footer's hollow end node (footer border + py-8 + pt-4). */}
      <span
        data-drawn={drawn}
        className={cn(
          'absolute -bottom-12 block w-rail-line origin-top -translate-x-1/2 bg-input transition-transform duration-900 ease-brand motion-reduce:transition-none',
          RAIL_X_IN_MAIN,
          HEAD_Y,
          drawn ? 'scale-y-100' : 'scale-y-0 motion-reduce:scale-y-100',
        )}
      />
      <RailNode active={active === 'hero'} className={cn(RAIL_X_IN_MAIN, HEAD_Y)} />
    </div>
  )
}
