import { Check, Loader, RefreshCw, X, type LucideIcon } from 'lucide-react'

import type { NodeState, Span } from './trace'

export interface NodeStateView {
  word: string
  /** Idle has no icon: its dashed box and the word carry the state. */
  icon?: LucideIcon
  iconClass?: string
}

// Every state has a word and (except idle) an icon; colour is never the only signal (DESIGN-V2 5.5, 8).
// Shared by PipelineGraph, StepInspector and WorkflowTimeline so the three never drift apart.
export const NODE_STATE: Record<NodeState, NodeStateView> = {
  idle: { word: 'waiting' },
  running: {
    word: 'running',
    icon: Loader,
    iconClass: 'text-primary animate-spin motion-reduce:animate-none',
  },
  failed: { word: 'failed', icon: X, iconClass: 'text-destructive' },
  retrying: { word: 'retrying', icon: RefreshCw, iconClass: 'text-primary' },
  done: { word: 'done', icon: Check, iconClass: 'text-ok' },
}

/** A timeline span as a node state: a running attempt after the first is `retrying`. */
export function spanView(span: Span): NodeStateView & { state: NodeState } {
  const state: NodeState =
    span.outcome === 'running' && span.attempt > 1 ? 'retrying' : span.outcome
  return { state, ...NODE_STATE[state] }
}
