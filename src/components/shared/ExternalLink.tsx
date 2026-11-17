import type { ComponentProps } from 'react'

import { safeUrl } from '@/lib/url'

export interface ExternalLinkProps extends Omit<ComponentProps<'a'>, 'href' | 'rel' | 'target'> {
  /** Any string, including untrusted API data; it is validated here. */
  href: string | null | undefined
  /** Restrict hosts, e.g. GITHUB_LINK_HOSTS for remote data. Omit for hard-coded https links. */
  allowedHosts?: readonly string[]
}

/**
 * The only way to render an off-site link (docs/SECURITY.md section 2/3). https only, no
 * credentials, `rel="noopener noreferrer"`, same tab (DESIGN.md section 9). An invalid URL
 * renders the children as plain text instead of a link.
 */
export function ExternalLink({
  href,
  allowedHosts,
  className,
  children,
  ...rest
}: ExternalLinkProps) {
  const url = safeUrl(href, allowedHosts)
  if (!url) return <span className={className}>{children}</span>
  return (
    <a {...rest} href={url} rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
