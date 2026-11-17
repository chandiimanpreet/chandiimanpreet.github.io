import { Badge } from '@/components/ui/badge'

export interface StackListProps {
  items: readonly string[]
  /** Accessible name for the list, when the context does not already name it. */
  label?: string
}

export function StackList({ items, label }: StackListProps) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
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
