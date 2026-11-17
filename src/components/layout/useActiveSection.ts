import { createContext, useEffect, useState } from 'react'

import { sections } from '@/content/nav'
import type { SectionId } from '@/types/content'

const IDS = new Set<string>(sections.map((s) => s.id))
const isSectionId = (id: string): id is SectionId => IDS.has(id)

/** Active section id, provided once by Layout so the rail (and header) read it without more observers. */
export const ActiveSectionContext = createContext<SectionId>('hero')

/**
 * One IntersectionObserver over `main > section[id]`. A section is active while it crosses a thin
 * band 40% down the viewport; between sections the last one stays active. Call it once (Layout).
 */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('hero')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).at(-1)?.target.id
        if (hit && isSectionId(hit)) setActive(hit)
      },
      { rootMargin: '-40% 0px -59% 0px' },
    )
    document.querySelectorAll('main > section[id]').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return active
}
