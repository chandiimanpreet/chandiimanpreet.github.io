# DESIGN-BACKEND.md: backend addendum to DESIGN.md

A delta, not a rewrite. DESIGN.md stays the source of truth for palette, type, tokens, the branch rail and the fork. Where this file and DESIGN.md disagree, this file wins for the sections it names. Copy marked `[EDIT]` needs the owner; numbers are real or absent.

## 1. Rationale

**The rail says when. The request says what.** The git history stays as the page's spine (time, ordering, the people branch). On top of it we add one second idea: the site is a small read-only service, and it behaves like one where that is literally true. The profile really is JSON at a URL, so the hero shows that request. The page really has a load time and a rate-limited upstream, so the footer reports them. Nothing is simulated.

One test for every element: **would a backend engineer call it a lie?** A fake hash, a fake latency, a curl that points nowhere and an "uptime 99.99%" badge all fail. A measured `fetch`, the real `pushed_at`, and a diagram of a system that exists all pass.

Second test: **can a recruiter read it without the metaphor?** Every machine-shaped block has a plain-English line next to it (diagram caption, legend, "Chose X over Y because Z"). The h1, lead and CTA stay exactly as dominant as before.

Use: request/response, service diagrams as request paths, health checks, stack layers, changelogs, trade-off records. Reject: terminal windows with traffic-light dots, typed/blinking prompts, matrix rain, `sudo` / `rm -rf` / "it works on my machine" jokes, fake boot logs, ASCII-art banners, green-on-black, neon grids, server-rack illustrations, spinning globes, invented uptime or request counters, skill bars, "microservices" buzzword clouds.

Rule changes to DESIGN.md section 1:
- Monospace still means machine facts. The list of machine facts grows: request lines, JSON, status codes, measured values, protocol labels on arrows.
- A **request line** (`GET /path`) appears in exactly three places: hero, contact, footer health. Never as a section eyebrow; headings stay plain sentences.
- Saffron keeps its three jobs. Diagrams, JSON and health use `--text`, `--text-muted`, `--border-strong`; `--ok` / `--danger` only for real status. No new hues.
- Section shapes: Projects stays **rows** (each row can now open), Skills stays **running text** (now ordered as layers), Experience is a **changelog list** on the rail.

## 2. Ideas

### A. Hero: the profile as a real request  (modifies Hero, replaces the 200px avatar slot)

```
o-- 7c1e4a2 (HEAD -> main)  ● Open to backend roles  Chandigarh 14:32
|   (avatar 72px)                    +------------------------------------------+
|   Manpreet                         | GET /data/profile.json   [Run] [Copy curl]|
|   Singh                            | 200 OK · 41 ms · 1.8 kB · just now        |
|   Backend engineer. I build ...    | {                                        |
|   [ See my projects ]  GitHub ->   |   "name": "Manpreet Singh",              |
|   12 public repos · ...            |   "role": "Backend engineer",            |
|                                    |   "builds": ["APIs", "services", ...],   |
|                                    |   "city": "Chandigarh",                  |
|                                    |   "status": "Open to backend roles",     |
|                                    |   "email": "you@example.com"             |
|                                    | }                                        |
|                                    | 6 of 14 fields · Open raw                |
|                                    +------------------------------------------+
```

- The panel is a `<figure>`: `--surface`, 1px `--border`, `--r-md`, no header chrome, no dots.
- The path shown is the true path (`config.paths.profile`). The body is the real response, projected to `config.heroFields` (`name, role, builds, city, status, email`). The footer line says how many fields were left out and links to the raw file. Keys shown are the file's real keys; do not rename them for display.
- JSON colouring: keys and punctuation `--text-muted`, values `--text`, `email` and URL values are real links (`--accent`). Built with `el()` and `textContent`, in `<pre><code>`.
- On load: the panel shows the timing of the profile fetch the page makes anyway.
- **Run**: refetches with `cache: 'no-store'`, measures `performance.now()` around fetch + `text()`, byte size from `TextEncoder`. Not throttled, not faked, no minimum delay.
- **Copy curl**: copies `curl -s <absolute URL of profile.json>` built from `location`. It works.

