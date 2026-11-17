import { heroPicks } from '@/content/hero'
import { projects, systems } from '@/content/projects'
import type { Metric } from '@/types/content'

export interface HeroStat extends Metric {
  /** Mono tag naming the technology behind the number. */
  tag: string
}

/** Hero proof stats. A pick whose metric no longer exists is dropped, never rendered blank. */
export function heroStats(): HeroStat[] {
  const sources = [...projects, ...systems]
  return heroPicks.flatMap(({ from, index, tag }) => {
    const metric = sources.find((s) => s.id === from)?.metrics[index]
    return metric ? [{ ...metric, tag }] : []
  })
}
