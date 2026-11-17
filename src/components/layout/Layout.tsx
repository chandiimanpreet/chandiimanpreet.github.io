import type { ReactNode } from 'react'

import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { ActiveSectionContext, useActiveSection } from './useActiveSection'

export interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const active = useActiveSection()

  return (
    <ActiveSectionContext value={active}>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <SiteHeader />
      {/* Sections own their width: the hero is full bleed, the rest use max-w-content. */}
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
    </ActiveSectionContext>
  )
}
