# DESIGN.md: Manpreet Singh portfolio

Source of truth for the implementer. Follow it exactly; flag gaps instead of inventing.
Copy marked `[EDIT]` is a placeholder the owner must confirm. Nothing else is filler.

## 1. Concept

**The page is a git history.** One continuous line (the *branch rail*) runs down the left
edge of the content, like `git log --graph`. Each section hangs off the rail at a commit
node. At the Showcase section the rail **forks**: other engineers live on a second branch
that splits off and **merges back** before Contact. That fork is the signature element and
it carries meaning: my work is `main`, the people I learn from are a branch I pull from.

Everything else stays quiet: flat surfaces, hairline borders, no glassmorphism, no card
shadows. Light is used twice and only where it means something: a soft saffron halo around
the HEAD node in the hero (the rail's origin), and a pointer spotlight inside Showcase cards
(see 7). Colour is ink navy plus one saffron accent; the only second hue is the steel blue
of the forked branch.

Polish comes from precision, not effects: the reference site the owner likes gets its
impact from a sci-fi HUD (glowing core, spinning rings, cyan on black). We match that level
of finish with a different identity: warm saffron on ink, editorial type, and a structural
motif (version history) instead of a decorative one. Do not borrow its palette, display
font or reactor/HUD imagery.

Rules that keep it disciplined:
- Saffron marks exactly three things: the rail's active node, links/primary actions, focus rings.
- Steel blue appears only on the forked branch and things attached to it (Showcase).
- Monospace is for machine facts only (hashes, repo names, counts, dates). Never for headings.
- Section headings are plain sentence-case statements. No eyebrow labels, no numbering.
- Three sections, three different shapes: Projects is a **list of rows**, Showcase is a
  **card grid**, Skills is **running text**. Do not make them look alike.

## 2. Colour

Contrast figures are WCAG ratios against `bg / surface / surface-2`, computed.

### Dark (default), "Ink"
| Token | Name | Hex | Use | Contrast |
|---|---|---|---|---|
| `--bg` | Ink | `#0D1017` | page | |
| `--surface` | Slate | `#151A23` | cards, header | |
| `--surface-2` | Slate raised | `#1D2430` | hover fill, skeleton, code chips | |
| `--border` | Seam | `#2A3342` | decorative hairlines, idle rail | decorative |
| `--border-strong` | Seam strong | `#6B7890` | input/button outlines (needs 3:1) | 4.3 / 3.9 / 3.5 |
| `--text` | Bone | `#ECE8DF` | body, headings | 15.6 / 14.3 / 12.8 |
| `--text-muted` | Ash | `#A3ACBA` | secondary text, metadata | 8.3 / 7.6 / 6.8 |
| `--accent` | Saffron | `#F5A524` | links, active node, focus | 9.3 / 8.6 / 7.6 |
| `--accent-fill` | Saffron | `#F5A524` | primary button background | |
| `--on-accent` | Char | `#1A1204` | text on `--accent-fill` | 9.1 |
| `--branch` | Steel | `#7DB0E0` | forked rail, Showcase accents | 8.3 / 7.6 / 6.8 |
| `--ok` | Moss | `#5BC58B` | "copied" confirmation | 8.9 |
| `--danger` | Coral | `#F58A8C` | error text | 8.1 |

### Light, "Paper"
| Token | Name | Hex | Use | Contrast |
|---|---|---|---|---|
| `--bg` | Paper | `#FAF7F1` | page | |
| `--surface` | White | `#FFFFFF` | cards, header | |
| `--surface-2` | Linen | `#F1ECE2` | hover fill, skeleton, code chips | |
| `--border` | Crease | `#DDD5C7` | decorative hairlines, idle rail | decorative |
| `--border-strong` | Crease strong | `#857B6B` | input/button outlines | 3.9 / 4.2 / 3.5 |
| `--text` | Ink | `#171B24` | body, headings | 16.1 / 17.2 / 14.6 |
| `--text-muted` | Graphite | `#535C6B` | secondary text | 6.3 / 6.8 / 5.7 |
| `--accent` | Burnt saffron | `#9A4A00` | links, active node, focus | 5.9 / 6.3 / 5.3 |
| `--accent-fill` | Burnt saffron | `#9A4A00` | primary button background | |
| `--on-accent` | White | `#FFFFFF` | text on `--accent-fill` | 6.3 |
| `--branch` | Deep steel | `#2A5F96` | forked rail, Showcase accents | 6.2 / 6.6 / 5.6 |
| `--ok` | Pine | `#1A6E41` | confirmation | 5.9 |
| `--danger` | Brick | `#AD272C` | error text | 6.3 |

Never use `--border` to convey state or as the only boundary of an interactive control.

## 3. Type

Google Fonts, one request, `display=swap`, `preconnect` to both font hosts:
`Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700` / `Instrument+Sans:wght@400;500;600` / `JetBrains+Mono:wght@400;500`

| Role | Family | Fallback stack |
|---|---|---|
| Display (h1, h2) | Bricolage Grotesque | `"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif` |
| Body, UI, h3 | Instrument Sans | `"Instrument Sans", system-ui, -apple-system, sans-serif` |
| Machine facts | JetBrains Mono | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` |

| Token | Size | Weight | Line-height | Tracking | Used for |
|---|---|---|---|---|---|
| `--fs-hero` | `clamp(2.75rem, 1.6rem + 5.8vw, 5.5rem)` | 700 | 0.95 | -0.03em | h1 (name) |
| `--fs-h2` | `clamp(1.75rem, 1.35rem + 2vw, 2.75rem)` | 600 | 1.1 | -0.02em | section headings |
| `--fs-h3` | `1.25rem` | 600 | 1.3 | -0.01em | project/card names |
| `--fs-lead` | `clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)` | 400 | 1.5 | 0 | hero statement, section intros |
| `--fs-body` | `1rem` | 400 | 1.65 | 0 | paragraphs |
| `--fs-small` | `0.875rem` | 400/500 | 1.5 | 0 | metadata, nav, buttons |
| `--fs-mono` | `0.8125rem` | 400/500 | 1.5 | 0 | hashes, counts, branch tag |

Body copy max width `62ch`. No all-caps anywhere. Headings use `text-wrap: balance`.

## 4. Space, radius, layout, motion tokens

- Spacing (4px base): `--sp-1` 4, `--sp-2` 8, `--sp-3` 12, `--sp-4` 16, `--sp-5` 24, `--sp-6` 32, `--sp-7` 48, `--sp-8` 72, `--sp-9` 112.
- Section rhythm: `--section-gap: clamp(48px, 6vw, 80px)` (= `clamp(3rem, 6vw, 5rem)`, top and bottom of every section: about 96px between sections at 360, 160px at 1440).
- Radius: `--r-sm` 4 (chips, inputs), `--r-md` 10 (cards, buttons), `--r-full` 999 (avatars, nodes). Nothing larger.
- Container: `--container` 1120px, side gutter `--gutter: clamp(16px, 5vw, 48px)`.
- Rail: `--rail-w` 2px line, `--rail-col` 56px column on desktop (20px on mobile), `--node` 12px, `--fork-offset` 28px (0 on mobile, see 5).
- Breakpoints: `48rem` (768px) two-column layouts turn on; `64rem` (1024px) three-column Showcase.
- Motion: `--dur-1` 120ms (colour/hover), `--dur-2` 240ms (reveals, theme), `--dur-3` 900ms (rail draw only). `--ease: cubic-bezier(0.2, 0.7, 0.2, 1)`. Reveal distance `--rise` 12px.

## 5. Layout

### Desktop (>= 768px)
```
+--------------------------------------------------------------------------+
| MS   About  Projects  Showcase  Contact                        [ theme ] |  sticky header, 64px
+--------------------------------------------------------------------------+
|  rail                                                                    |
|   |                                                                      |
|   o-- 7c1e4a2 (HEAD -> main)                                 .--------.  |
|   |   Manpreet                                               | avatar |  |
|   |   Singh                                                  | 200px  |  |
|   |   Software engineer. I build ...                         '--------'  |
|   |   [ See my projects ]  GitHub ->                                     |
|   |                                                                      |
|   o-- I like software that is boring to operate.   | Languages  ...      |  about 7/12 | skills 5/12
|   |   paragraph ...                                | Frameworks ...      |
|   |   paragraph ...                                | Tooling    ...      |
|   |                                                                      |
|   o-- Things I have built                                                |
|   |   ----------------------------------------------------------------   |
|   |   repo-name        One-line description            JS   * 12  Mar 26 |  rows, not cards
|   |   ----------------------------------------------------------------   |
|   |   repo-name        One-line description            Go   *  4  Jan 26 |
|   |   ----------------------------------------------------------------   |
|   |                                                                      |
|   o--.   Engineers worth following        branch: people                 |
|   |   \                                                                  |
|   |    o  +-----------+ +-----------+ +-----------+                      |  fork line in steel
|   |    |  | (av) Name | | (av) Name | | (av) Name |                      |
|   |    |  | bio ...   | | bio ...   | | bio ...   |                      |
|   |    |  | repo repo | | repo repo | | repo repo |                      |
|   |    o  +-----------+ +-----------+ +-----------+                      |
|   |   /                                                                  |
|   o--'   Let's talk                                                      |  merge node
|   |      you@example.com [ Copy ]   GitHub   LinkedIn                    |
|   |                                                                      |
|   o   Built by Manpreet Singh. Source on GitHub.            Back to top  |  rail ends in a node
+--------------------------------------------------------------------------+
```

### Mobile (320px to 767px)
```
+------------------------------+
| MS                  [ theme ]|  header not sticky
| About Projects Showcase Contact   wraps as a second row, 44px targets
+------------------------------+
| |                            |
| o 7c1e4a2 (HEAD -> main)     |
| | (avatar 72px)              |
| | Manpreet                   |
| | Singh                      |
| | Software engineer. I ...   |
| | [ See my projects ]        |
| | GitHub ->                  |
| o I like software that ...   |
| | paragraphs                 |
| | Languages ...              |  skills stack under about
| o Things I have built        |
| | repo-name                  |
| | description                |  row stacks: name, desc, meta line
| | JS  * 12  Mar 26           |
| o Engineers worth following  |
| : +------------------------+ |  rail turns steel and dashed here
| : | (av) Name              | |  (no sideways fork; one column)
| : | bio / repos            | |
| : +------------------------+ |
| o Let's talk                 |
| o footer                     |
+------------------------------+
```

Structure: `<main class="rail">` is a grid of `[--rail-col] [1fr]`; every `<section>` sits in
column 2 and draws its own node with `::before`, positioned on the rail, vertically centred
on the first line of its heading. The rail line is a single `::before` on `main`. The fork is
one extra element inside the Showcase section (`.fork`): a 2px steel border on its left,
top and bottom, with `border-radius: var(--fork-offset)` on the two left corners, offset
`--fork-offset` to the right of the rail. No SVG, no canvas.

## 6. Sections and copy

**Header.** Monogram "MS" (link to top) / nav: About, Projects, Showcase, Contact / theme toggle.
Skip link, first in DOM: "Skip to content".

**Hero** (`#top`)
- Ref line (mono, muted, the only place this device appears): `7c1e4a2 (HEAD -> main)`.
  The hash is decorative and fixed; mark it `aria-hidden="true"`.
