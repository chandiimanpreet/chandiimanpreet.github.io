import { useRef, useSyncExternalStore } from 'react'
import { ArrowDown } from 'lucide-react'

import type { FrameHandle } from '@/components/hero/contracts'
import { ScrollCue } from '@/components/hero/ScrollCue'
import { SystemDiagram } from '@/components/hero/SystemDiagram'
import { TerminalLine } from '@/components/hero/TerminalLine'
import { BinaryRain } from '@/components/hero/BinaryRain'
import { useFrameLoop } from '@/components/hero/useFrameLoop'
import { ResumeLink } from '@/components/shared/ResumeLink'
import { StackList } from '@/components/shared/StackList'
import { Button, buttonVariants } from '@/components/ui/button'
import { headingId } from '@/content/nav'
import { profile } from '@/content/profile'
import { prefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** DESIGN-V3 5.9, verbatim: the text alternative for the diagram and its trace log. */
const SYSTEM_DESCRIPTION =
  'Diagram of a backend system handling simulated requests. A request enters through an API gateway, passes authentication and rate limiting, and reaches the API service. Reads are answered from a cache, or from the database when the cache misses. Writes are placed on a queue and picked up by a worker, which runs a durable workflow. One workflow step calls an agent service, fails once, waits, and is retried before the result is committed to the database.'

// DESIGN-V3 4.6: CSS-only entrance; the global reduced-motion rule puts it in its final state at 0.
const ENTER = 'animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-240 ease-brand'
const SIM_START_MS = 900
// Below sm both buttons share one row at 320px; height stays 44px.
const BUTTON = 'h-target px-4 text-sm sm:px-5 sm:text-base'
// Outlined chips over StackList's badges; the 90% backing holds the scrim rule (DESIGN-V3 2.2) over the field.
const CHIPS =
  '**:data-[slot=badge]:h-7 **:data-[slot=badge]:rounded-md **:data-[slot=badge]:border-border-strong **:data-[slot=badge]:bg-background/90 **:data-[slot=badge]:px-2.5 **:data-[slot=badge]:text-sm **:data-[slot=badge]:font-normal **:data-[slot=badge]:text-muted-foreground'

const [firstName, ...restName] = profile.name.split(' ')

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {}
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export default function HeroSection() {
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false)

  const heroRef = useRef<HTMLElement>(null)
  const fieldRef = useRef<FrameHandle>(null)
  const diagramRef = useRef<FrameHandle>(null)
  useFrameLoop(
    (t, dt) => {
      fieldRef.current?.frame(t, dt)
      diagramRef.current?.frame(t, dt)
    },
    { target: heroRef, paused: reduced, startDelayMs: SIM_START_MS },
  )

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-labelledby={headingId('hero')}
      className="group/hero relative isolate overflow-hidden"
    >
      <BinaryRain ref={fieldRef} still={reduced} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-background/92 from-55% to-background/70 xl:bg-linear-to-r xl:from-background/92 xl:from-42% xl:via-background/45 xl:via-70% xl:to-background/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-background to-transparent"
      />
      {/* The fixed header is transparent: keep its links on solid background while it sits over the trace field. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-linear-to-b from-background from-57% to-transparent"
      />

      {/* Top padding clears the fixed, transparent header. */}
      <div className="mx-auto w-full max-w-hero px-gutter pt-[calc(var(--spacing-header)+var(--spacing-section))] pb-section xl:grid xl:min-h-svh xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:items-center xl:gap-12">
        <div>
          <h1
            id={headingId('hero')}
            className={cn(ENTER, 'font-display text-hero text-foreground')}
          >
            {firstName}
            <br />
            {restName.join(' ')}
          </h1>
          <p
            className={cn(
              ENTER,
              '[--tw-animation-delay:60ms] mt-4 text-lead font-medium text-foreground',
            )}
          >
            {profile.role}
          </p>
          <TerminalLine
            text={profile.tagline}
            instant={reduced}
            className={cn(
              ENTER,
              '[--tw-animation-delay:120ms] mt-6 max-w-[34rem] text-sm text-muted-foreground sm:text-base',
            )}
          />
          <div className={cn(ENTER, '[--tw-animation-delay:180ms] mt-8 flex flex-wrap gap-3')}>
            <Button
              asChild
              className={cn(
                BUTTON,
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground focus-visible:outline-solid',
              )}
            >
              <a href="#projects">
                View projects
                <ArrowDown
                  aria-hidden
                  className="transition-transform duration-120 group-hover/button:translate-y-0.5 motion-reduce:transition-none"
                />
              </a>
            </Button>
            <ResumeLink
              className={cn(
                buttonVariants({ variant: 'outline' }),
                BUTTON,
                'bg-background/70 font-mono',
              )}
            >
              ./resume
            </ResumeLink>
          </div>
          <StackList
            items={profile.stack.slice(0, 7)}
            label="Core tools"
            className={cn(ENTER, '[--tw-animation-delay:180ms] mt-6', CHIPS)}
          />
        </div>

        <figure
          className={cn(
            ENTER,
            '[--tw-animation-delay:240ms] mt-10 max-w-2xl min-w-0 xl:mt-0 xl:max-w-none',
          )}
        >
          {/* Label backings hold the 88% scrim rule (DESIGN-V3 2.2) where the xl scrim thins out. */}
          <div className="flex items-center justify-between gap-3 font-mono text-code whitespace-nowrap text-muted-foreground">
            <span aria-hidden="true" className="rounded-sm bg-background/90 px-1.5">
              system map
            </span>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex items-center gap-2 rounded-sm bg-background/90 px-1.5"
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    reduced ? 'border border-border-strong bg-transparent' : 'bg-primary',
                  )}
                />
                {reduced ? 'paused' : 'live'}
              </span>
            </div>
          </div>
          <SystemDiagram ref={diagramRef} still={reduced} />
          <figcaption className="sr-only">{SYSTEM_DESCRIPTION}</figcaption>
        </figure>
      </div>

      <ScrollCue />
    </section>
  )
}
