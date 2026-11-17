import type { Project } from '@/types/content'

const PROFILE = 'https://github.com/chandiimanpreet'
const SLOT =
  'This slot is reserved for a repository I am preparing to publish. Until then, my code is on my GitHub profile.'

// To add a repo: replace a placeholder (or append) with
// { id, name, description, stack: ['Go', ...], repoUrl: 'https://github.com/chandiimanpreet/<repo>', liveUrl? }
export const projects: readonly Project[] = [
  {
    id: 'repo-01',
    name: 'repo-01',
    description: SLOT,
    stack: [],
    repoUrl: PROFILE,
    placeholder: true,
  },
  {
    id: 'repo-02',
    name: 'repo-02',
    description: SLOT,
    stack: [],
    repoUrl: PROFILE,
    placeholder: true,
  },
  {
    id: 'repo-03',
    name: 'repo-03',
    description: SLOT,
    stack: [],
    repoUrl: PROFILE,
    placeholder: true,
  },
]
