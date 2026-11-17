import { projectAnchorId } from '@/lib/anchors'

/** Matching key so "Express.js" (skills) and "Express" (project stack) are the same skill. */
export const skillKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.js$/, '')
    .replace(/[^a-z0-9+#]/g, '')

export interface SkillLink {
  href: string
  title: string
}

interface StackOwner {
  id: string
  name: string
  stack: string[]
}

/** skillKey -> link to the first project (in the given order) whose stack lists the skill. */
export function buildSkillLinks(owners: StackOwner[]): Map<string, SkillLink> {
  const links = new Map<string, SkillLink>()
  for (const { id, name, stack } of owners) {
    for (const tech of stack) {
      const key = skillKey(tech)
      if (!links.has(key))
        links.set(key, { href: `#${projectAnchorId(id)}`, title: `Used in ${name}` })
    }
  }
  return links
}

// Presentation grouping by stack layer (DESIGN-V2 5.6), backend first. Every name must exist in
// src/content/skills.ts or in a project stack in src/content/projects.ts (the test enforces it).
export const SKILL_LAYERS: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['Go', 'Node.js', 'TypeScript', 'JavaScript', 'C++', 'C'] },
  {
    label: 'Services and workflows',
    items: ['REST APIs', 'Microservices', 'Temporal', 'Express.js', 'Next.js', 'Zod', 'SSE'],
  },
  { label: 'Data', items: ['MongoDB', 'Redis'] },
  { label: 'Cloud', items: ['AWS (EKS, EC2, ECS, S3, VPC, IAM)'] },
  {
    label: 'Delivery',
    items: ['Kubernetes', 'Docker', 'Helm', 'ArgoCD', 'GitHub Actions', 'Jenkins'],
  },
  { label: 'Agent systems', items: ['LangGraph', 'LangChain', 'LangSmith', 'AWS Bedrock'] },
  {
    label: 'Tools and fundamentals',
    items: [
      'Linux',
      'Git',
      'Postman',
      'Data structures and algorithms',
      'Computer networks',
      'Operating systems',
      'DBMS',
      'OOP',
    ],
  },
]
