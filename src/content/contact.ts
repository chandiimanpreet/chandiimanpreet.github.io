import type { MailTemplate } from '@/types/content'

/** DESIGN-V2 section 5.8. UI copy, not resume facts. */
export const mailTemplates: readonly MailTemplate[] = [
  {
    label: 'Hiring for a backend role',
    subject: 'Backend role at ',
    body: 'Role:\nTeam:\nStack:\nLink to the job description:',
  },
  { label: 'Question about Natalie', subject: 'About Natalie' },
]
