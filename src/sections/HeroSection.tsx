import { ArrowRight } from 'lucide-react'

import { HeroStats } from '@/components/hero/HeroStats'
import { heroStats } from '@/components/hero/stats'
import { LocalClock } from '@/components/hero/LocalClock'
import { SECTION_PL } from '@/components/layout/railGeometry'
import { PipelineGraph } from '@/components/pipeline/PipelineGraph'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { headingId } from '@/content/nav'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

// The page's single load sequence (DESIGN-V2 section 7): hero children rise in at 60 ms steps.
// CSS only (tw-animate-css); reduced motion renders the final state. The delay goes through
// --tw-animation-delay because animate-in's shorthand reads it (a bare animation-delay could lose
// to the shorthand on source order).
const ENTER =
  'animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-240 ease-brand motion-reduce:animate-none'

const stats = heroStats()
const [firstName, ...restName] = profile.name.split(' ')
const city = profile.location.split(',')[0]

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby={headingId('hero')}
      className={cn(
        'relative isolate mx-auto w-full max-w-content pr-gutter py-section',
        SECTION_PL,
      )}
    >
      {/* HEAD halo behind the hero's rail node. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 -z-10 size-112 rounded-full bg-radial from-glow to-transparent to-70%"
      />

      <p className={cn(ENTER, 'font-mono text-code text-muted-foreground')}>
        <span aria-hidden>main · </span>
        {city} · <span className="sr-only">local time </span>
        <LocalClock timeZone={profile.timeZone} />
      </p>

      <h1
        id={headingId('hero')}
        className={cn(
          ENTER,
          'mt-6 font-display text-hero text-foreground [--tw-animation-delay:60ms]',
        )}
      >
        {firstName}
        <br />
        {restName.join(' ')}
      </h1>

      <p
        className={cn(
          ENTER,
          'mt-4 text-lead font-medium text-foreground [--tw-animation-delay:120ms]',
        )}
      >
        {profile.role}
      </p>

      <p
        className={cn(
          ENTER,
          'mt-6 max-w-measure text-lead text-muted-foreground [--tw-animation-delay:180ms]',
        )}
      >
        {profile.lead}
      </p>

      <div className={cn(ENTER, 'mt-8 flex flex-wrap gap-3 [--tw-animation-delay:240ms]')}>
        <Button asChild size="lg" className="h-target px-5">
          <a href="#projects">
            View projects
            <ArrowRight
              aria-hidden
              className="transition-transform duration-120 group-hover/button:translate-x-1"
            />
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-target px-5">
          <a href="#contact">Contact</a>
        </Button>
      </div>

      {/* Full width at every size: the content column caps at ~968px, and the compact graph needs
          ~500px (three stages of ~125px plus two 3rem connectors), more than any side column gets. */}
      <div className={cn(ENTER, 'mt-12 min-w-0 lg:mt-16 [--tw-animation-delay:300ms]')}>
        {/* PipelineGraph renders its own <figure> and the compact caption. */}
        <Card className="rounded-md border border-border px-4 shadow-none ring-0">
          <PipelineGraph compact />
        </Card>
      </div>

      <div
        className={cn(
          ENTER,
          'mt-12 border-t border-border pt-8 lg:mt-16 [--tw-animation-delay:360ms]',
        )}
      >
        <HeroStats stats={stats} />
      </div>
    </section>
  )
}
