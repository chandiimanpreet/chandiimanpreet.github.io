import { describe, expect, it } from 'vitest'

import type { GithubRepo } from '@/lib/github'

import { selectRepos } from './repos'

const repo = (name: string, description: string | null = 'd'): GithubRepo => ({
  name,
  description,
  html_url: `https://github.com/chandiimanpreet/${name}`,
  homepage: null,
  language: null,
  topics: [],
  stargazers_count: 0,
  forks_count: 0,
  pushed_at: null,
  fork: false,
})

const names = (repos: GithubRepo[]) => repos.map((r) => r.name)

describe('selectRepos', () => {
  it('drops repos with no or blank description', () => {
    expect(names(selectRepos([repo('a', null), repo('b', ' '), repo('c')], 6))).toEqual(['c'])
  })

  it('keeps the first of names that differ only by case', () => {
    expect(names(selectRepos([repo('Taskify'), repo('taskify'), repo('TASKIFY')], 6))).toEqual([
      'Taskify',
    ])
  })

  it('counts a dropped description-less repo as no claim on the name', () => {
    expect(names(selectRepos([repo('Svc', null), repo('svc')], 6))).toEqual(['svc'])
  })

  it('keeps at most max, in order', () => {
    const many = Array.from({ length: 9 }, (_, i) => repo(`r${i}`))
    expect(names(selectRepos(many, 6))).toEqual(['r0', 'r1', 'r2', 'r3', 'r4', 'r5'])
  })
})
