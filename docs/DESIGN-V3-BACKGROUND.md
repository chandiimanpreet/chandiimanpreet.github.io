# DESIGN-V3-BACKGROUND.md: what moves behind the hero

Addendum to `docs/DESIGN-V3.md`. It answers the owner's question: "in background you are playing 0 and 1; what
else can we do in the background, from the backend engineer perspective?"

Scope: the hero background layer only (today: `BinaryRain.tsx` + `rain.ts`, DESIGN-V3 section 6). The system
diagram, the text column, the scrims and the frame loop stay as they are. Where section 4 of this file disagrees
with DESIGN-V3 section 6, this file wins once the owner approves it (section 5).

Constraints carried in: dark theme, Ink / Bone / Saffron / Steel, CSP `script-src 'self'`, no new dependency,
canvas 2D or SVG/CSS only, one `requestAnimationFrame` loop (`useFrameLoop`), pause when hidden, off-screen,
paused or reduced motion (still frame instead), at most 4 kB gzip of new JS per idea, text over it at 4.5:1 or
better, works at 320px, cheaper on mobile. Positioning: Backend Engineer; LLM agent work is one strength among
several. All gzip and per-frame figures below are design estimates, not measurements.

---

## 1. Diagnosis: what the 0/1 rain says

**What it says.** "This is a computer person." It gives depth and life cheaply, it recedes well behind text, and
the owner liked it in the reference.

**What it does not say.**
- Nothing about *backend*. Bits are the layer nobody on a backend team works at. A frontend developer, a security
  hobbyist and a crypto landing page all use the same rain. It is genre wallpaper (the film reference from 1999),
  not a picture of his work.
- Nothing about his actual skills. No request, no retry, no queue, no workflow, no deploy. The diagram in front
  tells a precise story (cache hit, miss, enqueue, a failed attempt retried by a durable workflow); the rain
  behind it tells none, so the two layers do not talk to each other.
- It is the reference's most recognisable feature. Recolouring it steel instead of cyan does not change the
  silhouette: falling mono glyphs. A visitor who has seen kakrottt.github.io will read ours as the same idea.
- Random glyphs are noise by construction. A backend engineer looking closely finds nothing to recognise, which
  fails the DESIGN-V3 "lie test" in a soft way: it is not false, it is just empty.

**What a better background must do.** Keep the three cheap layers (moving texture, scrim, content). Replace the
texture with something a backend engineer recognises within two seconds, that is *driven by the same simulated
system as the diagram*, and that has a different silhouette from falling glyphs.

---

## 2. Ten ideas

Resume ties use only what is in `docs/RESUME.md`: Go, Node.js/TypeScript, REST APIs, microservices,
event-driven backends, Temporal workflows with automatic retries and priority-tiered task queues (moved from
BullMQ/Redis queues), idempotent processing, SSE, MongoDB, Redis, AWS (EKS, EC2, ECS, S3), Kubernetes, Helm,
ArgoCD, Docker, GitHub Actions, Jenkins, Prometheus/Grafana deployments, LangGraph agents with LangSmith tracing.

Layer vocabulary used below: **field** = full-bleed canvas texture (replaces the rain; only one field can exist);
**widget** = a small corner element; **diagram** = a second node-and-edge picture (competes with the system map).

### 2.1 Trace field (span waterfall)  [field]
**Concept.** Every simulated request in the diagram leaves a distributed trace in the background: a small
waterfall of span bars that draws itself in real time, then drifts upward and fades.

**Viewer sees.** Two to five columns of staircase-shaped bar clusters in steel, slowly rising (about 19 px/s).
The newest cluster in each column is still being drawn: bars grow left to right with a bone tick at the leading
edge. About every 13 seconds one cluster shows a short coral bar (the failed attempt), a thin waiting line (the
backoff) and a second bar (the retry), at the same moment the diagram shows it. Density: 15 to 25 clusters on a
desktop hero, mostly rectangles, almost no text.

**Communicates.** Observability and distributed systems (he ships LangSmith-traced pipelines and Temporal
workflows), request paths through microservices, retries as a first-class thing. It is the telemetry of the
system drawn in front of it.

**Implementation.** One canvas. Data = the existing `compile()` timelines from `sim.ts` (pulses become spans).
The field is a pure function of the frame-loop time: `fieldAt(t)` returns blocks with position and age. Per
repaint (30 Hz): one background fill plus at most about 450 `fillRect` and 25 `fillText`. Under 0.5 ms.

**A11y / perf.** `aria-hidden`. Rectangles are easier on the eye behind text than glyphs. Still frame is
`fieldAt(STILL_T_MS)`, the same instant as the diagram's still frame.

