# DESIGN-V3-HEADER.md: the header, finished

Addendum to `docs/DESIGN-V3.md`. **It replaces section 8.4 and the "Header" row of 8.6.** Where the two
disagree, this file wins. Everything else in V3 (palette, type, hero layers, rain) is unchanged.

Owner brief: "make the header better, elegant". Today the bar is a bare `MS` and four mono links floating over
the rain, and at `xl` the rain runs straight through the links.

Reference for the feel only: a terminal-style brand block, slash-prefixed mono nav with a highlighted current
item, an outlined mono action at the far right. Nothing is copied: no text, no mark, no code.

---

## 0. Decisions at a glance

| Topic | Decision |
|---|---|
| Brand | A 32px square logomark (an "M" drawn as a request path ending in a saffron commit node) plus two mono lines: `manpreet@backend` / `~/distributed-systems` |
| Nav | `/about` `/projects` `/contact`, mono. Current item = filled chip + saffron slash. No underline |
| Resume | Outlined mono action `resume.pdf ↗`, far right, after a hairline divider. `sm` and up only |
| Top of page | A soft scrim under the bar (95% background, fading out below it), so no rain crosses any header text |
| Scrolled | `bg-background/90`, blur, bottom border, 1px saffron scroll-progress hairline (CSS only) |
| Mobile | One compact row: mark + three links. **No menu, no dialog, no button** |
| Status chip | **Not built.** Owner question 1 |
| Motion | One entrance (fade and 8px drop, 240ms). Colour transitions on hover. Nothing loops |
| New dependencies / tokens / colours | None. One small CSS block in `src/index.css` (the progress hairline) |

What makes ours its own: a square mark (our radius rule: nothing rounder than 10px), 4px chips rather than
round pills, saffron used only as "the signal" (the commit node, the current slash, the progress line), and no
status theatre.

---

## 1. Layout

Shell (unchanged values unless noted):