- Status, on the same mono line after the ref (wraps under it on mobile): a static 8px `--ok` dot + "Open to roles" `[EDIT or remove]`, then "[EDIT city] 14:32" as a live local clock (`toLocaleTimeString` with `timeZone` from profile.json, `[EDIT: Asia/Kolkata]`, updated once a minute, inside `<time>`).
- h1: `Manpreet Singh` (breaks after "Manpreet" at every width).
- Lead `[EDIT]`: "Software engineer. I build web software that stays fast, readable and easy to hand over to the next person."
- Primary button: "See my projects" (to `#projects`). Text link: "GitHub" with arrow (to `https://github.com/chandiimanpreet`).
- Proof line under the actions (mono, muted), from the profile call already being made, so it costs no extra request: "12 public repos · 34 followers · on GitHub since 2021". Omit any part whose value is 0; omit the whole line if the call fails. No contribution heatmap: that data is not in the unauthenticated REST API, and a third-party image is ruled out.
- Avatar: GitHub `avatar_url`, square with `--r-md`, `alt="Portrait of Manpreet Singh"`. Fallback: a `--surface-2` tile with "MS" in display type.

**About + skills** (`#about`)
- h2: "I like software that is boring to operate."
- P1 `[EDIT]`: "I'm a software engineer who cares most about the part after launch: the code someone has to read at 2am, the deploy that has to work the first time, the page that has to load on a slow phone."
- P2 `[EDIT]`: "I work mainly on the web, front to back. I'd rather ship a small thing that is finished than a large thing that is nearly finished, and I write down why I made a decision so the next person doesn't have to guess."
- P3 `[EDIT]`: "Right now I'm moving my projects into the open. Until they're public, the list below is curated by hand."
- Skills, three labelled lines of running text (a `<dl>`; label in body 600, values in muted body, separated by a middle dot). All values `[EDIT]`, from `data/profile.json`:
  - Languages: JavaScript · TypeScript · Python · SQL
  - Frameworks: React · Node.js · Express
  - Tooling: Git · Docker · GitHub Actions · Linux
  No pills, no progress bars, no percentages, no logo wall.

