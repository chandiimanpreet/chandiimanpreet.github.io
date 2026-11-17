import { useState } from 'react'

import { Section } from '@/components/layout/Section'
import { prefersReducedMotion } from '@/components/pipeline/motionPreference'
import { PipelineGraph } from '@/components/pipeline/PipelineGraph'
import { NODES, SCENARIOS, type NodeId, type ScenarioId } from '@/components/pipeline/trace'
import { useTraceRun } from '@/components/pipeline/useTraceRun'
import { WorkflowTimeline } from '@/components/pipeline/WorkflowTimeline'
import { Todo } from '@/components/shared/Todo'
import { RequestPath } from '@/components/workflows/RequestPath'
import { StepInspector } from '@/components/workflows/StepInspector'
import { TraceControls } from '@/components/workflows/TraceControls'
import { TraceLog } from '@/components/workflows/TraceLog'
import { failedAttempts } from '@/components/workflows/traceView'
import { WorkflowDisclosure } from '@/components/workflows/WorkflowDisclosure'

// DESIGN-V2 5.5, the signature section: one simulated run of Natalie's screening workflow,
// shown as request path, execution timeline, step graph and log, all from one RunState.
// Default view is finishedRun('retry') (useTraceRun's initial state); nothing auto-plays.
export default function AgentsSection() {
  const run = useTraceRun('retry')
  const [selected, setSelected] = useState<NodeId>('resume')
  const [touched, setTouched] = useState(false)
  // Read once on mount; play() re-checks the live preference before it animates.
  const [reducedMotion] = useState(prefersReducedMotion)
  const node = run.nodes[selected]

  const touch = (action: () => void) => () => {
    setTouched(true)
    action()
  }
  const clear = (action: () => void) => {
    setTouched(false)
    action()
  }

  return (
    <Section id="agents" title="Watch a durable workflow run">
      <p className="mt-4 max-w-measure text-lead text-muted-foreground">
        This is Natalie&apos;s candidate screening, the job I moved from BullMQ queues on Redis to
        one fault-tolerant Temporal workflow. A request starts the execution, the steps run in
        parallel where they can, a failed step retries on its own, and progress streams back over
        SSE. Press run to replay it.
      </p>

      <div className="mt-10 space-y-12">
        {/* Re-renders every replay frame (clock readout). Everything below except the timeline is
            memoised and receives only event-stable props, and setSelected is a stable setter. */}
        <TraceControls
          run={run}
          touched={touched}
          reducedMotion={reducedMotion}
          onScenario={(s: ScenarioId) => clear(() => run.setScenario(s))}
          onRun={touch(run.play)}
          onPause={run.pause}
          onStep={touch(run.step)}
          onReset={() => clear(run.reset)}
        />

        <RequestPath inProgress={run.status === 'running' || run.status === 'paused'} />

        {/* Carries the "Simulated replay" note (its aria-describedby target). */}
        <WorkflowTimeline
          spans={run.spans}
          clockMs={run.clockMs}
          totalMs={SCENARIOS[run.scenario].totalMs}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="space-y-6">
          <h3 className="text-h3">Inside the workflow</h3>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0 space-y-3">
              {/* PipelineGraph renders its own <figure> and caption. */}
              <PipelineGraph nodes={run.nodes} selected={selected} onSelect={setSelected} />
              <Todo what="confirm the evaluators run concurrently and there is no aggregator step" />
            </div>
            <StepInspector
              node={NODES[selected]}
              state={node.state}
              attempt={node.attempt}
              failures={failedAttempts(run.spans, selected)}
            />
          </div>
          <WorkflowDisclosure />
        </div>

        <TraceLog log={run.log} />
      </div>
    </Section>
  )
}
