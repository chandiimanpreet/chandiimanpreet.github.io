import type { System, SystemFlow } from '@/types/content'

export interface FlowStep {
  label: string
  /** Label on the arrow into this step. */
  via?: string
}

/** Resolves a flow's node ids to labels, dropping ids with no node (the content test guards this). */
export function resolveFlow(system: System, flow: SystemFlow): FlowStep[] {
  return flow.steps.flatMap((step) => {
    const node = system.nodes.find((n) => n.id === step.node)
    return node ? [{ label: node.label, via: step.via }] : []
  })
}
