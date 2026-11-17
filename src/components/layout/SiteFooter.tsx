import { ExternalLink } from '@/components/shared/ExternalLink'
import { profile } from '@/content/profile'
import { socials } from '@/content/socials'
import { targetLinkClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

import { RAIL_X_IN_MAIN, SECTION_PL } from './railGeometry'

const github = socials.find((s) => s.id === 'github')
const email = socials.find((s) => s.id === 'email')

/** DESIGN-V2 section 5.9: one quiet line (stacked below md) where the rail ends in a hollow node. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      {/* Same box as <main> (pl-rail) and <Section> (SECTION_PL), so the text starts at the
          sections' x at every width and the end node sits on the rail line. */}
      <div className="relative mx-auto max-w-content pl-rail text-sm text-muted-foreground">
        {/* Hollow end node of the rail. top-11 overlaps the line's end (Rail: -bottom-12), so no gap
            shows across the footer border. Decoration only. */}
        <span
          aria-hidden="true"
          data-rail-end
          className={cn(
            'absolute top-11 block size-node -translate-x-1/2 rounded-full border-2 border-input bg-background',
            RAIL_X_IN_MAIN,
          )}
        />
        <div
          className={cn(
            'flex min-w-0 flex-col gap-y-1 py-8 pr-gutter md:flex-row md:flex-wrap md:items-center md:gap-x-6',
            SECTION_PL,
          )}
        >
          <p className="py-3 text-foreground">Thanks for reading.</p>
          {github && (
            <ExternalLink href={github.href} className={targetLinkClass}>
              {github.label}
            </ExternalLink>
          )}
          {email && (
            <a href={email.href} className={cn(targetLinkClass, 'break-all')}>
              {profile.email}
            </a>
          )}
          <a href="#main" className={cn(targetLinkClass, 'md:ml-auto')}>
            Back to top
          </a>
          <p className="py-3 md:basis-full">
            &copy; {new Date().getFullYear()} {profile.name}. Built with Vite, React 19, TypeScript,
            Tailwind CSS and shadcn/ui.
          </p>
        </div>
      </div>
    </footer>
  )
}