**Projects** (`#projects`)
- h2: "Things I have built"
- Intro: "Pulled live from GitHub and sorted by most recently updated." When showing the manual list instead: "A hand-picked list. My repositories are private for now."
- Row content: repo name (h3, link) / description (one line, 2-line clamp on mobile) / language (dot + name) / stars (mono, hidden when 0) / updated ("Mar 2026", mono). Fallback rows show `tags` in place of language and omit stars and date.
- Outcome line: if a `profile.json` project with the same name has an `outcome`, show it under the description in `--text` 500 (for example "Cut cold-start time from 4s to 900ms." `[EDIT, real numbers only]`). Recruiters read results, not feature lists. No outcome, no line.
- Each row ends with an arrow glyph that moves 4px right on row hover.
- Max 6 rows, forks excluded, sorted by `pushed_at`. Below the list: "All repositories on GitHub" link.
- Placeholder entries for `data/profile.json` `projects[]`, all `[EDIT]`:
  1. `portfolio`: "This site. Static HTML, CSS and vanilla JS, with GitHub data cached in the browser." Tags: HTML, CSS, JavaScript.
  2. `[EDIT project name]`: "[EDIT one sentence: what it does and who it is for.]" Tags: [EDIT].
  3. `[EDIT project name]`: "[EDIT one sentence: the problem, then the result.]" Tags: [EDIT].

