import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

/** A pressed/unpressed toggle with a fixed name, so screen readers hear the state, not a new label. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={dark}
      className="size-target border-input dark:border-input"
    >
      {dark ? <Moon aria-hidden className="size-5" /> : <Sun aria-hidden className="size-5" />}
    </Button>
  )
}
