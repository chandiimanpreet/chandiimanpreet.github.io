import { Fragment } from 'react'

import { Section } from '@/components/layout/Section'
import { buildAnchors, useHashOpenRows } from '@/components/projects/anchors'
import { GithubRepoList } from '@/components/projects/GithubRepoList'
import { ProjectFacts } from '@/components/projects/ProjectFacts'
import { ProjectRow } from '@/components/projects/ProjectRow'
import { SystemFacts } from '@/components/projects/SystemFacts'
import { PeriodTime } from '@/components/shared/PeriodTime'
import { Accordion } from '@/components/ui/accordion'
import { projects, systems } from '@/content/projects'
import { projectAnchorId, systemAnchorId } from '@/lib/anchors'

const ANCHORS = buildAnchors(projects, systems)
const ORGS = [...new Set(systems.map((s) => s.org))]
// The personal project (Natalie) is open by default; it carries the backend story.
const OPEN_BY_DEFAULT = projects.slice(0, 1).map((p) => p.id)

export default function ProjectsSection() {
  const [open, setOpen] = useHashOpenRows(ANCHORS, OPEN_BY_DEFAULT)

  return (
    <Section id="projects" title="Things I have built">
      <p className="mt-4 max-w-measure text-lead text-muted-foreground">
        One project of my own, and the systems I shipped at work.
      </p>
      <Accordion type="multiple" value={open} onValueChange={setOpen} className="mt-10">
        {projects.map((p) => (
          <ProjectRow
            key={p.id}
            value={p.id}
            anchorId={projectAnchorId(p.id)}
            name={p.name}
            summary={p.tagline}
            metrics={p.metrics}
            meta={<PeriodTime period={p.period} />}
          >
            <ProjectFacts project={p} />
          </ProjectRow>
        ))}
        {/* The org once, as a label over its systems, instead of on every row. */}
        {ORGS.map((org) => (
          <Fragment key={org}>
            <p className="mt-10 px-3 pb-2 font-mono text-sm text-muted-foreground">
              Built at {org}
            </p>
            {systems
              .filter((s) => s.org === org)
              .map((s) => (
                <ProjectRow
                  key={s.id}
                  value={s.id}
                  anchorId={systemAnchorId(s.id)}
                  nameAnchorId={projectAnchorId(s.id)}
                  name={s.name}
                  summary={s.summary}
                  metrics={s.metrics}
                >
                  <SystemFacts system={s} />
                </ProjectRow>
              ))}
          </Fragment>
        ))}
      </Accordion>
      <GithubRepoList className="mt-16" />
    </Section>
  )
}