**Showcase** (`#showcase`)
- h2: "Engineers worth following"
- Branch tag beside the heading (mono, steel, the only branch tag on the page): `branch: people`
- Intro: "People whose work I read and learn from. Each card is built live from their public GitHub profile."
- Card: avatar 48px round / name (h3) / `@login` (mono, muted) / bio (3-line clamp) / followers ("1.2k followers", mono) / up to 2 top repos by stars as text links. Whole name links to the profile; opens in the same tab.
- Seed `data/showcase.json` `[EDIT]`: `["torvalds", "sindresorhus", "gaearon", "addyosmani", "kentcdodds", "tj"]`. Grid: 1 col, 2 at 768px, 3 at 1024px.

**Contact** (`#contact`)
- h2: "Let's talk"
- P: "I'm open to software engineering roles and interesting collaborations. Email is the fastest way to reach me; I usually reply within two days." `[EDIT]`
- Email shown in full as a `mailto:` link `[EDIT: you@example.com]` with a "Copy" button beside it. Then text links: GitHub, LinkedIn `[EDIT url]`.
- No contact form (no backend; a mailto is honest and always works).

**Footer.** "Built by Manpreet Singh with plain HTML, CSS and JavaScript." / "Source on GitHub" / "Back to top". The rail ends here in a hollow node.

