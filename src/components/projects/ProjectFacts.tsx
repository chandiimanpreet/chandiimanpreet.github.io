import { ArrowRight } from 'lucide-react'

import { ExternalLink } from '@/components/shared/ExternalLink'
import { StackList } from '@/components/shared/StackList'
import { Todo } from '@/components/shared/Todo'
import { Button } from '@/components/ui/button'
import { targetLinkClass } from '@/lib/styles'
import type { Project } from '@/types/content'

import { Fact } from './Fact'

export interface ProjectFactsProps {
  project: Project
}

/** Open content for a personal project: the re-architecture first, it is the backend story. */
export function ProjectFacts({ project }: ProjectFactsProps) {
  const { workflow, agentGraph, repoUrl, liveUrl } = project
  return (
    <dl className="space-y-6">
      {workflow && (
        <Fact term="Trade-off">
          <p>{workflow.summary}</p>
          <p>Replaced: {workflow.replaced}.</p>
          <ul className="list-disc space-y-1 pl-5">
            {workflow.guarantees.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </Fact>
      )}
      {agentGraph && (
        <Fact term="How it works">
          <p>{agentGraph.summary}</p>
        </Fact>
      )}
      <Fact term="Stack">
        <StackList items={project.stack} />
      </Fact>
      <Fact term="Links">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {workflow && (
            <Button variant="link" asChild className="h-target px-0 text-base">
              <a href="#agents">
                Watch a run <ArrowRight aria-hidden />
              </a>
            </Button>
          )}
          {repoUrl && (
            <ExternalLink href={repoUrl} className={targetLinkClass}>
              Source
            </ExternalLink>
          )}
          {liveUrl && (
            <ExternalLink href={liveUrl} className={targetLinkClass}>
              Live demo
            </ExternalLink>
          )}
          {!repoUrl && !liveUrl && <Todo what={`${project.name} repo or demo URL`} />}
        </div>
      </Fact>
    </dl>
  )
}
