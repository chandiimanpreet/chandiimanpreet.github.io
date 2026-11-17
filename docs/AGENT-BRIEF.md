# AGENT-BRIEF: rules for every parallel build agent

Read in this order before touching code: `CONTRIBUTING.md`, `SKILLS.md`, `docs/SECURITY.md`, then your slice of `docs/DESIGN-V2.md` (section 5 per-section spec, section 6 component list and TypeScript contracts, sections 7 to 9 motion, a11y, performance), and `docs/RESUME.md` (only source of facts). Other agents are building the other files at the same moment.

## Reconciling DESIGN-V2 with the foundation (the foundation's layout wins)
| DESIGN-V2 says | Use in this repo |
|---|---|
| `src/sections/Hero.tsx` etc. | `src/sections/HeroSection.tsx` (default export, already exists as a placeholder). Same for About, Experience, Projects, Skills, Showcase, Contact |
| Workflows section | `src/sections/AgentsSection.tsx`, section id `agents` (nav label is "Workflows"; heading text per DESIGN-V2) |
| `site` object in `src/lib/site.ts` | `profile` from `@/content/profile`, nav from `@/content/nav` |
| `Rail`, `Section` in `components/Rail.tsx` | `Section` in `@/components/layout/Section` (keep the `id`, `title` props working; the rail agent adds the optional `variant` and `aside` props) |
| `Todo` component | `@/components/shared/Todo` is created by the rail agent (`<Todo what="..."/>`); import it, do not create it |
| Copy "lives in the file that renders it" | Resume facts come from `@/content/*` (typed, tested). Pure UI copy (headings, labels, microcopy) stays in your component file |
| Footer, SiteHeader | `@/components/layout/SiteFooter.tsx`, `SiteHeader.tsx`, `ThemeToggle.tsx` |
| ToggleGroup, Progress, Avatar | Not installed. Do not run `shadcn add`. Use Button/Tabs/Badge/Card, or a plain `<img>` with width/height |

## Ownership (hard rule)
Edit only the files named in your task. New files only inside your own folder. Never edit `src/content/*`, `src/lib/*`, `src/hooks/*`, `src/types/*`, `src/index.css`, `App.tsx`, `components/ui/*`, configs, CI, package.json. Never run `npm install` or add dependencies. Need a change elsewhere? Put it in your report, do not do it.

## Engineering rules
- SOLID/DRY/KISS as in CONTRIBUTING.md: one component per file, named exports (default export only for section files), props as `interface XProps`, data in via props or `@/content`, no `fetch` in components, small pure functions for logic so they can be tested.
- Tailwind with tokens only (see SKILLS.md "Change design values"): no hex/rgb values, no arbitrary colour classes, `cn()` for merging. Interactive targets at least 44px on touch. Visible `focus-visible` ring. Respect `prefers-reduced-motion` (animate with `motion` tokens from `@/lib/motion` or CSS transitions).
- Security (docs/SECURITY.md): remote text only as React children; no `dangerouslySetInnerHTML`; off-site links only via `<ExternalLink>`; remote URLs only after `safeUrl`; no phone number; no new third-party hosts; no inline scripts.
- Accessibility: semantic landmarks, one h1 (hero only), headings in order, text alternatives for any diagram, state never colour-only, keyboard operable.
- Do not invent facts or numbers. Anything not in `docs/RESUME.md` is a visible `<Todo what="..."/>`.
- Positioning: "Backend Engineer", never "AI engineer". Agents are one strength among several.

## Verify (scoped; others are mid-edit, so the full build may fail on their files)
- `npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -E "<your file paths>"` (ignore errors in files you do not own; mention them if they block you)
- `npx eslint <your files>`
- `npx vitest run <your test files>` if you wrote tests (add a `*.test.ts(x)` beside any logic).
- Do NOT run `npm run build`, `npm run dev` or `npm run format` (the whole-repo versions); the coordinator does the integration pass.

## Report (short)
Files written, exports and props, tests run and result, anything you needed from files you do not own, open `<Todo>`s.