| Property | Value |
|---|---|
| Element | `<header>` `fixed inset-x-0 top-0 z-40 isolate` |
| Height | `h-header` = 64px at every width (`--spacing-header`, unchanged, so `scroll-padding-top` and the hero's top padding stay correct) |
| Inner | `mx-auto flex h-header max-w-hero items-center px-gutter` (`max-w-hero` = 80rem, same as the hero; `px-gutter` = 16px at 320, 48px from 960) |
| Border | `border-b`, always present (transparent at the top) so nothing shifts on scroll |
| z-order | Skip link 50, header 40, hero content below. Inside the header: scrim `-z-10`, content auto, progress hairline on the bottom border |

Left group = the brand link. Right group = `ml-auto flex items-center`: `<nav>`, then (from `sm`) divider, then
resume action.

### 1.1 1440 (inner 1280, content 1184)

```
|<-48->|                                                                                         |<-48->|
+--------------------------------------------------------------------------------------------------------+
|       +----+ manpreet@backend                    /about  [/projects]  /contact  |  [ resume.pdf ↗ ]    |  64
|       | /\/| ~/distributed-systems                                                                     |
|       +----+                                                                                           |
+========================------------------------------------------------------------------------------- +  <- 1px border; saffron part = scroll progress
        32  12                                     <- gap 4 between chips ->   16 | 16
```

### 1.2 1024 (content 928)

Identical to 1440; only the empty middle shrinks.

```
+----------------------------------------------------------------------------+
|     [M] manpreet@backend            /about [/projects] /contact | [resume.pdf ↗] |
|         ~/distributed-systems                                               |
+----------------------------------------------------------------------------+
```

### 1.3 768 (`md`, content about 691; used about 611)

Same as 1024. This is the narrowest width that shows the two text lines.

```
+----------------------------------------------------------------+
|  [M] manpreet@backend      /about [/projects] /contact | [resume.pdf ↗] |
|      ~/distributed-systems                                      |
+----------------------------------------------------------------+
```

### 1.4 640 to 767 (`sm`)

Mark only (no text lines), nav at 12px, divider and resume action stay.

```
+--------------------------------------------------------+
|  [M]                 /about [/projects] /contact | [resume.pdf ↗] |
+--------------------------------------------------------+
```

### 1.5 360 (content 324; used about 256)

```
|<18>|                                  |<18>|
+--------------------------------------------+
| [M]            /about [/projects] /contact |  64
+--------------------------------------------+
```

### 1.6 320 (content 288; used about 256, 32 spare)

```
|16|                              |16|
+------------------------------------+
| [M]    /about [/projects] /contact |  64
+------------------------------------+
```

Width budget at 320 (JetBrains Mono advance is 0.6em; 12px text = 7.2px per character):
mark link 38 (44px target pulled 6px left) + chips 59 + 81 + 74 + two 2px gaps = **256px of 288px**. The resume
action (about 118px) does not fit below 640, so it is not shown there (section 6).

### 1.7 Responsive class summary

| Element | `<640` | `sm` 640+ | `md` 768+ |
|---|---|---|---|
| Brand mark | shown | shown | shown |
| Brand text (two lines) | hidden | hidden | `md:flex` |
| Nav chips | `text-xs`, `px-2`, list `gap-x-0.5` | `text-xs`, `px-2`, `gap-x-1` | `md:text-sm`, `md:px-2.5`, `gap-x-1` |
| Divider + resume action | hidden | `sm:flex` | shown, `md:text-sm` |

---

## 2. Brand block

### 2.1 Logomark: "request path M"

An **M** drawn as one stroke, the way the hero diagram draws an edge, ending in a saffron node: a request
that travelled the path and committed. It is the hero's idea (a request, a path, a saffron outcome) at 32px.
Square with a 7px corner, not a circle.

Use verbatim (`viewBox` 32, rendered at 32px):

```tsx
<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={cn('size-8 shrink-0', className)}>
  <rect
    x="1" y="1" width="30" height="30" rx="7"
    className="fill-card stroke-border-strong transition-colors duration-120 group-hover:stroke-primary"
    strokeWidth="1"
  />
  <path
    d="M9 22V11l7 7 7-7v8"
    className="fill-none stroke-foreground"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  />
  <circle cx="23" cy="22" r="2.5" className="fill-primary" />
</svg>
```

- Colours come only from `fill-*` / `stroke-*` token utilities. No `style`, no gradients, no filters.
- The right leg stops at y=19 so the saffron node (centre 23,22) reads as the end of the line, not a blob on it.
- Plus or minus 1 unit of optical adjustment is allowed; nothing else.

### 2.2 Identity lines

| Line | Text | Classes |
|---|---|---|
| 1 | `manpreet@backend` | `font-mono text-sm font-bold leading-none text-foreground`; the `@` is wrapped in `<span class="text-primary">` |
| 2 | `~/distributed-systems` | `font-mono text-xs leading-none text-muted-foreground` |

Wrapper for the two lines: `hidden md:flex flex-col gap-y-1.5`. Gap between mark and text: `gap-x-3`.

Why these words (every claim is on the resume):
- `manpreet@backend`: first name, and the role, "Backend Engineer", written as user@host. It restates the hero's
  job title in the machine voice; it does not add a claim.
- `~/distributed-systems`: the resume's first line is "expertise in Go, Node.js/TypeScript and distributed
  systems". It names the field without repeating "backend" twice.
- Rejected: `~/portfolio` (says nothing), any availability phrase (not a fact we hold), any "AI" wording
  (positioning rule).

The strings live in content, not in the component (section 9.2).

### 2.3 Link behaviour

- One `<a href="#main">` wraps mark and text: `group -ml-1.5 flex h-target min-w-target items-center gap-x-3
  rounded-md md:ml-0 md:pr-2`. Below `md` the mark is centred in a 44 by 44 target and the `-ml-1.5` pulls it
  back so the mark's left edge sits on the gutter.
- `aria-label`: `` `${brand.user}@${brand.host}: ${profile.name}, ${profile.role}. Back to top` `` (the visible
  label comes first, WCAG 2.5.3).
- Hover: the mark's frame stroke goes `border-strong` to `primary` (120ms). Line 1 does not change; line 2 goes
  `muted-foreground` to `foreground` (`transition-colors duration-120 group-hover:text-foreground`).
- Focus: the global `:focus-visible` ring (2px `ring`, 3px offset) around the whole link. Do not restyle it.
- No hover movement, no rotation, no animated packet.

---

## 3. Nav

`<nav aria-label="Primary">` > `<ul class="flex items-center gap-x-0.5 sm:gap-x-1">`. Items come from
`navItems` (unchanged): about, projects, contact. Labels stay `/` + lowercased label.

### 3.1 Anatomy

The anchor is the 44px touch target; an inner span is the visible 32px chip.

```
<a class="group flex h-target items-center outline-none" href="#about" aria-current?>
  <span class="chip">            <- h-8, rounded-sm (4px), px-2 md:px-2.5
    <span aria-hidden>/</span>about
  </span>
</a>
```

Chip base: `flex h-8 items-center rounded-sm px-2 font-mono text-xs font-medium transition-colors duration-120
md:px-2.5 md:text-sm`.

### 3.2 States

| State | Chip | Label | Slash |
|---|---|---|---|
| Rest | transparent | `text-muted-foreground` | `text-border-strong` |
| Hover | `group-hover:bg-secondary/60` | `group-hover:text-foreground` | `group-hover:text-primary` |
| Current (`aria-current="location"`) | `bg-secondary ring-1 ring-inset ring-border` | `text-foreground` | `text-primary` |
| Focus-visible | 2px `ring` colour outline, 2px offset, drawn on the chip: `group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring` | as its state | as its state |

- Current is a filled chip, not an underline: remove `underline decoration-primary decoration-2` from `NavLink`
  and `underline-offset-8` from `SiteHeader`.
- The slash is the signal: grey at rest, saffron only where you are (or are pointing). Three saffron slashes in
  a row was noise.
- Weight is `font-medium` in every state so the row never shifts.
- Current is not colour alone: the chip has a visible shape (fill plus inset ring), and `aria-current` carries
  it to assistive tech.
- Over the hero nothing is current (existing behaviour, keep).
- Slash margin: `mr-px` (the old `mr-0.5` reads as a gap at this size).

### 3.3 Resume action

Sits **last, outside the `<nav>`** (it is a file, not a section): divider, then the action. It moves out of the
`navItems.map` (delete the `item.id === 'contact'` special case and the `Fragment`).

- Divider: `<span aria-hidden="true" class="mx-4 hidden h-5 w-px bg-border sm:block" />`.
- `<ResumeLink className="group hidden h-target items-center outline-none sm:flex">` wrapping one chip span:
  `flex h-9 items-center gap-x-1.5 rounded-md border border-border-strong bg-background/60 px-3 font-mono
  text-xs text-foreground transition-colors duration-120 md:text-sm` plus the same `group-focus-visible:*`
  outline classes as a nav chip.
- Content: `resume.pdf` then lucide `ArrowUpRight` (`aria-hidden`, `size-3.5`). The existing sr-only suffix
  "(PDF, opens in a new tab)" stays, from `ResumeLink`.
- Hover (link only): border and text go to `primary`. The arrow nudges `translate-x-px -translate-y-px`
  (`transition-transform duration-120 motion-reduce:transition-none`).
- Disabled (`profile.resumeUrl === null`): `ResumeLink` already renders a `span` with `aria-disabled="true"`,
  `opacity-50`, `cursor-not-allowed`, `title="Resume coming soon"`. In that state the hover styles must not
  apply: scope them with `group-[:is(a)]:group-hover:` (or the equivalent that compiles), and verify in the
  browser that hovering the disabled chip changes nothing. The arrow is still rendered.
- `ResumeLink.tsx` itself is not edited.

---

## 4. Top state and scrolled state

`useScrolled()` is unchanged (`scrollY > 0`).

### 4.1 Layers inside the header

| Layer | Element | Top of page | Scrolled |
|---|---|---|---|
| Scrim | `<div aria-hidden>` `pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-background/95 from-60% to-transparent transition-opacity duration-240 ease-brand` | `opacity-100` | `opacity-0` |
| Bar | the `<header>` itself, `border-b transition-colors duration-240 ease-brand` | `border-transparent bg-transparent` | `border-border bg-background/90 backdrop-blur-md` |
| Progress | section 4.3 | not visible (progress is 0) | visible |

How the rain stops crossing the links: the scrim is 96px tall and holds 95% background for its first 60%
(about 58px), then fades to nothing by 96px. All header text sits between y=14 and y=50, so every glyph has at
least 95% background behind it (V3 rule: never less than 88%), and because the scrim outlives the 64px bar and
fades, there is no hard edge across the rain. The rain is still visible either side of the hero column from
about y=70 down. No backing boxes behind individual links, no text-shadow.

The header needs `isolate` so the scrim's `-z-10` stays inside it.

### 4.2 Transition

Scrim opacity and bar colour cross-fade over 240ms `ease-brand`. `backdrop-filter` is not animated (it snaps
on; under a 90% fill the snap is not visible). Under reduced motion the global rule makes both instant.

### 4.3 Scroll-progress hairline (earns its place; cut first if anything is at risk)

Why keep it: on a one-page site it is the only cue for "how much is left", it costs six lines of CSS and no
JavaScript, and it reuses the bar's own bottom border instead of adding an element to look at.

- Element: `<div aria-hidden="true" class="scroll-progress" />` as the last child of `<header>`.
- Add to `src/index.css`, next to the `.reveal` block (the only CSS this spec adds):

```css
/* Header scroll progress: scroll-driven, no JS. Browsers without support do not show it. */
.scroll-progress {
  display: none;
}
@keyframes scroll-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@supports (animation-timeline: scroll()) {
  .scroll-progress {
    display: block;
    position: absolute;
    inset: auto 0 -1px 0;          /* sits exactly on the header's 1px bottom border */
    height: 1px;
    background: var(--primary);
    opacity: 0.7;
    transform-origin: left;
    animation: scroll-progress linear both;
    animation-timeline: scroll(root block);
  }
}
```

- Fallback: none needed. Without `animation-timeline` support the element is `display: none`; no JS polyfill.
- Reduced motion: it stays. It moves only as a direct result of the reader's own scrolling (no autonomous
  motion), and the global 0.01ms rule does not affect scroll-driven timelines. Do not add it to the `.reveal`
  opt-out.