## 7. Components and states

| Component | Default | Hover | Focus-visible | Other states |
|---|---|---|---|---|
| Nav link | `--text-muted`, `--fs-small` 500 | `--text` | focus ring | Current section: `--text` plus 2px saffron underline, `aria-current="true"` |
| Primary button | `--accent-fill` bg, `--on-accent` text, `--r-md`, 44px tall | lifts 1px, bg mixes 8% toward `--text` | focus ring | Active: no lift |
| Text link | `--accent`, underline 1px offset 3px | underline 2px | focus ring | Arrow glyph nudges 2px right on hover |
| Theme toggle | 44px icon button, `--border-strong` outline, sun/moon inline SVG | `--surface-2` bg | focus ring | `aria-pressed` reflects light mode; `aria-label="Use light theme"` / `"Use dark theme"` |
| Rail node | 12px ring, `--border-strong`, `--bg` fill | n/a | n/a | Active (section in view): filled `--accent`. Showcase nodes use `--branch` |
| Project row | top hairline `--border`, transparent bg | `--surface` bg, name turns `--accent` | ring on the name link | Loading, empty, error below |
| Engineer card | `--surface` bg, 1px `--border`, `--r-md`, no shadow | border becomes `--branch`; pointer spotlight (below) | ring on name link | Loading, error below |
| Status dot | 8px `--ok` circle, static, always followed by its text label | n/a | n/a | Absent when `status` is empty in profile.json |
| Copy button | "Copy", outline `--border-strong` | `--surface-2` bg | focus ring | Success: label "Copied" in `--ok` for 2s. Failure: label "Press Ctrl+C", email text gets selected |
| Skeleton | `--surface-2` block, `--r-sm` | | | Opacity pulse 1 to 0.5, 1.2s; static under reduced motion |
| Inline notice | `--fs-small`, `--text-muted`, left 2px `--border-strong` bar | | | Error variant: `--danger` bar and text |

Focus ring, one definition for everything: `outline: 2px solid var(--accent); outline-offset: 3px;` on `:focus-visible`.

Pointer spotlight (Showcase cards only): one delegated `pointermove` listener on the grid
sets `--x`/`--y` on the hovered card; the card's `::before` paints
`radial-gradient(var(--spot-size) circle at var(--x) var(--y), var(--spot), transparent 60%)`.
Enabled only under `@media (hover: hover) and (pointer: fine)`. It is light inside a card,
not a custom cursor; the system cursor is never replaced.

HEAD halo (hero only): `radial-gradient(var(--glow-size) circle, var(--glow), transparent 70%)`
centred on the hero's rail node, behind the content, `pointer-events: none`. Static.

**Projects data states**
- Loading: 3 skeleton rows; list has `aria-busy="true"`.
- Success: rows from the API.
- Empty (API returns zero public repos): render `profile.json` projects with the "hand-picked" intro. No error styling; this is the expected state today.
- Error / rate limit: render `profile.json` projects plus an inline notice: "GitHub isn't answering right now, so this is a saved list. Try again in a few minutes."
- Nothing at all (API empty and no manual projects): inline notice: "Projects are on their way. In the meantime, my GitHub profile has the latest." with the profile link.

**Showcase data states**
- Loading: one skeleton card per username (avatar circle plus three lines), so the grid doesn't jump.
- Per-card error: the card stays, showing `@login` as a link to `github.com/login` and "Profile couldn't be loaded." Other cards are unaffected.
- All failed (rate limit): cards in the per-card error form plus one inline notice above the grid: "GitHub's hourly limit was reached. Names still link to each profile."
- Empty list: section intro is replaced by "No one listed yet." (should not ship in this state).

## 8. Motion

**Signature moment: the rail draws itself.** On first load the rail line grows from the top
of the page down to the hero node over `--dur-3`, the HEAD node fills saffron, then the hero
text settles. After that the rail keeps pace with reading: the saffron portion of the line
fills with scroll progress, and when it reaches Showcase the steel fork draws out and back.

