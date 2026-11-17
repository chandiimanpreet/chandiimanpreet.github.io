import { memo, useState } from 'react'

import type { RunState } from '@/components/pipeline/trace'

import { announcement, formatReplayClock } from './traceView'

export interface TraceLogProps {
  log: RunState['log']
}

/**
 * Event log as an ordered list with one polite live region. Several events can land in one frame
 * (four at 3.2s in the retry run), so the region announces all of them, not just the last.
 * Memoised: `log` keeps its identity between events, so replay frames skip it.
 */
export const TraceLog = memo(function TraceLog({ log }: TraceLogProps) {
  // Previous-render state (React's "adjust state on prop change" pattern), no effect needed.
  const [prev, setPrev] = useState(log)
  const [spoken, setSpoken] = useState(log.at(-1)?.message ?? '')
  if (log !== prev) {
    setPrev(log)
    setSpoken(announcement(prev, log))
  }
  return (
    <div>
      <h3 className="text-h3">Progress</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        The real system streams this to the client over SSE.
      </p>
      <ol className="mt-4 space-y-1.5 border-t border-border pt-4">
        {log.map((entry, i) => (
          <li key={i} className="flex gap-4 text-sm">
            <span className="shrink-0 font-mono text-code text-muted-foreground tabular-nums">
              {formatReplayClock(entry.at)}
            </span>
            <span>{entry.message}</span>
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="sr-only">
        {spoken}
      </p>
    </div>
  )
})
