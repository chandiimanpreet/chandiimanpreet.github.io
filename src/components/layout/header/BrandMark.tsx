import { cn } from '@/lib/utils'

export interface BrandMarkProps {
  className?: string
}

/** Logomark: an "M" drawn as a request path ending in a saffron commit node. Needs a `group` ancestor for hover. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn('size-8 shrink-0', className)}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="7"
        className="fill-card stroke-border-strong transition-colors duration-120 group-hover:stroke-primary"
        strokeWidth="1"
      />
      <path
        d="M9 22V11l7 7 7-7v8"
        className="fill-none stroke-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="23" cy="22" r="2.5" className="fill-primary" />
    </svg>
  )
}
