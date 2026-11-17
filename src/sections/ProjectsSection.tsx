import { Section } from '@/components/layout/Section'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ExternalLink } from '@/components/shared/ExternalLink'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { linkClass } from '@/lib/styles'
import { githubProfileUrl } from '@/lib/url'

const soon = projects.filter((p) => p.placeholder).length

export default function ProjectsSection() {
  return (
    <Section
      id="projects"
      eyebrow="~/projects $ ls -la"
      title="Things I've built"
      className="text-center"
    >
      <p className="mt-4 font-mono text-code text-muted-foreground">
        total {projects.length} · {projects.length - soon} public · {soon} coming soon
      </p>
      {projects.length > 0 ? (
        <ul className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-muted-foreground">
          Repositories are on the way. My code is on{' '}
          <ExternalLink newTab href={githubProfileUrl(profile.githubLogin)} className={linkClass}>
            GitHub
          </ExternalLink>
          .
        </p>
      )}
    </Section>
  )
}
