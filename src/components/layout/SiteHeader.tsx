import { ArrowUpRight } from 'lucide-react'
import { useContext } from 'react'

import { ResumeLink } from '@/components/shared/ResumeLink'
import { navItems } from '@/content/nav'
import { brand, profile } from '@/content/profile'
import { cn } from '@/lib/utils'

import { BrandMark } from './header/BrandMark'
import { NavLink } from './header/NavLink'
import { useScrolled } from './header/useScrolled'
import { ActiveSectionContext } from './useActiveSection'

export function SiteHeader() {
  const active = useContext(ActiveSectionContext)
  // The hero has no nav link: nothing is current over it.
  const current = active === 'hero' ? null : active
  const scrolled = useScrolled()

  return (
    // The border is always there (transparent at the top) so scrolling never shifts layout.
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 isolate border-b transition-colors duration-240 ease-brand',
        scrolled
          ? 'border-border bg-background/90 backdrop-blur-md'
          : 'border-transparent bg-transparent',
      )}
    >
      {/* Holds the rain back behind the header text at the top; fades so it has no hard edge. */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-background/95 from-60% to-transparent transition-opacity duration-240 ease-brand',
          scrolled ? 'opacity-0' : 'opacity-100',
        )}
      />
      <div className="mx-auto flex h-header max-w-hero animate-in items-center px-gutter duration-240 ease-brand fill-mode-both fade-in slide-in-from-top-2">
        <a
          href="#main"
          aria-label={`${brand.name}: ${profile.name}, ${profile.role}. Back to top`}
          className="group -ml-1.5 flex h-target min-w-target items-center justify-center gap-x-3 rounded-md md:ml-0 md:pr-2"
        >
          <BrandMark />
          <span className="hidden flex-col gap-y-1.5 md:flex">
            <span className="font-mono text-sm leading-none font-bold text-foreground">
              {brand.name}
            </span>
            <span className="font-mono text-xs leading-none text-muted-foreground transition-colors duration-120 group-hover:text-foreground">
              {brand.path}
            </span>
          </span>
        </a>
        <div className="ml-auto flex items-center">
          <nav aria-label="Primary">
            <ul className="flex items-center gap-x-0.5 sm:gap-x-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <NavLink item={item} active={item.id === current} />
                </li>
              ))}
            </ul>
          </nav>
          <span aria-hidden="true" className="mx-4 hidden h-5 w-px bg-border sm:block" />
          <ResumeLink className="group hidden h-target items-center outline-none sm:flex">
            <span className="flex h-9 items-center gap-x-1.5 rounded-md border border-border-strong bg-background/60 px-3 font-mono text-xs text-foreground transition-colors duration-120 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring group-[:is(a)]:group-hover:border-primary group-[:is(a)]:group-hover:text-primary md:text-sm">
              resume.pdf
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-120 group-[:is(a)]:group-hover:translate-x-px group-[:is(a)]:group-hover:-translate-y-px motion-reduce:transition-none"
              />
            </span>
          </ResumeLink>
        </div>
      </div>
      <div aria-hidden="true" className="scroll-progress" />
    </header>
  )
}