**Risks.** Reads as "abstract bars" to non-engineers (acceptable: it still reads as calm texture). The coupling
to the diagram is subtle; few will notice it consciously.

**Cost.** About 1.6 kB gzip new; the rain it replaces is about the same, so roughly net zero.

```
        ▁▁▁▁▁▁▁▁▁▁▁▁▁▁ 200              (faded, near top)
         ▂▂  ▂▂  ▂▂▂ ▂▂

   ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁ 202
    ▃▃
       ▃▃▃
           ▃▃▃▃
               ▃▃▃
                   ▃▃▃▃▃
                        ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃     workflow
                           ▃▃▃▃▃▃ ░░░ ╌╌╌╌╌╌ ▃▃▃▃▃▃|   failed (coral), backoff, retry, live head
```

### 2.2 Status-code rain  [field]
**Concept.** Keep the falling columns but replace `0`/`1` with HTTP status codes; a rare `503` flashes coral,
freezes, and is replaced by a `200` one step later (a retry).

**Viewer sees.** The current rain with 3-character glyph groups (`200 201 202 204 304 404 429 503`), about 90%
2xx in steel, 4xx in ash, a 5xx every few seconds in coral that turns into a saffron `200`.

**Communicates.** REST APIs, error handling, retries, rate limiting (`429`).

**Implementation.** Reuse `rain.ts` column model; cell becomes 3 glyphs wide (so a third of the columns), a
weighted pick table, one extra per-cell state for the retry swap. Per step: the same `fillRect` plus about 45
`fillText`.

**A11y / perf.** Same as today. Three-digit groups are more "readable" than bits, so they pull the eye more.

**Risks.** Still the reference's silhouette (falling mono glyphs); a wall of numbers behind text is the worst
case for legibility; 4xx/5xx in a hero can read as "his services fail a lot".

**Cost.** About 0.3 kB gzip over the current rain.

```
 200   204       200   201
 200         404 200
 201   200       304   200
       200  [503]      202      <- coral, becomes 200 on the next step
 200         200       200
```

### 2.3 Production log tail  [field or widget]
**Concept.** `tail -f` on the simulated system: structured log lines scroll up the right half of the hero.

**Viewer sees.** Dim mono lines, newest at the bottom, pushed up one row every 400 to 900 ms:
`12:04:07.218 INFO  api      7f3a GET /v1/jobs/137 200`. Level word tinted (INFO steel, WARN saffron, ERROR
coral). Lines fade with height.

**Communicates.** Operating real services, request ids, structured logging; Node.js and Go service work.

**Implementation.** Canvas `fillText`, a ring buffer of about 60 strings generated from the sim's log events.
Per step about 60 `fillText` (only on a scroll step).

**A11y / perf.** `aria-hidden`. Text behind text is the hardest thing to keep legible; needs the strongest scrim.

**Risks.** Duplicates the existing trace log in the diagram (same content twice). Timestamps are invented
numbers. The reference and many "hacker" portfolios already have terminal text walls.

**Cost.** About 1.2 kB gzip.

```
                    12:04:06.911 INFO  gateway  22d0 POST /v1/jobs 202
                    12:04:07.218 INFO  api      7f3a GET /v1/jobs/137 200
                    12:04:08.400 WARN  workflow a91c attempt 1 failed, retrying
                    12:04:09.730 INFO  workflow a91c attempt 2 completed
                    ▍
```

### 2.4 Workflow event history  [field]
**Concept.** The durable-execution ledger: each workflow run is a vertical thread of numbered events appended
one by one; a failed activity is followed by a timer and a second attempt, and nothing is lost.

**Viewer sees.** A few vertical lines (one per workflow run) with small dots appended downward; each dot has a
two-word mono label (`scheduled`, `started`, `failed`, `timer`, `started`, `completed`). Threads fade as they
age.

**Communicates.** Temporal: fault-tolerant execution, automatic retries, idempotent replay. The most specific
tie to his strongest resume line (BullMQ to Temporal re-architecture).

**Implementation.** Canvas: lines, 3 px squares, short `fillText`. Data = the workflow part of the retry and
enqueue timelines. Per frame about 150 primitives.

**A11y / perf.** `aria-hidden`; labels are text, so the scrim rule applies.

**Risks.** Only people who have used a durable workflow engine recognise it. Says the same thing as the diagram's
`attempt 1 ✕ / backoff / attempt 2 ✓` tags. Vertical threads with dots drift back toward "rain".

**Cost.** About 1.4 kB gzip.

```
   │                 │
   ● scheduled       ● scheduled
   ● started         ● started
   ✕ failed          ● completed
   ◌ timer
   ● started
   ● completed
```

