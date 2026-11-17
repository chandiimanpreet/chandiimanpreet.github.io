import type { Profile } from '@/types/content'

// Stored reversed and flipped at runtime so neither the source nor the minified bundle holds the
// address as a literal for naive scrapers (docs/SECURITY.md section 8; the minifier constant-folds
// a plain split-and-join). Render it as a normal mailto link; never obscure it visually.
const EMAIL_REVERSED = 'moc.liamg@555idnahcteerpnam'

// Positioning: Backend Engineer who has also shipped LLM agent services. Never "AI engineer".
export const profile: Profile = {
  name: 'Manpreet Singh',
  role: 'Backend Engineer',
  lead: 'I build distributed systems in Go and Node.js/TypeScript: REST APIs, event-driven services and durable Temporal workflows, shipped on AWS and Kubernetes with automated CI/CD. I have also put LLM agents into production on top of them.',
  summary:
    'Software Engineer with expertise in Go, Node.js/TypeScript and distributed systems. I design scalable REST APIs and event-driven backends with durable workflow orchestration, retries and idempotent processing, and I ship and integrate LLM agents into production services using LangChain and LangGraph. Experienced in running reliable backends on AWS and Kubernetes with automated CI/CD.',
  location: 'Patiala, Punjab, India',
  city: 'Patiala',
  timeZone: 'Asia/Kolkata',
  email: [...EMAIL_REVERSED].reverse().join(''),
  githubLogin: 'chandiimanpreet',
  // OWNER DECISION (SECURITY.md section 8): the source PDF contains the phone number, so no PDF
  // ships yet. When a redacted copy exists at public/resume/<file>.pdf, set this to its path
  // ('/resume/<file>.pdf') and every "Download resume" control appears. null hides them all.
  resumeUrl: null,
}
