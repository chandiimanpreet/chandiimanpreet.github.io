# DESIGN-V3.md: Manpreet Singh portfolio, lean "live backend" redesign

Supersedes DESIGN.md, DESIGN-BACKEND.md and DESIGN-V2.md. Where they disagree with this file, this file wins.
Stack is unchanged: Vite 8, React 19, TypeScript strict, Tailwind v4 (tokens in `src/index.css` only), shadcn/ui,
no animation library, no new runtime dependency.

**Positioning (unchanged, applies everywhere):** Manpreet Singh is a **Backend Engineer** (Go, Node.js/TypeScript,
distributed systems, REST APIs, event-driven services, durable Temporal workflows, AWS, Kubernetes, CI/CD) who has
also shipped LLM agent services. Never "AI engineer" or "AI backend engineer". Agent work shows up as one node in
the hero diagram and nowhere else. No invented facts or numbers. No phone number anywhere.

Implementers: build from this file without making design decisions. If something is missing, ask the coordinator.

---

## 0. V2 to V3 at a glance

| V2 | V3 |
|---|---|
| Palette Ink / Bone / Saffron / Steel, three fonts, radii, spacing and motion tokens | **Kept.** Additions only (section 2.2) |
| Dark default, light toggle, `theme-init.js`, CSP, `safeUrl`, runtime email, phone test | **Kept** |
| One `<h1>`, `section[id][aria-labelledby]` as direct children of `<main>`, order from `nav.ts` | **Kept** |
| "Would a backend engineer call it a lie?" test | **Kept**, applied to the new hero (section 5.7) |
| Git-history rail, rail nodes, fork, HEAD halo | **Deleted.** One metaphor only: the running system |
| Sections About, Experience, Workflows, Skills, Showcase; education, achievements | **Deleted** |
| Hero: lead paragraph, clock line, proof stats, static compact step graph in a card | **Replaced** by name, role, typed prompt, two buttons over a live system background |
| Interactive Workflows trace (timeline, inspector, controls, log) | **Deleted.** The retry story moves into the hero loop, non-interactive |
| Projects as accordion rows plus live GitHub repo list | **Replaced** by a hand-curated card grid from `src/content/projects.ts`. No GitHub API calls |
| Contact with mail templates and local time | **Simplified:** paragraph, email with Copy, GitHub, LinkedIn |
| Mobile menu `<dialog>` | **Deleted.** Two nav links fit in the header at 320px |
| Motion rules "no typewriter, no particles, no travelling packets, no autoplay" | **Replaced** by section 4 to 7. The owner asked for exactly these, so they are now the signature, with pause, reduced-motion and performance rules attached |
| External links open in the same tab | **Replaced:** project cards, socials and the resume open in a new tab (owner request) |
| "No eyebrows" | **Replaced:** each section below the hero has one mono request-line eyebrow |

---

## 1. Reference teardown (kakrottt.github.io)

Read from the shipped HTML, CSS and JS bundle. Nothing from it is reused: no names, text, code, colours or shapes.

### 1.1 What the hero is made of
Back to front:
1. A page-wide fixed grid texture and four corner brackets (a "blueprint sheet" frame).
2. A 2D canvas of falling 0s and 1s filling the hero. Cell 15px, JetBrains Mono, one new glyph per column per
   tick, ticks on a 55ms interval (about 18 per second). Trails come from painting the background colour at 14%
   alpha over the whole canvas each tick. About 15% of glyphs are near-white, the rest cyan at 60%.
3. A left-to-right gradient of the background colour: opaque under the text, transparent on the right. This is
   the whole legibility trick, and it works.
4. Two large blurred cyan blobs in opposite corners.
5. A two-column grid (max 72rem). Left: status chip, uppercase display name with a cyan glow, role in cyan mono,
   the typed prompt, two buttons, seven stack chips, four stat tiles. Right: a translucent bordered card titled
   like a figure, containing an SVG diagram.

The diagram: client, edge, load balancer, a Kubernetes cluster drawn as a rotating ring with a pulsing core, a
datastore, and two monitoring boxes on a dashed arc. Edges draw in once (0.5s each, staggered over 0.65s). A single
3px dot loops along the main line every 4.5s. Nodes never react to the dot.

Typing: 35ms per character from mount, roughly 3.5s for the sentence, block cursor blinking on a 1s step, with a
fixed min-height so the layout does not jump. Entrance: text column rises 40px over 1s; the card scales from 0.96.

Page rhythm: four full-viewport "sheets" (hero, profile, projects, contact), each centred with a soft glow, a mono
shell-prompt eyebrow and an uppercase heading. Fixed nav that turns translucent after 50px. Project cards have a
terminal-window title bar, a status pill, chips, and lift 6px with a glow on hover. One-line mono footer.

### 1.2 Why it works
- **Depth from three cheap layers** (moving texture, scrim, content) reads as "alive" before you read a word.
- **The diagram is the pitch.** You learn what he does from the picture, not from a paragraph.
- **One voice.** Mono for everything machine-like, one accent colour, one glow.
- **Staged load.** Text, then edges, then the packet: about 1.5s of choreography, then a calm loop.
- **Almost no reading required.** Name, role, one sentence, two buttons.

### 1.3 Where it falls short (and we do better)
- Rain canvas ignores device pixel ratio (soft on retina), never pauses off-screen or in a hidden tab, and under
  reduced motion draws nothing, leaving a flat hero.
- The diagram is a picture of a system, not a system: one dot, no node reaction, no failure, no branch.
- The typed sentence is mutated in place with no accessible static text. No pause control (WCAG 2.2.2).
- 380 kB of JS for a four-section page, mostly an animation library and an icon pack.
- A fixed HUD chip, corner brackets, glow blobs, stat tiles and stack chips compete with the diagram.

### 1.4 What we deliberately do differently
| Reference | Ours |
|---|---|
| Cyan on near-black, glow, uppercase sci-fi display face | Warm saffron signal on cool ink; steel-blue rain recedes behind it. No glow, no uppercase. Bricolage Grotesque |
| DevOps subject: a cluster as a spinning reactor | Backend subject: a request path with a cache, a queue, a worker, a durable workflow that fails once and retries |
| One looping dot; static nodes | A deterministic simulation: 4 scenarios, 1 to 4 packets, nodes light up while they work, tags and a trace log |
| Diagram in a bordered card | Diagram sits directly on the rain, no card: the system *is* the background |
| Shell-prompt eyebrows (`~/x $ cmd`) | HTTP request-line eyebrows (`GET /projects`) |
| Terminal-window project cards with status pills | Route-line project cards; hover draws a "request in flight" line |
| Centred full-viewport sheets, HUD chip, corner frame, blobs | Left-aligned editorial column, natural section height, none of the chrome |
| Stat tiles, stack chips, status chip in the hero | None. Name, role, prompt, two buttons |
| Animation library + icon pack | CSS, one canvas, one SVG, one `requestAnimationFrame` loop. About 6 kB gzip of new JS |
| Rain blank under reduced motion; no pause | Composed still frame under reduced motion; a visible Pause button for everyone |

---

## 2. Concept, palette, type

### 2.1 Concept
**The system is the background.** The first screen is a backend at work: bits drift behind it, requests enter at
the gateway, get authenticated, hit the cache or the database, get queued, and one job fails and is retried by a
durable workflow before it commits. In front of it: a name, a job title and one typed command.

Design principle, one sentence: **show the system running, and say very little.**

Two tests for every decision:
- **Lie test.** Would a backend engineer call it fake? The traffic is labelled "simulated" in the figure itself.
- **Five-second test.** Name, role and "View projects" are readable and reachable before any animation finishes.

### 2.2 Palette: keep every existing token, add two
No existing value changes. Colour roles are tightened:

| Token | Role in V3 |
|---|---|
| `primary` (saffron) | The signal: packets, active nodes, the prompt `$`, the caret, primary button, links, focus ring |
| `branch` (steel) | The rain only (through `--rain`). It is cool and low-contrast so it recedes behind the warm signal |
| `ok` (moss), `destructive` (coral) | Diagram outcomes (commit, cache hit, failed attempt) and "Copied". Always with a word or glyph |
| `card`, `border-strong`, `muted-foreground` | Node fill, node and edge strokes, labels |

Add to `src/index.css` (foundation package). These are the only new raw colours:

```css
:root {
  --rain: rgb(42 95 150 / 0.28);       /* steel on paper */
  --rain-head: rgb(42 95 150 / 0.62);
}
.dark {
  --rain: rgb(125 176 224 / 0.38);     /* steel on ink */
  --rain-head: rgb(236 232 223 / 0.85); /* bone */
}
@theme inline {
  --color-rain: var(--rain);
  --color-rain-head: var(--rain-head);
  --container-hero: 80rem;             /* max-w-hero: hero and header inner width */
  --animate-caret: caret-blink 1s steps(1) 10;      /* 10 blinks, then solid (WCAG 2.2.2) */
  --animate-cue: cue-drop 1.6s var(--ease-brand) infinite;
  @keyframes caret-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes cue-drop { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(2rem); opacity: 0; } }
}
/* Section reveal: scroll-driven, no JS. Browsers without support simply show the content. */
@keyframes reveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@supports (animation-timeline: view()) {
  .reveal { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 35%; }
}
@media (prefers-reduced-motion: reduce) {
  .reveal { animation: none; }   /* the global 0.01ms rule does not stop scroll-driven animations */
}
```