- It is decorative: `aria-hidden`, no role, no value.

---

## 5. Status chip (optional, NOT built)

The reference shows an "open to work" style indicator. We hold no such fact, and the resume does not state
availability, so **the default header has no status chip and the implementer builds nothing for it.**

If the owner answers question 1 with exact wording, it is a small follow-up:
- Content: `brand.status: string | null` in `src/content/profile.ts`; render nothing when `null`.
- Place: between `<nav>` and the divider, `hidden lg:flex items-center gap-x-2 ml-4`.
- Look: a static `size-1.5 rounded-full bg-ok` dot (no pulse, no ping) and the text in
  `font-mono text-xs text-muted-foreground`. Plain text, not a link, not a live region.
- The owner must keep it true; a stale "available" is worse than none.

---

## 6. Mobile (below 640)

**Decision: a compact inline row. No menu.** Three short links fit at 320 with 32px to spare (1.6), so a
menu would add a button, a dialog, focus management and a scroll lock to hide three words. (For the record:
the `body:has(dialog[open])` rule was removed from `src/index.css` in V3, so a dialog would also need CSS
back.)

Exact behaviour:
- Row: mark (44px target, 32px mark) at the left, `/about /projects /contact` at the right, `text-xs`, chips
  `h-8 px-2`, list `gap-x-0.5`. Labels are **not** shortened.
