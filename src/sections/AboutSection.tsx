import { Section } from '@/components/layout/Section'
import { StackList } from '@/components/shared/StackList'
import { profile } from '@/content/profile'

export default function AboutSection() {
  return (
    <Section id="about" eyebrow="~/about $ whoami" title="Backend engineer" className="text-center">
      <p className="mx-auto mt-4 max-w-measure text-lead text-muted-foreground">{profile.about}</p>
      <StackList items={profile.stack} label="Tools I work with" className="mt-8 justify-center" />
    </Section>
  )
}
