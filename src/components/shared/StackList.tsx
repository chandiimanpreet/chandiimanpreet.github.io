import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface StackListProps {
  items: readonly string[]
  /** Accessible name for the list, when the context does not already name it. */
  label?: string
  className?: string
}

export function StackList({ items, label, className }: StackListProps) {
  return (
    <ul aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <li key={item}>
          <Badge variant="secondary" className="rounded-sm font-mono">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}
