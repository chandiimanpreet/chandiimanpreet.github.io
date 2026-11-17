import type { ComponentProps } from 'react'

import { safeUrl } from '@/lib/url'

export interface ExternalLinkProps extends Omit<ComponentProps<'a'>, 'href' | 'rel' | 'target'> {
  /** Any string, including untrusted data; it is validated here. */
  href: string | null | undefined
  /** Restrict hosts, e.g. GITHUB_LINK_HOSTS. Omit for hard-coded https links. */
  allowedHosts?: readonly string[]
  /** Open in a new tab and say so to screen readers (DESIGN-V3 section 0). */
  newTab?: boolean
}

/**
 * The only way to render an off-site link (docs/SECURITY.md section 2/3). https only, no
 * credentials, `rel="noopener noreferrer"` always. An invalid URL renders the children as plain
 * text instead of a link.
 */
export function ExternalLink({
  href,
  allowedHosts,
  newTab = false,
  className,
  children,
  ...rest
}: ExternalLinkProps) {
  const url = safeUrl(href, allowedHosts)
  if (!url) return <span className={className}>{children}</span>
  return (
    <a
      {...rest}
      href={url}
      target={newTab ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}
