import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ProjectsSection from './ProjectsSection'

vi.mock('@/hooks/useGithubRepos', () => ({ useGithubRepos: () => ({ status: 'loading' }) }))

const trigger = (name: RegExp) => screen.getByRole('button', { name })

describe('ProjectsSection', () => {
  afterEach(() => {
    history.replaceState(null, '', '#')
  })

  it('opens Natalie by default with its re-architecture story and a repo Todo', () => {
    render(<ProjectsSection />)
    expect(trigger(/^Natalie/).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText(/BullMQ jobs on Redis queues/)).toBeTruthy()
    expect(screen.getByText(/Natalie repo or demo URL/)).toBeTruthy()
    expect(trigger(/^Helm deployment service/).getAttribute('aria-expanded')).toBe('false')
  })

  it('names the org once over the systems, not on each row', () => {
    render(<ProjectsSection />)
    expect(screen.getAllByText(/Built at DevSecCops\.AI/)).toHaveLength(1)
  })

  it('renders a flow as whole steps, each ending with the label into the next', () => {
    render(<ProjectsSection />)
    act(() => trigger(/^Helm deployment service/).click())
    const steps = screen.getByText('Deployment service').closest('ol')!.querySelectorAll('li')
    expect([...steps].map((li) => li.textContent)).toEqual([
      'Deployment serviceHelm',
      'Kubernetes clusterinstalls',
      'ArgoCD, SonarQube, Grafana, Prometheus',
    ])
  })

  it('renders both anchor ids for systems and opens the row a hash points at', () => {
    Element.prototype.scrollIntoView = vi.fn()
    const { container } = render(<ProjectsSection />)
    expect(container.querySelector('#system-helm-deployer')).toBeTruthy()
    expect(container.querySelector('#project-helm-deployer')).toBeTruthy()
    expect(container.querySelector('#project-natalie')).toBeTruthy()

    act(() => {
      history.replaceState(null, '', '#system-helm-deployer')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(trigger(/^Helm deployment service/).getAttribute('aria-expanded')).toBe('true')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })
})
