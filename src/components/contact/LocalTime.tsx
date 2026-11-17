import { useMinuteTick } from '@/hooks/useMinuteTick'
import { formatLocalTime } from '@/lib/time'

export interface LocalTimeProps {
  timeZone: string
  place: string
}

/** "Local time in Patiala: 3:42 PM GMT+5:30." Ticks on the minute; paused while the tab is hidden. */
export function LocalTime({ timeZone, place }: LocalTimeProps) {
  const now = useMinuteTick()
  return (
    <p className="text-sm text-muted-foreground">
      Local time in {place}:{' '}
      <time dateTime={now.toISOString()}>{formatLocalTime(now, timeZone)}</time>.
    </p>
  )
}
