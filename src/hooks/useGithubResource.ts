import { useEffect, useState } from 'react'

import { GithubError, type GithubResult } from '@/lib/github'

export type GithubState<T> =
  | { status: 'loading' }
  | ({ status: 'success' } & GithubResult<T>)
  | { status: 'error'; error: GithubError }

type Fetcher<T> = (login: string) => Promise<GithubResult<T>>

/** Backs useGithubRepos. `fetcher` must be a module-level function. */
export function useGithubResource<T>(fetcher: Fetcher<T>, login: string): GithubState<T> {
  const [state, setState] = useState<{ login: string; value: GithubState<T> }>({
    login,
    value: { status: 'loading' },
  })

  useEffect(() => {
    let live = true
    fetcher(login).then(
      (result) => live && setState({ login, value: { status: 'success', ...result } }),
      (err: unknown) =>
        live &&
        setState({
          login,
          value: {
            status: 'error',
            error:
              err instanceof GithubError
                ? err
                : new GithubError('network', 'Could not reach GitHub.'),
          },
        }),
    )
    return () => {
      live = false
    }
  }, [fetcher, login])

  // A changed login shows loading until its own result lands, never the previous user's data.
  return state.login === login ? state.value : { status: 'loading' }
}
