import { Section } from '@/components/layout/Section'
import { SkillGroup } from '@/components/skills/SkillGroup'
import { buildSkillLinks, SKILL_LAYERS } from '@/components/skills/skillLayers'
import { achievements } from '@/content/achievements'
import { projects, systems } from '@/content/projects'

// Own project first, so a skill shared with a work system links to Natalie.
const links = buildSkillLinks([...projects, ...systems])
const certification = achievements.find((a) => a.kind === 'certification')

export default function SkillsSection() {
  return (
    <Section id="skills" title="What I reach for">
      <dl className="mt-8 divide-y divide-border border-y border-border">
        {SKILL_LAYERS.map((layer) => (
          <SkillGroup key={layer.label} label={layer.label} items={layer.items} links={links} />
        ))}
      </dl>
      {certification && (
        <p className="mt-6 text-muted-foreground">
          <span className="font-semibold text-foreground">Certified:</span> {certification.title}
          {certification.detail && (
            <span className="font-mono text-code"> ({certification.detail})</span>
          )}
        </p>
      )}
    </Section>
  )
}
