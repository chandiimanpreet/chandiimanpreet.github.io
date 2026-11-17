import { useEffect, useRef, type PointerEvent } from 'react'

import { Section } from '@/components/layout/Section'
import { PersonCard } from '@/components/showcase/PersonCard'
import { spotlightPosition, toPerson, type Person } from '@/components/showcase/person'
import { showcase } from '@/content/showcase'

// Spotlight only for a real hovering mouse, and never when the user asked for less motion.
const SPOTLIGHT_MEDIA =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'

const people = showcase.map(toPerson).filter((p): p is Person => p !== null)

export default function ShowcaseSection() {
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // One delegated listener on the grid, at most one style write per animation frame.
  function onPointerMove(e: PointerEvent<HTMLUListElement>) {
    if (frame.current || e.pointerType !== 'mouse') return
    if (!window.matchMedia(SPOTLIGHT_MEDIA).matches) return
    const card = (e.target as Element).closest<HTMLElement>('[data-spot]')
    if (!card) return
    const { clientX, clientY } = e
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const { x, y } = spotlightPosition(clientX, clientY, card.getBoundingClientRect())
      card.style.setProperty('--mx', `${x}px`)
      card.style.setProperty('--my', `${y}px`)
    })
  }

  return (
    <Section
      id="showcase"
      title="Engineers worth following"
      variant="fork"
      aside={
        <span aria-hidden className="font-mono text-code text-branch">
          branch: people
        </span>
      }
    >
      <p className="mt-4 max-w-measure text-lead text-muted-foreground">
        People whose work I read and learn from.
      </p>
      <ul
        onPointerMove={onPointerMove}
        className="mt-10 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-3"
      >
        {people.map((person) => (
          <li key={person.login}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
