import { useRef } from 'react'

import { CopyEmailButton } from '@/components/contact/CopyEmailButton'
import { mailtoHref } from '@/components/contact/contact'
import { SocialIcon } from '@/components/contact/SocialIcon'
import { Section } from '@/components/layout/Section'
import { ExternalLink } from '@/components/shared/ExternalLink'
import { profile } from '@/content/profile'
import { socials } from '@/content/socials'
import { linkClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

const links = socials.filter((s) => s.id !== 'email')
const firstName = (profile.name.split(' ')[0] ?? profile.name).toLowerCase()

export default function ContactSection() {
  const emailRef = useRef<HTMLAnchorElement>(null)

  return (
    <Section
      id="contact"
      eyebrow={`~/contact $ ping ${firstName}`}
      title="Let's build something"
      className="text-center"
    >
      <p className="mt-4 font-mono text-code text-muted-foreground">
        stack: go, node.js/typescript, temporal, aws, kubernetes
      </p>
      <ul aria-label="Elsewhere" className="mt-10 flex items-center justify-center gap-4">
        {links.map((s) => (
          <li key={s.id}>
            <ExternalLink
              newTab
              href={s.href}
              className="inline-flex size-14 items-center justify-center rounded-full text-muted-foreground transition-colors duration-120 hover:text-primary"
            >
              <SocialIcon id={s.id} className="size-8" />
              <span className="sr-only">{s.label}</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* Address comes from profile.email, assembled at runtime (SECURITY.md section 8). */}
        <a
          ref={emailRef}
          href={mailtoHref(profile.email)}
          className={cn('min-w-0 font-mono text-lead break-all', linkClass)}
        >
          {profile.email}
        </a>
        <CopyEmailButton email={profile.email} targetRef={emailRef} />
      </div>
    </Section>
  )
}