Implementation (CSS first, no library):
- Rail fill: a second line over the idle rail, `transform-origin: top`, animated `scaleY(0 -> 1)` with `animation-timeline: scroll(root)` inside `@supports (animation-timeline: scroll())`. Without support, the rail is simply fully drawn in `--border-strong`; nodes still activate.
- Fork: same technique scoped with `animation-timeline: view()` on `.fork` (a clip-path reveal top to bottom).
- Node activation and nav `aria-current`: one shared `IntersectionObserver`.
- Section reveal: content fades in and rises `--rise` over `--dur-2`, once, as it enters. Children are not staggered, except the hero (ref line, name, lead, actions at 60ms steps).
- Hover and theme changes: `--dur-1` on colour, border, background only. Never animate layout properties.

Not allowed: parallax, custom cursors, typewriter or scrambling text, tilt cards, spinning or pulsing ornaments, particle backgrounds, scroll-jacking, looping animation (skeleton pulse is the one exception and stops when data lands).

**Reduced motion** (`prefers-reduced-motion: reduce`): rail and fork render fully drawn, no
reveal transforms (content is visible immediately), no skeleton pulse, no button lift, smooth
scroll off. Node colour changes remain because they are state, not decoration.

## 9. Accessibility

- Landmarks: `header`, `nav[aria-label="Primary"]`, `main#main`, one `section[aria-labelledby]` per section, `footer`. One `h1`; h2 per section; h3 for project and card names.
- The rail, nodes, fork and hero hash are decoration: generated content or `aria-hidden="true"`, never focusable. The branch tag is `aria-hidden` too; the heading already names the section.
- Content must be readable with JS disabled or failed: reveals only apply under a `.js` class set by the head script, so nothing is stuck at opacity 0.
- Theme: an inline head script reads `localStorage.theme` and sets `data-theme` on `<html>` before first paint. Default is dark when nothing is saved. Set `color-scheme` per theme and update `<meta name="theme-color">`.
- Data regions: `aria-busy` while loading; a visually hidden `role="status"` line announces "Projects loaded", "Showing saved project list" or the error text. Copy button result is announced through the same pattern.
- Targets at least 44x44px on touch. Links inside paragraphs are underlined; colour is never the only signal (language dots always carry the language name).
- Remote text goes in with `textContent`. Avatars: `alt=""` on Showcase cards (the name is adjacent), `loading="lazy"`, explicit `width`/`height`.
- External links keep the same tab; no `target="_blank"`.
- Check at 320px, at 200% zoom, with keyboard only, in both themes, and with forced-colors (nodes and rail use borders, so they survive it).

## 10. `css/tokens.css` (paste as is)