Remove from `src/index.css`: `--rail-col`, `--fork-offset` and their media query, `--glow`, `--spot`,
`--color-glow`, `--color-spot`, `--spacing-rail`, `--spacing-rail-line`, `--spacing-node`, `--spacing-node-sm`,
`--spacing-fork`, `--spacing-label`, and the `body:has(dialog[open])` rule. Keep everything else.

Contrast (computed, WCAG relative luminance). "Worst case over rain" means the brightest possible rain pixel
under the minimum scrim allowed behind text (88% background):

| Pair | Dark | Light |
|---|---|---|
| Foreground on background, worst case over rain | 12.4:1 | 14.5:1 |
| Muted foreground (the typed prompt), worst case over rain | 6.6:1 | 5.7:1 |
| Primary as text, worst case over rain | 7.4:1 | 5.3:1 |
| Foreground / muted on `card` (node labels, cards) | 14.3 / 7.6 | 17.2 / 6.8 |
| `border-strong` on background / on card (non-text, needs 3:1) | 4.3 / 3.9 | 3.9 / 4.2 |

Rule that follows: **no text may sit over rain with less than 88% scrim behind it.** Diagram labels sit inside
opaque `card`-filled nodes, so they are unaffected.

### 2.3 Typography: unchanged families, tighter roles
- **Bricolage Grotesque** (display): the h1 and the two h2s. Nothing else.
- **Instrument Sans** (body): paragraphs, buttons, nav, card descriptions.
- **JetBrains Mono** (machine voice): the prompt line, eyebrows, diagram labels and tags, trace log, stack chips,
  the figure header. Never a heading.
- Sizes use existing tokens: `text-hero`, `text-h2`, `text-h3`, `text-lead`, `text-code`. No new size tokens.
- Sentence case everywhere. No uppercase, no letter-spaced labels, no text-shadow.

---

## 3. Page structure

Order (from `src/content/nav.ts`): `hero`, `projects`, `contact`. Then the footer. Header nav: Projects, Contact,
Resume (only when `profile.resumeUrl` is set).

Breakpoints: default (320 up), `sm` 640 (diagram switches from tall to wide layout), `lg` 1024 (3-column cards),
`xl` 1280 (hero becomes two columns and full viewport height).

### 3.1 Desktop 1440
```
+----------------------------------------------------------------------------------------------------------+
| MS                                                              Projects   Contact   Resume ↗      [◐]   |  header 64px, fixed, transparent over hero
+----------------------------------------------------------------------------------------------------------+
| 0 1 1 0   1 0   (rain, full bleed, strongest on the right)   1 0 1   0 1 1 0 1   0 0 1   1 0 1 1 0   1 0 |
|                                                                                                          |
|   Manpreet                                  system map                    ● simulated traffic   [⏸]     |
|   Singh                                                      ┌───────┐                                   |
|                                                              │ cache │ HIT                               |
|   Backend Engineer                                           └───┬───┘                                   |
|                                              ┌───────┐ ┌──────┐ ┌─┴───┐                 ┌──────────┐     |
|   $ designing APIs, orchestrating       (o)──│gateway│─│ auth │─│ api │────────●────────│ database │     |
|     workflows, building the backend          └───────┘ └──────┘ └─┬───┘                 └────┬─────┘     |
|     systems that run behind them.▍                    rate limit  │                          │ commit    |
|                                                                 ┌─┴───┐   ┌────────┐   ┌─────┴────┐      |
|   [ View projects ↓ ]  [ Resume ↗ ]          7f3a GET /v1/jobs..│queue│─◆─│ worker │───│ workflow │      |
|                                              a91c job.process ..└─────┘   └────────┘   └────┬─────┘      |
|                                              22d0 POST /v1/jobs..                  attempt 2 │ durable   |
|                                                                                        ┌────┴─────┐      |
|                                                                                        │  agent   │ llm  |
|                                                                                        └──────────┘      |
|                                                  scroll                                                  |
|                                                    │●                                                    |
+----------------------------------------------------------------------------------------------------------+
|   GET /projects                                                                                          |
|   Things I have built                                                                                    |
|   A few repositories, picked by hand. Each card opens the code on GitHub.                                |
|                                                                                                          |
|   +------------------------------+  +------------------------------+  +------------------------------+   |
|   | GET /repos/repo-01         ↗ |  | GET /repos/repo-02         ↗ |  | GET /repos/repo-03         ↗ |   |
|   |------------------------------|  |------------------------------|  |------------------------------|   |
|   | repo-01          coming soon |  | repo-02          coming soon |  | repo-03          coming soon |   |
|   | This slot is reserved for a  |  | ...                          |  | ...                          |   |
|   | repository I am preparing... |  |                              |  |                              |   |
|   | [chip] [chip] [chip]         |  |                              |  |                              |   |
|   | Source ↗            Live ↗   |  | Source ↗                     |  | Source ↗                     |   |
|   +------------------------------+  +------------------------------+  +------------------------------+   |
|                                                                                                          |
|   POST /contact                                                                                          |
|   Let's talk                                                                                             |
|   I build backend systems: APIs, durable workflows and the infrastructure they run on. ...               |
|   name@example.com  [ Copy ]                                                                             |
|   GitHub ↗     LinkedIn ↗                                                                                |
+----------------------------------------------------------------------------------------------------------+
|   © 2026 Manpreet Singh. Built with React, TypeScript and Tailwind CSS.                    Back to top   |
+----------------------------------------------------------------------------------------------------------+
```
Hero inner width `max-w-hero` (80rem) with `px-gutter`; from `xl` a grid `grid-cols-[minmax(0,5fr)_minmax(0,7fr)]
gap-12 items-center`, `min-h-svh`. Sections below use `max-w-content` (70rem) `px-gutter py-section`.

### 3.2 Mobile 360
```
+--------------------------------------+
| MS            Projects Contact  [◐]  |  64px, fixed
+--------------------------------------+
| 1 0   (rain under ~90% scrim)  0 1   |
|  Manpreet                            |
|  Singh                               |
|  Backend Engineer                    |
|                                      |
|  $ designing APIs, orchestrating     |
|    workflows, building the backend   |
|    systems that run behind them.▍    |
|                                      |
|  [ View projects ↓ ]  [ Resume ↗ ]   |
|                                      |
|  system map       ● simulated  [⏸]   |
|  (o)───[gateway]─────[ auth ]        |
|                         │ rate limit |
|        [ cache ]─────[ api ]         |
|            ┌───────────┘│            |
|        [database]    [queue]         |
|            │            │            |
|        [workflow]────[worker]        |
|            │ durable                 |
|        [ agent ] llm                 |
|  7f3a GET /v1/jobs/137 200 hit 3 ms  |
|  a91c job.process attempt 2 done     |
+--------------------------------------+
|  GET /projects                       |
|  Things I have built                 |
|  A few repositories, picked by hand. |
|  [ card ]                            |
|  [ card ]                            |
|  [ card ]                            |
|  POST /contact                       |
|  Let's talk                          |
|  ...                                 |
|  name@example.com                    |
|  [ Copy ]                            |
|  GitHub ↗                            |
|  LinkedIn ↗                          |
+--------------------------------------+
|  © 2026 Manpreet Singh. Built with…  |
|  Back to top                         |
+--------------------------------------+
```
At 360x740 the name, role, prompt and both buttons are above the fold and the top of the diagram is visible.
"Resume" is hidden in the header below `sm` (it stays in the hero). Between 640 and 1279 the hero is one column
with the **wide** diagram capped at `max-w-2xl`, left aligned.

---

## 4. Hero spec

### 4.1 Layers and z-order
All inside `<section id="hero" class="group/hero relative isolate overflow-hidden" data-paused>`:

| z | Layer | Element | Notes |
|---|---|---|---|
| 0 | Rain | `<canvas aria-hidden>` `absolute inset-0 size-full -z-20` | Section 6. Fades in `opacity-0 -> 100` over 900ms (`duration-900 ease-brand`) |
| 1 | Scrim | `<div aria-hidden>` `absolute inset-0 -z-10 pointer-events-none` | Below `xl`: `bg-linear-to-b from-background/92 from-55% to-background/70`. From `xl`: `bg-linear-to-r from-background/92 from-42% via-background/45 via-70% to-background/20`. The text column never extends past 42% of the hero width at `xl` |
| 1 | Bottom fade | `<div aria-hidden>` `absolute inset-x-0 bottom-0 h-24 -z-10 bg-linear-to-t from-background to-transparent` | Rain dissolves into the page; no hard edge |
| 2 | Content | text column and `<figure>` | Normal flow |
| 40 | Header | fixed | Section 7 |

No blobs, no grid texture, no glow, no backdrop blur inside the hero.

