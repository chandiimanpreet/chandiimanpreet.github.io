// Classic blocking script (not a module): runs before first paint so there is no theme flash.
// Kept as a file so the CSP can stay script-src 'self'. Same storage key as src/hooks/useTheme.ts.
// The two theme-color literals below copy --background from src/index.css (:root Paper, .dark Ink);
// keep them in sync there. useTheme reads the token itself after the first toggle.
;(function () {
  var theme = 'dark'
  try {
    if (localStorage.getItem('theme') === 'light') theme = 'light'
  } catch (e) {
    /* storage disabled: default dark */
  }
  var root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d1017' : '#faf7f1')
})()
