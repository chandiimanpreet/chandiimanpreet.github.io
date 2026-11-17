import type { ComponentType } from 'react'

import { Layout } from '@/components/layout/Layout'
import { sections } from '@/content/nav'
import AboutSection from '@/sections/AboutSection'
import ContactSection from '@/sections/ContactSection'
import HeroSection from '@/sections/HeroSection'
import ProjectsSection from '@/sections/ProjectsSection'
import type { SectionId } from '@/types/content'

// Order comes from src/content/nav.ts; this map only says which file renders which id.
const SECTION_COMPONENTS: Record<SectionId, ComponentType> = {
  hero: HeroSection,
  about: AboutSection,
  projects: ProjectsSection,
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
