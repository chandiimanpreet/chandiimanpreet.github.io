import type { ReactNode } from 'react'

import { Rail } from './Rail'
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
      {/* The page container: pl-rail reserves the git-history column every section sits beside. */}
      <main
        id="main"
        tabIndex={-1}
        className="relative mx-auto w-full max-w-content pl-rail outline-none"
      >
        <Rail />
        {children}
      </main>
      <SiteFooter />
    </ActiveSectionContext>
  )
}
