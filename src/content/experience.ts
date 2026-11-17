import type { ExperienceEntry } from '@/types/content'

// Newest first. Bullets and numbers are verbatim from docs/RESUME.md.
export const experience: ExperienceEntry[] = [
  {
    id: 'devseccops',
    company: 'DevSecCops.AI',
    role: 'Software Engineer',
    location: 'Kurukshetra, India',
    period: { start: '2025-09', end: null },
    highlights: [
      'Developed WhatsApp and voice AI agents for conversational commerce: users search catalogs and place orders in natural language, automating 100% of the order-taking flow without human agents.',
      'Delivered omnichannel AI booking agents (WhatsApp, voice) for hospitality, handling room availability, pricing queries and reservations end to end.',
      'Architected a multi-agent document intelligence pipeline with LangGraph that classifies and extracts structured data from import/export documents (commercial invoices, freight booking confirmations, customs declarations) with 95%+ field accuracy.',
      'Engineered AI-driven CI/CD pipelines using agentic AI to orchestrate build, test and deploy workflows, reducing manual DevOps effort by 40% and doubling deployment speed.',
      'Built an AI-powered DevOps automation tool for repetitive operational tasks, cutting manual intervention by 50% and the failure rate by 30%.',
      'Implemented a Go microservice that deploys Helm charts for platform components (ArgoCD, SonarQube, Grafana, Prometheus), streamlining 15+ deployments and taking setup time from hours to minutes.',
    ],
    metrics: [
      { value: '100%', label: 'of order-taking automated' },
      { value: '95%+', label: 'document field accuracy' },
      { value: '40%', label: 'less manual DevOps effort' },
      { value: '2x', label: 'deployment speed' },
      { value: '50%', label: 'less manual intervention' },
      { value: '30%', label: 'lower failure rate' },
      { value: '15+', label: 'deployments streamlined' },
    ],
    systemIds: [
      'commerce-agents',
      'booking-agents',
      'document-intelligence',
      'agentic-cicd',
      'devops-automation',
      'helm-deployer',
    ],
  },
  {
    id: 'aryaka',
    company: 'Aryaka Networks',
    role: 'Software Engineer Intern',
    location: 'Bangalore, India',
    period: { start: '2025-01', end: '2025-06' },
    highlights: [
      'Set up multiple end-to-end testing environments: servers, operating systems and virtual machines using ESXi and QEMU.',
      'Analyzed network architecture and traffic flows to support testing infrastructure and deployment automation.',
      'Migrated 5 legacy functionalities to a modern framework for better integration and maintainability, and enabled continuous testing pipelines.',
      'Built automated test suites with Pytest and integrated Allure reports with Jenkins CI/CD, finding 4 critical bugs before production.',
      'Improved reliability through automation and reporting pipelines.',
    ],
    metrics: [
      { value: '5', label: 'legacy functionalities migrated' },
      { value: '4', label: 'critical bugs caught before production' },
    ],
  },
]
