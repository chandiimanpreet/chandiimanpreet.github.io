import { cn } from '@/lib/utils'

import type { HeroStat } from './stats'

export interface HeroStatsProps {
  stats: HeroStat[]
  className?: string
}

/** Proof numbers as a <dl>. DOM reads label then value; the tag and value are lifted visually. */
export function HeroStats({ stats, className }: HeroStatsProps) {
  return (
    <dl className={cn('grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((s) => (
        <div key={s.tag} className="flex flex-col gap-1">
          <dt className="order-3 text-sm text-muted-foreground">{s.label}</dt>
          <dd className="order-2 font-display text-h2 text-foreground">{s.value}</dd>
          <dd className="order-1 font-mono text-code text-muted-foreground">{s.tag}</dd>
        </div>
      ))}
    </dl>
  )
}