### 4.2 Text column
In DOM order:
1. `<h1 id="hero-title">` "Manpreet" `<br>` "Singh": `font-display text-hero text-foreground`.
2. Role `<p>`: "Backend Engineer": `mt-4 text-lead font-medium text-foreground`.
3. `<TerminalLine text={profile.tagline} />`: `mt-6 max-w-[34rem] font-mono text-sm sm:text-base text-muted-foreground`.
4. Buttons row: `mt-8 flex flex-wrap gap-3`.

No lead paragraph, clock, chips or stats. `profile.lead` and `profile.summary` are deleted.

### 4.3 The typed prompt (`TerminalLine`)
Default text (`profile.tagline`): `designing APIs, orchestrating workflows, building the backend systems that run behind them.`
The `$` is rendered separately and is not part of the string.

Markup (this exact structure keeps wrapping identical from the first frame, so there is no layout shift):
```html
<p class="font-mono ...">
  <span aria-hidden="true" class="mr-2 text-primary select-none">$</span>
  <span class="sr-only">{text}</span>
  <span aria-hidden="true">
    <span>{text.slice(0, count)}</span>
    <span class="inline-block w-0 overflow-visible align-baseline text-primary animate-caret
                 motion-reduce:animate-none group-data-[paused=true]/hero:[animation-play-state:paused]">▍</span>
    <span class="invisible">{text.slice(count)}</span>
  </span>
</p>
```
- **Screen readers** get the full sentence once, immediately, from the `sr-only` span. The typed copy is
  `aria-hidden`. No live region, no per-character announcements.
- **Speed:** 28ms per character, starting 500ms after mount. The default sentence (91 characters) finishes about
  3.0s after mount. Constant speed, no fake typos.
- **Caret:** zero-width inline box so it never changes line breaks. Blinks on a 1s step. `animate-caret` is applied
  only once typing completes (solid while typing), runs 10 times, then stays solid.
- **Reduced motion:** `count = text.length` on the first render, caret solid, no timer is created.
- **Pause button pressed mid-typing:** typing completes instantly (same as reduced motion), caret solid.
- Timer: one `setInterval` that clears itself at the end. This is the only timer outside the frame loop.

### 4.4 Buttons
| Button | Element | Style | Behaviour |
|---|---|---|---|
| **View projects** | `<Button asChild>` wrapping `<a href="#projects">` + `ArrowDown` icon | `variant="default"`, `h-target px-5 text-base` | Scrolls to Projects (native anchor, smooth unless reduced motion) |
| **Resume** | `<ResumeLink>` (renders nothing when `profile.resumeUrl` is null) + `ArrowUpRight` icon | `buttonVariants({ variant: 'outline' })` + `h-target px-5 text-base bg-background/70` | Opens the PDF in a new tab. Accessible name "Resume (PDF, opens in a new tab)" |

States (both): hover = existing variant hover (`bg-primary/80` / `bg-muted`), icon moves 2px in its direction over
120ms (`group-hover/button:translate-y-0.5`, and `-translate-y-0.5 translate-x-0.5` for the up-right arrow);
active = existing 1px press; focus-visible = existing ring (`ring-3 ring-ring/50` plus `border-ring`). No scale, no glow.
When Resume is absent the row holds one button; nothing else moves.

### 4.5 The figure (right column from `xl`, below the buttons otherwise)
```html
<figure class="mt-10 xl:mt-0 min-w-0 max-w-2xl xl:max-w-none">
  <div class="flex items-center justify-between font-mono text-code text-muted-foreground" aria-hidden="true">
    <span>system map</span>
    <span class="flex items-center gap-2"><span class="size-2 rounded-full bg-primary"></span>simulated traffic</span>
  </div>
  <MotionToggle />            <!-- real button, not aria-hidden; sits at the right end of that row -->
  <SystemDiagram />           <!-- aria-hidden SVG + trace log -->
  <figcaption class="sr-only">{SYSTEM_DESCRIPTION}</figcaption>
</figure>
```
(Implementation note: the header row is one flex container; the label spans are `aria-hidden`, the button is not.)
The status dot is solid `bg-primary` while running and hollow (`border border-border-strong bg-transparent`) when
paused or under reduced motion, where the text reads "simulated traffic, paused".

`MotionToggle`: `Button variant="ghost" size="icon"` at `size-target`, icon `Pause` / `Play`, `aria-label="Pause
animation"`, `aria-pressed={paused}`. It pauses the rain, the diagram, the caret and the scroll cue together
(sets `data-paused` on the hero section). Not rendered under reduced motion. State is not persisted.

### 4.6 Load choreography (ms after mount; reduced motion: everything is in its final state at 0)
| At | What | How |
|---|---|---|
| 0 | h1 | `animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-240 ease-brand` (existing `ENTER` string) |
| 60 / 120 / 180 | role / prompt line / buttons | same, `[--tw-animation-delay:…]` |
| 0 to 900 | rain canvas | opacity 0 to 1 |
| 240 | figure header and SVG | same `ENTER`, one fade for the whole SVG (no per-node stagger) |
| 500 | typing starts | section 4.3 |
| 900 | simulation clock starts; first packet leaves the client | frame loop `startDelayMs: 900` |
| about 3000 | typing done, caret starts blinking | |
| about 9640 | first failed attempt is visible (simulation time 8740 plus the 900 start delay); the retry leaves 1.4s later and commits at about 13200 | section 5.5 |

### 4.7 Scroll cue
Only from `xl` (where the hero is exactly one viewport). `aria-hidden`, not focusable, `pointer-events-none`,
`absolute bottom-6 left-1/2 -translate-x-1/2`: the word `scroll` in `font-mono text-code text-muted-foreground`
above a 1px by 2rem line (`bg-border-strong`) with a 4px saffron dot travelling down it (`animate-cue`, 1.6s
loop). It is a packet leaving the hero. `motion-reduce:animate-none` (dot rests at the top);
`group-data-[paused=true]/hero:[animation-play-state:paused]`. It scrolls away with the hero; no scroll listener.

### 4.8 Frame loop (the only `requestAnimationFrame` loop on the page)
`useFrameLoop(onFrame, { target, paused, startDelayMs })` in `src/components/hero/useFrameLoop.ts`:
- Runs only while **all** hold: the hero intersects the viewport (`IntersectionObserver`, threshold 0),
  `document.visibilityState === 'visible'`, not paused, not reduced motion.
- Passes `tMs` = accumulated *running* time (never wall-clock) and `dtMs`, with `dtMs` clamped to 100ms, so
  resuming never jumps or fast-forwards.
- Skips a callback when less than 15ms has passed since the last one (caps at about 60fps on 120Hz screens).
- `HeroSection` calls it once and forwards to two imperative handles: `rainRef.current?.frame(t, dt)` and
  `diagramRef.current?.frame(t, dt)`. No React state changes per frame.
- Under reduced motion the loop never starts; each layer draws its still frame once on mount (sections 5.8, 6.6).

---

## 5. Architecture animation spec

### 5.1 Nodes
Ten nodes. Labels are generic roles on purpose (no product names; see open question 2).

| id | Label in box | Sub-label (9.5 units, muted, outside the box) | Shape |
|---|---|---|---|
| `client` | (none; label "client" under it) | | circle r 9 |
| `gateway` | `gateway` | | box |
| `auth` | `auth` | `rate limit` | box |
| `api` | `api` | | box |
| `cache` | `cache` | | box |
| `db` | `database` | | box with a second line 4 units under its top edge (reads as a store) |
| `queue` | `queue` | | box |
| `worker` | `worker` | | box |
| `workflow` | `workflow` | `durable` | box |
| `agent` | `agent` | `llm` | box |

The agent service is the last node, called by the workflow. It is not highlighted, larger or coloured differently.

Box: `rx 4`, `fill-card`, `stroke-border-strong`, stroke width 1.5 with `vector-effect: non-scaling-stroke`.
Label: `font-mono fill-foreground`, centred, `dominant-baseline: central`.

### 5.2 Edges (undirected for drawing; packets may travel either way)
`client-gateway`, `gateway-auth`, `auth-api`, `api-cache`, `api-db`, `api-queue`, `queue-worker`,
`worker-workflow`, `workflow-agent`, `workflow-db`. Ten edges. Stroke `stroke-border-strong`, width 1.5, no
arrowheads (direction is shown by motion). An edge with a packet on it gets `data-active` and `stroke-primary/60`;
the `workflow-agent` edge is dashed (`stroke-dasharray: 4 4`) while a `retry` packet is on it.

### 5.3 Geometry (use verbatim; plus or minus 4 units of optical adjustment is allowed, nothing else)
**Wide layout**, `viewBox="0 0 640 400"`, box 84 x 36, label font 12, used from 640px viewport width:

| Node | Centre | Edge polylines |
|---|---|---|
| client | 28,170 | client-gateway: 37,170 to 76,170 |
| gateway | 118,170 | gateway-auth: 160,170 to 190,170 |
| auth | 232,170 | auth-api: 274,170 to 304,170 |
| api | 346,170 | api-cache: 346,152 to 346,76 · api-db: 388,170 to 540,170 · api-queue: 346,188 to 346,272 |
| cache | 346,58 | |
| db | 582,170 | |
| queue | 346,290 | queue-worker: 388,290 to 422,290 |
| worker | 464,290 | worker-workflow: 506,290 to 540,290 |
| workflow | 582,290 | workflow-db: 582,272 to 582,188 · workflow-agent: 582,308 to 582,354 |
| agent | 582,372 | |

