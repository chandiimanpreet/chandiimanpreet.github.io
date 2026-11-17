import type { HeroPick } from '@/types/content'

// Backend first (Go, infrastructure), agents last. Values and labels come from the metrics in
// projects.ts; every pick must be a short number found verbatim in docs/RESUME.md (hero.test.ts),
// so the four values render at one size.
export const heroPicks: readonly HeroPick[] = [
  { from: 'helm-deployer', index: 0, tag: 'Go · Helm' },
  { from: 'agentic-cicd', index: 1, tag: 'CI/CD' },
  { from: 'devops-automation', index: 0, tag: 'DevOps' },
  { from: 'document-intelligence', index: 0, tag: 'LangGraph' },
]
