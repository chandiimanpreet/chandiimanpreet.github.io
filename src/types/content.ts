// Shapes for everything in src/content. Content files are the single source of truth;
// sections import data from there and types from here. No numbers that are not on the resume.

/** Year and month, `YYYY-MM`. */
export type YearMonth = `${number}-${number}`

/** `end: null` means "present". */
export interface DateRange {
  start: YearMonth
  end: YearMonth | null
}

/** A number taken verbatim from the resume. `value` is display text ("95%+", "2x", "15+"). */
export interface Metric {
  value: string
  label: string
}

export interface Profile {
  name: string
  /** Job title shown in the hero and meta. "Backend Engineer". */
  role: string
  /** One-sentence hero lead. */
  lead: string
  /** Resume summary paragraph. */
  summary: string
  location: string
  /** Short place name for compact UI ("Patiala"). */
  city: string
  /** IANA zone for the local clock. */
  timeZone: string
  email: string
  githubLogin: string
  /** Path under public/ (e.g. '/resume/x.pdf'). null = no resume published; hide every resume control. */
  resumeUrl: string | null
}

export type SocialId = 'github' | 'email' | 'linkedin' | 'leetcode' | 'resume'

export interface Social {
  id: SocialId
  label: string
  href: string
  /** True when the URL is not known yet. Render as disabled or hide; never link to it. */
  placeholder?: true
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  location: string
  period: DateRange
  /** Resume bullets, in resume order. */
  highlights: string[]
  /** Numbers from those bullets. */
  metrics: Metric[]
  /** Ids into `systems` (projects.ts) built in this role. */
  systemIds?: string[]
}

export type AgentNodeKind = 'input' | 'agent' | 'evaluator' | 'aggregator' | 'output'

export interface AgentNode {
  id: string
  label: string
  kind: AgentNodeKind
  description: string
}

export interface AgentEdge {
  /** AgentNode id. */
  from: string
  /** AgentNode id. */
  to: string
  label?: string
}

/** A LangGraph-style directed graph. Nodes sharing a `from` run in parallel. */
export interface AgentGraph {
  title: string
  summary: string
  nodes: AgentNode[]
  edges: AgentEdge[]
}

export interface WorkflowStep {
  id: string
  label: string
  description: string
}

/** A durable workflow (Temporal) as an ordered list of steps plus the guarantees around it. */
export interface Workflow {
  title: string
  summary: string
  /** Mechanism replaced, for the "before" side of a before/after. */
  replaced: string
  steps: WorkflowStep[]
  guarantees: string[]
}

export type SystemNodeKind = 'client' | 'channel' | 'agent' | 'service' | 'store' | 'external'

export interface SystemNode {
  id: string
  label: string
  kind: SystemNodeKind
  tech?: string
}

export interface SystemFlowStep {
  /** SystemNode id. */
  node: string
  /** Label on the arrow into this step ("natural language", "Helm"). */
  via?: string
}

/** One left-to-right path through a system. Max 6 steps (DESIGN-BACKEND.md B). */
export interface SystemFlow {
  label: string
  async?: boolean
  steps: SystemFlowStep[]
}

/** Architecture of a system built at work (not a repo). */
export interface System {
  id: string
  name: string
  org: string
  summary: string
  stack: string[]
  metrics: Metric[]
  nodes: SystemNode[]
  flows: SystemFlow[]
}

export interface Project {
  id: string
  name: string
  tagline: string
  period: DateRange
  stack: string[]
  highlights: string[]
  metrics: Metric[]
  repoUrl?: string
  liveUrl?: string
  agentGraph?: AgentGraph
  workflow?: Workflow
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  grade: string
  location: string
  period: DateRange
}

export type AchievementKind = 'certification' | 'competitive'

export interface Achievement {
  id: string
  kind: AchievementKind
  title: string
  detail?: string
}

/** Section ids double as DOM ids and URL hashes. */
export type SectionId =
  'hero' | 'about' | 'experience' | 'projects' | 'agents' | 'skills' | 'showcase' | 'contact'

export interface NavItem {
  id: SectionId
  label: string
  /** False keeps the section rendered but out of the header nav. */
  inNav: boolean
}

/** A hero proof stat: metric `index` of the project or system `from`, shown with a mono `tag`. */
export interface HeroPick {
  /** Project or System id. */
  from: string
  index: number
  tag: string
}

/** One hop on the Workflows request path. */
export interface RequestHop {
  /** Label on the arrow into this hop. */
  via?: string
  label: string
  /** [CONFIRM] in DESIGN-V2 section 10: the resume does not spell out this hop. */
  confirm?: boolean
  /** The hop highlighted while a run plays. */
  workflow?: boolean
}

/** One "what Temporal gives this workflow" line. */
export interface WorkflowGive {
  term: string
  detail: string
}

/** A Contact `mailto:` template (UI copy, DESIGN-V2 section 5.8). */
export interface MailTemplate {
  label: string
  subject: string
  body?: string
}
