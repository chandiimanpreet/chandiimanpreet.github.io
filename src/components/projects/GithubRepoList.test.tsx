import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GithubState } from '@/hooks/useGithubResource'
import { GithubError, type GithubRepo } from '@/lib/github'

import { GithubRepoList } from './GithubRepoList'

let state: GithubState<GithubRepo[]> = { status: 'loading' }
vi.mock('@/hooks/useGithubRepos', () => ({ useGithubRepos: () => state }))

const repo = (over: Partial<GithubRepo>): GithubRepo => ({
  name: 'svc',
  description: null,
  html_url: 'https://github.com/chandiimanpreet/svc',
  homepage: null,
  language: 'Go',
  topics: [],
  stargazers_count: 0,
  forks_count: 0,
  pushed_at: null,
  fork: false,
  ...over,
})

describe('GithubRepoList', () => {
  beforeEach(() => {
    state = { status: 'loading' }
  })

  it('shows skeletons while loading', () => {
    const { container } = render(<GithubRepoList />)
    expect(screen.getByText('Loading repositories')).toBeTruthy()
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3)
  })

  it('explains an empty list instead of treating it as an error', () => {
    state = { status: 'success', data: [], stale: false, savedAt: Date.now() }
    render(<GithubRepoList />)
    expect(screen.getByText(/repositories are private for now/)).toBeTruthy()
    expect(screen.queryByText(/saved data/)).toBeNull()
  })

  it('shows the empty-state copy when no repo survives the filter', () => {
    state = {
      status: 'success',
      data: [repo({ name: 'portfolio' }), repo({ name: 'Taskifyy', description: '  ' })],
      stale: false,
      savedAt: Date.now(),
    }
    render(<GithubRepoList />)
    expect(screen.getByText(/repositories are private for now/)).toBeTruthy()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('falls back to the profile link on error', () => {
    state = { status: 'error', error: new GithubError('rate-limit', 'limited') }
    render(<GithubRepoList />)
    const link = screen.getByRole('link', { name: 'my GitHub profile' })
    expect(link.getAttribute('href')).toBe('https://github.com/chandiimanpreet')
  })

  it('renders remote text literally, rejects off-host links and notes stale data', () => {
    const hostile = '<img src=x onerror=alert(1)>'
    state = {
      status: 'success',
      stale: true,
      savedAt: Date.now() - 3 * 3600_000,
      data: [
        repo({ description: hostile }),
        repo({ name: 'evil', description: 'x', html_url: 'https://evil.com/x' }),
      ],
    }
    const { container } = render(<GithubRepoList />)
    expect(screen.getByText(hostile)).toBeTruthy()
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('link', { name: 'svc' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'evil' })).toBeNull()
    expect(screen.getByText(/Showing saved data from 3 hours ago/)).toBeTruthy()
  })
})