| State | Status line | Body | Run button |
|---|---|---|---|
| No JS | hidden | hidden; "Open raw" link remains | hidden |
| Loading | "Sending" | 6 skeleton lines | disabled, `aria-busy` |
| OK | `200 OK` in `--ok`, then `41 ms · 1.8 kB · just now` | JSON | "Run" |
| In flight (replay) | "Sending" | previous JSON at 0.5 opacity | disabled |
| Failed | `Failed` in `--danger` + "You look offline. The copy on the left is still correct." | previous JSON or empty | "Retry" |

Copy changes `[EDIT]`: lead becomes "Backend engineer. I build APIs and services that stay fast under load and boring to operate." Status: "Open to backend roles".

- A11y: `figcaption` (visually hidden) "My profile as the JSON this site serves". Result is announced through the existing `role="status"` line: "Response received in 41 ms". Run and Copy are real `<button>`s, 44px targets. No typing effect; the body swaps in.
- Mobile: avatar and text first, panel full width under the proof line, `overflow-x: auto` on the `<pre>` only, `white-space: pre-wrap` so 320px never scrolls the page.

### B. Projects: rows that open into service records  (modifies Projects)

The row is unchanged. When a project has `architecture`, `metrics` or `tradeoffs`, the `<li>` gets a second child: a native `<details class="service">` with summary "How it works". First curated project is `open` by default. Curated projects (those in `profile.json`) sort before other GitHub repos, in file order; `projects.js` merges the curated entry into the API item by `name` (already needed for `outcome`).

Inside, in this order:

1. **Request path diagram** (`figure.arch`). One or more *flows*; each flow is an `<ol>` of boxes read left to right, joined by CSS arrows. No graph layout, no SVG, no canvas.

```
Request path
[ Mobile app ] --HTTPS--> [ API gateway ] --gRPC--> [ Orders service ] --SQL--> [ Orders DB ]
   client                    edge · Nginx              service · Go               database · Postgres
After the response (async)
[ Orders service ] - -publishes- -> ( Order events ) - -consumes- -> [ Invoice worker ] --> [ S3 ]
```
   - Box: 1px border, `--r-sm`, name in body 500, second line `kind · tech` in mono muted.
   - Meaning is carried by border, always backed by the text label: solid `--text` border = I built it (`mine: true`); dashed `--border-strong` = someone else's system; `kind: queue` uses `--r-full`; `kind: store` has a double bottom border.
   - Arrow: `li + li::before`, a `--border-strong` line with a CSS chevron; the `via` label ("gRPC") sits on it in mono. Flows with `async: true` use a dashed line.
   - Caption (visible `figcaption`, body): `architecture.summary`, one or two plain sentences. Legend line under it, only for marks actually used: "Solid: built by me. Dashed box: external. Dashed arrow: asynchronous."
   - Limits: max 3 flows, max 6 steps each. More than that means the diagram is wrong.
2. **Numbers** (`dl.service__metrics`): up to 4, value in mono `--fs-h3`, label muted, optional source in `--fs-small` ("k6 load test, Mar 2026"). No source, no number.
3. **Facts** (`dl.service__facts`): My part / Stack / Trade-offs / What I'd change. Trade-off sentence template: "Chose **{chose}** over {over}: {because}." "What I'd change" is one honest paragraph; it is the most senior line on the page.

- A11y: the diagram *is* its text alternative: ordered lists with `aria-label` = flow label; `via` text precedes the node name in DOM order so it reads "HTTPS, API gateway, edge, Nginx". Arrows are generated content. Works in forced-colors (all borders). `<details>` gives keyboard and no-JS behaviour for free.
- Motion: none required. Optional: arrows `scaleX(0 -> 1)` once on `toggle`, `--dur-2` (already 0 under reduced motion). No travelling dots, no looping "packets".
- Mobile: `.arch` is a size container; under `34rem` each flow turns vertical (boxes full width, arrows point down, `via` label beside the arrow). Metrics become a 2-column grid.

