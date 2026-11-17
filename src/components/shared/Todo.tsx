import { Badge } from '@/components/ui/badge'

export interface TodoProps {
  /** What is missing, e.g. "LinkedIn URL". */
  what: string
}

/** Visible marker for content the resume does not provide yet (DESIGN-V2 section 10). */
export function Todo({ what }: TodoProps) {
  return (
    <Badge
      variant="outline"
      className="h-auto border-dashed border-input font-mono text-code font-normal whitespace-normal text-muted-foreground"
    >
      TODO: {what}
    </Badge>
  )
}
