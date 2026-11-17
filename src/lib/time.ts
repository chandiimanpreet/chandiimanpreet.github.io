const clockFormatters = new Map<string, Intl.DateTimeFormat>()
const localFormatters = new Map<string, Intl.DateTimeFormat>()

function cached(
  cache: Map<string, Intl.DateTimeFormat>,
  timeZone: string,
  make: () => Intl.DateTimeFormat,
): Intl.DateTimeFormat {
  let f = cache.get(timeZone)
  if (!f) {
    f = make()
    cache.set(timeZone, f)
  }
  return f
}

/** "14:32" in `timeZone`, 24-hour. Formatters are cached per zone (the clock ticks every minute). */
export function formatClock(date: Date, timeZone: string): string {
  return cached(
    clockFormatters,
    timeZone,
    () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
      }),
  ).format(date)
}

/** "3:42 PM GMT+5:30" in `timeZone`. Formatters are cached per zone. */
export function formatLocalTime(date: Date, timeZone: string): string {
  return cached(
    localFormatters,
    timeZone,
    () =>
      new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
        timeZoneName: 'short',
      }),
  ).format(date)
}

/**
 * Milliseconds until the next whole UTC minute. Asia/Kolkata is UTC+5:30, so its minutes turn over
 * at the same instant; a zone with a seconds offset would need its own boundary (none exist today).
 */
export function msUntilNextMinute(nowMs: number): number {
  return 60_000 - (nowMs % 60_000)
}
