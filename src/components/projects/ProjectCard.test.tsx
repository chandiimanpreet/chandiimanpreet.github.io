import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Project } from '@/types/content'

import { ProjectCard } from './ProjectCard'

const base: Project = {
  id: 'job-runner',
  name: 'job-runner',
  description: 'A durable job runner.',
  stack: ['Go', 'Temporal'],
  repoUrl: 'https://github.com/chandiimanpreet/job-runner',
}

describe('ProjectCard', () => {
  it('links the whole card to the repo in a new tab', () => {
    render(<ProjectCard project={base} />)
    const a = screen.getByRole('link', {
      name: /^job-runner, source on GitHub ?\(opens in a new tab\)$/,
    })
    expect(a.getAttribute('href')).toBe(base.repoUrl)
    expect(a.getAttribute('target')).toBe('_blank')
    expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByRole('list')).toBeTruthy()
  })

  it('renders no link for a javascript: or off-allowlist repoUrl', () => {
    for (const repoUrl of ['javascript:alert(1)', 'https://evil.example/x']) {
      const { unmount } = render(<ProjectCard project={{ ...base, repoUrl }} />)
      expect(screen.queryByRole('link')).toBeNull()
      expect(screen.getByRole('heading', { name: 'job-runner' })).toBeTruthy()
      unmount()
    }
  })

  it('shows Live only when liveUrl is set and safe', () => {
    const { rerender } = render(<ProjectCard project={base} />)
    expect(screen.queryByRole('link', { name: /live site/ })).toBeNull()

    rerender(<ProjectCard project={{ ...base, liveUrl: 'https://job-runner.example.com' }} />)
    const live = screen.getByRole('link', {
      name: /^job-runner, live site ?\(opens in a new tab\)$/,
    })
    expect(live.getAttribute('href')).toBe('https://job-runner.example.com/')
    expect(live.getAttribute('target')).toBe('_blank')

    rerender(<ProjectCard project={{ ...base, liveUrl: 'javascript:alert(1)' }} />)
    expect(screen.queryByRole('link', { name: /live site/ })).toBeNull()
  })

  it('placeholder shows "coming soon" and no stack list', () => {
    render(<ProjectCard project={{ ...base, placeholder: true }} />)
    expect(screen.getByText('coming soon')).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('renders hostile text literally', () => {
    const hostile = '<img src=x onerror=alert(1)>'
    const { container } = render(
      <ProjectCard project={{ ...base, name: hostile, description: hostile }} />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('heading', { level: 3 }).textContent).toContain(hostile)
  })
})
