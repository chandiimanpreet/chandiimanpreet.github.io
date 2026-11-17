import { cn } from '@/lib/utils'
import type { Achievement } from '@/types/content'

export interface AchievementListProps {
  items: Achievement[]
}

export function AchievementList({ items }: AchievementListProps) {
  return (
    <dl className="divide-y divide-border">
      {items.map((a) => (
        <div key={a.id} className="py-3">
          <dt className="font-medium text-foreground">{a.title}</dt>
          {a.detail && (
            <dd
              className={cn(
                'text-muted-foreground',
                // Exam codes are machine facts, so mono (DESIGN-V2 section 1).
                a.kind === 'certification' && 'font-mono text-code',
              )}
            >
              {a.detail}
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}
