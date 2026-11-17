import { ExperienceEntry } from '@/components/experience/ExperienceEntry'
import { Section } from '@/components/layout/Section'
import { experience } from '@/content/experience'
import { systems } from '@/content/projects'

const systemsFor = (ids: readonly string[] = []) =>
  ids.flatMap((id) => systems.filter((s) => s.id === id))

// DESIGN-V2 5.3: a changelog, newest first, each entry on a small node of its own line.
export default function ExperienceSection() {
  return (
    <Section id="experience" title="Changelog">
      <p className="mt-4 max-w-measure text-lead text-muted-foreground">
        Where I have worked, written the way I write release notes.
      </p>
      <ol className="mt-10 space-y-12 border-l border-border pl-6">
        {experience.map((entry) => (
          <li key={entry.id}>
            <ExperienceEntry entry={entry} systems={systemsFor(entry.systemIds)} />
          </li>
        ))}
      </ol>
    </Section>
  )
}
