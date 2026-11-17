import type { SkillGroup } from '@/types/content'

// Groups as on the resume. Deviations: languages lead with Go/TypeScript (backend positioning),
// and Postman sits under Developer tools instead of Fundamentals.
export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['Go', 'TypeScript', 'JavaScript', 'C++', 'C'] },
  {
    label: 'Frameworks and tools',
    items: [
      'Node.js', // resume summary: "Go, Node.js/TypeScript"
      'Express.js',
      'Next.js',
      'LangChain',
      'LangGraph',
      'LangSmith',
      'REST APIs',
      'Microservices',
    ],
  },
  {
    label: 'Cloud and databases',
    items: ['AWS (EKS, EC2, ECS, S3, VPC, IAM)', 'MongoDB', 'Redis'],
  },
  {
    label: 'CI/CD and GitOps',
    items: [
      'GitHub Actions',
      'Jenkins',
      'ArgoCD',
      'Docker',
      'Kubernetes',
      'Helm',
      'DevOps automation',
    ],
  },
  {
    label: 'Developer tools',
    items: ['Linux', 'Git', 'GitHub', 'Bitbucket', 'VS Code', 'Postman'],
  },
  {
    label: 'Fundamentals',
    items: [
      'Data structures and algorithms',
      'Computer networks',
      'OOP',
      'DBMS',
      'Operating systems',
    ],
  },
]
