import { ExternalLink } from '@/components/shared/ExternalLink'
import { Skeleton } from '@/components/ui/skeleton'
import { socials } from '@/content/socials'
import { useGithubRepos } from '@/hooks/useGithubRepos'
import { linkClass, projectGridClass, targetLinkClass } from '@/lib/styles'
import { GITHUB_LINK_HOSTS } from '@/lib/url'
import { cn, relativeTime } from '@/lib/utils'

import { selectRepos } from './repos'

export interface GithubRepoListProps {
  className?: string
}

const MAX_SHOWN = 6
const PROFILE_URL = socials.find((s) => s.id === 'github')?.href

/** Quiet list of public repos. Empty is normal (the repos are private for now), not an error. */
export function GithubRepoList({ className }: GithubRepoListProps) {
  const state = useGithubRepos()
  const repos = state.status === 'success' ? selectRepos(state.data, MAX_SHOWN) : []
  const profileLink = (
    <ExternalLink href={PROFILE_URL} className={linkClass}>
      my GitHub profile
    </ExternalLink>
  )

  return (
    <div className={cn('max-w-content', className)} aria-busy={state.status === 'loading'}>
      <h3 className="font-display text-h3 text-foreground">From GitHub</h3>

      {state.status === 'loading' && (
        <div className="mt-4 space-y-3">
          <span className="sr-only">Loading repositories</span>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-target w-full" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <p className="mt-4 max-w-measure text-muted-foreground">
          GitHub is not answering right now, so there is no live list. My code lives on{' '}
          {profileLink}.
        </p>
      )}

      {state.status === 'success' && repos.length === 0 && (
        <p className="mt-4 max-w-measure text-muted-foreground">
          Nothing public yet: my repositories are private for now. They will show up here, and on{' '}
          {profileLink}, as I open them.
        </p>
      )}

      {repos.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {repos.map((repo) => (
            <li key={repo.name} className={cn('grid gap-1 py-3', projectGridClass)}>
              <ExternalLink
                href={repo.html_url}
                allowedHosts={GITHUB_LINK_HOSTS}
                className={cn('font-mono text-sm', targetLinkClass)}
              >
                {repo.name}
              </ExternalLink>
              <span className="self-center text-muted-foreground">{repo.description}</span>
              {repo.language && (
                <span className="self-center font-mono text-sm text-muted-foreground">
                  {repo.language}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {state.status === 'success' && state.stale && (
        <p className="mt-3 text-sm text-muted-foreground">
          Showing saved data from {relativeTime(new Date(state.savedAt))}.
        </p>
      )}
    </div>
  )
}
