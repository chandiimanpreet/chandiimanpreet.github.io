export type ChangeType = 'Added' | 'Changed' | 'Reviewed'

export interface Change {
  type: ChangeType
  text: string
}

const CHANGED = /^(Migrated|Improved)\b/
// Analysis adds nothing, so it is not 'Added'. Every other verb (Set up, Built, ...) is.
const REVIEWED = /^Analyzed\b/
// "agent"/"agents" as a word (also matches "multi-agent"), but not "agentic".
const AGENT = /\bagents?\b/i
const GO = /\bGo\b/

const typeOf = (text: string): ChangeType =>
  CHANGED.test(text) ? 'Changed' : REVIEWED.test(text) ? 'Reviewed' : 'Added'

// Go work first, agent work last, everything else between; resume order kept within a rank.
const rank = (text: string): number => (GO.test(text) ? 0 : AGENT.test(text) ? 2 : 1)

/** Resume bullets -> changelog lines: a type word per bullet, infrastructure ahead of agents. Text untouched. */
export function toChanges(highlights: readonly string[]): Change[] {
  return highlights
    .map((text): Change => ({ type: typeOf(text), text }))
    .sort((a, b) => rank(a.text) - rank(b.text))
}
