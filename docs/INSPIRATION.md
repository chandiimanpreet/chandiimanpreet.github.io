# Portfolio Inspiration

Sourcing note: dribbble.com returned empty to scraping. Sources below are what search surfaced (templates, write-ups); the ideas are my synthesis of recurring 2025-26 patterns, not copies of any one site.
Sources: https://v0.app/templates/bento-portfolio-design-BT2cd8P4bYU (bento + dark),
https://superdesign.dev/library/swapnils-bold-portfolio (dark, orange-red accent, micro-interactions),
https://astro.build/themes/details/bentofolio-premium-astro-portfolio-template/ (bento, dark mode),
https://dev.to/vijaykumar_pilli_6fe25ea5/my-2026-portfolio-modern-nextjs-with-live-github-stats-devto-integration-3732 (live GitHub stats),
https://devplaybook.cc/blog/best-developer-portfolio-examples-2025 (hero = who, what, one CTA),
https://github.com/iamdhakrey/terminal-portfolio (terminal-style theme).

## Ideas (all plain CSS / vanilla JS)

1. **One-sentence hero + single CTA.** Big name, one line of what you build, one primary button, one quiet secondary link. Works because visitors decide in ~5s. Build: `h1{font-size:clamp(2.5rem,7vw,5.5rem);letter-spacing:-.04em}`, two `<a>` buttons.
2. **Bento grid as the main layout.** Mixed-size tiles (about, stack, featured project, stats, contact). Scannable, modern, content-agnostic. Build: `.bento{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}` with `.span2{grid-column:span 2}` / `.tall{grid-row:span 2}`; collapse to 1 col under 700px.
3. **Cursor-follow spotlight on cards.** Soft radial glow tracks the mouse inside each tile. Adds depth with zero imagery. Build: on `pointermove` set `--x/--y` on the card from `e.clientX - rect.left`; CSS `background:radial-gradient(300px circle at var(--x) var(--y),rgb(255 255 255/.08),transparent 60%)` in a `::before`.
4. **Gradient hairline borders.** 1px border at ~10% white, brightening on hover. Reads as premium vs. heavy shadows. Build: `border:1px solid var(--line); transition:border-color .2s` and `:hover{border-color:var(--accent)}`.
5. **Project cards with outcome line + stack chips.** Title, one-sentence result ("cut build time 40%"), 3 small tech chips, arrow that nudges right on hover. Recruiters want impact, not screenshots only. Build: flex chips, `.card:hover .arrow{transform:translateX(4px)}`.
6. **Live GitHub stats tile.** Repos, followers, recent repos, plus a contribution-style heatmap. Proof of activity. Build: `fetch('https://api.github.com/users/NAME')` (public, unauthenticated, 60 req/h) and cache in `localStorage` for an hour; render heatmap as a 7-row CSS grid of `<i>` squares with 4 opacity levels. Fail silently to static numbers.
7. **"People I admire" strip.** A row of small cards: avatar, name, one-line reason, link. Shows taste and humility, rare on portfolios. Build: horizontal `display:flex;overflow-x:auto;scroll-snap-type:x mandatory` with `scroll-snap-align:start`; avatars via `https://github.com/USER.png`.
8. **Scroll-reveal with IntersectionObserver.** Sections fade up 12px once. Restrained motion feels polished. Build: observer toggles `.in` class; `.reveal{opacity:0;transform:translateY(12px);transition:.5s}` `.in{opacity:1;transform:none}`; wrap in `@media (prefers-reduced-motion:no-preference)`.
9. **Mono "status" micro-details.** Pulsing green dot "Open to work", local time clock, `v2026.11` footer tag. Humanizes the page. Build: `@keyframes pulse` on a 8px dot; `setInterval` with `toLocaleTimeString([], {timeZone:'Asia/Kolkata'})`.
10. **Command-palette-lite nav (optional).** Press `/` or Cmd+K to jump to sections. Dev-native feel. Build: `<dialog>` with an input filtering a list of anchors; `showModal()` gives focus trap and Esc free.
11. **Text scramble/typed role line.** Rotating role words in the hero ("backend / infra / security"). Keep to one line, pause on hover. Build: `setInterval` swapping `textContent` with CSS fade; skip if reduced-motion.
12. **Subtle noise + radial glow background.** One large blurred accent blob top-center and a faint grain. Avoids flat black. Build: `body{background:radial-gradient(60rem 30rem at 50% -10%,rgb(124 92 255/.18),transparent),var(--bg)}`; grain via inline SVG `feTurbulence` data-URI at 4% opacity.

## Palette + font pairings

A. **Ink + Violet.** bg `#0b0b0f`, surface `#14141b`, line `#26262f`, text `#ecebf3`, muted `#8b8a9b`, accent `#7c5cff`. Fonts: Inter (body) + JetBrains Mono (labels, chips).
B. **Charcoal + Ember** (bold, warm). bg `#0e0d0c`, surface `#181614`, line `#2a2622`, text `#f3eee8`, muted `#9a9087`, accent `#ff5a36`. Fonts: Space Grotesk headings + IBM Plex Mono.
C. **Midnight + Mint** (terminal-leaning). bg `#0a0f12`, surface `#111a1f`, line `#1f2d34`, text `#e6f1ee`, muted `#7d949a`, accent `#3ddc97`. Fonts: Geist (or Manrope) + Geist Mono / Fira Code.

Contrast check: keep muted text >= 4.5:1 on surface; test accent on bg before using for small text.

## Avoid

1. Heavy WebGL/3D hero or loading screens: slow, inaccessible, hides your content.
2. Pure `#000` background with pure `#fff` text; harsh, causes halation. Use off-black/off-white.
3. Skill-percentage bars and 40 tech logos; meaningless. Show 6-8 tools you actually use.
4. Custom cursors and scroll-hijacking; breaks expectations and touch/keyboard use.
5. Third-party stat images or widgets loaded on every visit without fallback (rate limits, layout shift, privacy). Fetch once, cache, degrade gracefully.
