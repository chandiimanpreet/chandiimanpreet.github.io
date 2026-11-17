import { profile } from '@/content/profile'
import { targetLinkClass } from '@/lib/styles'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-content flex-col gap-y-1 px-gutter py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {profile.name}. Built with React, TypeScript and
          Tailwind CSS.
        </p>
        <a href="#main" className={targetLinkClass}>
          Back to top
        </a>
      </div>
    </footer>
  )
}
