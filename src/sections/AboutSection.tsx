import { AchievementList } from '@/components/about/AchievementList'
import { EducationList } from '@/components/about/EducationList'
import { Section } from '@/components/layout/Section'
import { Todo } from '@/components/shared/Todo'
import { achievements } from '@/content/achievements'
import { education } from '@/content/education'

// Copy from DESIGN-V2 5.2, written from the resume summary: backend first, agents as one strength.
export default function AboutSection() {
  return (
    <Section id="about" title="I like systems that finish what they start.">
      <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="max-w-measure space-y-4 text-lead text-muted-foreground md:col-span-7">
          <p>
            I&apos;m a backend engineer working in Go and Node.js/TypeScript on distributed systems.
            Most of my work is scalable REST APIs and event-driven backends with durable workflow
            orchestration, retries and idempotent processing.
          </p>
          <p>
            I ship on AWS and Kubernetes with automated CI/CD. I have also shipped LLM agents into
            production services with LangChain and LangGraph, built on the same foundations.
          </p>
          <Todo what="approve the About heading (a voice line, not resume text)" />
        </div>

        <aside aria-label="Education and credentials" className="space-y-8 md:col-span-5">
          <div>
            <h3 className="border-b border-border pb-2 font-display text-h3 text-foreground">
              Education
            </h3>
            <EducationList entries={education} />
          </div>
          <div>
            <h3 className="border-b border-border pb-2 font-display text-h3 text-foreground">
              Credentials
            </h3>
            <AchievementList items={achievements} />
          </div>
        </aside>
      </div>
    </Section>
  )
}
