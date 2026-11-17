import { useMinuteTick } from '@/hooks/useMinuteTick'
import { formatClock } from '@/lib/time'

export interface LocalClockProps {
  /** IANA zone, e.g. profile.timeZone. */
  timeZone: string
  className?: string
}

/** Wall clock in `timeZone`. Ticks on each minute boundary; stops while the tab is hidden. */
export function LocalClock({ timeZone, className }: LocalClockProps) {
  const now = useMinuteTick()
  return (
    <time dateTime={now.toISOString()} className={className}>
      {formatClock(now, timeZone)}
    </time>
  )
}
