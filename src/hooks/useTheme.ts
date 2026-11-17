import { useCallback, useState } from 'react'

export type Theme = 'dark' | 'light'

// Same key as public/theme-init.js, which applies the theme before first paint.
const STORAGE_KEY = 'theme'

function current(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** Reads the theme theme-init.js applied; toggling updates <html>, theme-color and storage. */
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void } {
  const [theme, setState] = useState<Theme>(current)

  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    root.classList.toggle('dark', t === 'dark')
    // theme-color follows the --background token (src/index.css) now applied to <html>.
    const color = getComputedStyle(root).getPropertyValue('--background').trim()
    if (color) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
    try {
      localStorage.setItem(STORAGE_KEY, t)
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    setState(t)
  }, [])

  const toggle = useCallback(() => setTheme(current() === 'dark' ? 'light' : 'dark'), [setTheme])

  return { theme, setTheme, toggle }
}
