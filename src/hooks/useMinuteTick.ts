import { useEffect, useState } from 'react'

import { msUntilNextMinute } from '@/lib/time'

/** Current time, refreshed on each minute boundary. Paused while the tab is hidden. */
export function useMinuteTick(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      setNow(new Date())
      timer = setTimeout(tick, msUntilNextMinute(Date.now()))
    }
    const onVisibility = () => {
      clearTimeout(timer)
      if (!document.hidden) tick()
    }

    if (!document.hidden) timer = setTimeout(tick, msUntilNextMinute(Date.now()))
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return now
}
