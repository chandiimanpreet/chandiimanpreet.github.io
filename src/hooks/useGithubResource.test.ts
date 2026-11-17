import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { GithubResult } from '@/lib/github'

import { useGithubResource } from './useGithubResource'

describe('useGithubResource', () => {
  it('never shows the previous login’s data, even when its fetch lands late', async () => {
    const pending = new Map<string, (r: GithubResult<string>) => void>()
    const fetcher = (login: string) =>
      new Promise<GithubResult<string>>((resolve) => pending.set(login, resolve))

    const { result, rerender } = renderHook(({ login }) => useGithubResource(fetcher, login), {
      initialProps: { login: 'a' },
    })
    await act(async () => pending.get('a')?.({ data: 'A', stale: false, savedAt: 1 }))
    expect(result.current).toMatchObject({ status: 'success', data: 'A' })

    rerender({ login: 'b' })
    expect(result.current).toEqual({ status: 'loading' }) // not A's data

    await act(async () => pending.get('b')?.({ data: 'B', stale: false, savedAt: 2 }))
    expect(result.current).toMatchObject({ status: 'success', data: 'B' })
  })

  it('ignores a result that arrives after the login changed', async () => {
    const pending = new Map<string, (r: GithubResult<string>) => void>()
    const fetcher = (login: string) =>
      new Promise<GithubResult<string>>((resolve) => pending.set(login, resolve))

    const { result, rerender } = renderHook(({ login }) => useGithubResource(fetcher, login), {
      initialProps: { login: 'a' },
    })
    rerender({ login: 'b' })
    await act(async () => pending.get('a')?.({ data: 'A', stale: false, savedAt: 1 }))
    expect(result.current).toEqual({ status: 'loading' })
  })
})
