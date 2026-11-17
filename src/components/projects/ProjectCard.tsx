import { ArrowUpRight } from 'lucide-react'

import { SocialIcon } from '@/components/contact/SocialIcon'
import { ExternalLink } from '@/components/shared/ExternalLink'
import { StackList } from '@/components/shared/StackList'
import { targetLinkClass } from '@/lib/styles'
import { GITHUB_LINK_HOSTS, safeUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/content'

export interface ProjectCardProps {
  project: Project
}

const HOVER_NUDGE =
  'transition-transform duration-120 ease-brand motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-within:translate-x-0.5 motion-safe:group-focus-within:-translate-y-0.5'

/** Terminal-window card: the whole card is one stretched new-tab link to the repo; Live sits above it. */
export function ProjectCard({ project }: ProjectCardProps) {
  const { id, name, description, stack, repoUrl, liveUrl, placeholder } = project
  // Validated here too so a bad URL drops the link and its "source on GitHub" wording together.
  const repoHref = safeUrl(repoUrl, GITHUB_LINK_HOSTS)
  const liveHref = safeUrl(liveUrl)
  const status = placeholder ? 'coming soon' : liveHref ? 'deployed' : 'public repo'

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-card',
        'transition duration-240 ease-brand hover:border-primary focus-within:border-primary',
        'hover:shadow-[0_0_0_1px_var(--primary),0_12px_32px_-12px_var(--glow)]',
        'focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-ring',
        'motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1',
        placeholder && 'border-dashed border-border-strong',
      )}
    >
      {/* Window chrome: the dots light up on hover like a terminal coming alive. */}
      <div
        aria-hidden="true"
        className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-3 font-mono text-code text-muted-foreground"
      >
        <span className="flex shrink-0 gap-1.5 opacity-40 transition-opacity duration-240 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="size-2.5 rounded-full bg-destructive" />
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="size-2.5 rounded-full bg-ok" />
        </span>
        <span className="min-w-0 flex-1 truncate">{id}.git</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong px-2.5 py-0.5 text-xs text-foreground">
          <span
            className={cn(
              'size-1.5 rounded-full',
              placeholder ? 'bg-muted-foreground' : 'bg-ok motion-safe:animate-pulse',
            )}
          />
          {status}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-sans text-h3 font-semibold break-words transition-colors duration-120 ease-brand group-hover:text-primary">
          {repoHref ? (
            <ExternalLink
              newTab
              href={repoHref}
              allowedHosts={GITHUB_LINK_HOSTS}
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {name}
              <span className="sr-only">, source on GitHub</span>
            </ExternalLink>
          ) : (
            name
          )}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {!placeholder && stack.length > 0 && (
          <div className="mt-4">
            <StackList items={stack} />
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-6 font-mono text-code">
          <span aria-hidden="true" className="inline-flex items-center gap-2 text-primary">
            <SocialIcon id="github" className="size-5" />
            view_source()
            <ArrowUpRight className={cn('size-4', HOVER_NUDGE)} />
          </span>
          {liveHref && (
            <ExternalLink newTab href={liveHref} className={cn(targetLinkClass, 'relative z-10')}>
              <span className="sr-only">{name}, live site</span>
              <span aria-hidden="true">
                open_live() <ArrowUpRight className="inline size-4 align-text-bottom" />
              </span>
            </ExternalLink>
          )}
        </div>
      </div>
    </article>
  )
}