The empty lower-left quadrant (x under 290, y over 215) holds the trace log (section 5.6).

**Tall layout**, `viewBox="0 0 328 392"`, box 76 x 32, label font 11, used below 640px:

| Node | Centre | Edge polylines |
|---|---|---|
| client | 36,30 | client-gateway: 45,30 to 98,30 |
| gateway | 136,30 | gateway-auth: 174,30 to 218,30 |
| auth | 256,30 | auth-api: 256,46 to 256,98 |
| api | 256,114 | api-cache: 218,114 to 174,114 · api-queue: 268,130 to 268,182 · api-db: 232,130 to 232,156 to 136,156 to 136,182 |
| cache | 136,114 | |
| db | 136,198 | |
| queue | 256,198 | queue-worker: 256,214 to 256,266 |
| worker | 256,282 | worker-workflow: 218,282 to 174,282 |
| workflow | 136,282 | workflow-db: 136,266 to 136,214 · workflow-agent: 136,298 to 136,346 |
| agent | 136,362 | |

The SVG is `w-full h-auto` with the layout's aspect ratio set on the wrapper (`aspect-[640/400]` /
`aspect-[328/392]`) so nothing shifts while it loads. The layout is chosen by `matchMedia('(min-width: 40rem)')`,
read once on mount and on its `change` event (no resize listener).

### 5.4 Packets
| Kind | Meaning | Shape (all `primary`) |
|---|---|---|
| `request` | synchronous call | solid circle r 4 + halo circle r 8 at 25% opacity |
| `response` | the answer travelling back | ring r 4, stroke 1.5, `fill-background`, no halo |
| `event` | asynchronous work after the queue | solid diamond (square 7 rotated 45 degrees) + halo |
| `retry` | second attempt | diamond inside a dashed ring r 8 |

Shape carries the meaning; colour never does alone. Rendered from a fixed pool of 8 `<g>` elements created once.
Each frame sets `transform="translate(x y)"` and a `data-kind` on the used ones and `display: none` on the rest.
Position along an edge uses `easeInOut(progress)` (cubic) over the edge polyline. No SVG filters, no blur, no
`getPointAtLength` (the polyline maths is a pure function).

### 5.5 Simulation (pure, deterministic, a function of time only)
Constants (ms): `TRAVEL 340` (request, event, retry hops), `RETURN 200` (response hops), `SPAWN 2200`,
`FAIL_HOLD 300`, `BACKOFF 900`. Work time on arrival: gateway 140, auth 200, api 240, cache 140, queue 180,
worker 300, workflow 260, agent 640, db 380. Response hops do no work at the nodes they pass.

Run `i` starts at `i * SPAWN` and plays `SEQUENCE[i % 6]`:
`SEQUENCE = ['cache-miss', 'cache-hit', 'workflow-retry', 'cache-hit', 'enqueue', 'cache-miss']`.
One full cycle is 13.2s; trace ids keep changing, so it never looks like a loop. The retry is first visible about
9.6s after page load.

| Scenario | Request line | Path | Length |
|---|---|---|---|
| `cache-hit` | `GET /v1/jobs/{n}` 200 | client, gateway, auth, api, cache (tag `HIT`, cache flashes `ok`), then a response back cache, api, auth, gateway, client | 2880 |
| `cache-miss` | `GET /v1/jobs/{n}` 200 | client, gateway, auth, api, cache (tag `MISS`), response to api, request api to db (tag `read`), response db, api, auth, gateway, client | 3800 |
| `enqueue` | `POST /v1/jobs` 202 | client, gateway, auth, api, queue (tag `queued`). At 2120 it **forks**: a response goes back queue, api, auth, gateway, client (ends 2920) while an `event` goes queue, worker, workflow, db (tag `commit`, db flashes `ok`) | 4080 |
| `workflow-retry` | `POST /v1/jobs` 202 | Same as `enqueue` up to the workflow (reached at 3360). Then `event` workflow to agent; agent works 640 and **fails** (agent `failed`, tag `timeout`, at 4340); response back to workflow (4540); workflow `failed`, tag `attempt 1 ✕` for `FAIL_HOLD`; workflow `backoff`, tag `backoff` for `BACKOFF` (until 5740); `retry` packet workflow to agent (tag on workflow `attempt 2`); agent works 640 and succeeds (6720); response back (6920); workflow works 260; `event` to db; db works 380 (tag `commit`, `ok`); workflow flashes `ok`, tag `attempt 2 ✓` | 7900 |

Node state at time `t` is the highest-priority state any active run gives it: `failed` > `backoff` > `active` >
`ok` > `idle`. A node is `active` while it works; the workflow stays `active` from first arrival until its final
event leaves. `ok` flashes last 400ms. Tags are shown while their state lasts plus 400ms.

At most 4 runs and 4 packets are ever alive at once (pool of 8 leaves headroom).

Node appearance by `data-state` (transition `stroke`, `fill` 120ms in, 240ms out, `ease-brand`):

| State | Stroke | Fill | Extra |
|---|---|---|---|
| `idle` | `border-strong` 1.5 | `card` | |
| `active` | `primary` 2 | `primary/10` over card | |
| `ok` | `ok` 2 | `card` | tag text in `fill-ok` |
| `failed` | `destructive` 2, dashed 4 3 | `card` | tag text in `fill-destructive`, includes `✕` |
| `backoff` | `primary` 1.5, dashed 2 4 | `card` | tag `backoff` |

Tags: `font-mono` at 9.5 units, placed 8 units outside the box on its free side (cache: right; db: below right;
queue: left; workflow: left on wide, right on tall; agent: right). One `<text>` per node, `textContent` set only
when it changes.

### 5.6 Trace log (the "latency readouts")
Mono `text-code`, `aria-hidden`, newest last, lines fade in over 240ms. Wide: last 3 lines, absolutely positioned
over the lower-left quadrant of the SVG (`left-0 bottom-0 w-[42%]`). Tall: last 2 lines in normal flow under the SVG.
A line is truncated with `truncate`, never wrapped.

| Emitted when | Text | Tone |
|---|---|---|
| a response reaches the client | `{id} GET /v1/jobs/{n} 200 cache hit {ms} ms` (or `cache miss`), `{id} POST /v1/jobs 202 queued {ms} ms` | `text-muted-foreground`; the status code in `text-ok` |
| the agent attempt fails | `{id} job.process attempt 1 failed, retrying` | `text-destructive` |
| the workflow commits | `{id} job.process completed` (enqueue) / `{id} job.process attempt 2 completed` (retry) | status word in `text-ok` |

`{id}` = 4 hex digits: `(((i + 1) * 40503) & 0xffff).toString(16).padStart(4, '0')`. `{n}` = `100 + (i * 37) % 900`.
`{ms}` = scenario base (hit 3, miss 17, enqueue and retry 6) plus `i % 3`.

### 5.7 Honesty rules
- The figure header says **"simulated traffic"** at all times. The `{ms}` values are illustrative constants and
  appear only inside this `aria-hidden` figure. They are not claims about any real system, are not content, and
  are exempt from the "every number is on the resume" rule; CONTRIBUTING.md gets one sentence saying so (WP8).
- No uptime, throughput, percentile, cost or request-count figures anywhere.
- No real product names in the diagram unless the owner approves them (open question 2).

### 5.8 Reduced motion
The frame loop never starts. The diagram renders `frameAt(STILL_T_MS)` once, with `STILL_T_MS = 10300`: the
retry packet is mid-way from workflow to agent, the workflow shows `attempt 2`, the api node is `active`, and the
trace log shows the failed attempt above it. A still picture that tells the whole retry story. A unit test pins
those properties (not the number), so if a timing constant changes the test says so and a new `STILL_T_MS` is picked.

### 5.9 Screen readers
The SVG and the trace log are `aria-hidden="true"` and contain nothing focusable. The `<figcaption class="sr-only">`
carries the alternative, exactly:

> Diagram of a backend system handling simulated requests. A request enters through an API gateway, passes
> authentication and rate limiting, and reaches the API service. Reads are answered from a cache, or from the
> database when the cache misses. Writes are placed on a queue and picked up by a worker, which runs a durable
> workflow. One workflow step calls an agent service, fails once, waits, and is retried before the result is
> committed to the database.

No live regions. Nothing in the hero announces itself after load.

---

## 6. Binary rain spec

> Superseded by `docs/DESIGN-V3-BACKGROUND.md` section 4 (trace field). See "V3 amendments" at the end.

