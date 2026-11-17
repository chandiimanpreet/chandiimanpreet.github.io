import type { GithubRepo } from '@/lib/github'

/**
 * Repos worth listing, in the order given: drops repos without a description and later repos
 * whose name repeats an earlier one ignoring case, then keeps the first `max`. Rule-based only.
 */
export function selectRepos(repos: readonly GithubRepo[], max: number): GithubRepo[] {
  const seen = new Set<string>()
  return repos
    .filter((r) => {
      const key = r.name.toLowerCase()
      if (!r.description?.trim() || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, max)
}