- No brand text, no divider, no resume action in the header. The resume stays one thumb-reach away as the
  hero's second button (`./resume`). See owner question 2 for a second mobile entry point.
- Each link is 44px tall and at least 59px wide. Chips never wrap: `<ul>` keeps `flex` with no `flex-wrap`,
  and each chip has `whitespace-nowrap`.
- No horizontal scroll at 320: verify with the real font and with the fallback (`ui-monospace`) by blocking the
  font file once.
- The hero scrim below `xl` is already 92% at the top; the header scrim stacks on it. Nothing else changes.

---

## 7. Motion

| What | Spec |
|---|---|
| Entrance (the only one) | On the inner row (not the `<header>`, so the fixed bar and its blur never animate): `animate-in fade-in slide-in-from-top-2 fill-mode-both duration-240 ease-brand`. Starts at 0ms, alongside the hero h1 (V3 4.6) |
| Hover / current | `transition-colors duration-120` on chips, mark frame, brand line 2, resume chip. Arrow nudge 1px, 120ms |
| Top to scrolled | 240ms `ease-brand` cross-fade (4.2) |
| Progress hairline | Scroll-driven only (4.3) |

Nothing loops, blinks, pulses or follows the pointer. Reduced motion: the global rule in `src/index.css` puts
the entrance in its final state and makes transitions instant; add `motion-reduce:transition-none` only on the
arrow's transform. No new duration or easing tokens.

