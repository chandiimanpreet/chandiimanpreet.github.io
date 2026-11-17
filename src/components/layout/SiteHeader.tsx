import { useContext } from 'react'

import { navItems } from '@/content/nav'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

import { MobileNav } from './header/MobileNav'
import { NavLink } from './header/NavLink'
import { useScrolled } from './header/useScrolled'
import { ThemeToggle } from './ThemeToggle'
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
        'sticky top-0 z-40 border-b bg-background transition-colors duration-120',
        scrolled ? 'border-border' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-header max-w-content items-center gap-x-6 px-gutter">
        <a
          href="#main"
          className="flex h-target items-center font-display text-lg font-bold text-foreground"
          aria-label={`MS, ${profile.name}, back to top`}
        >
          MS
        </a>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex gap-x-5">
            {navItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  item={item}
                  active={item.id === current}
                  className="text-sm underline-offset-8"
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <MobileNav items={navItems} current={current} />
        </div>
      </div>
    </header>
  )
}
