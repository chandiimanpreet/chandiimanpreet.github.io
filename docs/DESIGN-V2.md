# DESIGN-V2.md: Manpreet Singh portfolio (React 19 + TypeScript + Tailwind v4 + shadcn/ui)

Supersedes DESIGN.md and DESIGN-BACKEND.md for the React build. All content comes from docs/RESUME.md.
Anything not in the resume is rendered through `<Todo>` (visible dashed badge) and listed in section 10. Never print the phone number.

**Positioning (owner's instruction, applies everywhere):** Manpreet is a **Backend Engineer**: Go, Node.js/TypeScript,
distributed systems, durable workflows, AWS, Kubernetes, CI/CD. He has *also* shipped AI agent systems. Never write
"AI engineer" or "AI backend engineer"; AI is never the headline. Agents appear in Experience and inside the Natalie
case study, with equal weight given to the backend, Temporal, Go and infrastructure story.
`<title>`: "Manpreet Singh · Backend Engineer". Meta description: "Backend engineer working in Go and Node.js/TypeScript:
REST APIs, event-driven services, durable Temporal workflows, AWS and Kubernetes."

## 1. Concept
**The rail says when. The run says how.** The page is still a git history: one branch rail down the left edge,
a node per section, a steel fork at Showcase that merges back before Contact. V2 adds what a backend engineer
actually owns: a request that becomes a durable workflow, fails once, retries and finishes. The Workflows section
shows one real system (Natalie) three ways, all driven by one state object: the **request path**, the **workflow
execution timeline** with its retry, and the **step graph** of what runs inside it. The steps happen to be LLM agents;
the subject is the orchestration.

Two tests carried over from DESIGN-BACKEND.md:
- **Would a backend engineer call it a lie?** The trace is a replay and says so; its clock is the replay's real elapsed time. No latency, token or cost figures appear, because the resume has none.
- **Can a recruiter read it without the metaphor?** Every diagram has a plain sentence beside it; the hero leads with name, role, one sentence and three resume numbers.

| Signature idea | Verdict | Reason |
|---|---|---|
| Temporal-style workflow timeline with retry and failure states | **Chosen, the signature** | The BullMQ-to-Temporal re-architecture shown as behaviour: one execution, an automatic retry, parallel activities overlapping. Pure backend story |
| Natalie step graph with "Run trace" | **Chosen, second view of the same run** | His real architecture (parallel parsers, three evaluators, recommendation). A case study inside the workflow, not the headline |
| Request path strip | **Chosen, small** | Client to API to workflow to SSE, straight from the resume; frames the run as a backend request |
| Live request panel in the hero | Rejected | Content is bundled into the SPA, so there is no real request. A simulated `200 OK · 41 ms` fails the lie test |
| Footer health block, live GitHub cards | Rejected | They existed to justify GitHub API calls. V2 makes none: no rate-limit states, skeletons or layout shift |
| "Aggregator" node | Rejected until confirmed | Not in the resume; evaluators feed the recommendation directly (section 10) |
| React Flow, d3, dagre, the `motion` package | Rejected | Six steps in three fixed stages are a CSS grid, and every animation is a CSS transition on `data-state`. Add `motion` only when a spring or layout animation is really needed |

Rules:
- Saffron (`primary`) marks four things: the active rail node, links and primary actions, focus rings, the *running* step in a trace.
- Steel (`branch`) only on the fork and Showcase. Moss (`ok`) and coral (`destructive`) only as trace states, always with an icon and a word.
- Monospace is for machine facts: stack names, dates, step ids, the replay clock, attempt counts. Never headings.
- Headings are plain sentences. No eyebrows, numbering or all-caps.
- One shape per section: Experience is a **changelog**, Projects is **rows that open**, Workflows is a **diagram**, Skills is **running text**, Showcase is a **card grid**.

## 2. Tokens (Tailwind v4, `src/index.css`, foundation-owned; paste as is)
shadcn's semantic names are kept so primitives work untouched: `background`=Ink/Paper, `card`=surface,
`muted`/`secondary`/`accent`=surface-2 (shadcn's `accent` is a hover fill, **not** saffron), `primary`=saffron,
`input`=border-strong (3:1 control outline), `ring`=saffron. Dark is the default: `index.html` ships
`<html class="dark">`; an inline head script removes it when `localStorage.theme === "light"`.

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
:root {                       /* Paper */
  color-scheme: light;
  --background:#FAF7F1; --foreground:#171B24; --card:#FFFFFF; --card-foreground:#171B24;
  --popover:#FFFFFF; --popover-foreground:#171B24; --primary:#9A4A00; --primary-foreground:#FFFFFF;
  --secondary:#F1ECE2; --secondary-foreground:#171B24; --muted:#F1ECE2; --muted-foreground:#535C6B;
  --accent:#F1ECE2; --accent-foreground:#171B24; --destructive:#AD272C; --border:#DDD5C7;
  --input:#857B6B; --ring:#9A4A00; --branch:#2A5F96; --ok:#1A6E41;
  --glow:rgb(154 74 0 / 0.08); --spot:rgb(42 95 150 / 0.07); --radius:0.625rem;
}
.dark {                       /* Ink */
  color-scheme: dark;
  --background:#0D1017; --foreground:#ECE8DF; --card:#151A23; --card-foreground:#ECE8DF;
  --popover:#151A23; --popover-foreground:#ECE8DF; --primary:#F5A524; --primary-foreground:#1A1204;
  --secondary:#1D2430; --secondary-foreground:#ECE8DF; --muted:#1D2430; --muted-foreground:#A3ACBA;
  --accent:#1D2430; --accent-foreground:#ECE8DF; --destructive:#F58A8C; --border:#2A3342;
  --input:#6B7890; --ring:#F5A524; --branch:#7DB0E0; --ok:#5BC58B;
  --glow:rgb(245 165 36 / 0.12); --spot:rgb(125 176 224 / 0.10);
}
@theme inline {
  --color-background:var(--background); --color-foreground:var(--foreground);
  --color-card:var(--card); --color-card-foreground:var(--card-foreground);
  --color-popover:var(--popover); --color-popover-foreground:var(--popover-foreground);
  --color-primary:var(--primary); --color-primary-foreground:var(--primary-foreground);
  --color-secondary:var(--secondary); --color-secondary-foreground:var(--secondary-foreground);
  --color-muted:var(--muted); --color-muted-foreground:var(--muted-foreground);
  --color-accent:var(--accent); --color-accent-foreground:var(--accent-foreground);
  --color-destructive:var(--destructive); --color-border:var(--border); --color-input:var(--input);
  --color-ring:var(--ring); --color-branch:var(--branch); --color-ok:var(--ok);
  --radius-sm:4px; --radius-md:10px; --radius-lg:10px; --radius-xl:10px;   /* nothing rounder except full */
  --font-display:"Bricolage Grotesque","Segoe UI",system-ui,sans-serif;
  --font-sans:"Instrument Sans",system-ui,-apple-system,sans-serif;
  --font-mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
  --text-hero:clamp(2.75rem,1.6rem + 5.8vw,5.5rem); --text-hero--line-height:0.95; --text-hero--letter-spacing:-0.03em;
  --text-h2:clamp(1.75rem,1.35rem + 2vw,2.75rem);   --text-h2--line-height:1.1;   --text-h2--letter-spacing:-0.02em;
  --text-lead:clamp(1.125rem,1.05rem + 0.4vw,1.375rem); --text-lead--line-height:1.5;
  --text-mono:0.8125rem; --text-mono--line-height:1.5;
  --spacing-section:clamp(3rem,6vw,5rem);     /* py-section */
  --spacing-rail:1.25rem;                      /* rail column; 3.5rem from md, below */
  --container-page:70rem;                      /* max-w-page */
  --ease-out-soft:cubic-bezier(0.2,0.7,0.2,1);
}
@media (min-width:48rem) { :root { --spacing-rail:3.5rem; } }
@layer base {
  * { @apply border-border; }  body { @apply bg-background text-foreground font-sans antialiased; }
  h1,h2 { @apply font-display text-balance; }  html { scroll-behavior:smooth; scroll-padding-top:5rem; }
  :focus-visible { outline:2px solid var(--ring); outline-offset:3px; }
}
/* rail fill: scroll-linked, CSS only */
@keyframes rail-fill { from { transform:scaleY(0); } to { transform:scaleY(1); } }
@supports (animation-timeline: scroll()) { .rail-fill { transform-origin:top; animation:rail-fill linear both; animation-timeline:scroll(root); } }
/* trace connectors: <path class="edge" pathLength="1"> */
.edge { stroke-dasharray:1; stroke-dashoffset:1; transition:stroke-dashoffset 500ms var(--ease-out-soft); }
.edge[data-drawn="true"] { stroke-dashoffset:0; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior:auto; }  *,*::before,*::after { transition-duration:0ms !important; animation-duration:0ms !important; }
}
```

Utility patterns every file uses (do not invent alternatives):
- Page shell: `mx-auto max-w-page px-4 sm:px-8 lg:px-12`. Section rhythm: `py-section`.
- h2: `font-display text-h2 font-semibold`. Lead: `text-lead text-muted-foreground max-w-[62ch]`. Body: `text-base leading-relaxed max-w-[62ch]`.
- Machine fact: `font-mono text-mono text-muted-foreground`. Hairline: `border-t border-border`. Surface: `bg-card border border-border rounded-md` (no shadows anywhere; strip `shadow-*` from shadcn Card).
- Text link: `text-primary underline underline-offset-4 decoration-1 hover:decoration-2`. Touch target: `min-h-11 min-w-11`.
- Breakpoints: default (320 up), `md:` 768, `lg:` 1024. The 1440 design is `lg:` inside `max-w-page`; nothing changes above it.

Fonts: one Google Fonts `<link>` in `index.html`, `preconnect` to both hosts, `display=swap`:
`Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700` / `Instrument+Sans:wght@400;500;600` / `JetBrains+Mono:wght@400;500`.

## 3. shadcn primitives
Install: `npx shadcn@latest add button badge card accordion toggle-group avatar sheet progress`. Nothing else.

| Primitive | Used for | Theming / custom variants |
|---|---|---|
| `Button` | Hero CTAs, trace controls, copy, theme toggle, mail templates | `default` = saffron fill via `primary`. Add sizes `touch: "h-11 px-5"` and `icon-touch: "size-11"`. `outline` uses `border-input`. `link` for arrow links. Remove shadows |
| `Badge` | Stack chips, trace state labels, TODO markers | Add variants `mono` (`font-mono text-mono bg-secondary border-transparent rounded-sm`), `state` (leading icon, colour from `data-state`), `todo` (`border-dashed border-input text-muted-foreground`) |
| `Card` | Showcase cards, step inspector, hero pipeline frame | `rounded-md shadow-none`. Showcase adds `hover:border-branch` |
| `Accordion` | Project rows that open (`type="multiple"`, Natalie open by default) | Trigger is the whole row; chevron replaced by `ArrowRight` that rotates 90deg when open |
| `ToggleGroup` | Trace scenario: "Clean run" / "Fail one step" (`type="single"`, never empty) | `variant="outline"`, `data-[state=on]:bg-secondary data-[state=on]:border-input` |
| `Progress` | "Event 5 of 12" under the trace controls | Track `bg-secondary`, indicator `bg-primary`, height 2px |
| `Avatar` | Showcase people | `AvatarFallback` = initials in display type on `bg-secondary` |
| `Sheet` | Mobile nav below `md` | `side="right"`, `bg-card`, links are 44px rows |

Not used, on purpose: `Tooltip` (no touch or keyboard parity; step details live in the inspector), `Tabs` (timeline and graph are shown together), `Skeleton`/`Sonner` (no async data), `Dialog`, `NavigationMenu`.

## 4. Page layout
```
1440 (lg)                                                             320
+------------------------------------------------------------------+  +---------------------------+
| MS About Experience Projects Workflows Skills Showcase Contact [◐]|  | MS                 [◐][≡] |
+------------------------------------------------------------------+  +---------------------------+
| |  rail 56px        content, max 1120px                          |  | | rail 20px               |
| o-- Hero            name, role, lead, CTAs  | compact step graph |  | o Hero (graph below)      |
| o-- About           prose 7/12              | credentials 5/12   |  | o About, credentials      |
| o-- Experience      changelog entries on small rail nodes        |  | o Experience              |
| o-- Projects        rows that open                               |  | o Projects                |
| o-- Workflows       request path, timeline, step graph, log      |  | o Workflows (stacked)     |
| o-- Skills          seven labelled lines                         |  | o Skills                  |
| o--.  Showcase      steel fork, 3-col cards                      |  | : Showcase (dashed steel) |
| o--'  Contact       merge node                                   |  | o Contact                 |
| o   Footer          hollow node, rail ends                       |  | o Footer                  |
+------------------------------------------------------------------+  +---------------------------+
768 (md): full nav row; two-column sections stay two-column except Hero and Workflows (noted per section).
```
Header: sticky from `md`, 64px, `bg-background border-b`. Skip link first in DOM: "Skip to content".
Rail: a 2px line (`bg-border`) with a saffron `.rail-fill` overlay; nodes are 12px rings (`border-input bg-background`),
filled `bg-primary` when their section is in view. At Showcase the fork is a 2px `border-branch` bracket offset 28px
(`md:` only; below `md` the rail segment turns dashed steel instead).

## 5. Sections
### 5.1 Hero (`#top`)
```
1440                                                              320
o-- main · Patiala 14:32                                          o main · Patiala 14:32
|   Manpreet                    +----------------------------+    | Manpreet
|   Singh                       | [JD extraction] ┐ ┌[Skill]┐|    | Singh
|   Backend Engineer            |                 ├─┤[Exp. ]├─[Rec]| Backend Engineer
|   I build distributed ...     | [Resume parsing]┘ └[Edu. ]┘|    | I build distributed ...
|   [Watch a workflow run] GitHub→ One Temporal workflow ... |    | [ Watch a workflow run ]
|   15+         2x        95%+  +----------------------------+    | GitHub →
|   deployments deploy    field                                   | 15+ / 2x / 95%+ (stacked rows)
|   streamlined speed     accuracy                                | [compact graph, stages stacked]
768: single column like 320; stats in a 3-column row; graph full width under the stats.
```
- Ref line (mono, muted): `main` · `Patiala` · live clock in `<time>` (`toLocaleTimeString`, `timeZone: "Asia/Kolkata"`, updated each minute). No fake commit hash.
- h1: "Manpreet Singh" (forced break after "Manpreet"), `text-hero font-bold`. Role line directly under it: "Backend Engineer" (`text-lead font-medium text-foreground`).
- Lead: "I build distributed systems in Go and Node.js/TypeScript: REST APIs, event-driven services and durable Temporal workflows, shipped on AWS and Kubernetes with automated CI/CD. I have also put LLM agents into production on top of them."
- Primary button: "Watch a workflow run" (to `#workflows`). Link: "GitHub" with arrow (to `site.github`).
- Proof stats, a `<dl>` (value `font-display text-h2`, label `text-sm text-muted-foreground`), infrastructure first:
  - **15+** "deployments streamlined by a Go microservice that installs Helm charts; setup went from hours to minutes"
  - **2x** "deployment speed from automated build, test and deploy pipelines"
  - **95%+** "field accuracy from a multi-agent document pipeline"
- Right column: `<PipelineGraph compact />` in a Card, caption "One Temporal workflow from Natalie, my hiring platform. Run it below." (last three words link to `#workflows`). Static, all steps `done`.
- HEAD halo: `radial-gradient(28rem circle, var(--glow), transparent 70%)` behind the hero's rail node, `pointer-events-none`.
- States: none (no data fetching). Hero children reveal at 60ms steps on load (section 7).

### 5.2 About (`#about`)
Layout: 1440 and 768, prose 7/12 left and a credentials aside 5/12 right; 320, prose then Education then Credentials, stacked.
- h2: "I like systems that finish what they start."
- P1: "I'm a backend engineer working in Go and Node.js/TypeScript on distributed systems. Most of my work is scalable REST APIs and event-driven backends with durable workflow orchestration, retries and idempotent processing, so a failed step retries instead of losing the job."
- P2: "I ship on AWS and Kubernetes with automated CI/CD, and I write the tooling around it: one of my Go services deploys the platform's Helm charts. I have also shipped LLM agents into production services with LangChain and LangGraph, built on the same foundations."
- Aside, two `<dl>` groups with hairlines (label `font-medium`, detail muted, dates and scores mono):
  - Education: "Master of Computer Applications, National Institute of Technology, Kurukshetra" · `2022 to 2025` · `CGPA 9.1` / "BSc Mathematics and Computing, Punjabi University, Patiala" · `2019 to 2022` · `CGPA 8.8`
  - Credentials: "AWS Certified Developer, Associate (DVA-C02)" / "550+ LeetCode problems solved" / "LeetCode weekly contest: rank 4,273 of 36,305"

### 5.3 Experience (`#experience`)
Layout: each entry hangs off the rail on an 8px node. 1440 and 768: period, role and org on one line, then type word left and text right. 320: period, role, then each type word above its text.
- h2: "Changelog". Intro: "Where I have worked, written the way I write release notes."
- Markup: `<ol>` of `<article>`; period in `<time>` mono; role and org as h3; changes as `<dl>` with the type word (`font-semibold`, fixed `w-24` from `md`, above the text below `md`). The type is a word, never a coloured badge. Each entry has an 8px rail node.
- **Software Engineer, DevSecCops.AI** · Sept 2025 to now · Kurukshetra (infrastructure and agent work interleaved, on purpose)
  - Added: "A Go microservice that deploys Helm charts for ArgoCD, SonarQube, Grafana and Prometheus: 15+ deployments streamlined, setup time from hours to minutes."
  - Added: "A multi-agent document intelligence pipeline in LangGraph. It classifies import/export documents (commercial invoices, freight booking confirmations, customs declarations) and extracts structured data at 95%+ field accuracy."
  - Changed: "CI/CD into agent-orchestrated build, test and deploy workflows: 40% less manual DevOps effort, 2x deployment speed."
  - Added: "WhatsApp and voice agents for conversational commerce. Users search catalogs and place orders in natural language; 100% of the order-taking flow runs without a human agent."
  - Added: "A DevOps automation tool for repetitive operational tasks: 50% less manual intervention, 30% lower failure rate."
  - Added: "Omnichannel booking agents (WhatsApp, voice) for hospitality: room availability, pricing queries and reservations, end to end."
- **Software Engineer Intern, Aryaka Networks** · Jan 2025 to Jun 2025 · Bangalore
  - Added: "End-to-end testing environments across servers, operating systems and virtual machines on ESXi and QEMU."
  - Changed: "Migrated 5 legacy functionalities to a modern framework and enabled continuous testing pipelines."
  - Added: "Automated test suites in Pytest with Allure reports wired into Jenkins CI/CD. They caught 4 critical bugs before production."

### 5.4 Projects (`#projects`)
```
1440 / 768                                                                   320
o-- Things I have built                                                      o Things I have built
|   Natalie            Hiring platform on Temporal ...   Feb 2026 to now  ↓  | Natalie
|     outcome / Trade-off / How it works / Stack   [ Watch a run → ]         | (open: facts stacked)
|   Helm deployer                    Go microservice that ...     DevSecCops.AI  →
|   (two more work rows, same shape)
```
- h2: "Things I have built". Intro: "One project of my own, and three systems I shipped at work."
- Row (AccordionTrigger): name (h3) / one-line description / outcome in `text-foreground font-medium` / right meta in mono / arrow. Hover: `bg-card`, name turns `text-primary`. Open content is a `<dl>`.
- **Natalie** · `Feb 2026 to now` · open by default
  - Description: "Hiring platform that automates JD parsing, resume screening and candidate ranking, run as durable Temporal workflows."
  - Outcome: "Manual shortlisting went from hours to minutes."
  - Trade-off (first, it is the backend story): "Chose **Temporal workflows** over BullMQ/Redis queues: resume parsing and AI analysis run as one fault-tolerant execution with automatic retries, priority-tiered task queues keep allocation fair across users, and progress streams to the client over SSE."
  - How it works: "Inside the workflow, parallel resume-parsing and JD-extraction agents (LangGraph, AWS Bedrock) feed skill, experience and education evaluators. The result is an explainable shortlist or reject recommendation, with Zod-validated outputs and LangSmith tracing."
  - Stack (Badge `mono`): Express · Temporal · MongoDB · Redis · LangGraph · AWS Bedrock · Zod · LangSmith · SSE
  - Actions: Button `link` "Watch a run" (to `#workflows`); `<Todo what="Natalie repo or demo URL" />`
- **Helm deployer** · `DevSecCops.AI`: "Go microservice that deploys Helm charts for platform components: ArgoCD, SonarQube, Grafana, Prometheus." Outcome: "15+ deployments streamlined; setup time from hours to minutes." Stack: Go · Helm · Kubernetes.
- **Document intelligence pipeline** · `DevSecCops.AI`: "Multi-agent LangGraph pipeline that classifies import/export documents and extracts structured data." Outcome: "95%+ field accuracy across commercial invoices, freight booking confirmations and customs declarations." Stack: LangGraph.
- **Commerce and booking agents** · `DevSecCops.AI`: "WhatsApp and voice agents that take orders from a catalog and handle hotel availability, pricing and reservations in natural language." Outcome: "100% of the order-taking flow automated." Stack: WhatsApp · Voice.
- Work rows carry no outbound link; their meta reads "Built at DevSecCops.AI".

### 5.5 Workflows (`#workflows`), the signature. Nav label "Workflows"; fills the brief's "Agents" slot
```
1440
o-- Watch a durable workflow run
|   intro
|   [ Clean run | Fail one step ]   [▶ Run trace] [⏭ Step] [↺ Reset]      replay clock 00:03.2 · event 5 of 12
|   ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ (Progress, 2px)
|   Simulated replay of the workflow's structure. Timings are replay time, not production measurements.
|   Request path   [ Client ] ─HTTP→ [ Express API ] ─starts→ [ Temporal workflow ] ─SSE progress→ [ Client ]
|   Workflow execution                    0s      2s      4s      6s
|   JD extraction        ███████ ✓
|   Resume parsing       ████✕ ··· ███████ ✓   attempt 2
|   Skill evaluator                         ████████ ●
|   Experience evaluator                    ██████████ ●
|   Education evaluator                     ██████ ●
|   Recommendation                                        (waiting)
|   Inside the workflow
|   +---------------------------------------------------------------+  +-------------------------+
|   |  Parse (parallel)       Evaluate               Recommend      |  | Resume parsing          |
|   |  [✓ JD extraction ]──┐ ┌─[● Skill evaluator ]──┐              |  | failed once, retried    |
|   |                      ├─┤ [● Experience eval. ] ├─[Recommendation] attempt 2 of 2 · done    |
|   |  [✓ Resume parsing]──┘ └─[● Education eval.  ]─┘              |  | what it does · tech     |
|   +---------------------------------------------------------------+  +-------------------------+
|   Progress  (the real system streams this to the client over SSE)
|   00:01.0  Resume parsing failed (simulated). Temporal retries it automatically.
768: inspector moves under the graph, full width; everything else as 1440.
320: controls wrap to two rows (ToggleGroup full width, then three buttons); request path stacks top to bottom with
     down arrows; timeline labels sit above their bars; graph stages stack ([JD][Resume] side by side, ↓, three
     evaluators stacked, ↓, Recommendation); inspector under the graph; log last.
```
Copy:
- h2: "Watch a durable workflow run". Intro: "This is Natalie's candidate screening, the job I moved from BullMQ queues on Redis to one Temporal workflow. A request starts the execution, the steps run in parallel where they can, a failed step retries on its own, and progress streams back over SSE. Press run to replay it."
- Disclosure (always visible, `text-sm text-muted-foreground`, left 2px `border-input` bar): "Simulated replay of the workflow's structure. Timings are replay time, not production measurements."
- Request path, an `<ol>` of four boxes with labelled arrows (`via` text precedes the box name in DOM order): Client / "HTTP" Express API / "starts" Temporal workflow / "SSE progress" Client. Caption: "The API hands the job to Temporal on a priority-tiered task queue, so one user's batch cannot starve another's."
- Under the timeline: "Before: separate BullMQ jobs on Redis. Now: parsing and analysis are one fault-tolerant execution."
- Graph heading (h3): "Inside the workflow". Caption: "The steps are LLM agents built with LangGraph on AWS Bedrock." Stage headings: "Parse (parallel)" / "Evaluate" / "Recommend".
- Inspector text (`role` field; default selection `resume`):
  - `jd` JD extraction: "Extracts the requirements from the job description. Runs in parallel with resume parsing." Tech: LangGraph, AWS Bedrock
  - `resume` Resume parsing: "Parses the candidate's resume. Runs in parallel with JD extraction." Tech: LangGraph, AWS Bedrock
  - `skill` / `experience` / `education` {Skill|Experience|Education} evaluator: "Scores the candidate's {skills|experience|education} against the job description." Tech: LangGraph, Zod
  - `recommendation` Recommendation: "Returns an explainable shortlist or reject recommendation. Outputs are Zod-validated and the run is traced in LangSmith." Tech: Zod, LangSmith
- Log messages: "{label} started." / "{label} completed." / "{label} failed (simulated). Temporal retries it automatically." / "{label} retrying, attempt {n}." / final "Recommendation ready. Workflow completed."
Behaviour:
- **Default state is the finished retry run**: every step `done`, connectors drawn, the timeline complete with its failed attempt visible. A visitor who never clicks still sees a workflow that failed once and recovered; nothing is empty.
- Run trace: resets to idle, then plays the selected scenario on the replay clock. The button reads "Pause" while running and "Run again" when done. Step advances exactly one event (idle or paused). Reset returns to the default finished state. Changing scenario resets. Default scenario: "Fail one step".
- Selecting a step (click, Enter or Space, on the graph or its timeline row) fills the inspector and rings both the node and the row (`ring-2 ring-ring`). The request path's "Temporal workflow" box turns `border-primary` while a run is in progress.
- Scenario events in replay ms (`clean` total 4800, `retry` total 6200). `[CONFIRM]` evaluators run concurrently (section 10):

| Event | clean | retry |
|---|---|---|
| `jd` start / complete | 0 / 1200 | 0 / 1200 |
| `resume` start / fail (attempt 1) | 0 / none | 0 / 1000 |
| `resume` retry (attempt 2) / complete | none / 1800 | 1900 / 3200 |
| `skill`, `experience`, `education` start | 1800 | 3200 |
| `skill` / `experience` / `education` complete | 3200 / 3600 / 3000 | 4600 / 5000 / 4400 |
| `recommendation` start / complete | 3600 / 4800 | 5000 / 6200 |
Step states (each has an icon and a word; colour is never the only signal):

| State | Border / fill | Icon + label | Connector into its stage |
|---|---|---|---|
| `idle` | `border-input` dashed, transparent, muted text | none, "waiting" | undrawn |
| `running` | `border-primary` 2px, `bg-card` | `Loader`, "running" | drawn, `stroke-primary` |
| `failed` | `border-destructive` dashed | `X`, "failed" | drawn, `stroke-input` |
| `retrying` | `border-primary` dashed 2px | `RefreshCw`, "attempt 2" | drawn, `stroke-primary` |
| `done` | `border-foreground` solid, `bg-card` | `Check` in `text-ok`, "done" | drawn, `stroke-input` |
Timeline bars: `h-2 rounded-sm`, placed by `left`/`width` percentages of `totalMs`, grown with `scale-x` from `origin-left`.
Done `bg-foreground`, running `bg-primary`, failed `bg-destructive` followed by `X` and "failed"; the backoff gap is a dotted `border-t border-input`. Axis ticks every 2s in mono.

### 5.6 Skills (`#skills`)
Layout: 1440 and 768, label column (`md:w-48`) left and values right, hairline between rows; 320, label above its values.
- h2: "What I reach for". A `<dl>`; label `font-semibold`, values muted, separated by a middle dot. No pills, bars, percentages or logos. Order is backend first:
  - Languages: Go · TypeScript · JavaScript · C++ · C
  - Services and workflows: REST APIs · Microservices · Temporal · Express.js · Next.js · Zod · SSE
  - Data: MongoDB · Redis
  - Cloud: AWS (EKS, EC2, ECS, S3, VPC, IAM)
  - Delivery: Kubernetes · Docker · Helm · ArgoCD · GitHub Actions · Jenkins
  - Agent systems: LangGraph · LangChain · LangSmith · AWS Bedrock
  - Tools and fundamentals: Linux · Git · Postman · DSA · computer networks · operating systems · DBMS · OOP
- Proof: skills in Natalie's stack (Temporal, Express.js, Zod, SSE, MongoDB, Redis, LangGraph, LangSmith, AWS Bedrock) are links to `#projects` with `title="Used in Natalie"`. The rest are plain text.

### 5.7 Showcase (`#showcase`)
Layout: the fork drawn in section 4. Cards in 3 columns at 1440, 2 at 768, 1 at 320 (rail segment dashed steel, no sideways fork).
- h2: "Engineers worth following". Branch tag (mono, `text-branch`, `aria-hidden`): `branch: people`. Intro: "People whose work I read and learn from."
- Card: Avatar 48px (`https://github.com/{login}.png?size=96`, `loading="lazy"`, `width`/`height` 48, `alt=""`) / name (h3, link to `github.com/{login}`) / `@login` mono / one-line reason. Hover: `border-branch` plus pointer spotlight (`radial-gradient(18rem circle at var(--x) var(--y), var(--spot), transparent 60%)`, only under `(hover:hover) and (pointer:fine)`).
- Seed, a static array in the file; every entry is `[EDIT]` and every reason renders `<Todo what="why I follow them" />` until the owner writes it: `mfateev`, `mitchellh`, `bradfitz`, `kelseyhightower`, `antirez`, `hwchase17`. Verify logins before shipping.
- States: avatar fails, AvatarFallback shows initials. Empty array: the section and its nav link are not rendered.

### 5.8 Contact (`#contact`)
Layout: heading, paragraph, email with Copy, template buttons in a row, then links. At 320 the email wraps and templates and links stack full width.
- h2: "Let's talk". P: "I build backend systems: APIs, durable workflows and the infrastructure they run on. If you are hiring for that, email is the fastest way to reach me."
- Email as a `mailto:` link in `text-lead`, with an outline "Copy" Button. Success: label "Copied" with `Check` in `text-ok` for 2s, announced through a `role="status"` span. Failure: label "Press Ctrl+C" and the address text is selected.
- Mail templates (outline Buttons rendered as `mailto:` links): "Hiring for a backend role" (subject "Backend role at ", body "Role:\nTeam:\nStack:\nLink to the job description:") / "Question about Natalie" (subject "About Natalie").
- Links: GitHub (`https://github.com/chandiimanpreet`), `<Todo what="LinkedIn URL" />`, `<Todo what="LeetCode URL" />`. No phone number. No form.

### 5.9 Footer
One line (stacks at 320), `text-sm text-muted-foreground`: "Built by Manpreet Singh with React, TypeScript and Tailwind CSS." / "GitHub" / "Back to top". The rail ends here in a hollow node. No health block, no counters.

## 6. Component list (one owner per file)
Foundation-owned (other agents import, never edit): `src/index.css` (section 2), `index.html` (title, meta, fonts, theme script), `src/App.tsx`, `src/components/ui/*`, and three small shared files:

```ts
// src/lib/site.ts
export const site = {
  name: "Manpreet Singh", role: "Backend Engineer", email: "manpreetchandi555@gmail.com",
  github: "https://github.com/chandiimanpreet",
  linkedin: null as string | null, leetcode: null as string | null,   // null renders <Todo>
  city: "Patiala", timeZone: "Asia/Kolkata",
} as const;
export type SectionId = "about" | "experience" | "projects" | "workflows" | "skills" | "showcase" | "contact";
export const nav: { id: SectionId; label: string }[];   // labels are the ids, capitalised
// src/lib/use-active-section.ts: one IntersectionObserver over `section[id]`
export function useActiveSection(): SectionId | "top";
// src/components/Todo.tsx: <Badge variant="todo">TODO: {what}</Badge>; always visible until the content exists
export function Todo(props: { what: string }): JSX.Element;
```
`App.tsx` renders: `<SiteHeader/> <Rail> <Hero/> <About/> <Experience/> <Projects/> <Workflows/> <Skills/> <Showcase/> <Contact/> </Rail> <Footer/>`.

| # | File (owner) | Exports and responsibilities | shadcn | Depends on |
|---|---|---|---|---|
| 1 | `src/components/SiteHeader.tsx` | `SiteHeader()`: monogram, nav with `aria-current`, theme toggle (inline; toggles `.dark` on `<html>` and `localStorage.theme`), Sheet nav below `md` | Button, Sheet | site, use-active-section |
| 2 | `src/components/Rail.tsx` | `Rail({children})`, `Section(props: SectionProps)` | none | use-active-section |
| 3 | `src/sections/Hero.tsx` | `Hero()` incl. clock and proof stats | Button, Card | 2, 8, site |
| 4 | `src/sections/About.tsx` | `About()` | none | 2 |
| 5 | `src/sections/Experience.tsx` | `Experience()` with a local `entries` array | none | 2 |
| 6 | `src/sections/Projects.tsx` | `Projects()` with a local `projects` array | Accordion, Badge, Button | 2, Todo |
| 7 | `src/sections/Workflows.tsx` | `Workflows()`: owns `useTraceRun`, selected step, controls, request path strip, inspector, log, disclosure | Button, ToggleGroup, Progress, Card, Badge | 2, 8, 9, 10 |
| 8 | `src/components/pipeline/PipelineGraph.tsx` | `PipelineGraph(props: PipelineGraphProps)` | Badge | 10 |
| 9 | `src/components/pipeline/WorkflowTimeline.tsx` | `WorkflowTimeline(props: WorkflowTimelineProps)` | none | 10 |
| 10 | `src/components/pipeline/trace.ts` | types, `NODES`, `STAGES`, `SCENARIOS`, `idleRun()`, `finishedRun()`, `reduce()`, `useTraceRun()` | none | none |
| 11 | `src/sections/Skills.tsx` | `Skills()` with a local `groups` array | none | 2 |
| 12 | `src/sections/Showcase.tsx` | `Showcase()` with a local `people` array and the spotlight handler | Card, Avatar | 2, Todo |
| 13 | `src/sections/Contact.tsx` | `Contact()` incl. copy button | Button | 2, Todo, site |
| 14 | `src/sections/Footer.tsx` | `Footer()` with the hollow end node | none | site |

Copy lives in the file that renders it (section 5 is the source); there is no shared content file to fight over.

```ts
// 2. Rail.tsx
interface SectionProps {
  id: SectionId | "top";
  title?: string;                    // renders the h2 and sets aria-labelledby; Hero passes none
  variant?: "main" | "fork";         // fork: steel node and bracket (Showcase)
  aside?: React.ReactNode;           // beside the h2, e.g. the branch tag
  children: React.ReactNode;
}
// 10. trace.ts
export type NodeId = "jd" | "resume" | "skill" | "experience" | "education" | "recommendation";
export type NodeState = "idle" | "running" | "failed" | "retrying" | "done";
export type ScenarioId = "clean" | "retry";
export interface PipelineNode { id: NodeId; label: string; role: string; tech: string[]; stage: 0 | 1 | 2 }
export interface TraceEvent { at: number; node: NodeId; type: "start" | "fail" | "retry" | "complete"; attempt: number }
export interface Scenario { id: ScenarioId; label: string; totalMs: number; events: TraceEvent[] }   // sorted by `at`
export interface Span { node: NodeId; attempt: number; startMs: number; endMs: number | null; outcome: "running" | "failed" | "done" }
export interface RunState {
  scenario: ScenarioId; status: "idle" | "running" | "paused" | "done";
  clockMs: number; cursor: number;                       // cursor = events applied so far
  nodes: Record<NodeId, { state: NodeState; attempt: number }>;
  spans: Span[]; log: { at: number; message: string }[];
}
export const NODES: Record<NodeId, PipelineNode>;
export const STAGES: { label: string; nodes: NodeId[] }[];           // 3 stages, render order
export const SCENARIOS: Record<ScenarioId, Scenario>;                // event table in 5.5
export function idleRun(s: ScenarioId): RunState;                    // nothing started
export function reduce(run: RunState, toClockMs: number): RunState;  // pure; applies every event with at <= toClockMs
export function finishedRun(s: ScenarioId): RunState;                // reduce(idleRun(s), totalMs); the default view
export function useTraceRun(initial?: ScenarioId): RunState & {      // initial defaults to "retry"
  play(): void; pause(): void; step(): void; reset(): void; setScenario(s: ScenarioId): void;
};  // one requestAnimationFrame loop while status is "running"; cancelled on pause, done, unmount and document.hidden
// 8. PipelineGraph.tsx
interface PipelineGraphProps {
  nodes?: RunState["nodes"];          // omitted: every step renders as done (hero)
  compact?: boolean;                  // hero: steps are <span>, no state labels, smaller type
  selected?: NodeId; onSelect?(id: NodeId): void;
}
// 9. WorkflowTimeline.tsx
interface WorkflowTimelineProps { spans: Span[]; clockMs: number; totalMs: number; selected?: NodeId; onSelect?(id: NodeId): void }
```
Build notes:
- **Graph structure is HTML, not SVG.** An `<ol>` of three stages (`grid md:grid-cols-[1fr_3rem_1fr_3rem_1fr]`, stacked below `md`), each a `<ul>` of step `<button>`s (`<span>` when `compact`). Only the two connectors between stages are inline SVG (`aria-hidden`, `preserveAspectRatio="none"`, `<path class="edge" pathLength="1">`): a fan-in/fan-out bracket from `md`, a single down arrow below it. A connector is drawn once any step in the next stage has left `idle`.
- `trace.ts` leaves one runnable check: `finishedRun("retry")` has every step `done`, `resume.attempt === 2` and exactly one `failed` span. Use `src/components/pipeline/trace.test.ts` if Vitest is present, otherwise an `import.meta.env.DEV` `console.assert`.
- Workflows renders the log as an `<ol>`; only the newest line is mirrored into one `aria-live="polite"` region.

## 7. Motion
**One signature moment: the workflow run.** Everything else is quiet.
- Trace: step border, fill and icon change over 150ms; connectors draw via `stroke-dashoffset` over 500ms; timeline bars grow with `scale-x`. All CSS, driven by `data-state` / `data-drawn` from `RunState`. No travelling dots, no looping packets; the only spinner is the `running` icon.
- Rail: the saffron fill tracks scroll (`.rail-fill`, CSS scroll timeline). Without support the rail is fully drawn in `border-input`. V1's load-time rail draw is removed; it competed with the run.
- Reveal: sections fade in and rise 12px over 240ms, once, via a `data-inview` attribute set by `Section`. Hero children stagger at 60ms. Content is visible by default; the hidden start state applies only under a `.js` class, so a failed bundle never leaves blank sections.
- Hover and theme: colour, border and background only, 120ms. Arrow glyphs nudge 4px.
- Not allowed: parallax, custom cursors, typewriter or scramble text, tilt, particles, scroll-jacking, autoplaying the trace, animating layout properties.

**Reduced motion** (`prefers-reduced-motion: reduce`): the global rule in section 2 zeroes transitions. `useTraceRun().play()` skips the clock and jumps to the finished state of the selected scenario; Step remains the way to walk it event by event. State changes still happen because they are information. The `Loader` icon does not spin. Smooth scroll is off.

## 8. Accessibility
- Landmarks: `header`, `nav[aria-label="Primary"]`, `main#main`, one `section[aria-labelledby]` each, `footer`. One h1, h2 per section, h3 for entries, rows, cards, "Inside the workflow" and the inspector title.
- **The graph's text alternative is its own DOM**: an ordered list of stages, each a list of buttons named "{label}, {state}, attempt {n}". Connectors are decoration. Its `<figure>` has a visible `figcaption`.
- **The timeline is a real `<table>`** (caption "Workflow execution"; columns Step, Attempts, Outcome, Started, Ended in replay seconds). Bars sit in the Outcome cell with `aria-hidden`; the cell text carries the meaning.
- **The request path is an `<ol>`** that reads "Client; HTTP, Express API; starts, Temporal workflow; SSE progress, Client". Arrows are generated content.
- Keyboard: every step is a tab stop in reading order; Enter or Space selects; controls are native buttons; ToggleGroup and Accordion keep Radix roving focus. No traps; Sheet returns focus to its trigger.
- Announcements: one `aria-live="polite"` line for trace events; a separate `role="status"` for "Copied". The Run button changes its label instead of using `aria-pressed`.
- Focus ring: the single `:focus-visible` rule in section 2, 2px saffron, 3px offset, never removed.
- Contrast (computed in DESIGN.md section 2, values unchanged): body 15.6:1 dark / 16.1:1 light; muted 8.3 / 6.3; saffron 9.3 / 5.9; steel 8.3 / 6.2; moss 8.9 / 5.9; coral 8.1 / 6.3; control outlines (`input`) at least 3.5:1. `border` alone never marks state or an interactive boundary.
- State is never colour-only: each trace state has an icon and a word; failed and idle also differ by dashed border.
- Targets at least 44px on touch. External links open in the same tab. Rail, nodes, fork and branch tag are `aria-hidden`.
- Verify at 320px, at 200% zoom, keyboard only, both themes, forced-colors, and with a screen reader running "Fail one step".

## 9. Performance
- No runtime data fetching. The only third-party requests are the fonts and six lazy 48px avatars.
- Dependencies: react, react-dom, the Radix packages behind the eight primitives, `lucide-react` (named imports only), `clsx`, `tailwind-merge`, `class-variance-authority`. No animation, graph, chart, date or state library.
- Budget (check with `vite build`): initial JS at most 130 kB gzip, CSS at most 20 kB gzip, no layout shift (every image has `width`/`height`; the default trace state renders on first paint).
- Animate only `transform`, `opacity` and `stroke-dashoffset`. One `requestAnimationFrame` loop, alive only while a trace runs. One IntersectionObserver per concern. The spotlight is one delegated `pointermove` on the grid.
- `index.html`: inline theme script before first paint, `<meta name="theme-color">` per theme, a `<noscript>` line with name, role and email.

## 10. Open items for the owner (each is a visible `<Todo>` or a `[CONFIRM]` until resolved)
- LinkedIn URL and LeetCode URL (not in the resume). Natalie repository or demo URL.
- Showcase: confirm the six logins and write one line on each.
- `[CONFIRM]` the three evaluators run concurrently, as the trace draws them. If not, make the three start times in 5.5 sequential.
- `[CONFIRM]` there is no separate aggregator step before the recommendation. If there is, add it as a fourth stage.
- `[CONFIRM]` the request path wording: the client calls the Express API over HTTP and the API starts the workflow. The resume lists Express, Temporal and SSE but does not spell out the hops. MongoDB and Redis are left off the path because the resume does not say what each stores.
- Approve the voice lines that are not resume text: the About h2, "so a failed step retries instead of losing the job", "so one user's batch cannot starve another's".
- Resume PDF: not linked, because the file contains the phone number. Supply a version without it to add a "Resume" link.
- An availability line ("Open to roles") is omitted because the resume does not state it.
