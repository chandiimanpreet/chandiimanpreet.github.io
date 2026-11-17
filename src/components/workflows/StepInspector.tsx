import { memo } from 'react'

import { NODE_STATE } from '@/components/pipeline/nodeState'
import type { NodeState, PipelineNode } from '@/components/pipeline/trace'
import { StackList } from '@/components/shared/StackList'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StepInspectorProps {
  node: PipelineNode
  state: NodeState
  attempt: number
  /** Failed attempts so far, from the run's spans. */
  failures: number
}

/** Details for the selected step: state, retry history, what it does and its tech. */
// Memoised: every prop is a primitive or a constant NODES entry, so replay frames skip it.
export const StepInspector = memo(function StepInspector({
  node,
  state,
  attempt,
  failures,
}: StepInspectorProps) {
  const view = NODE_STATE[state]
  const Icon = view.icon
  return (
    <Card className="gap-3 rounded-md border border-border px-4 shadow-none ring-0">
      {/* h4: it sits under the "Inside the workflow" h3. */}
      <h4 className="text-h3">{node.label}</h4>
      <p className="flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon aria-hidden className={cn('size-4', view.iconClass)} />}
        {view.word}
        {attempt > 0 && (
          <span className="font-mono text-code text-muted-foreground">· attempt {attempt}</span>
        )}
      </p>
      {failures > 0 && (
        <p className="text-sm">
          Failed {failures === 1 ? 'once' : `${failures} times`}, retried automatically by Temporal.
        </p>
      )}
      <p className="text-sm leading-relaxed text-muted-foreground">{node.role}</p>
      <StackList items={node.tech} label="Tech" />
    </Card>
  )
})