| Property | Value |
|---|---|
| Glyphs | `0` and `1` only, equal probability |
| Font | JetBrains Mono (`--font-mono`), weight 400, size = cell minus 2px. Wait for `document.fonts.ready` before the first draw |
| Cell | 16px from 640px viewport width, 14px below |
| Columns | `ceil(width / cell)`, capped at 120 (above that the cell grows to `width / 120`) |
| Step rate | Fixed 20 steps per second (50ms accumulator fed by the frame loop). The canvas repaints only on a step |
| Speed | Per column, random in 0.25 to 0.60 rows per step (5 to 12 rows per second, about 80 to 190 px/s). Re-rolled each time the column restarts. Slower and more varied than the reference: a drift, not a downpour |
| Density | A column that leaves the bottom restarts at a random row between `-rows` and 0, so about 55 to 65% of columns show a head at any moment |
| Trail | Each step paints `--background` over the whole canvas at alpha 0.10, then draws new glyphs. A glyph fades to about 12% in 1s |
| Head | The newest glyph in a column is drawn in `--rain-head`; on the next step the same glyph is redrawn in `--rain` |
| Shimmer | Each step, 2% of columns redraw one random cell within 6 rows above the head with the opposite bit |
| Colours | Read from CSS (`getComputedStyle(canvas)`: `--rain`, `--rain-head`, `--background`) on mount and when the `class` of `<html>` changes (one `MutationObserver`). Never per frame, never hard-coded |
| Theme change | Canvas is cleared to the new `--background` and continues; no cross-fade |
| Where | Hero only. It is clipped by the hero's `overflow-hidden` and dissolved by the bottom fade |

