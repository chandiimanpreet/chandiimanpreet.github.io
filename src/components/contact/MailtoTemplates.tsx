import { Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { mailTemplates } from '@/content/contact'

import { mailtoHref } from './contact'

export interface MailtoTemplatesProps {
  email: string
}

/** Pre-filled email drafts. Plain mailto links styled as buttons; no form (SECURITY.md). */
export function MailtoTemplates({ email }: MailtoTemplatesProps) {
  return (
    <ul aria-label="Email templates" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {mailTemplates.map((t) => (
        <li key={t.label}>
          <Button asChild variant="outline" className="min-h-target w-full sm:w-auto">
            <a href={mailtoHref(email, t)}>
              <Mail aria-hidden />
              {t.label}
            </a>
          </Button>
        </li>
      ))}
    </ul>
  )
}
