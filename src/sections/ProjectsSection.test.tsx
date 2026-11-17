import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Project } from '@/types/content'

import ProjectsSection from './ProjectsSection'

const state = vi.hoisted(() => ({ projects: null as readonly Project[] | null }))

vi.mock('@/content/projects', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/content/projects')>()
  return {
    get projects() {
      return state.projects ?? real.projects
    },
  }
})

afterEach(() => {
  state.projects = null
})

describe('ProjectsSection', () => {
  it('keeps its id, heading and one card per project', async () => {
    const { projects } = await import('@/content/projects')
    render(<ProjectsSection />)
    const section = screen.getByRole('region', { name: "Things I've built" })
    expect(section.id).toBe('projects')
    expect(within(section).getAllByRole('article')).toHaveLength(projects.length)
  })

  it('shows the empty-state line with a GitHub link for no projects', () => {
    state.projects = []
    render(<ProjectsSection />)
    expect(screen.queryByRole('article')).toBeNull()
    expect(screen.getByText(/Repositories are on the way\. My code is on/)).toBeTruthy()
    const link = screen.getByRole('link', { name: /^GitHub ?\(opens in a new tab\)$/ })
    expect(link.getAttribute('href')).toBe('https://github.com/chandiimanpreet')
    expect(link.getAttribute('target')).toBe('_blank')
  })
})
