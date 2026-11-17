import { ArrowRight } from 'lucide-react'

import { StackList } from '@/components/shared/StackList'
import type { System } from '@/types/content'

import { Fact } from './Fact'
import { resolveFlow } from './flow'

export interface SystemFactsProps {
  system: System
}

/** Open content for a closed-source work system: its request paths, then the stack. */
export function SystemFacts({ system }: SystemFactsProps) {
  return (
    <dl className="space-y-6">
      {system.flows.map((flow) => {
        const steps = resolveFlow(system, flow)
        return (
          <Fact key={flow.label} term={flow.label}>
            {/* Each step is one unit: its node, then the label and arrow into the next step, so a
                wrapped line never starts with an arrow. Stacked below md, a row from md. */}
            <ol className="flex flex-col gap-1 md:flex-row md:flex-wrap md:gap-x-2">
              {steps.map((step, i) => {
                const next = steps[i + 1]
                return (
                  <li
                    key={`${i}-${step.label}`}
                    className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2"
                  >
                    <span className="text-foreground">{step.label}</span>
                    {next && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ArrowRight
                          aria-hidden
                          className="size-3.5 shrink-0 rotate-90 md:order-last md:rotate-0"
                        />
                        {next.via && (
                          <span className="font-mono text-sm whitespace-nowrap">{next.via}</span>
                        )}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </Fact>
        )
      })}
      {system.stack.length > 0 && (
        <Fact term="Stack">
          <StackList items={system.stack} />
        </Fact>
      )}
    </dl>
  )
}
