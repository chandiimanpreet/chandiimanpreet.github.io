import { profile } from '@/content/profile'
import { fetchRepos, type GithubRepo } from '@/lib/github'

import { useGithubResource, type GithubState } from './useGithubResource'

/** Public non-fork repos for `login` (default: the owner), most starred first. */
export function useGithubRepos(login: string = profile.githubLogin): GithubState<GithubRepo[]> {
  return useGithubResource(fetchRepos, login)
}
