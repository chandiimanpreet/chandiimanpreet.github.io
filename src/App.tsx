import type { ComponentType } from 'react'

import { Layout } from '@/components/layout/Layout'
import { sections } from '@/content/nav'
import AboutSection from '@/sections/AboutSection'
import AgentsSection from '@/sections/AgentsSection'
import ContactSection from '@/sections/ContactSection'
import ExperienceSection from '@/sections/ExperienceSection'
import HeroSection from '@/sections/HeroSection'
import ProjectsSection from '@/sections/ProjectsSection'
import ShowcaseSection from '@/sections/ShowcaseSection'
import SkillsSection from '@/sections/SkillsSection'
import type { SectionId } from '@/types/content'

// Order comes from src/content/nav.ts; this map only says which file renders which id.
const SECTION_COMPONENTS: Record<SectionId, ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  agents: AgentsSection,
  skills: SkillsSection,
  showcase: ShowcaseSection,
  contact: ContactSection,
}

export function App() {
  return (
    <Layout>
      {sections.map(({ id }) => {
        const SectionComponent = SECTION_COMPONENTS[id]
        return <SectionComponent key={id} />
      })}
    </Layout>
  )
}
