import type { Project, System } from '@/types/content'

// Everything here is stated on the resume. Where the resume names no technology for a part,
// the node has no `tech`; do not fill gaps with guesses.

export const projects: Project[] = [
  {
    id: 'natalie',
    name: 'Natalie',
    tagline: 'Hiring platform that automates JD parsing, resume screening and candidate ranking.',
    period: { start: '2026-02', end: null },
    stack: [
      'Express',
      'Temporal',
      'MongoDB',
      'Redis',
      'LangGraph',
      'AWS Bedrock',
      'Zod',
      'LangSmith',
      'SSE',
    ],
    highlights: [
      'Automates JD parsing, resume screening and candidate ranking, taking manual shortlisting from hours to minutes.',
      'Multi-agent LLM pipeline with LangGraph and AWS Bedrock: parallel resume-parsing and JD-extraction agents feed skill, experience and education evaluators, producing explainable shortlist/reject recommendations with Zod-validated outputs and LangSmith tracing.',
      'Re-architected background processing from BullMQ/Redis queues to Temporal workflows: resume parsing and AI analysis run as one fault-tolerant execution with automatic retries, priority-tiered task queues keep resource allocation fair across users, and progress streams to the browser over SSE.',
    ],
    metrics: [{ value: 'Hours → minutes', label: 'manual shortlisting time' }],
    agentGraph: {
      title: 'Screening pipeline',
      summary:
        'Two parsing agents run in parallel, three evaluators score the candidate against the role, and the scores are combined into one explainable recommendation. Every LLM output is validated with Zod and traced in LangSmith.',
      nodes: [
        {
          id: 'jd',
          kind: 'input',
          label: 'Job description',
          description: 'The role as written by the recruiter.',
        },
        { id: 'resume', kind: 'input', label: 'Resume', description: 'The candidate document.' },
        {
          id: 'jd-agent',
          kind: 'agent',
          label: 'JD extraction agent',
          description: 'Pulls requirements out of the job description.',
        },
        {
          id: 'resume-agent',
          kind: 'agent',
          label: 'Resume parsing agent',
          description: 'Turns the resume into structured data.',
        },
        {
          id: 'skill-eval',
          kind: 'evaluator',
          label: 'Skill evaluator',
          description: 'Scores skills against the requirements.',
        },
        {
          id: 'experience-eval',
          kind: 'evaluator',
          label: 'Experience evaluator',
          description: 'Scores work history against the role.',
        },
        {
          id: 'education-eval',
          kind: 'evaluator',
          label: 'Education evaluator',
          description: 'Scores education against the role.',
        },
        {
          id: 'aggregator',
          kind: 'aggregator',
          label: 'Aggregator',
          description: 'Combines the three evaluations into one result with reasons.',
        },
        {
          id: 'recommendation',
          kind: 'output',
          label: 'Shortlist or reject',
          description: 'Explainable recommendation, Zod-validated.',
        },
      ],
      edges: [
        { from: 'jd', to: 'jd-agent' },
        { from: 'resume', to: 'resume-agent' },
        { from: 'jd-agent', to: 'skill-eval' },
        { from: 'jd-agent', to: 'experience-eval' },
        { from: 'jd-agent', to: 'education-eval' },
        { from: 'resume-agent', to: 'skill-eval' },
        { from: 'resume-agent', to: 'experience-eval' },
        { from: 'resume-agent', to: 'education-eval' },
        { from: 'skill-eval', to: 'aggregator' },
        { from: 'experience-eval', to: 'aggregator' },
        { from: 'education-eval', to: 'aggregator' },
        { from: 'aggregator', to: 'recommendation' },
      ],
    },
    workflow: {
      title: 'Background processing on Temporal',
      summary:
        'Resume parsing and AI analysis run as one durable Temporal workflow instead of separate queue jobs, so a failure in either step retries in place instead of leaving a half-processed candidate.',
      replaced: 'BullMQ jobs on Redis queues',
      steps: [
        {
          id: 'enqueue',
          label: 'Queue by priority',
          description:
            'The workflow starts on a priority-tiered task queue so one heavy user cannot starve the rest.',
        },
        {
          id: 'parse',
          label: 'Parse resume',
          description: 'Resume parsing runs as a workflow step with automatic retries.',
        },
        {
          id: 'analyse',
          label: 'AI analysis',
          description: 'The LangGraph screening pipeline runs in the same execution.',
        },
        {
          id: 'stream',
          label: 'Stream progress',
          description: 'Progress reaches the browser in real time over SSE.',
        },
      ],
      guarantees: [
        'One fault-tolerant execution for parsing and analysis',
        'Automatic retries',
        'Priority-tiered task queues for fair resource allocation across users',
        'Real-time progress over SSE',
      ],
    },
  },
]

