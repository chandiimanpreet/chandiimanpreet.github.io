import { cn } from '@/lib/utils'

import type { LogLine } from './contracts'

export interface TraceLogProps {
  lines: readonly LogLine[]
  max: 2 | 3
  className?: string
}

function LineText({ line }: { line: LogLine }) {
  const { text, status } = line
  // The status may sit mid-line ("GET /v1/jobs/137 200 hit 3ms") or close it ("job completed").
  const at = status ? text.lastIndexOf(` ${status}`) : -1
  const tone = line.tone === 'failed' ? undefined : 'text-ok'
  if (!status) return text
  if (at < 0)
    return (
      <>
        {text} <span className={tone}>{status}</span>
      </>
    )
  return (
    <>
      {text.slice(0, at + 1)}
      <span className={tone}>{status}</span>
      {text.slice(at + 1 + status.length)}
    </>
  )
}

/** Newest line last; decorative (the figure's figcaption is the text alternative). */
export function TraceLog({ lines, max, className }: TraceLogProps) {
  // Opaque-enough backing (>= 88%, DESIGN-V3 2.2) so the trace field never runs behind the text.
  return (
    <ol
      aria-hidden="true"
      className={cn(
        'w-fit max-w-full rounded-sm bg-background/90 px-1.5 py-1 font-mono text-code text-muted-foreground empty:invisible',
        className,
      )}
    >
      {lines.slice(-max).map((line) => (
        <li
          key={line.key}
          className={cn(
            'truncate animate-in fade-in duration-240 ease-brand motion-reduce:animate-none',
            line.tone === 'failed' && 'text-destructive',
          )}
        >
          {line.traceId} <LineText line={line} />
        </li>
      ))}
    </ol>
  )
}