### 2.5 Priority queue lanes  [widget or field]
**Concept.** Three horizontal lanes (high, default, low) fill with job ticks from the left and are drained by
workers on the right; the high lane always drains first.

**Viewer sees.** Small steel squares entering each lane, worker slots pulsing saffron as they take one, the low
lane backing up for a moment and then catching up.

**Communicates.** Event-driven backends, queues and workers, back-pressure, the resume's "priority-tiered task
queues for fair resource allocation".

**Implementation.** Canvas or SVG; a deterministic arrival/drain schedule; at most about 80 squares. Trivial
per-frame cost.

**A11y / perf.** `aria-hidden`. No text needed.

**Risks.** As a full field it is sparse and reads as a loading bar; as a widget it competes with the diagram's
own queue and worker nodes for the same idea.

**Cost.** About 1.0 kB gzip.

```
 high     ▪ ▪ ▪                         ─▶ [w][w]
 default  ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪               ─▶ [w]
 low      ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪   ─▶ [ ]
```

### 2.6 Health matrix with a circuit breaker  [field]
**Concept.** A grid of service cells that pulse with health-check heartbeats; now and then one cell fails, its
neighbours' breaker opens (hollow), goes half-open (one probe), and closes again.

**Viewer sees.** A large dim grid of 10 px squares across the right of the hero, each blinking softly on its own
period. Every 15 s or so a cell turns coral, a ring of cells goes hollow for 3 s, one probe pulse, then normal.

**Communicates.** Reliability engineering, microservices, failure isolation, Kubernetes liveness probes.

**Implementation.** Canvas; state per cell = phase offset; the breaker is a timed script. About 300 `fillRect`
per repaint at 10 Hz.

**A11y / perf.** Very cheap. Blinking must stay under 3 flashes per second and low contrast (WCAG 2.3.1).

**Risks.** A status-page grid is generic (reads like a contribution graph); "circuit breaker" is not on the
resume, so the claim is implied rather than earned.

**Cost.** About 1.1 kB gzip.

```
 ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪
 ▪ ▪ ▪ ▫ ▫ ▫ ▪ ▪ ▪ ▪ ▪ ▪
 ▪ ▪ ▪ ▫ ✕ ▫ ▪ ▪ ▪ ▪ ▪ ▪     ✕ failing, ▫ breaker open
 ▪ ▪ ▪ ▫ ▫ ▫ ▪ ▪ ▪ ▪ ▪ ▪
```

### 2.7 Token bucket  [widget]
**Concept.** A rate limiter you can watch: tokens drip into a bucket at a fixed rate, requests take one each, a
burst empties it and the next request bounces with `429`.

**Viewer sees.** A small column of saffron dots that refills steadily; packets from the left consume them; one
bounces back when the column is empty.