### C. Skills as stack layers  (modifies About; data only)

Same `<dl>` running text, no pills. The groups change and their order now means something: top to bottom is the path a request takes. Empty layers are not rendered; claiming "Observability" with nothing in it is worse than leaving it out.

```
Languages         Go · Python · SQL · TypeScript                 [EDIT all]
APIs              REST · gRPC · Node.js · FastAPI
Data              PostgreSQL · Redis
Messaging         Kafka · RabbitMQ
Infrastructure    Docker · Kubernetes · AWS · GitHub Actions
Observability     Prometheus · Grafana · OpenTelemetry
```
- Hairline between rows so it reads as a stack. Label column fixed at `9rem` on desktop.
- Proof: a skill that appears in any `projects[].stack` becomes a link to that project row (`#project-{name}`), title "Used in orders-api". Skills with no project stay plain text. Derived, no extra data.
- Mobile: label above its items, same order.

### D. Health block  (modifies Footer; the rail's last node)

```
o   GET /health                                     All checks passing
    last push      3 days ago, orders-api
    this page      ready in 380 ms · 84 kB · 9 requests · 0 dependencies
    github data    live · 46 of 60 API calls left this hour
    Built by Manpreet Singh with plain HTML, CSS and JavaScript.   Source   Back to top
```
Every row is measured in the visitor's browser or read from GitHub. A row with no data is omitted, never guessed.

| Row | Source | Variants |
|---|---|---|
| last push | newest `pushedAt` in the repos already fetched | omitted when no public repos or API failed |
| this page | Navigation Timing (`domContentLoadedEventEnd`) + sum of `transferSize`, read after `load` | "served from your browser cache" when transfer size is 0 |
| github data | cache state + `x-ratelimit-remaining` from responses already made | "cached 12 min ago" / "saved list, rate limit reached, resets 15:10" |

- Summary: "All checks passing" (`--ok` dot) or "Degraded: showing saved GitHub data" (hollow `--text-muted` dot). Degraded is not styled as an error; it is the design working.
- No uptime percentage, no visitor counter, no build hash we cannot verify.
- A11y: `<h2 class="visually-hidden">Site status</h2>` + `<dl>`. Dot always has its text. Not a live region (values settle once). Mobile: key above value.

### E. Contact as `POST /contact`  (modifies Contact)

There is no backend, so there is no fake endpoint. The request is real and its transport is email:

```
POST /contact                                       transport: your mail app
[ Hiring for a role ]  [ Want to collaborate ]  [ Question about a project ]
you@example.com [ Copy ]      It is 02:10 for me. I reply within two days.
```
- Each template is a `mailto:` link with `subject` and a short body skeleton ("Role: / Team: / Stack: / Link to the job description:"). Outline-button style.
- After a click or copy, the status line reads `202 Accepted · your mail app has it from here` (202 is accurate: handed off, not delivered).
- Local-time sentence reuses the hero clock; no "asleep/awake" guessing.
- **curl**: rendered only if `profile.contact.endpoint` exists (a real form endpoint the owner adds later). Then show `curl -X POST {endpoint} -d 'email=..' -d 'message=..'` with a Copy button. Until then, no curl here; the working curl lives in the hero.
- A11y: plain links and one button; nothing new. Mobile: templates stack, full width.

### F. Experience as a changelog  (new section `#experience`, between About and Projects)

h2: "Changelog". Intro: "Where I have worked, written the way I write release notes." Newest first. Each entry hangs off the main rail on a small node (8px, `--border-strong`).

