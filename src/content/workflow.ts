import type { RequestHop, WorkflowGive } from '@/types/content'

/** Natalie's request path: "Client; HTTP, Express API; starts, Temporal workflow; SSE progress, Client". */
export const requestPath: readonly RequestHop[] = [
  { label: 'Client' },
  { via: 'HTTP', label: 'Express API', confirm: true },
  { via: 'starts', label: 'Temporal workflow', confirm: true, workflow: true },
  { via: 'SSE progress', label: 'Client' },
]

// Each line restates the Natalie bullet in docs/RESUME.md; nothing beyond it.
export const temporalGives: readonly WorkflowGive[] = [
  {
    term: 'Automatic retries',
    detail:
      'a failed step, like the resume parse above, retries on its own instead of failing the job.',
  },
  {
    term: 'Durable state',
    detail:
      'resume parsing and AI analysis run as one fault-tolerant execution, not separate BullMQ jobs on Redis.',
  },
  { term: 'Priority-tiered task queues', detail: 'work is allocated fairly across users.' },
  { term: 'Real-time progress', detail: 'the client follows the run over SSE.' },
]
