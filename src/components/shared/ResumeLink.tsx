import type { ReactNode } from 'react'

import { profile } from '@/content/profile'
import { resumeHref } from '@/lib/url'
import { cn } from '@/lib/utils'

export interface ResumeLinkProps {
  className?: string
  children: ReactNode
}

/**
 * New-tab link to the resume (a same-origin PDF or a Google Drive link, see `resumeHref`).
 * While `profile.resumeUrl` is null or not an allowed link it renders the same control as a disabled, non-link span
 * so the layout is final and the button never points at a missing file.
 */
export function ResumeLink({ className, children }: ResumeLinkProps) {
  const url = resumeHref(profile.resumeUrl)
  if (url === null) {
    return (
      <span
        aria-disabled="true"
        title="Resume coming soon"
        className={cn(className, 'cursor-not-allowed opacity-50')}
      >
        {children}
        <span className="sr-only"> (coming soon)</span>
      </span>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (PDF, opens in a new tab)</span>
    </a>
  )
}