```
o   2023 to now    Backend engineer, Acme Payments                      [EDIT all]
|   Added     Idempotency keys on the payments API; duplicate charges went to zero.
|   Changed   Moved report generation from request time to a queue; p95 4.1s to 220ms.
|   Removed   A nightly cron that paged someone twice a week.
```
- Period in mono; role and org as h3; change type as a fixed-width body 600 word (Added / Changed / Fixed / Removed), text in body. Word, not a coloured badge.
- Section and nav link ("Experience") are not rendered when `experience` is empty.
- A11y: `<ol>` of `<article>`, `<time datetime>`, changes as a `<dl>`. Small nodes are generated content. Mobile: period on its own line, type word above its text.

## 3. CONTRACT.md additions (append as is)

```
## Backend addendum (DESIGN-BACKEND.md)
Mount points:
| `hero-response` | `<figure class="response">` in hero | request panel; static markup holds the request line, buttons and "Open raw" link |
| `response-status` | `<p>` inside it | status line, textContent only |
| `response-body` | `<pre><code>` inside it | JSON projection of profile.json |
| `response-run`, `response-curl` | `<button>` | replay the request / copy the curl command |
| `experience-list` | `<ol class="changelog">` in `section#experience[data-rail-node]` | `.changelog__entry` items; JS sets `hidden` on the section and its nav link when empty |
| `health-mount` | `<dl class="health">` in footer | `.health__row` items |
| `health-summary` | `<p>` in footer | summary text; JS sets `data-state="ok|degraded"` |
| `contact-templates` | `<ul>` in contact | `li > a.btn.btn--outline` mailto links |
| `contact-status` | `<p role="status">` | "202 Accepted" line |
Classes emitted by JS:
- Response: `.response` gets `is-loading|is-ok|is-error`; body spans `span.json__key`, `span.json__str`, `span.json__punct`, `a.json__link`.
- Service record: `li.project-row` gets `id="project-{name}"` and an optional second child `details.service` > `summary.service__summary`, `figure.arch`, `dl.service__metrics`, `dl.service__facts`.
- Diagram: `figure.arch` > `p.arch__label` + `ol.arch__flow` (modifier `arch__flow--async`) per flow, then `figcaption.arch__caption`, `p.arch__legend`. Step: `li.arch__step` > `span.arch__via` (optional, first in DOM), `span.arch__node` (modifiers `arch__node--mine`, `arch__node--queue|store|service|edge|client|external`) > `span.arch__name`, `span.arch__kind`.
- Metrics: `div.metric` > `dt.metric__label`, `dd.metric__value`, `dd.metric__source` (optional).
- Skill proof: `a.skill-group__proof` inside `p.skill-group__items`.
- Health: `div.health__row` > `dt`, `dd`.
- Changelog: `li.changelog__entry` > `article` > `p.changelog__period` > `time`, `h3.changelog__role`, `dl.changelog__changes` > `dt.changelog__type`, `dd`.
```

## 4. `data/profile.json` additions

All additive; existing keys keep working.

```json
{
  "role": "Backend engineer",
  "builds": ["APIs", "services", "data pipelines"],
  "city": "[EDIT]", "timeZone": "Asia/Kolkata", "status": "Open to backend roles", "email": "[EDIT]",
  "contact": { "templates": [{ "label": "Hiring for a role", "subject": "Backend role at ", "body": "Role:\nTeam:\nStack:\nLink:" }] },
  "skills": { "Languages": [], "APIs": [], "Data": [], "Messaging": [], "Infrastructure": [], "Observability": [] },
  "experience": [{
    "period": "2023 to now", "start": "2023-04", "role": "", "org": "", "url": null,
    "changes": [{ "type": "added", "text": "" }]
  }],
  "projects": [{
    "name": "orders-api", "description": "", "outcome": "", "tags": [], "url": null, "repo": "",
    "role": "Sole author",
    "stack": ["Go", "PostgreSQL", "Kafka"],
    "metrics": [{ "label": "p99 latency", "value": "180 ms", "source": "k6 load test, Mar 2026" }],
    "tradeoffs": [{ "chose": "PostgreSQL", "over": "DynamoDB", "because": "" }],
    "wouldChange": "",
    "architecture": {
      "summary": "A request comes in through the gateway, the orders service writes to Postgres and answers; invoices are generated afterwards from a queue.",
      "nodes": {
        "app": { "label": "Mobile app", "kind": "client" },
        "gw":  { "label": "API gateway", "kind": "edge", "tech": "Nginx" },
        "api": { "label": "Orders service", "kind": "service", "tech": "Go", "mine": true },
        "db":  { "label": "Orders DB", "kind": "store", "tech": "PostgreSQL", "mine": true },
        "q":   { "label": "Order events", "kind": "queue", "tech": "Kafka" }
      },
      "flows": [
        { "label": "Request path", "steps": [{ "node": "app" }, { "node": "gw", "via": "HTTPS" }, { "node": "api", "via": "gRPC" }, { "node": "db", "via": "SQL" }] },
        { "label": "After the response", "async": true, "steps": [{ "node": "api" }, { "node": "q", "via": "publishes" }] }
      ]
    }
  }]
}
```
- `kind` is one of `client | edge | service | queue | store | external`. `skills` key order is render order (object, as today). `config.js` gains `heroFields`.
- `tests/check.mjs`: add one check that every `steps[].node` exists in `nodes`, every trade-off has `chose`, `over`, `because`, and every metric has a `source`.
- `data/showcase.json` suggestion `[EDIT]`, backend-leaning: `["torvalds", "antirez", "mitchellh", "bradfitz", "kelseyhightower", "tj"]`.

## 5. Tokens (append to `:root` in tokens.css; no new colours)

```css
  --edge: var(--border-strong); --edge-len: 2.5rem; --node-min: 7rem; /* diagram arrows and boxes */
  --label-col: 9rem;  /* skills, health, changelog label column */
  --node-sm: 0.5rem;  /* changelog entry node on the rail */
