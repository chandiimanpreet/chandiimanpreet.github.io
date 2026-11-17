import type { Profile } from '@/types/content'

// Stored reversed and flipped at runtime so neither the source nor the minified bundle holds the
// address as a literal for naive scrapers (docs/SECURITY.md section 8; the minifier constant-folds
// a plain split-and-join). Render it as a normal mailto link; never obscure it visually.
const EMAIL_REVERSED = 'moc.liamg@555idnahcteerpnam'

// Positioning: Backend Engineer who has also shipped LLM agent services. Never "AI engineer".
export const profile: Profile = {
  name: 'Manpreet Singh',
  role: 'Backend Engineer',
  tagline:
    'designing APIs, orchestrating workflows, building the backend systems that run behind them.',
  about:
    'Software engineer working on distributed systems in Go and Node.js/TypeScript. I design REST APIs and event-driven backends with durable workflow orchestration, retries and idempotent processing, run them on AWS and Kubernetes with automated CI/CD, and have shipped LLM agents into production services with LangChain and LangGraph.',
  // Most important first: the hero shows the first 7, About shows all.
  stack: [
    'Go',
    'TypeScript',
    'Node.js',
    'Temporal',
    'AWS',
    'Kubernetes',
    'Docker',
    'REST APIs',
    'Microservices',
    'LangGraph',
    'MongoDB',
    'Redis',
    'GitHub Actions',
    'ArgoCD',
  ],
  email: [...EMAIL_REVERSED].reverse().join(''),
  githubLogin: 'chandiimanpreet',
  // OWNER DECISION: the resume lives in Google Drive (public viewer link; replace the file via
  // "Manage versions" so this link stays valid). null shows every Resume control disabled ("coming soon").
  resumeUrl: 'https://drive.google.com/file/d/1oowuUjFVxn6LK8ig8DnYJv6U9yr1LJ-4/view?usp=sharing',
}

// Header brand lines (docs/DESIGN-V3-HEADER.md 2.2): the role as user@host, the field as a path.
export const brand = { name: 'manpreetSingh', path: '~/backend-engineer' } as const
