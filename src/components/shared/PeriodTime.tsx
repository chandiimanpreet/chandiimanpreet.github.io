import { formatPeriod } from '@/lib/utils'
import type { DateRange } from '@/types/content'

export interface PeriodTimeProps {
  period: DateRange
}

/** "Sep 2025 – Present" in a `<time>`; `dateTime` carries the machine-readable start month. */
export function PeriodTime({ period }: PeriodTimeProps) {
  return <time dateTime={period.start}>{formatPeriod(period)}</time>
}
