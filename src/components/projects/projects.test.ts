import { describe, expect, it } from 'vitest'

import { projects, systems } from '@/content/projects'

import { buildAnchors, rowForHash } from './anchors'
import { resolveFlow } from './flow'

describe('anchors', () => {
  const anchors = buildAnchors(projects, systems)

  it('maps project and both system anchor ids to their row', () => {
    expect(rowForHash('#project-natalie', anchors)).toBe('natalie')
    expect(rowForHash('#project-helm-deployer', anchors)).toBe('helm-deployer')
    expect(rowForHash('#system-helm-deployer', anchors)).toBe('helm-deployer')
    for (const s of systems) expect(rowForHash(`#system-${s.id}`, anchors)).toBe(s.id)
  })

  it('ignores unknown or empty hashes', () => {
    expect(rowForHash('', anchors)).toBeNull()
    expect(rowForHash('#projects', anchors)).toBeNull()
  })
})

describe('resolveFlow', () => {
  it('resolves node labels and keeps the arrow label', () => {
    const helm = systems.find((s) => s.id === 'helm-deployer')!
    expect(resolveFlow(helm, helm.flows[0]!)).toEqual([
      { label: 'Deployment service', via: undefined },
      { label: 'Kubernetes cluster', via: 'Helm' },
      { label: 'ArgoCD, SonarQube, Grafana, Prometheus', via: 'installs' },
    ])
  })

  it('drops steps that point at a missing node', () => {
    const helm = systems.find((s) => s.id === 'helm-deployer')!
    expect(resolveFlow(helm, { label: 'x', steps: [{ node: 'nope' }] })).toEqual([])
  })
})
