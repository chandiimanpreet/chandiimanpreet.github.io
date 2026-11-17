import { useRef } from 'react'

import { CopyEmailButton } from '@/components/contact/CopyEmailButton'
import { LocalTime } from '@/components/contact/LocalTime'
import { MailtoTemplates } from '@/components/contact/MailtoTemplates'
import { mailtoHref } from '@/components/contact/contact'
import { Section } from '@/components/layout/Section'
import { ExternalLink } from '@/components/shared/ExternalLink'
import { Todo } from '@/components/shared/Todo'
import { profile } from '@/content/profile'
import { socials } from '@/content/socials'
import { linkClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

const LINK_IDS = new Set(['github', 'linkedin', 'leetcode'])
const links = socials.filter((s) => LINK_IDS.has(s.id))
const place = profile.location.split(',')[0] ?? profile.location

export default function ContactSection() {
  const emailRef = useRef<HTMLAnchorElement>(null)

  return (
    <Section id="contact" title="Let's talk">
      <div className="mt-6 flex max-w-measure flex-col gap-6">
        <p className="text-muted-foreground">
          I build backend systems: APIs, durable workflows and the infrastructure they run on. If
          you are hiring for that, email is the fastest way to reach me.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Address comes from profile.email, assembled at runtime (SECURITY.md section 8). */}
          <a
            ref={emailRef}
            href={mailtoHref(profile.email)}
            className={cn('min-w-0 text-lead break-all', linkClass)}
          >
            {profile.email}
          </a>
          <CopyEmailButton email={profile.email} targetRef={emailRef} />
        </div>

        <MailtoTemplates email={profile.email} />

        <LocalTime timeZone={profile.timeZone} place={place} />

        <ul
          aria-label="Elsewhere"
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6"
        >
          {links.map((s) => (
            <li key={s.id} className="flex min-h-target items-center">
              {s.placeholder ? (
                <Todo what={`${s.label} URL`} />
              ) : (
                <ExternalLink href={s.href} className={linkClass}>
                  {s.label}
                </ExternalLink>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
