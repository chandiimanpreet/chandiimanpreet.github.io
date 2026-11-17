# AGENT-BRIEF: rules for every parallel build agent

Read in this order before touching code: `CONTRIBUTING.md`, `SKILLS.md`, `docs/SECURITY.md`, then your slice of `docs/DESIGN-V3.md` (plus `docs/DESIGN-V3-HEADER.md` for the header and `docs/DESIGN-V3-BACKGROUND.md` for the hero background; an addendum wins where it disagrees), and `docs/RESUME.md` (only source of facts). Other agents are building other files at the same moment.

## Ownership (hard rule)

Edit only the files named in your task. New files only inside your own folder. Never edit `src/content/*`, `src/lib/*`, `src/types/*`, `src/index.css`, `App.tsx`, `components/ui/*`, `components/layout/*`, `components/shared/*`, configs, CI, package.json. Never run `npm install` or add dependencies. Need a change elsewhere? Put it in your report, do not do it.

## Engineering rules

- SOLID/DRY/KISS as in CONTRIBUTING.md: one component per file, named exports (default export only for section files), props as `interface XProps`, data in via props or `@/content`, no `fetch` anywhere, small pure functions for logic so they can be tested.
- Tailwind with tokens only (see SKILLS.md "Change design values"): no hex/rgb values, no arbitrary colour classes, `cn()` for merging. Interactive targets at least 44px on touch. Visible `focus-visible` ring. Respect `prefers-reduced-motion` (CSS `motion-reduce:` variants; `prefersReducedMotion` from `@/lib/motion` for JS; JS animation only through `useFrameLoop`).
- Security (docs/SECURITY.md): text only as React children; no `dangerouslySetInnerHTML`; off-site links only via `<ExternalLink>`, the resume only via `<ResumeLink>`; URLs only after `safeUrl` / `resumeHref`; no phone number; no new third-party hosts; no inline scripts; no network requests or browser storage.
- Accessibility: semantic landmarks, one h1 (hero only), headings in order, text alternatives for any diagram, state never colour-only, keyboard operable.
- Do not invent facts or numbers. Anything not in `docs/RESUME.md` stays off the page; list it in your report.
- Positioning: "Backend Engineer", never "AI engineer". Agents are one strength among several.

## Verify (scoped; others are mid-edit, so the full build may fail on their files)

- `npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -E "<your file paths>"` (ignore errors in files you do not own; mention them if they block you)
- `npx eslint <your files>`
- `npx vitest run <your test files>` if you wrote tests (add a `*.test.ts(x)` beside any logic).
- Do NOT run `npm run build`, `npm run dev` or `npm run format` (the whole-repo versions); the coordinator does the integration pass.

## Report (short)

Files written, exports and props, tests run and result, anything you needed from files you do not own, facts you left out for lack of a source.
