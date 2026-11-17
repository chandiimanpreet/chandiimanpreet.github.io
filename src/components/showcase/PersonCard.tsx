import { useState } from 'react'

import { Card } from '@/components/ui/card'
import { ExternalLink } from '@/components/shared/ExternalLink'
import { Todo } from '@/components/shared/Todo'
import { GITHUB_LINK_HOSTS } from '@/lib/url'

import { initials, type Person } from './person'

export interface PersonCardProps {
  person: Person
}

/**
 * Static card (no GitHub API call). `data-spot` marks it for the section's delegated pointermove,
 * which sets --mx/--my; without those vars the gradient is invalid and nothing paints.
 */
export function PersonCard({ person }: PersonCardProps) {
  const { login, name, reason, profileUrl, avatarUrl } = person
  const [avatarFailed, setAvatarFailed] = useState(false)

  return (
    <Card
      data-spot
      className="relative isolate h-full gap-3 rounded-md border border-border p-5 ring-0 transition-colors duration-120 ease-brand before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(18rem_circle_at_var(--mx)_var(--my),var(--spot),transparent_60%)] focus-within:border-branch hover:border-branch"
    >
      <div className="flex items-center gap-3">
        {/* Initials always sit underneath: they show while the avatar loads and if GitHub fails. */}
        <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-display font-semibold text-secondary-foreground">
          <span aria-hidden="true">{initials(name ?? login)}</span>
          {!avatarFailed && (
            <img
              src={avatarUrl}
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              alt=""
              onError={() => setAvatarFailed(true)}
              className="absolute inset-0 size-full"
            />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-h3 text-foreground">
            {/* Stretched link: the whole card is the (44px+) target; same tab per DESIGN. */}
            <ExternalLink
              href={profileUrl}
              allowedHosts={GITHUB_LINK_HOSTS}
              className="break-words text-foreground underline-offset-4 after:absolute after:inset-0 hover:text-branch hover:underline"
            >
              {name ?? login}
            </ExternalLink>
          </h3>
          {name && <p className="font-mono text-code text-muted-foreground">@{login}</p>}
        </div>
      </div>
      <div className="text-muted-foreground">{reason ?? <Todo what="why I follow them" />}</div>
    </Card>
  )
}
