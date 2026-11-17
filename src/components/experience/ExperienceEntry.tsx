import { PeriodTime } from '@/components/shared/PeriodTime'
import { systemAnchorId } from '@/lib/anchors'
import { targetLinkClass } from '@/lib/styles'
import type { ExperienceEntry as Entry, System } from '@/types/content'

import { toChanges } from './changelog'

export interface ExperienceEntryProps {
  entry: Entry
  /** Systems built in this role, already resolved from `entry.systemIds`. */
  systems: System[]
}

/** One changelog entry: period, role and org (h3), then typed change lines. */
export function ExperienceEntry({ entry, systems }: ExperienceEntryProps) {
  return (
    <article className="relative">
      <span
        aria-hidden="true"
        className="absolute top-1.5 -left-6 size-node-sm -translate-x-1/2 rounded-full border-2 border-border-strong bg-background"
      />
      <p className="font-mono text-code text-muted-foreground">
        <PeriodTime period={entry.period} />
        {'\u00a0· '}
        {entry.location}
      </p>
      <h3 className="mt-1 font-display text-h3 text-foreground">
        {entry.role}, {entry.company}
      </h3>
      <dl className="mt-4 space-y-3">
        {toChanges(entry.highlights).map(({ type, text }) => (
          <div key={text} className="md:flex md:gap-4">
            <dt className="font-semibold md:w-label md:shrink-0">{type}</dt>
            <dd className="max-w-measure leading-relaxed text-foreground">{text}</dd>
          </div>
        ))}
      </dl>
      {systems.length > 0 && (
        <div className="mt-4 md:flex md:gap-4">
          <p className="font-semibold md:w-label md:shrink-0 md:pt-2.5">Systems</p>
          <ul className="flex flex-wrap gap-x-4">
            {systems.map((s) => (
              <li key={s.id}>
                <a href={`#${systemAnchorId(s.id)}`} className={targetLinkClass}>
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
