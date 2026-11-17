# SKILLS: how to work in this repo

Playbooks for recurring tasks. Follow `CONTRIBUTING.md` first; this file is the how.

## Commands

`npm run dev` (Vite, http://localhost:5173) · `npm run typecheck` · `npm run lint` · `npm test` · `npm run build` · `npm run preview` (production build with CSP; use it to check for CSP console errors) · `npm run format`.

## Build a section (section agents)

1. Edit only `src/sections/<Name>Section.tsx` (default export). Put helpers in `src/components/<name>/` as named-export components, one per file.
2. Wrap content in `<Section id="..." title="...">` from `@/components/layout/Section` (gives `id`, `aria-labelledby`, h2, container and section spacing). Hero builds its own `<section>` with the page's only `<h1>`.
3. Import data from `@/content/*` and types from `@/types/content`. Never hard-code resume facts in JSX.
4. GitHub data: `useGithubRepos(login?)` returns `{ status: 'loading' } | { status: 'success', data, stale, savedAt } | { status: 'error', error }`. Show skeletons while loading, a quiet "showing saved data" note when `stale`, and a static fallback on error.
5. Add a `*.test.tsx` beside your component if it has logic (branches, mapping). Run the four checks before handing back.

## Add a section (new slot)

1. Add the id to `SectionId` in `src/types/content.ts` and an entry to `sections` in `src/content/nav.ts` (order = page order; `inNav` = header link).
2. Create `src/sections/<Name>Section.tsx` and register it in `SECTION_COMPONENTS` in `src/App.tsx`.

## Add or change a project

- Edit `projects` in `src/content/projects.ts`. Optional `agentGraph` (nodes + edges; nodes sharing a `from` run in parallel) and `workflow` (ordered steps + guarantees).
- Work systems (closed source) go in `systems` in the same file and are linked from `experience[].systemIds`.
- Every metric value must appear in `docs/RESUME.md`; tests check edges/steps reference real nodes.

## Add a showcased engineer

- Append a GitHub username to `src/content/showcase.ts`. Nothing else. Max 8 (keeps the grid short). Cards make no API calls: avatar and profile URLs are derived from the login (`isGithubLogin`, `githubProfileUrl` in `@/lib/url`).

## Shared building blocks (reuse before writing new ones)

- `@/lib/anchors`: `headingId`, `projectAnchorId`, `systemAnchorId` (in-page link targets).
- `@/lib/styles`: `linkClass`, `targetLinkClass`, `projectGridClass`.
- `@/lib/time`: `formatClock`, `formatLocalTime`, `msUntilNextMinute`; `@/hooks/useMinuteTick` re-renders once a minute for clocks.
- `@/components/shared`: `ExternalLink`, `Todo`, `PeriodTime` (a `<time>` for a date range), `StackList` (mono tech badges, optional `label` for an accessible name).
- UI copy that tests guard lives in `@/content`: `hero.ts` (`heroPicks`), `workflow.ts` (`requestPath`, `temporalGives`), `contact.ts` (`mailTemplates`).

## Change design values

- Edit `src/index.css` only: raw values in `:root` (light, "Paper") and `.dark` (dark, "Ink", default); Tailwind names in `@theme inline`.
- Available tokens:
  - Colours: `background foreground card card-foreground popover popover-foreground primary primary-foreground secondary secondary-foreground muted muted-foreground accent accent-foreground destructive border border-strong input ring surface surface-2 branch ok glow spot`. `primary` is saffron (links, primary action, active node, focus). shadcn's `accent` is the subtle hover fill, not saffron. `branch` (steel) is Showcase only.
  - Fonts: `font-display` (= `font-heading`), `font-sans`, `font-mono`.
  - Sizes: `text-hero text-h2 text-h3 text-lead text-code` (line-height/tracking/weight included) plus Tailwind defaults.
  - Spacing: Tailwind's 4px scale, plus `section gutter header target rail rail-line node node-sm fork label` (e.g. `py-section px-gutter h-target w-rail`).
  - Width: `max-w-content` (70rem), `max-w-measure` (62ch).
  - Radius: `rounded-sm` 4px, `rounded-md`/`lg`/`xl` 10px (nothing larger), `rounded-full`.
  - Motion: `ease-brand`, `duration-120 / 240 / 900`, `tw-animate-css` classes (`animate-in fade-in ...`), always with a `motion-reduce:` fallback. No JS animation library.
- Dark-only tweaks: `dark:` variant (class-based on `<html>`).
- Changing `--background`: also update the `theme-color` literal in `index.html` and both literals in `public/theme-init.js` (a content test fails until they match).

## Add a shadcn component

- `npx shadcn@latest add <name> -y`, then replace `from "cn"` with `from "@/lib/utils"` in the generated file (this project uses clsx + tailwind-merge, not the `cn` package) and remove `cn` from `package.json` if the CLI added it.

## Call the GitHub API

- Only through `src/lib/github.ts` (via the hooks). It validates every response with hand-written parsers, caches in `localStorage` (`pf:v1:*`, 1 h TTL, re-validated on read), backs off on rate limit, and serves stale cache when GitHub is down.
- Remote URLs: `safeUrl(value, GITHUB_LINK_HOSTS)` from `@/lib/url`; avatars are pre-validated to `avatars.githubusercontent.com`. Render remote text as React children only.

## Security rules (docs/SECURITY.md)

- CSP is injected at build: no inline scripts or `<style>` tags, no third-party hosts. Adding a host means editing the CSP in `vite.config.ts` and SECURITY.md together.
- Off-site links: `<ExternalLink>`; raw `<a href="https://...">` fails lint. Same tab, no `target="_blank"`.
- No phone number anywhere; no resume PDF until the owner approves a redacted copy (`profile.resumeUrl` stays `null`, which hides every resume control).

## Design work (Fable)

- Read the brief, write `docs/DESIGN*.md`: palette, type, layout wireframes, copy, motion, component states. Avoid templated defaults.

## Implementation work (Opus)

- Read `CONTRIBUTING.md`, `SKILLS.md`, the design docs. Implement exactly; flag gaps instead of inventing.

## Verify

- `npm run typecheck && npm run lint && npm test && npm run build`, then `npm run preview`: console clean (no CSP errors), 320px and 1440px, keyboard order, both themes, reduced motion, API failure (block api.github.com in devtools).

## Deploy (only when the user says so)

- Push `main` of repo `chandiimanpreet.github.io`; `.github/workflows/deploy.yml` runs audit, checks and build, then deploys to Pages (Settings > Pages > Source: GitHub Actions, Enforce HTTPS on).