```

## 6. Build order

| # | Item | Why now | Rough size |
|---|---|---|---|
| 1 | C. Skills layers + backend copy (lead, status, about, showcase seed) | Repositions the whole site; almost no code | data + ~15 lines JS |
| 2 | B. Service records with diagrams | The portfolio's actual substance; what a hiring engineer opens | ~90 JS, ~110 CSS |
| 3 | A. Hero request panel | First-screen identity; reuses the fetch that already exists | ~70 JS, ~60 CSS |
| 4 | D. Health block | Small, honest, memorable; needs `github.js` to expose rate-limit and cache state | ~50 JS, ~30 CSS |
| 5 | E. Contact templates | Cheap; improves the mail a recruiter actually sends | ~25 JS |
| 6 | F. Changelog | High value but blocked on owner content | ~40 JS, ~40 CSS |

Skip for now: the request palette (DESIGN.md already declined it for a one-page site; if the site grows it is a `<dialog>` on `/` filtering section anchors, about 50 lines); the contact curl (until a real endpoint exists); cross-highlighting a node shared by two flows; arrow draw animation; replacing the decorative hero hash with a real commit SHA (costs an API call; revisit with health).

Blocked on the owner: two or three real backend projects with a diagram, sourced numbers and one trade-off each. Item 2 ships empty without them, and placeholders there would be exactly the kind of lie this design is built to avoid.

## 7. Conflicts found while reading (not fixed here)

- `data/profile.json` on disk does not match DESIGN.md section 11: it has `tagline`, `bio`, `social[]`, lowercase skill keys and `repo`, and lacks `lead`, `about[]`, `status`, `city`, `timeZone`, `email`, `links`. Pick one shape before building A, C and E.
- CONTRACT.md says external links get `target="_blank"`; DESIGN.md section 9 says same tab. This addendum assumes DESIGN.md (same tab).
- `getProjects()` returns either GitHub repos or the manual list, never merged. B and the existing `outcome` line both need the merge by `name` described in B.