// Systems built at DevSecCops.AI (closed source). Referenced from experience[].systemIds.
// A system is an "agent system" when any node has kind 'agent'.
export const systems: System[] = [
  {
    id: 'helm-deployer',
    name: 'Helm deployment service',
    org: 'DevSecCops.AI',
    summary:
      'A Go microservice that deploys platform components (ArgoCD, SonarQube, Grafana, Prometheus) as Helm charts, taking setup time from hours to minutes.',
    stack: ['Go', 'Helm', 'Kubernetes'],
    metrics: [{ value: '15+', label: 'deployments streamlined' }],
    nodes: [
      { id: 'service', kind: 'service', label: 'Deployment service', tech: 'Go' },
      { id: 'cluster', kind: 'external', label: 'Kubernetes cluster' },
      { id: 'components', kind: 'external', label: 'ArgoCD, SonarQube, Grafana, Prometheus' },
    ],
    flows: [
      {
        label: 'Install',
        steps: [
          { node: 'service' },
          { node: 'cluster', via: 'Helm' },
          { node: 'components', via: 'installs' },
        ],
      },
    ],
  },
  {
    id: 'commerce-agents',
    name: 'Conversational commerce agents',
    org: 'DevSecCops.AI',
    summary:
      'Customers search the catalogue and place orders in natural language over WhatsApp or voice, with no human agent in the loop.',
    stack: ['WhatsApp', 'Voice'],
    metrics: [{ value: '100%', label: 'of the order-taking flow automated' }],
    nodes: [
      { id: 'customer', kind: 'client', label: 'Customer' },
      { id: 'whatsapp', kind: 'channel', label: 'WhatsApp' },
      { id: 'voice', kind: 'channel', label: 'Voice' },
      { id: 'agent', kind: 'agent', label: 'Commerce agent' },
      { id: 'catalog', kind: 'store', label: 'Catalogue' },
      { id: 'orders', kind: 'service', label: 'Orders' },
    ],
    flows: [
      {
        label: 'Search over WhatsApp',
        steps: [
          { node: 'customer' },
          { node: 'whatsapp', via: 'natural language' },
          { node: 'agent' },
          { node: 'catalog', via: 'search' },
        ],
      },
      {
        label: 'Order over voice',
        steps: [
          { node: 'customer' },
          { node: 'voice', via: 'natural language' },
          { node: 'agent' },
          { node: 'orders', via: 'place order' },
        ],
      },
    ],
  },
  {
    id: 'booking-agents',
    name: 'Hospitality booking agents',
    org: 'DevSecCops.AI',
    summary:
      'Omnichannel agents that answer room availability and pricing questions and make reservations end to end.',
    stack: ['WhatsApp', 'Voice'],
    metrics: [],
    nodes: [
      { id: 'guest', kind: 'client', label: 'Guest' },
      { id: 'channel', kind: 'channel', label: 'WhatsApp or voice' },
      { id: 'agent', kind: 'agent', label: 'Booking agent' },
      { id: 'availability', kind: 'service', label: 'Availability and pricing' },
      { id: 'reservation', kind: 'service', label: 'Reservations' },
    ],
    flows: [
      {
        label: 'Booking',
        steps: [
          { node: 'guest' },
          { node: 'channel' },
          { node: 'agent' },
          { node: 'availability', via: 'query' },
          { node: 'reservation', via: 'reserve' },
        ],
      },
    ],
  },
  {
    id: 'document-intelligence',
    name: 'Document intelligence pipeline',
    org: 'DevSecCops.AI',
    summary:
      'A multi-agent LangGraph pipeline that classifies import/export documents (commercial invoices, freight booking confirmations, customs declarations) and extracts structured data from them.',
    stack: ['LangGraph'],
    metrics: [{ value: '95%+', label: 'field accuracy' }],
    nodes: [
      { id: 'document', kind: 'client', label: 'Trade document' },
      { id: 'classifier', kind: 'agent', label: 'Classification agent', tech: 'LangGraph' },
      { id: 'extractor', kind: 'agent', label: 'Extraction agent', tech: 'LangGraph' },
      { id: 'output', kind: 'store', label: 'Structured data' },
    ],
    flows: [
      {
        label: 'Classify, then extract',
        steps: [
          { node: 'document' },
          { node: 'classifier' },
          { node: 'extractor', via: 'document type' },
          { node: 'output', via: 'fields' },
        ],
      },
    ],
  },
  {
    id: 'agentic-cicd',
    name: 'Agentic CI/CD pipelines',
    org: 'DevSecCops.AI',
    summary:
      'An agent orchestrates build, test and deploy workflows that used to need a person at each step.',
    stack: [],
    metrics: [
      { value: '40%', label: 'less manual DevOps effort' },
      { value: '2x', label: 'deployment speed' },
    ],
    nodes: [
      { id: 'orchestrator', kind: 'agent', label: 'Pipeline agent' },
      { id: 'build', kind: 'service', label: 'Build' },
      { id: 'test', kind: 'service', label: 'Test' },
      { id: 'deploy', kind: 'service', label: 'Deploy' },
    ],
    flows: [
      {
        label: 'Release',
        steps: [{ node: 'orchestrator' }, { node: 'build' }, { node: 'test' }, { node: 'deploy' }],
      },
    ],
  },
  {
    id: 'devops-automation',
    name: 'DevOps automation tool',
    org: 'DevSecCops.AI',
    summary: 'An AI-powered tool that takes over repetitive operational tasks.',
    stack: [],
    metrics: [
      { value: '50%', label: 'less manual intervention' },
      { value: '30%', label: 'lower failure rate' },
    ],
    nodes: [
      { id: 'operator', kind: 'client', label: 'Operator' },
      { id: 'agent', kind: 'agent', label: 'Automation agent' },
      { id: 'tasks', kind: 'external', label: 'Operational tasks' },
    ],
    flows: [
      {
        label: 'Task run',
        steps: [
          { node: 'operator' },
          { node: 'agent', via: 'request' },
          { node: 'tasks', via: 'executes' },
        ],
      },
    ],
  },
]
