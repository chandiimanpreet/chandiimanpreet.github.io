import { describe, expect, it } from 'vitest'

import { headingId, projectAnchorId, systemAnchorId } from './anchors'

describe('anchors', () => {
  it('builds stable ids', () => {
    expect(projectAnchorId('helm-deployer')).toBe('project-helm-deployer')
    expect(systemAnchorId('helm-deployer')).toBe('system-helm-deployer')
    expect(headingId('about')).toBe('about-title')
  })
})