```css
:root {
  /* colour: dark is the default */
  color-scheme: dark;
  --bg: #0D1017;
  --surface: #151A23;
  --surface-2: #1D2430;
  --border: #2A3342;
  --border-strong: #6B7890;
  --text: #ECE8DF;
  --text-muted: #A3ACBA;
  --accent: #F5A524;
  --accent-fill: #F5A524;
  --on-accent: #1A1204;
  --branch: #7DB0E0;
  --ok: #5BC58B;
  --danger: #F58A8C;
  --glow: rgb(245 165 36 / 0.12);   /* hero HEAD halo */
  --spot: rgb(125 176 224 / 0.10);  /* Showcase card pointer spotlight */
  --glow-size: 28rem;
  --spot-size: 18rem;

  /* type */
  --font-display: "Bricolage Grotesque", "Segoe UI", system-ui, sans-serif;
  --font-body: "Instrument Sans", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  --fs-hero: clamp(2.75rem, 1.6rem + 5.8vw, 5.5rem);
  --fs-h2: clamp(1.75rem, 1.35rem + 2vw, 2.75rem);
  --fs-h3: 1.25rem;
  --fs-lead: clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem);
  --fs-body: 1rem; --fs-small: 0.875rem; --fs-mono: 0.8125rem;
  --lh-hero: 0.95; --lh-heading: 1.1; --lh-h3: 1.3; --lh-lead: 1.5; --lh-body: 1.65;
  --lh-small: 1.5;
  --fw-regular: 400; --fw-medium: 500; --fw-semibold: 600; --fw-bold: 700;
  --track-hero: -0.03em; --track-heading: -0.02em; --track-h3: -0.01em;
  --measure: 62ch;

  /* space */
  --sp-1: 0.25rem; --sp-2: 0.5rem; --sp-3: 0.75rem; --sp-4: 1rem; --sp-5: 1.5rem; --sp-6: 2rem;
  --sp-7: 3rem; --sp-8: 4.5rem; --sp-9: 7rem;
  --section-gap: clamp(3rem, 6vw, 5rem);

  /* layout */
  --container: 70rem;
  --gutter: clamp(1rem, 5vw, 3rem);
  --header-h: 4rem;
  --target: 2.75rem;
  --bp-md: 48rem; /* reference only: custom properties don't work in media queries */
  --bp-lg: 64rem;

  /* rail (signature element) */
  --rail-w: 2px; --rail-col: 1.25rem;
  --node: 0.75rem;
  --fork-offset: 0rem;

  /* shape */
  --r-sm: 4px; --r-md: 10px; --r-full: 999px;
  --hairline: 1px;
  --focus-w: 2px;
  --focus-offset: 3px;

  /* motion */
  --dur-1: 120ms; --dur-2: 240ms; --dur-3: 900ms;
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --rise: 12px;
}

@media (min-width: 48rem) {
  :root {
    --rail-col: 3.5rem;
    --fork-offset: 1.75rem;
  }
}

:root[data-theme="light"] {
  color-scheme: light;
  --bg: #FAF7F1;
  --surface: #FFFFFF;
  --surface-2: #F1ECE2;
  --border: #DDD5C7;
  --border-strong: #857B6B;
  --text: #171B24;
  --text-muted: #535C6B;
  --accent: #9A4A00;
  --accent-fill: #9A4A00;
  --on-accent: #FFFFFF;
  --branch: #2A5F96;
  --ok: #1A6E41;
  --danger: #AD272C;
  --glow: rgb(154 74 0 / 0.08);
  --spot: rgb(42 95 150 / 0.07);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-1: 0ms;
    --dur-2: 0ms;
    --dur-3: 0ms;
    --rise: 0px;
  }
}
```

## 11. Notes for the implementer

- `data/profile.json` shape: `{ name, login, lead, status, city, timeZone, about[], skills: { Languages[], Frameworks[], Tooling[] }, email, links: { github, linkedin }, projects: [{ name, description, outcome?, tags[], url }] }`. All visible copy in section 6 lives there, not in JS.
- `data/showcase.json` is a flat array of usernames (per SKILLS.md).
- API budget: 1 call for the profile, 1 for repos, 2 per showcased engineer (user, repos). Six engineers is 14 calls on a cold cache, inside the 60/hour limit; do not seed more than 8.
- Language dot colours: do not import GitHub's language colour map. Use `--text-muted` for every dot; the name carries the meaning.
- From INSPIRATION.md, adopted: one-sentence hero with a single CTA (1), hairline borders that brighten on hover (4), outcome line and arrow nudge on projects (5), live GitHub numbers without the heatmap (6), people section (7, as the forked branch), one-time scroll reveal (8), mono status details (9), pointer spotlight (3, Showcase only), one accent glow (12, hero halo only, no grain).
- Declined, with reasons: bento grid (2) fights the rail and is the current template default; rotating/typed role line (11) is noise and hides the one sentence that matters; command palette (10) is deferred until there is more than one page; palettes A to C are not used (A is the generic violet, and ours is already distinct from the reference's cyan HUD).
- Open questions for the owner: status text, city and time zone, real email and LinkedIn URL, the `[EDIT]` about copy and skills, the two placeholder projects, and the final Showcase usernames.