**Communicates.** API design, rate limiting (the diagram's `auth` node already has a `rate limit` sub-label).

**Implementation.** SVG or canvas, about 20 elements, a scripted burst every 12 s.

**A11y / perf.** Negligible cost.

**Risks.** Too small to be a background; as a widget it is a second diagram next to the first. Better as a
future detail *inside* the system map than as a layer.

**Cost.** About 0.7 kB gzip.

```
   drip ▾
   ┌─────┐
   │ ● ● │  <- tokens
   │ ● ● │        ● ─▶ ok
   │ ●   │        ● ─▶ ok
   └─────┘        ● ◀─ 429
```

### 2.8 Pod grid with a rolling update  [field]
**Concept.** A cluster as rows of nodes holding pod squares; a new version rolls out pod by pod (new one starts
hollow, turns solid when ready, an old one terminates), with one pod failing readiness and being replaced.

**Viewer sees.** Bordered node boxes with 6 to 9 small squares each; a wave of saffron outlines moving through
them every 20 s.

**Communicates.** Kubernetes, EKS, Helm, ArgoCD, zero-downtime deploys (he builds a Go service that deploys Helm
charts).

**Implementation.** Canvas, about 40 pods, a deterministic rollout script. Cheap.

**A11y / perf.** `aria-hidden`; no text needed.

**Risks.** This is the reference's subject (a Kubernetes cluster in a DevOps portfolio). It would pull the page
toward "DevOps engineer" and toward looking copied. Authentic, but wrong emphasis.

**Cost.** About 1.3 kB gzip.

```
 ┌ node-a ────┐  ┌ node-b ────┐  ┌ node-c ────┐
 │ ■ ■ ■      │  │ ■ ■ □      │  │ ■ ▨ ■      │    ■ v2 ready  □ v2 starting  ▨ v1 terminating
 │ ■ ■        │  │ ■ ■ ■      │  │ ■ ■        │
 └────────────┘  └────────────┘  └────────────┘
```

### 2.9 Hash ring  [diagram]
**Concept.** A large faint ring with nodes on it; keys appear, hash to a point and slide clockwise to their
owner; a node joins and only its arc's keys move.

**Viewer sees.** One big circle (40% of the hero height), slow, elegant, with dots travelling along the arc.

**Communicates.** Distributed systems theory: partitioning, rebalancing.

**Implementation.** Canvas arcs or SVG; about 30 keys; `Math.cos/sin` per key per frame.

**A11y / perf.** Cheap. Circular motion is calm.

**Risks.** High wow, low honesty: consistent hashing, sharding and cluster-mode datastores are **not on the
resume**. It also echoes the reference's rotating ring. Do not ship unless the owner has built on it.

**Cost.** About 1.2 kB gzip.

```
            ● n1
        ·        ·
     ·     k7 ─╮    ● n2
    ·           ╰▶
     ● n4         ·
        ·      ● n3
```

### 2.10 Latency ribbon (sparklines and a cache heat strip)  [widget or field]
**Concept.** Two thin lines breathing along the bottom of the hero (a calm one and a spiky one, as a median and
a tail would look) above a strip of small cells for cache hits and misses.

**Viewer sees.** A slow seismograph at the foot of the hero; a spike appears when the diagram's attempt fails,
then settles.

**Communicates.** Performance awareness, caching (Redis), monitoring (Prometheus/Grafana deployments).

**Implementation.** Canvas polyline of about 200 points fed by a smoothed noise function plus sim events;
`lineTo` per point per repaint.

**A11y / perf.** Cheap, no text if unlabelled.

**Risks.** DESIGN-V3 5.7 forbids percentile and throughput figures, so the lines can carry **no labels or
axes**; unlabelled, they read as a stock ticker or audio wave. Sits exactly where the bottom fade is.

**Cost.** About 0.9 kB gzip.

```
        ╱╲                    ╱╲╱╲
 ──────╱  ╲──────────────────╱    ╲───────────      spiky line
 ─────────────────────────────────────────────      calm line
 ▪▪▪▫▪▪▪▪▫▪▪▪▪▪▪▫▪▪▪▪▫▫▪▪▪▪▪▪▪▪▫▪▪▪▪▪▪▪▪▪▪▪▫▪▪▪     ▪ hit  ▫ miss
```

### 2.11 Considered and dropped without a write-up
Raft leader election (not on the resume; consensus is not his claim), B-tree page splits (database internals:
same problem), a `top`-style process table (sysadmin, not backend), deploy pipeline stages lighting up (the
reference's pipeline; DevOps emphasis).

### 2.12 What combines and what conflicts
- **Only one field.** 2.1, 2.2, 2.3, 2.4, 2.6 and 2.8 are full-bleed textures. Any two together are two motion
  systems in different directions behind text: noise. Pick one.
- **A field can absorb glyphs from another idea.** 2.1 can carry 2.2's vocabulary as a single status code at the
  end of each trace (this is the recommendation). 2.2 could carry 2.3's level colours.
- **Widgets fight the diagram.** 2.5, 2.7 and 2.10 are small pictures; the hero already has one picture (the
  system map) with its own trace log. A widget is a third focal point. If one is ever wanted, it belongs inside
  the system map (for example token bucket on the `auth` node), not in the background.
- **Second diagrams conflict outright.** 2.8 and 2.9 are node-and-edge pictures behind a node-and-edge picture.
- **Content duplicates.** 2.3 repeats the trace log; 2.4 repeats the workflow tags; 2.5 repeats the queue and
  worker nodes. 2.1 is the only one that shows the *same events from a different instrument* (topology in front,
  time behind) instead of the same picture twice.

---

## 3. Comparison and recommendation

Scores 1 to 5, **5 is always best** (so "legibility safety" 5 = least risk to text, "cheapness" 5 = least code
and frame cost, "originality" 5 = least like the reference).

| # | Idea | Wow | Backend authenticity | Legibility safety | Cheapness | Mobile | Originality | Total |
|---|---|---|---|---|---|---|---|---|
| 2.1 | **Trace field** | 4 | 5 | 4 | 4 | 4 | 5 | **26** |
| 2.2 | Status-code rain | 3 | 4 | 2 | 5 | 4 | 2 | 20 |
| 2.3 | Log tail | 3 | 4 | 2 | 4 | 3 | 3 | 19 |
| 2.4 | Workflow event history | 3 | 5 | 3 | 4 | 3 | 4 | 22 |
| 2.5 | Priority queue lanes | 3 | 5 | 5 | 5 | 4 | 4 | 26 (but a widget: conflicts with the diagram) |
| 2.6 | Health matrix + breaker | 3 | 3 | 4 | 5 | 5 | 3 | 23 |
| 2.7 | Token bucket | 2 | 4 | 5 | 5 | 4 | 4 | 24 (too small to be a background) |
| 2.8 | Pod grid rolling update | 4 | 3 | 4 | 4 | 3 | 1 | 19 |
| 2.9 | Hash ring | 5 | 1 | 4 | 4 | 3 | 3 | 20 (fails the lie test) |
| 2.10 | Latency ribbon | 2 | 3 | 5 | 5 | 5 | 4 | 24 (cannot be labelled) |

### Recommendation: 2.1 Trace field, carrying 2.2's status codes as its only glyphs
Replace the 0/1 rain with the trace field, and let each finished trace end in its HTTP status code (`200`,
`202`). That is two ideas on **one** canvas layer, behind the unchanged diagram.

**Why.** It is the only option that is driven by the system in front of it: the diagram shows *where* a request
goes, the background shows the same request *over time*, and when the agent call fails in the diagram a coral
span appears behind it in the same second and the retry span follows after the backoff. That coupling is the
"wow" for the audience that matters (engineers who have stared at a trace waterfall at 2 am), and for everyone
else it is still a calm, rising texture of soft bars with a clearly different silhouette from the reference's
falling glyphs. It claims nothing he has not done: request paths through services, durable retries and traced
pipelines are all on the resume. It is mostly rectangles, so it is kinder to the text over it than any glyph
wall, it costs about what the rain costs (the rain is deleted, so the bundle stays roughly level), it reuses the
existing timelines instead of adding a second simulation, and its reduced-motion still frame shows the same
frozen instant as the diagram.

### Do not do
- Do not keep the 0/1 rain *under* the trace field, or run any two fields together.
- Do not add a corner widget (queue bars, token bucket, sparklines, log tail) to the background. One picture.
- Do not ship the hash ring, Raft or B-tree ideas: not on the resume.
- Do not ship the pod grid or a pipeline strip as the background: that is the reference's subject.
- Do not label anything with latency, percentile, throughput or uptime numbers (DESIGN-V3 5.7).
- Do not add span names, service names or trace ids as text in the field. Status code only.
- Do not make failed spans frequent or bright: one per 13.2 s cycle, coral at 55% alpha, never a flash.
- Do not add glow, blur, shadows, parallax on scroll, or pointer-following effects to the field.
- Do not start a second `requestAnimationFrame` loop or a timer for it.

---

## 4. Spec: the trace field

Implementer: build from this section without design decisions. If something is missing, ask the coordinator.
This section supersedes DESIGN-V3 section 6 (binary rain) including 6.1 (pointer reaction: **removed**, no
replacement) once approved.

### 4.1 Layers and z-order (unchanged except the first row)
| z | Layer | Element |
|---|---|---|
| -20 | **Trace field** | `<canvas aria-hidden="true">` with the classes `BinaryRain` has today: `pointer-events-none absolute inset-0 -z-20 size-full animate-in fade-in fill-mode-both duration-900 ease-brand motion-reduce:animate-none` |
| -10 | Scrims | The three existing scrim `<div>`s in `HeroSection.tsx`, untouched |
| 0 | Content | Text column and `<figure>`, untouched |

The 88% scrim rule (DESIGN-V3 2.2) is unchanged and still sufficient: the brightest pixel the field can paint is
`--rain-head`, the same token the rain used, so the contrast table in DESIGN-V3 2.2 still holds.

### 4.2 Tokens
Reuse `--rain` (settled spans, status text), `--rain-head` (live leading edge), `--background` (clear colour),
`--font-mono`. Add **one** raw colour to `src/index.css`, next to `--rain-head` in each theme block that defines
`--rain` (the canvas reads it with `getComputedStyle`; no `@theme` entry is needed):

```css
:root { --trace-fail: rgb(173 39 44 / 0.45); }   /* brick; only if the light block still exists */
.dark { --trace-fail: rgb(245 138 140 / 0.55); } /* coral on ink */
```

Update the two comments on `--branch` / `--rain` from "the hero rain" to "the hero trace field". No renames.

### 4.3 Data: spans come from the existing simulation
`sim.ts` gains two exports and no logic change: `export const SPAWN` (already defined, 2200) and
`export const TIMELINES` (already defined). `SEQUENCE` and `STILL_T_MS` are already exported.

`spansOf(timeline)` turns one `Timeline` into rows:
1. Row 0 is the **root** span: `startMs 0`, `endMs timeline.durationMs`, kind `root`.
2. Take `timeline.pulses`, drop every pulse with state `ok`, drop exact duplicates (same node, state, start and
   end), sort by `startMs` ascending then `endMs` descending. Each becomes one row, in that order, with kind
   `work` (state `active`), `failed` (state `failed`) or `wait` (state `backoff`).

Resulting row counts today: `cache-hit` 5, `cache-miss` 6, `enqueue` 8, `workflow-retry` 16. `MAX_ROWS` is
computed as the maximum over the four shapes at module load (not hard-coded). Status code per scenario: `200`
for `cache-hit` and `cache-miss`, `202` for `enqueue` and `workflow-retry`.

### 4.4 Geometry and density per viewport
`fieldConfig(w, h, viewportW)` where `w`, `h` are the canvas CSS size (from the `ResizeObserver`) and
`viewportW` is `window.innerWidth`:

| Value | `viewportW < 640` (mobile, cheaper) | `viewportW >= 640` |
|---|---|---|
| `lanes` | 1 | `clamp(round(w / 360), 2, 5)` |
| `laneW` (px) | `min(w - 32, 280)` | `min(300, (w - 32 - (lanes - 1) * 48) / lanes)` |
| `laneX[k]` | `16` | `16 + k * (w - 32 - laneW) / (lanes - 1)` |
| `rowPitch` / `barH` (px) | 7 / 3 | 8 / 4 |
| `labels` (status code text) | off | on |
| Repaint interval | 50 ms (20 Hz) | 33 ms (30 Hz) |
| `stride` (show every n-th run) | 4 | 2 when `lanes` is 2, otherwise 1 |

Derived, same for all viewports:
- `TIME_SPAN_MS = 8000`; `pxPerMs = laneW / TIME_SPAN_MS`. One time scale for every trace, so a cache hit is a
  short cluster and the retry trace nearly fills the lane.
- `blockH = MAX_ROWS * rowPitch`; `slot = blockH + 40` (vertical pitch of blocks in a lane).
- `speed = slot / (lanes * stride * SPAWN)` px per ms. This makes consecutive blocks in a lane exactly one
  `slot` apart. Resulting drift: about 17 px/s (1 lane), 19 (2), 25 (3), 19 (4), 15 (5).
- `y0 = h - 96 - blockH`: the top of a block when it spawns, just above the 96 px bottom fade.

Check at 320 px: `laneW = 280` (320 - 32 = 288, capped), one lane, 3 px bars, no text. No horizontal overflow
is possible (the canvas is `absolute inset-0` inside `overflow-hidden`).

### 4.5 The field as a pure function of time
`fieldAt(tMs, cfg)` returns the blocks to draw, newest first. `tMs` is the frame-loop time, the **same clock the
diagram uses**, so block `run` and diagram run `i` are the same request.

For integer `n` (negative allowed, so the field is already populated at `tMs = 0`):
- `run = n * stride`, `lane = mod(n, lanes)`, `scenario = SEQUENCE[mod(run, 6)]`
- `ageMs = tMs - run * SPAWN`; the block exists when `ageMs >= 0`
- `y = y0 - ageMs * speed`; the block is dropped when `y + blockH <= 0`
- `x = laneX[lane] + hash01(run) * 0.6 * (laneW - durationMs * pxPerMs)`, with
  `hash01(run) = (((run + 1) * 40503) & 0xffff) / 0xffff` (the same hash the trace ids use; works for negative
  `run` because of the mask). This breaks the left edges out of a rigid grid.
- `alpha = clamp((y - 0.06 * h) / (0.24 * h), 0, 1)`: full strength below 30% of the hero height, fading to
  nothing at 6% (under the header).

Iterate `n` downward from `floor(tMs / (stride * SPAWN))` until a block is dropped; hard cap 32 blocks.
No module state, no `Math.random`, no `Date`: the same `(tMs, cfg)` always returns the same blocks.

### 4.6 Drawing one block
All coordinates are rounded to device pixels (`Math.round(v * scale) / scale`). For each span of the block's
shape with `startMs < ageMs` (spans that have not started are not drawn, so a trace **draws itself in real
time** over its first 2.9 to 7.9 s):

| Kind | Rect | Fill |
|---|---|---|
| `root` | `x + start * pxPerMs`, `y`, width to `min(end, ageMs)`, height `barH` | `--rain` at `0.5 * alpha` |
| `work` | same, at `y + row * rowPitch` | `--rain` at `alpha` |
| `failed` | same | `--trace-fail` at `alpha` |
| `wait` | same, but height 1 px, vertically centred in the row | `--rain` at `0.5 * alpha` |

Minimum drawn width 2 px. **Live head:** while `startMs <= ageMs < endMs`, draw a 2 px by `barH` rect at the
span's leading edge in `--rain-head` at `alpha`. **Status code:** when `cfg.labels` and `ageMs >= durationMs`,
`fillText(status, x + durationMs * pxPerMs + 6, y + barH / 2)` in `--rain` at `alpha`, font
`400 10px var(--font-mono)`, `textAlign 'left'`, `textBaseline 'middle'`. That is the only text in the field.

Use `ctx.globalAlpha` for the alpha factors (reset to 1 after each repaint). Batch by fill colour where it is
free (all `--rain` rects of a block, then fail, then heads); do not build paths.

### 4.7 Timings
| Thing | Value |
|---|---|
| Canvas fade-in | 0 to 900 ms after mount (existing classes) |
| First paint | `fieldAt(0)` drawn once as soon as fonts and size are known, before the frame loop starts (the loop has a 900 ms start delay; the hero must not be empty during it) |
| Repaint | Accumulator fed by `frame(t, dt)`: repaint when 33 ms (desktop) or 50 ms (mobile) have accumulated; otherwise return without touching the canvas |
| Trace draw-in | Real time, from the sim timelines (2880 / 3800 / 4080 / 7900 ms) |
| Failed span first visible | Sim time 8740 ms, the same frame the diagram's agent node turns `failed` |
| Block lifetime | `(y0 + blockH) / speed`: about 40 s on a 900 px desktop hero |

### 4.8 Pointer interaction
None. Remove the `pointerX` prop and any `pointermove` listener that existed for the rain.

### 4.9 Reduced motion, pause, visibility
- **Reduced motion** (`still` prop true): draw `fieldAt(STILL_T_MS, cfg)` once on mount and on resize; the
  frame handle does nothing. At that instant the retry trace is mid-flight with its coral span and backoff line
  visible, matching the diagram's still frame.
- **Pause button**: the frame loop stops calling `frame()`, so the canvas keeps its last paint. Resume continues
  from the same `tMs` (the loop's clock is accumulated running time), so nothing jumps.
- **Hidden tab / hero off-screen**: handled by `useFrameLoop`; no code in the field.
- **Theme class change** (if the toggle exists): re-read the four colours and repaint the current frame.
- **Resize**: recompute `cfg`, resize the backing store, repaint the current `tMs` (keep the last `tMs` in a ref).

### 4.10 Performance caps
- Backing store scale: `canvasScale(w, h, dpr)` exactly as today (DPR capped at 2, at most 4,000,000 pixels).
- Context `getContext('2d', { alpha: false })`. One opaque `fillRect` of `--background` per repaint, then at
  most 32 blocks x 17 rects + heads + 32 `fillText`. No alpha-trail pass, no per-cell state, no typed arrays.
- No layout reads in `frame()`. Colours and font read once on mount and on theme change. `ctx.font`,
  `textAlign`, `textBaseline` set once per resize.
- Wait for `document.fonts.ready` before the first paint only when `cfg.labels` is on.
- Budget: new code at most **2 kB gzip**; total initial JS must not rise above the current figure by more than
  0.5 kB after the rain files are deleted. Scripting per repaint under 1 ms at 4x CPU throttle.

### 4.11 File plan
**Create**
| Path | Purpose | Exports |
|---|---|---|
| `src/components/hero/traceField.ts` | Pure model, no DOM | `interface Span { row: number; startMs: number; endMs: number; kind: 'root' \| 'work' \| 'failed' \| 'wait' }` · `interface TraceShape { durationMs: number; status: '200' \| '202'; spans: readonly Span[] }` · `interface FieldConfig { lanes: number; stride: number; laneW: number; laneX: readonly number[]; pxPerMs: number; rowPitch: number; barH: number; blockH: number; slot: number; speed: number; y0: number; h: number; labels: boolean; repaintMs: number }` · `interface Block { run: number; scenario: ScenarioId; x: number; y: number; ageMs: number; alpha: number }` · `spansOf(t: Timeline): Span[]` · `SHAPES: Record<ScenarioId, TraceShape>` · `MAX_ROWS` · `TIME_SPAN_MS` · `fieldConfig(w: number, h: number, viewportW?: number): FieldConfig` · `fieldAt(tMs: number, cfg: FieldConfig): Block[]` · `canvasScale(w: number, h: number, dpr: number): number` (moved unchanged from `rain.ts`) |
| `src/components/hero/TraceField.tsx` | Canvas layer; implements `FrameHandle` via `useImperativeHandle`; owns `ResizeObserver`, theme `MutationObserver`, colour reads and the draw routine (4.6) | `interface TraceFieldProps { ref: Ref<FrameHandle>; still: boolean; className?: string }` · `function TraceField` |
| `src/components/hero/traceField.test.ts` | Section 4.12 | |

**Modify**
| Path | Change |
|---|---|
| `src/components/hero/sim.ts` | Add `export` to `SPAWN` and `TIMELINES`. Nothing else |
| `src/sections/HeroSection.tsx` | `<BinaryRain ref={rainRef} still={reduced} />` becomes `<TraceField ref={fieldRef} still={reduced} />`; rename the ref; drop any pointer wiring |
| `src/index.css` | 4.2: one token, two comments |
| `docs/DESIGN-V3.md` | One line at the top of section 6: "Superseded by docs/DESIGN-V3-BACKGROUND.md section 4" (coordinator) |

**Delete** `src/components/hero/BinaryRain.tsx`, `rain.ts`, `rain.test.ts` (move the `canvasScale` tests into
`traceField.test.ts`). `grep -rn "BinaryRain\|/rain'" src` must be empty afterwards. `--rain` and `--rain-head`
stay.

### 4.12 Tests (`traceField.test.ts`, pure; no canvas mocking)
- `spansOf`: row 0 is the root spanning `0..durationMs`; rows are unique and consecutive; every span lies within
  `0..durationMs`; counts are 5 / 6 / 8 / 16 for hit / miss / enqueue / retry; only `workflow-retry` has
  `failed` spans and it has exactly one `wait` span, which starts no earlier than the end of a `failed` span.
- `TIME_SPAN_MS` is at least the longest `durationMs`; `MAX_ROWS` equals the largest span count.
- `fieldConfig`: 1 lane and `labels: false` below 640; 2 to 5 lanes above; at widths 320, 360, 640, 768, 1024,
  1440, 2560 every lane satisfies `laneX >= 16` and `laneX + laneW <= w - 16`; `speed` is positive and at most
  0.03 px/ms.
- `fieldAt`: same input gives deep-equal output; never more than 32 blocks for `tMs` in `0..120000` step 250 at
  each test width; `fieldAt(0, cfg)` is not empty; two blocks in the same lane are at least `slot` apart in `y`;
  every block has `0 <= alpha <= 1`, `y <= y0` and `y + blockH > 0`; every block's `scenario` equals
  `SEQUENCE[mod(run, 6)]` and `ageMs` equals `tMs - run * SPAWN` (this pins the coupling to the diagram).
- Still frame: `fieldAt(STILL_T_MS, fieldConfig(1440, 900))` contains a `workflow-retry` block whose `ageMs` is
  past the start of its `failed` span and before its `durationMs` (pin the property, not the number).
- `canvasScale`: the existing cases, moved.
- `HeroSection.test.tsx`: still one `<canvas aria-hidden="true">` in the hero; nothing focusable inside it.

### 4.13 Acceptance checklist (browser, `npm run build && npm run preview`)
- [ ] 1440x900: steel bar clusters rise slowly behind the diagram; clearly visible on the right, barely under
      the text column; no 0/1 glyphs anywhere.
- [ ] Watch one request in the diagram: a new cluster starts drawing in the background as the packet leaves the
      client, and finishes (status code appears) when the run ends.
- [ ] About 9.6 s after load the agent node fails in the diagram and a coral span appears in the newest
      background trace in the same moment; the retry bar follows the thin backoff line.
- [ ] Nothing pops in or out: clusters draw in from zero width and fade out near the top.
- [ ] 360x740 and 320 wide: one lane, no text in the field, no horizontal scroll, name and buttons unaffected.
- [ ] Contrast picker over the brightest field pixel behind the prompt text: at least 4.5:1.
- [ ] `prefers-reduced-motion: reduce`: the field is a still picture that includes a coral span; nothing moves.
- [ ] Pause freezes field and diagram together; Play resumes with no jump. Switch tabs for 30 s: no catch-up.
- [ ] Scroll the hero out of view: CPU returns to idle.
- [ ] `grep -rn requestAnimationFrame src` shows `useFrameLoop.ts` only; no `pointermove` listener in the hero.
- [ ] Bundle: total initial JS within 0.5 kB gzip of the figure before this change; zero CSP violations.
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` green.

---

## 5. Open questions for the owner

1. **Retire the 0/1 rain completely?** The recommendation replaces it. You said you liked it in the reference;
   if you want to keep falling glyphs, the fallback is 2.2 (status-code rain), which is cheaper but still looks
   like the reference. Default: replace.
2. **A failure in the background too?** The diagram already shows one failed attempt per cycle. The trace field
   mirrors it with one coral span every 13.2 s. It is the detail that proves the two layers are one system, but
   it does put a second "failure" on your first screen. Default: keep it, dim.
3. **Status codes as the only text (`200`, `202`)?** They make the bars read as HTTP traces at a glance. They
   are simulated, like the trace log, and sit under the same "simulated traffic" exemption (DESIGN-V3 5.7).
   Default: on from 640 px, off on phones.