### 6.1 Pointer reaction (optional, lowest priority, cut first if the budget is at risk)
Only under `(hover: hover) and (pointer: fine)`. One passive `pointermove` listener on the hero stores `clientX`
in a ref (no state, no layout read in the handler; the hero's left offset is cached by the `ResizeObserver`).
Columns within 72px of the pointer fall 1.8x faster. Nothing follows the cursor, nothing glows.

### 6.2 Performance caps
- Backing store scale = `min(devicePixelRatio, 2)`, then reduced further so `width * height * scale²` never
  exceeds 4,000,000 pixels.
- Sizing: one `ResizeObserver` on the hero; on change, set the canvas size once and rebuild the columns. No
  `offsetWidth` or `getBoundingClientRect` inside the frame callback.
- One `fillRect` plus at most `columns * 1.02` `fillText` calls per step. `ctx.font` and `textBaseline` are set
  once per resize, not per step.
- Context: `getContext('2d', { alpha: false })`.

### 6.3 Reduced motion still frame
Run 160 steps synchronously on mount (seeded generator, so the frame is the same every visit), draw the result
once, and stop. The hero keeps its texture and depth; nothing moves.

---

## 7. Other motion (three things, all quiet)

1. **Section reveal.** Projects and Contact fade in and rise 12px as they enter the viewport, via the `.reveal`
   class from section 2.2 (scroll-driven CSS, no observer, no JS). Unsupported browsers and reduced motion: content
   is simply visible.
2. **Project card hover and focus.** `-translate-y-1` over 240ms `ease-brand`; border `border-border` to
   `border-primary`; a 2px `bg-primary` line across the card's top edge grows `scale-x-0` to `scale-x-100` from
   the left over 240ms (a request in flight); the header arrow moves 2px up-right over 120ms. `motion-reduce:`
   keeps the colour change and drops the transforms.
3. **Header.** Background and border fade between transparent and `bg-background/85 backdrop-blur-md
   border-border` over 120ms when `scrollY > 0` (existing `useScrolled`).

Plus the hero load sequence in section 4.6.

**Do not animate:** the h1 (no glow, gradient, scramble or per-letter effects), theme switching, numbers counting
up, parallax, cursor followers, card tilt, magnetic buttons, scroll-jacking or snapping, rain outside the hero,
blobs or gradients, anything in Contact or the footer, layout properties (`width`, `height`, `top`, `left`).

---

## 8. Projects, contact, header, footer

### 8.1 Data shape (adding a repo is one object)
```ts
// src/types/content.ts
export interface Project {
  /** Stable key and DOM id suffix. Lowercase, hyphens. */
  id: string
  /** Repository name as it should be displayed. */
  name: string
  /** One or two sentences. Plain text. */
  description: string
  /** 0 to 6 short tech names, most important first. */
  stack: readonly string[]
  /** https://github.com/... (validated with safeUrl + GITHUB_LINK_HOSTS). */
  repoUrl: string
  /** Optional deployed URL, https only. */
  liveUrl?: string
  /** True for a reserved slot: dashed border and a "coming soon" tag. Remove when the repo is real. */
  placeholder?: true
}
```
```ts
// src/content/projects.ts
const PROFILE = 'https://github.com/chandiimanpreet'
const SLOT = 'This slot is reserved for a repository I am preparing to publish. Until then, my code is on my GitHub profile.'

// To add a repo: replace a placeholder (or append) with
// { id, name, description, stack: ['Go', ...], repoUrl: 'https://github.com/chandiimanpreet/<repo>', liveUrl? }
export const projects: readonly Project[] = [
  { id: 'repo-01', name: 'repo-01', description: SLOT, stack: [], repoUrl: PROFILE, placeholder: true },
  { id: 'repo-02', name: 'repo-02', description: SLOT, stack: [], repoUrl: PROFILE, placeholder: true },
  { id: 'repo-03', name: 'repo-03', description: SLOT, stack: [], repoUrl: PROFILE, placeholder: true },
]
```
No stack chips on placeholders: a stack would describe a project that does not exist yet.

### 8.2 Projects section (`#projects`)
- Eyebrow: `GET /projects` · h2: "Things I have built" · intro: "A few repositories, picked by hand. Each card
  opens the code on GitHub."
- Grid: `mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3`, as a `<ul>` of `<li>`.
- Empty array: the section and its nav link still render; the grid is replaced by one line: "Repositories are on
  the way. My code is on GitHub." with "GitHub" as a new-tab link to the profile.

Card (`ProjectCard`), an `<article class="group relative ...">`:
```
+----------------------------------------+   <- 2px primary line, scale-x on hover/focus-within
| GET /repos/{id}                      ↗ |   header: font-mono text-code text-muted-foreground, border-b, px-5 py-3, aria-hidden
|----------------------------------------|
| {name}                   [coming soon] |   h3: text-h3 font-sans font-semibold; tag only when placeholder
| {description}                          |   text-sm leading-relaxed text-muted-foreground, mt-2
| [chip] [chip] [chip]                   |   <StackList>, mt-4, omitted when stack is empty
|                                        |
| Source ↗                    Live ↗     |   mt-6, font-mono text-code; Live only when liveUrl
+----------------------------------------+
```
- Surface: `rounded-md border border-border bg-card overflow-hidden h-full flex flex-col`; body `p-5`. Placeholder:
  `border-dashed border-border-strong`, tag "coming soon" = `Badge variant="outline"` in mono.
- **Whole card opens the repo in a new tab:** the h3 holds `<ExternalLink newTab href={repoUrl}
  allowedHosts={GITHUB_LINK_HOSTS} className="after:absolute after:inset-0 focus-visible:outline-none">` (stretched
  link). The card shows the focus ring through `focus-within:outline-2 focus-within:outline-ring
  focus-within:outline-offset-3`. "Source" in the footer is plain text with an arrow (`aria-hidden`), not a second
  link to the same place.
- "Live" is its own `<ExternalLink newTab>` with `relative z-10` and `targetLinkClass`, so it stays clickable above
  the stretched link.
- Link accessible name: "{name}, source on GitHub (opens in a new tab)". Live: "{name}, live site (opens in a new tab)".
- Hover and focus: section 7, item 2. The h3 turns `text-primary` on hover.

### 8.3 Contact section (`#contact`)
- OWNER OVERRIDE (centered terminal style, replaces the text below where they differ): eyebrow `~/contact $ ping manpreet`, h2 "Let's build something", a mono line `stack: go, node.js/typescript, temporal, aws, kubernetes`, a row of round GitHub and LinkedIn icon links (inline SVG, sr-only labels, new tab), then the email link with Copy. Centered.
- (superseded) Eyebrow: `POST /contact` · h2: "Let's talk"
- Paragraph (`text-lead text-muted-foreground max-w-measure`): "I build backend systems: APIs, durable workflows
  and the infrastructure they run on. If you are hiring for that, email is the fastest way to reach me."
- Email row: `<a href={mailtoHref(profile.email)}>` showing `{profile.email}` in `text-lead` with `linkClass`
  and `break-all`, followed by the existing `<CopyEmailButton>` (labels "Copy", "Copied", "Press Ctrl+C";
  `role="status"` announcement kept). The address is assembled at runtime from `profile.email`; it never appears
  as a literal in source.
- Links row (`<ul aria-label="Elsewhere">`, stacked below `sm`): "GitHub" (`https://github.com/chandiimanpreet`)
  and "LinkedIn" (`https://www.linkedin.com/in/chandiimanpreet/`), each `<ExternalLink newTab>` with
  `targetLinkClass` and a trailing `ArrowUpRight` (`aria-hidden`).
- No form, no phone, no mail templates, no local time, no LeetCode.

### 8.4 Header
`<header class="fixed inset-x-0 top-0 z-40 border-b transition-colors duration-120">`, inner `mx-auto flex
h-header max-w-hero items-center gap-x-6 px-gutter`.
- Left: `MS` monogram (existing), `href="#main"`, `aria-label="MS, Manpreet Singh, back to top"`.
- Right (`ml-auto flex items-center gap-x-1 sm:gap-x-5`): `<nav aria-label="Primary">` with "Projects", "Contact"
  (existing `NavLink`, `aria-current="location"` from `useActiveSection`), then `<ResumeLink>` "Resume" styled
  like a nav link with `ArrowUpRight` and `hidden sm:flex`, then `<ThemeToggle>`.
- At the top: `border-transparent bg-transparent`. Scrolled: `border-border bg-background/85 backdrop-blur-md`.
- Nav links are always visible; there is no menu button at any width.

### 8.5 Footer
`<footer class="border-t border-border">`, inner `mx-auto flex max-w-content flex-col gap-y-1 px-gutter py-8
text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between`:
- "© {year} Manpreet Singh. Built with React, TypeScript and Tailwind CSS."
- "Back to top" (`href="#main"`, `targetLinkClass`).

### 8.6 All UI text in one place
| Where | Text |
|---|---|
| Skip link | Skip to content |
| Header | MS · Projects · Contact · Resume · (toggle name) Dark theme |
| Hero | Manpreet Singh · Backend Engineer · `$` designing APIs, orchestrating workflows, building the backend systems that run behind them. |
| Hero buttons | View projects · Resume |
| Figure | system map · simulated traffic · simulated traffic, paused · Pause animation · Play animation · scroll |
| Diagram labels | client, gateway, auth, rate limit, api, cache, database, queue, worker, workflow, durable, agent, llm |
| Diagram tags | HIT, MISS, read, queued, commit, timeout, attempt 1 ✕, backoff, attempt 2, attempt 2 ✓ |
| Projects | GET /projects · Things I have built · A few repositories, picked by hand. Each card opens the code on GitHub. · coming soon · Source · Live · Repositories are on the way. My code is on GitHub. |
| Contact | POST /contact · Let's talk · (paragraph in 8.3) · Copy · Copied · Press Ctrl+C · GitHub · LinkedIn |
| Footer | © {year} Manpreet Singh. Built with React, TypeScript and Tailwind CSS. · Back to top |
| New-tab hint (sr-only) | (opens in a new tab) |
| `<title>` / description | unchanged from `index.html` |

---

## 9. File plan

### 9.1 Delete
```
src/sections/        AboutSection.tsx  AgentsSection.tsx  ExperienceSection.tsx  ShowcaseSection.tsx
                     SkillsSection.tsx  ProjectsSection.test.tsx (rewritten in WP6)
src/components/      about/  experience/  pipeline/  showcase/  skills/  workflows/        (whole folders)
src/components/hero/ HeroStats.tsx  LocalClock.tsx  stats.ts  hero.test.ts
src/components/projects/   every existing file (anchors, Fact, flow, GithubRepoList(+test), ProjectFacts,
                           ProjectRow, projects.test, repos(+test), SystemFacts)
src/components/contact/    LocalTime.tsx  MailtoTemplates.tsx
src/components/layout/     Rail.tsx  Rail.test.tsx  railGeometry.ts  header/MobileNav.tsx
src/components/shared/     PeriodTime.tsx  Todo.tsx (if unused after the rewrite)
src/components/ui/         accordion.tsx  skeleton.tsx  card.tsx
src/content/         achievements.ts  education.ts  experience.ts  hero.ts  showcase.ts  skills.ts
                     workflow.ts  contact.ts
src/hooks/           useGithubRepos.ts  useGithubResource.ts(+test)  useMinuteTick.ts(+test)
src/lib/             github.ts(+test)  guards.ts  time.ts  anchors.ts(+test)
```
Also remove from kept files: `formatLocalTime` re-export and the `MailTemplate` parameter type in
`components/contact/contact.ts` (`mailtoHref(email)` keeps an optional `{ subject?, body? }` inline type);
`projectGridClass` from `lib/styles.ts`; `relativeTime`, `formatYearMonth`, `formatPeriod` from `lib/utils.ts` if
nothing imports them (and their tests).
Do not regenerate or re-add anything under `ui/`.
The Radix accordion import disappears with `accordion.tsx`; `radix-ui` stays (Button uses `Slot`).

### 9.2 Create
| Path | Purpose | Contract |
|---|---|---|
| `src/components/hero/contracts.ts` | Shared hero types, pasted verbatim from 9.4 | types only |
| `src/components/hero/sim.ts` | Topology, scenarios, `compile`, `frameAt`. Pure, no DOM | `frameAt(tMs: number): Frame`; `STILL_T_MS`; `SCENARIOS`; `SEQUENCE`; `compile(s: Scenario): Timeline` |
| `src/components/hero/geometry.ts` | The two layouts and polyline maths. Pure | `LAYOUTS: Record<LayoutId, DiagramLayout>`; `pointAt(points: readonly Point[], t: number): Point`; `pointOnEdge(layout, from, to, progress): Point` |
| `src/components/hero/rain.ts` | Column state and sizing. Pure, `rand` injected | `rainConfig(w, h): RainConfig`; `createColumns(cfg, rand): RainColumns`; `stepColumns(cols, cfg, rand, boost?): number[]`; `canvasScale(w, h, dpr): number`; `seeded(seed: number): () => number` |
| `src/components/hero/typing.ts` | `typedLength(elapsedMs, total, msPerChar): number`; `useTypewriter(text, opts): { count: number; done: boolean }` | `opts: { msPerChar?: number; startDelayMs?: number; instant: boolean }` |
| `src/components/hero/useFrameLoop.ts` | Section 4.8 | `useFrameLoop(onFrame: (tMs: number, dtMs: number) => void, opts: { target: RefObject<Element \| null>; paused: boolean; startDelayMs?: number }): void` |
| `src/components/hero/BinaryRain.tsx` | Canvas layer | `interface BinaryRainProps { ref: Ref<FrameHandle>; still: boolean; pointerX?: RefObject<number \| null>; className?: string }` |
| `src/components/hero/SystemDiagram.tsx` | SVG, packet pool, applies frames imperatively, owns the log state | `interface SystemDiagramProps { ref: Ref<FrameHandle>; still: boolean; className?: string }` |
| `src/components/hero/DiagramNode.tsx` | One node (box or client circle), label, sub-label, tag slot | `interface DiagramNodeProps { id: NodeId; center: Point; size: { w: number; h: number }; fontSize: number }` |
| `src/components/hero/TraceLog.tsx` | The log lines | `interface TraceLogProps { lines: readonly LogLine[]; max: 2 \| 3; className?: string }` |
| `src/components/hero/TerminalLine.tsx` | Section 4.3 | `interface TerminalLineProps { text: string; instant: boolean; className?: string }` |
| `src/components/hero/MotionToggle.tsx` | Pause button | `interface MotionToggleProps { paused: boolean; onToggle: () => void }` |
| `src/components/hero/ScrollCue.tsx` | Section 4.7 | no props |
| `src/components/projects/ProjectCard.tsx` | Section 8.2 | `interface ProjectCardProps { project: Project }` |
| `src/components/shared/ResumeLink.tsx` | New-tab link to `profile.resumeUrl`; returns `null` when it is null | `interface ResumeLinkProps { className?: string; children: ReactNode }` |
| `src/lib/motion.ts` | `prefersReducedMotion(): boolean` (moved from `components/pipeline/motionPreference.ts`) | |
| Tests | `sim.test.ts`, `geometry.test.ts`, `rain.test.ts`, `typing.test.ts`, `useFrameLoop.test.ts`, `SystemDiagram.test.tsx`, `TerminalLine.test.tsx`, `ProjectCard.test.tsx`, `ProjectsSection.test.tsx`, `ResumeLink.test.tsx`, `ContactSection.test.tsx` | see 9.5 |

### 9.3 Modify
| Path | Change |
|---|---|
| `src/index.css` | Section 2.2 additions and removals |
| `src/types/content.ts` | `Project` per 8.1; `Profile` drops `lead`, `summary`, `location`, `city`, `timeZone`, adds `tagline: string`; `SectionId = 'hero' \| 'projects' \| 'contact'`; `SocialId = 'github' \| 'linkedin' \| 'email'`; delete every type no longer referenced |
| `src/content/profile.ts` | Add `tagline` (4.3); drop removed fields; keep the reversed-email mechanism and `resumeUrl: null` |
| `src/content/projects.ts` | Replace with 8.1 |
| `src/content/socials.ts` | GitHub, LinkedIn (`https://www.linkedin.com/in/chandiimanpreet/`), email. No placeholders |
| `src/content/nav.ts` | `hero` (not in nav), `projects`, `contact` |
| `src/content/content.test.ts` | Keep: phone test, email test, section ids, theme-color. Replace the rest with: every `repoUrl` passes `safeUrl(_, GITHUB_LINK_HOSTS)`; every `liveUrl` passes `safeUrl`; project ids unique; `stack.length <= 6`; `resumeUrl` is null or starts with `/resume/` and ends in `.pdf`; socials are https or mailto; `tagline` does not start with `$` |
| `src/App.tsx`, `src/App.test.tsx` | Three sections; test contract unchanged |
| `src/components/layout/Layout.tsx` | Remove `Rail` and `pl-rail`; `<main id="main" tabIndex={-1} className="outline-none">` (sections own their width) |
| `src/components/layout/Section.tsx` | `interface SectionProps extends Omit<ComponentProps<'section'>, 'id' \| 'title'> { id: SectionId; eyebrow: string; title: ReactNode }`. Renders `<section id aria-labelledby class="reveal mx-auto w-full max-w-content px-gutter py-section">`, the eyebrow as `<p aria-hidden class="font-mono text-code text-muted-foreground">`, then the h2 (`mt-3 font-display text-h2`). No rail, fork or aside |
| `src/components/layout/SiteHeader.tsx`, `header/NavLink.tsx`, `header/header.test.tsx` | Section 8.4 |
| `src/components/layout/SiteFooter.tsx` (+ test) | Section 8.5 |
| `src/components/shared/ExternalLink.tsx` (+ test) | Add `newTab?: boolean`: sets `target="_blank"` and appends `<span class="sr-only"> (opens in a new tab)</span>`. `rel="noopener noreferrer"` stays unconditional |
| `src/components/contact/contact.ts` (+ test) | Trim as in 9.1 |
| `src/lib/styles.ts` | Remove `projectGridClass` |
| `src/sections/HeroSection.tsx`, `ProjectsSection.tsx`, `ContactSection.tsx` | Rewrite per sections 4, 8.2, 8.3 |
| `CONTRIBUTING.md`, `docs/SECURITY.md`, `docs/AGENT-BRIEF.md` | WP8: point "Visual design" at this file; update the folder map; note that links may open in a new tab, that no GitHub API call is made, and the simulated-readout exemption (5.7) |

Not modified: `vite.config.ts` (CSP stays exactly as is), `index.html`, `public/*`, CI, `package.json`
(no dependency added; none removed in this pass).

### 9.4 Shared contracts (paste into `src/components/hero/contracts.ts`)
```ts
export type NodeId =
  'client' | 'gateway' | 'auth' | 'api' | 'cache' | 'db' | 'queue' | 'worker' | 'workflow' | 'agent'
export type EdgeId = `${NodeId}-${NodeId}`
export type NodeState = 'idle' | 'active' | 'ok' | 'failed' | 'backoff'
export type PacketKind = 'request' | 'response' | 'event' | 'retry'
export type ScenarioId = 'cache-hit' | 'cache-miss' | 'enqueue' | 'workflow-retry'
export type LayoutId = 'wide' | 'tall'

export interface Point { x: number; y: number }

export interface DiagramLayout {
  viewBox: { w: number; h: number }
  box: { w: number; h: number }
  fontSize: number
  nodes: Record<NodeId, Point>
  /** Polyline per edge, in the direction of the id (`from-to`). Reverse travel uses 1 - progress. */
  edges: Partial<Record<EdgeId, readonly Point[]>>
}

/** One hop of one track. Times are filled in by compile(). */
export interface Hop {
  to: NodeId
  kind: PacketKind
  /** Work on arrival in ms. 0 = pass through. Defaults to the node's work time for non-response hops. */
  work?: number
  /** State the node shows while working (default 'active') and the state it flashes after. */
  result?: 'ok' | 'failed'
  /** Tag shown on the node while it works. */
  tag?: string
  /** Extra states held at the node after work, before the next hop leaves (fail hold, backoff). */
  holds?: readonly { state: NodeState; ms: number; tag?: string }[]
}
export interface Track { from: NodeId; hops: readonly Hop[]; forkFrom?: { track: number; afterHop: number } }
export interface Scenario { id: ScenarioId; tracks: readonly Track[] }

export interface Segment { from: NodeId; to: NodeId; kind: PacketKind; startMs: number; endMs: number; track: number }
export interface Pulse { node: NodeId; state: NodeState; startMs: number; endMs: number; tag?: string }
export interface LogEvent { atMs: number; kind: 'response' | 'failed' | 'completed' }
export interface Timeline { durationMs: number; segments: readonly Segment[]; pulses: readonly Pulse[]; events: readonly LogEvent[] }

export interface PacketFrame { key: string; from: NodeId; to: NodeId; progress: number; kind: PacketKind }
export interface LogLine { key: string; traceId: string; text: string; status?: string; tone: 'info' | 'ok' | 'failed' }
export interface Frame {
  packets: readonly PacketFrame[]
  nodes: Record<NodeId, NodeState>
  tags: Partial<Record<NodeId, string>>
  /** Edges that currently carry a packet. */
  edges: readonly EdgeId[]
  /** Oldest first; at most 3. */
  log: readonly LogLine[]
}

/** What the frame loop drives. Implemented by BinaryRain and SystemDiagram via useImperativeHandle. */
export interface FrameHandle { frame(tMs: number, dtMs: number): void }
```
`frameAt` must be a pure function of `tMs` (no module state, no `Math.random`, no `Date`): the same input always
returns the same frame. `SystemDiagram` diffs each frame against the previous one and touches the DOM only for
what changed; it calls `setState` only when `frame.log.at(-1)?.key` changes.

### 9.5 Work packages
WP1 runs first and alone. WP2 to WP7 then run in parallel; each touches only its own files. WP8 is the coordinator.
Scoped verification per `docs/AGENT-BRIEF.md` (typecheck, eslint and vitest on own files only).

| WP | Owner files | Depends on | Tests to write |
|---|---|---|---|
| **1 Foundation and demolition** | Everything in 9.1; `index.css`, `types/content.ts`, `content/*`, `content.test.ts`, `App.tsx`, `App.test.tsx`, `Layout.tsx`, `Section.tsx`, `ExternalLink.tsx`(+test), `ResumeLink.tsx`(+test), `lib/motion.ts`, `lib/styles.ts`, `lib/utils.ts`, `components/contact/contact.ts`(+test), `hero/contracts.ts`. Also creates **signature-only stubs** (correct exports and props, render `null` / return an empty frame) for every other file in 9.2 and three minimal section files with the right `id`, heading and `aria-labelledby`, so the repo typechecks, lints, tests and builds green before anyone else starts | none | Updated content test (9.3); `ExternalLink` with `newTab` has `target="_blank"`, `rel` and the sr-only hint; `ResumeLink` renders nothing for null and a new-tab link for a path; App test passes with three sections |
| **2 Simulation core** | `hero/sim.ts`, `hero/geometry.ts`, `sim.test.ts`, `geometry.test.ts` | WP1 | Each scenario compiles to the length in 5.5 (2880, 3800, 4080, 7900); every segment's edge exists in **both** layouts; `frameAt` is deterministic and never returns more than 8 packets across `0..40000` step 50; `workflow-retry` produces `failed` then `backoff` then `ok` on the workflow, in that order; `frameAt(STILL_T_MS)` has a `retry` packet, `nodes.api === 'active'`, `tags.workflow === 'attempt 2'`; log has at most 3 lines; `pointAt` returns the ends at 0 and 1 and the corner of an L-shaped polyline at the right fraction |
| **3 Binary rain** | `hero/rain.ts`, `rain.test.ts`, `hero/BinaryRain.tsx` | WP1 | `rainConfig`: cell 14 below 640 and 16 above, columns never above 120; `canvasScale` never above 2 and never above the 4,000,000 pixel cap; with a seeded `rand`, `stepColumns` is deterministic, heads only move down, a column past the bottom restarts above the top, `boost` multiplies speed |
| **4 System diagram** | `hero/SystemDiagram.tsx`, `hero/DiagramNode.tsx`, `hero/TraceLog.tsx`, `SystemDiagram.test.tsx` | WP1 (codes against 9.4; integrates with WP2 at merge) | Renders 10 nodes and 10 edges for each layout; root is `aria-hidden` and contains no focusable element; `still` renders the still frame without a frame call; calling `frame()` twice with the same time performs no DOM writes the second time (spy on `setAttribute`); `TraceLog` shows at most `max` lines |
| **5 Hero shell** | `sections/HeroSection.tsx`, `hero/TerminalLine.tsx`, `hero/typing.ts`, `hero/useFrameLoop.ts`, `hero/MotionToggle.tsx`, `hero/ScrollCue.tsx`, `typing.test.ts`, `useFrameLoop.test.ts`, `TerminalLine.test.tsx` | WP1 (stubs for rain and diagram) | `typedLength` clamps to `0..total`; `TerminalLine`: the sr-only span holds the full text on first render, the visual copy is `aria-hidden`, `instant` shows everything with no timer (fake timers); `useFrameLoop`: no frames while `document.hidden`, while paused, or before `startDelayMs`; `dtMs` never above 100; cancels on unmount. Hero: one h1, Resume absent when `resumeUrl` is null, figcaption text equals 5.9, toggle flips `data-paused` and `aria-pressed` |
| **6 Projects** | `sections/ProjectsSection.tsx`, `components/projects/ProjectCard.tsx`, `ProjectCard.test.tsx`, `ProjectsSection.test.tsx` | WP1 | Card link has the repo href, `target="_blank"`, `rel="noopener noreferrer"`; a `javascript:` repoUrl renders no link; Live link only with `liveUrl`; placeholder shows "coming soon" and no stack list; section renders one card per project and the empty-state line for `[]`; hostile `name` text renders literally |
| **7 Contact and chrome** | `sections/ContactSection.tsx`, `layout/SiteHeader.tsx`, `layout/header/NavLink.tsx`, `layout/header/header.test.tsx`, `layout/SiteFooter.tsx`(+test), `ContactSection.test.tsx`; deletes `contact/LocalTime.tsx`, `contact/MailtoTemplates.tsx` if WP1 left them | WP1 | Email link is `mailto:` + `profile.email`; GitHub and LinkedIn links open in a new tab with the exact URLs in 8.3; no `tel:` link and no digit run of 10 in the rendered page; header has exactly two nav links plus Resume only when set; no `<dialog>` or menu button; footer has "Back to top" |
| **8 Integration and QA (coordinator)** | `CONTRIBUTING.md`, `docs/SECURITY.md`, `docs/AGENT-BRIEF.md`; no `src/` files except conflict fixes agreed with the owner package | WP2 to WP7 | `npm run typecheck && npm run lint && npm test && npm run build && sh scripts/check-dist.sh`; bundle sizes against section 10; the browser checklist in section 10; a grep that no deleted module is still imported |

---

## 10. Acceptance checklist (coordinator, in a browser, on `npm run build && npm run preview`)

**Visual**
- [ ] Dark by default; the toggle switches to light and back with no flash on reload; rain and diagram re-colour.
- [ ] 1440x900: hero is exactly one viewport; text left, diagram right; rain clearly visible on the right, barely under the text.
- [ ] 360x740: name, role, prompt, both buttons above the fold; top of the diagram visible; tall layout; labels readable.
- [ ] 320px wide: no horizontal scroll anywhere; header shows MS, Projects, Contact, toggle on one row.
- [ ] 768 and 1024: one-column hero with the wide diagram no wider than 42rem.
- [ ] Within 15s of load you see: a cache hit, a cache miss going to the database, a 202 that forks to the queue, and a failed agent call followed by backoff and a successful retry. Nodes light while working; the trace log updates.
- [ ] The prompt types once, wraps without shifting anything, and the caret stops blinking after about 10s.
- [ ] No rail, no blobs, no glow, no uppercase headings, no hex colours in component files (`grep -rnE '#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(' src --include=*.tsx` is empty).
- [ ] Project cards: three placeholders with dashed borders; hover lifts 4px and draws the top line; click opens `github.com/chandiimanpreet` in a new tab.
- [ ] Setting `resumeUrl` to a test path makes "Resume" appear in the hero and header and open in a new tab; setting it back to null removes both with no gap.

**Accessibility**
- [ ] `prefers-reduced-motion: reduce`: nothing moves anywhere; the rain is a still texture; the diagram shows the retry still frame; the prompt is fully typed; no Pause button; sections do not fade.
- [ ] Pause button stops rain, packets, caret and scroll cue at once; Play resumes without a jump. Keyboard operable, name "Pause animation", `aria-pressed` reflects state.
- [ ] Screen reader pass (VoiceOver or NVDA): hero reads "Manpreet Singh, heading level 1", "Backend Engineer", the prompt sentence once (no "$", no character-by-character), the buttons, the Pause button, then the figure description from 5.9. Nothing from the SVG or trace log is read. Nothing is announced on its own afterwards.
- [ ] Tab order: skip link, MS, Projects, Contact, (Resume), theme toggle, View projects, (Resume), Pause, card 1 (then its Live link if any), card 2, card 3, email, Copy, GitHub, LinkedIn, Back to top. Focus ring always visible, including on cards.
- [ ] Every new-tab link's accessible name ends with "(opens in a new tab)".
- [ ] axe (or Lighthouse accessibility) reports 0 violations in both themes; Lighthouse accessibility at least 95.
- [ ] Contrast spot checks with a picker over the brightest rain glyph behind the prompt text: at least 4.5:1 in both themes.
- [ ] 200% zoom at 1280 wide: no clipped text, no overlap between trace log and nodes.
- [ ] Forced colours (Windows high contrast): text, buttons, card borders and focus remain visible; the decoration may disappear.

**Performance**
- [ ] `vite build` output: total initial JS at most **95 kB gzip** (and lower than before V3); CSS at most **15 kB gzip**; new hero code (sim, geometry, rain, components) at most **6 kB gzip**.
- [ ] Chrome Performance, 10s recording on the hero at 1440x900: no long tasks; scripting per frame under **2ms** on average, under **4ms** at 4x CPU throttle; no "Recalculate style" or "Layout" entries caused by the frame loop (only paint and composite).
- [ ] Rain repaints at about 20Hz, not 60; backing store never above 4,000,000 pixels (log `canvas.width * canvas.height` once in dev).
- [ ] Exactly one `requestAnimationFrame` chain (`grep -rn requestAnimationFrame src` shows `useFrameLoop.ts` only).
- [ ] Scroll the hero out of view: the loop stops (Performance monitor CPU drops to idle). Switch tabs for 30s and return: no burst of catch-up motion.
- [ ] CLS 0 on load in both layouts; Lighthouse performance at least 95 on mobile emulation.
- [ ] Network tab: no request to `api.github.com` or any third-party host.

**Security**
- [ ] Zero CSP violations in the console in both themes, on load, on toggle, on Pause, on Copy. CSP meta is unchanged and first in `<head>`.
- [ ] `sh scripts/check-dist.sh` passes (no inline script, no data: fonts, no phone pattern, no email literal, no third-party script).
- [ ] `grep -rn 'target="_blank"' src` hits only `ExternalLink.tsx` and `ResumeLink.tsx`, both with `rel="noopener noreferrer"`.
- [ ] `grep -rnE 'dangerouslySetInnerHTML|innerHTML|insertAdjacentHTML' src` is empty (the diagram sets `textContent` and attributes only).
- [ ] Every `repoUrl` and `liveUrl` reaches the DOM through `ExternalLink` (so through `safeUrl`); a bad URL in `projects.ts` renders text, not a link.
- [ ] No phone number, no `tel:`; the email appears only at runtime; `ls public/*.pdf public/resume 2>/dev/null` is empty until the owner supplies a redacted file.
- [ ] No "AI engineer" wording anywhere: `grep -rniE 'ai (backend )?engineer' src index.html` is empty.

---

## 11. Open questions for the owner

1. **Illustrative latency in the trace log.** The log shows values such as "3 ms" inside a figure labelled
   "simulated traffic". They make the system feel real, but they are not measurements. Keep them (default), or
   drop the numbers and keep only method, path, status and outcome?
2. **Tech names in the diagram.** Nodes use generic roles (cache, queue, database, workflow). Your resume lists
   Redis, MongoDB and Temporal, but not which one plays which role in a single system, so nothing is named by
   default. Do you want sub-labels such as `temporal` under workflow, `redis` under cache and `mongodb` under
   database? Say which mapping is true.
3. **Resume PDF.** The button appears as soon as `profile.resumeUrl` is set. The file must be a copy **without the
   phone number**, metadata stripped, saved as `public/resume/Manpreet-Singh-Resume.pdf`. Can you supply it?
4. **Placeholder cards.** Ship now with three "coming soon" slots that open your GitHub profile (default), or hold
   the Projects section back until at least one real repository is ready?

---

## V3 amendments (owner decisions and QA pass, after the first build)

- **Background:** the 0/1 rain is retired and replaced by the trace field (`docs/DESIGN-V3-BACKGROUND.md` section 4):
  span waterfalls of the diagram's own runs, rising, each ending in its status code (from 640px), with one dim
  coral failure span per 13.2 s cycle synchronised to the agent failure. `BinaryRain.tsx` and `rain.ts` are deleted;
  `--rain` / `--rain-head` stay and `--trace-fail` is added. Section 6 no longer applies.
- **Trace log lines (5.6) are shorter** so the whole line fits at 320px: `{id} GET /v1/jobs/{n} 200 hit {ms}ms`
  (or `miss`), `{id} POST /v1/jobs 202 queued {ms}ms`, `{id} job attempt 1 failed, retrying`,
  `{id} job completed` / `{id} job attempt 2 completed`.
- **Diagram (QA pass):** label size 10 / 10.5 units; wide trace log up to 62% of the figure width; tall trace log
  at 12px; tag sides: tall cache left, queue below-right, workflow left, rate-limit below-left; wide agent tag left.
- **Hero (owner requests):** a "Core tools" chip row (`profile.stack.slice(0, 7)`) under the buttons; below `sm`
  the two buttons use `text-sm` and `px-4` so they share one row at 320px.
- **Contact** is centred, terminal-style (owner override of 8.3).
- **About** section exists.
- **Nav** is `/about`, `/projects`, `/resume`, `/contact`.
- **No theme toggle:** dark only.
- **Resume PDF ships** (`public/resume/`).
