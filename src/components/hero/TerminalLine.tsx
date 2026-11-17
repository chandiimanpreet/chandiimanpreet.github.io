import { cn } from '@/lib/utils'

import { useTypewriter } from './typing'

export interface TerminalLineProps {
  text: string
  instant: boolean
  className?: string
}

/**
 * DESIGN-V3 4.3. The untyped rest stays in the flow (invisible) and the caret is zero-width, so line
 * breaks are final from the first frame. Screen readers get the sentence once, from the sr-only copy.
 */
export function TerminalLine({ text, instant, className }: TerminalLineProps) {
  const { count, done } = useTypewriter(text, { instant })

  return (
    <p className={cn('font-mono', className)}>
      <span aria-hidden="true" className="mr-2 text-primary select-none">
        $
      </span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <span>{text.slice(0, count)}</span>
        <span
          className={cn(
            'inline-block w-0 overflow-visible align-baseline text-primary',
            done &&
              'animate-caret group-data-[paused=true]/hero:[animation-play-state:paused] motion-reduce:animate-none',
          )}
        >
          ▍
        </span>
        <span className="invisible">{text.slice(count)}</span>
      </span>
    </p>
  )
}