---

## 8. Accessibility

- **Landmarks.** `<header>` is the page banner (a direct child of the app root, before `<main>`). One
  `<nav aria-label="Primary">`. The resume action is in the banner but outside the nav.
- **Skip link.** Unchanged in `Layout.tsx`: first focusable element, `z-50`, appears above the header at
  `top-2 left-2`, targets `#main`. The brand link also targets `#main`; that is intended (back to top).
- **Focus order.** Skip link, brand, /about, /projects, /contact, resume (when shown and enabled), then main.
  DOM order equals visual order at every width. The disabled resume span is not focusable.
- **Current item.** `aria-current="location"` on exactly one nav link, none over the hero (existing test).
- **Names.** Brand: section 2.3. Nav links: their text ("/about": the slash is `aria-hidden`, so the name is
  "about"). Resume: "resume.pdf (PDF, opens in a new tab)". Mark, divider, scrim, progress: `aria-hidden`.
- **Targets.** Every link is 44px tall; narrowest is the mark at 44 by 44.
- **Focus ring.** 2px saffron, never clipped by the 64px bar (chip 32 + 2 x (2 + 2) = 40).
- **Contrast** (dark theme, computed with WCAG relative luminance; "worst case" = the brightest rain pixel,
  `--rain-head`, under the stated fill, ignoring the hero's own scrim, which only helps):

| Pair | Ratio | Needs |
|---|---|---|
| Foreground (brand line 1, current label) over top scrim, 95% | 14.4:1 | 4.5 |
| Muted foreground (brand line 2, resting labels) over top scrim, 95% | 7.7:1 | 4.5 |
| Primary (`@`, current slash) over top scrim, 95% | 8.6:1 | 4.5 |
| Foreground / muted / primary over scrolled bar, 90%, rain behind | 13.0 / 6.9 / 7.8 | 4.5 |
| Foreground / primary on the current chip (`secondary`) | 12.7 / 7.6 | 4.5 |
| `border-strong` (mark frame, resume outline) on background | 4.3:1 | 3 |
| Focus ring (`ring`) on background | 9.3:1 | 3 |

  The resting slash (`border-strong`, 4.3:1) is decorative and `aria-hidden`. The light palette still exists in
  `src/index.css`; the same classes resolve there, and the V3 table (2.2) already covers those pairs.
- **Reduced motion.** Section 7. **Zoom.** At 200% on a 1280 viewport the `sm` layout applies; nothing
  overlaps. **Forced colours.** Outlines and borders are real `outline`/`border`, so they survive.

---

## 9. File plan (one work package, one Opus implementer)

### 9.1 Create

| File | Contract |
|---|---|
| `src/components/layout/header/BrandMark.tsx` | `export interface BrandMarkProps { className?: string }` and `export function BrandMark({ className }: BrandMarkProps)`: the SVG of 2.1, nothing else. Relies on a `group` ancestor for its hover stroke |

### 9.2 Modify

| File | Change |
|---|---|
| `src/content/profile.ts` | Add `export const brand = { user: 'manpreet', host: 'backend', path: '~/distributed-systems' } as const`. The `Profile` type is not touched |
| `src/components/layout/header/NavLink.tsx` | Props unchanged (`item`, `active`, rest). Render the anchor + inner chip of 3.1 with the states of 3.2. `className` still merges onto the anchor |
| `src/components/layout/SiteHeader.tsx` | Sections 1 to 4 and 7: `isolate`, scrim div, brand link (mark + two lines from `brand`), nav without the resume special case, divider, resume action, `.scroll-progress` div. Delete the `resumePill` constant and the `Fragment` import. No new props; still reads `ActiveSectionContext` and `useScrolled` |
| `src/index.css` | Add the `.scroll-progress` block of 4.3. **No new tokens, no new colours** |
| `src/components/layout/header/header.test.tsx` | Section 9.3 |

Not touched: `ResumeLink.tsx`, `useScrolled.ts`, `useActiveSection.ts`, `Layout.tsx`, `nav.ts`, hero files,
`types/content.ts`, `vite.config.ts` (CSP unchanged: no inline style, no script, no new host).

### 9.3 Tests (`header.test.tsx`)

Keep the four existing tests, with these edits:
1. Active link: unchanged (text `/projects`, `aria-current="location"`).
2. Nav links / disabled resume / no menu: unchanged assertions; they must still pass with the resume outside
   the `<nav>` (the nav has exactly the three section links; `[aria-disabled="true"]` text matches `/resume/`;
   no `dialog`; no buttons).
3. Resume link: `getByRole('link', { name: /resume/ })` unchanged; add that it is **not** inside the Primary
   nav.
4. Replace "names the monogram link" with: the brand link's accessible name matches
   `/^manpreet@backend: .+ Back to top$/`, its `href` is `#main`, and it contains an `svg[aria-hidden="true"]`.

Add one:
5. The header renders one `.scroll-progress` element with `aria-hidden="true"`.

Then: `npm run typecheck && npm run lint && npm test && npm run build`.

### 9.4 Order of work

1. `brand` content, `BrandMark.tsx`. 2. `NavLink.tsx`. 3. `SiteHeader.tsx`. 4. `index.css` block. 5. Tests.
6. Browser check against section 10 on `npm run build && npm run preview` (the CSP only exists in the build).

---

## 10. Acceptance checklist

- [ ] 320, 360, 768, 1024, 1440: matches the wireframes; no horizontal scroll; header is 64px at every width.
- [ ] 320 with the web font blocked (fallback mono): still no overflow.
- [ ] At the top of the page at 1440, no rain glyph is visible behind any header text; the scrim has no hard
      lower edge.
- [ ] Scrolling 1px cross-fades to the bar (fill, blur, border) with no layout shift; scrolling back restores
      the scrim.
- [ ] Progress hairline grows left to right along the bottom border in a supporting browser, and is absent
      (not broken) in one without `animation-timeline`.
- [ ] Brand: mark is crisp at 1x and 2x; two lines from 768; hover turns the frame saffron; the name is
      announced as "manpreet@backend: Manpreet Singh, Backend Engineer. Back to top".
- [ ] Nav: exactly one filled chip with a saffron slash for the section in view; none over the hero; resting
      slashes are grey.
- [ ] Resume: `resume.pdf ↗` at 640 and up, opens the PDF in a new tab; with `resumeUrl: null` it is dimmed,
      not focusable, and does not react to hover.
- [ ] Keyboard: skip link, brand, about, projects, contact, resume, main. Every focus ring fully visible.
- [ ] Reduced motion: no entrance movement, instant state changes, progress hairline still tracks scroll.
- [ ] No button, no `<dialog>`, no status chip in the header.
- [ ] `dist/index.html` CSP unchanged; no `style` attribute and no raw colour in any header component.
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` all pass.

---

## 11. Open questions for the owner

1. **Status chip.** Do you want a status line in the header (section 5)? Only if you give the exact, true
   wording (for example whether you are open to new roles, and what kind). Default: none.
2. **Resume on phones.** Below 640 the header has no room for the resume action; it remains the hero's second
   button. Is that enough, or should the Contact section also get a resume link so it is reachable after
   scrolling? (That is a Contact-section change, outside this package.)
3. **Second line.** `~/distributed-systems` is taken from the resume summary. Prefer something else that is
   equally true (for example `~/go-and-typescript`)? Default: keep.
