# SKILLS: how to work in this repo

Playbooks for recurring tasks. Follow `CONTRIBUTING.md` first; this file is the how.

## Commands

`npm run dev` (Vite, http://localhost:5173) · `npm run typecheck` · `npm run lint` · `npm test` · `npm run build` · `npm run preview` (production build with CSP; use it to check for CSP console errors) · `npm run format`.

## Build a section (section agents)

1. Edit only `src/sections/<Name>Section.tsx` (default export). Put helpers in `src/components/<name>/` as named-export components, one per file.
2. Wrap content in `<Section id="..." eyebrow="..." title="...">` from `@/components/layout/Section` (gives `id`, `aria-labelledby`, the mono eyebrow line, h2, container and section spacing). Hero builds its own `<section>` with the page's only `<h1>`.
3. Import data from `@/content/*` and types from `@/types/content`. Never hard-code resume facts in JSX.
4. Add a `*.test.ts(x)` beside your component if it has logic (branches, mapping). Run the four checks before handing back.

## Add a section (new slot)

1. Add the id to `SectionId` in `src/types/content.ts` and an entry to `sections` in `src/content/nav.ts` (order = page order; `inNav` = header link).
2. Create `src/sections/<Name>Section.tsx` and register it in `SECTION_COMPONENTS` in `src/App.tsx`.

## Add or change a project

- Edit `projects` in `src/content/projects.ts`: `{ id, name, description, stack, repoUrl, liveUrl? }`; drop `placeholder: true` when the repo is real. Cards are rendered by `ProjectCard`; no API calls.
- `npm test` checks unique ids, `repoUrl` on `GITHUB_LINK_HOSTS`, `liveUrl` https and at most 6 stack items. Facts and numbers must be in `docs/RESUME.md`.

## Change the resume

- `profile.resumeUrl` in `src/content/profile.ts`: `/resume/<file>.pdf` (file in `public/resume/`) or an https link on `drive.google.com` / `docs.google.com` (`RESUME_HOSTS`). Anything else, or `null`, renders every `<ResumeLink>` disabled.

## Shared building blocks (reuse before writing new ones)

- `@/content/nav`: `sections`, `navItems`, `headingId`.
- `@/lib/url`: `safeUrl`, `resumeHref`, `githubProfileUrl`, `isGithubLogin`, `GITHUB_LINK_HOSTS`, `RESUME_HOSTS`.
- `@/lib/styles`: `linkClass`, `targetLinkClass`. `@/lib/motion`: `prefersReducedMotion`.
- `@/components/shared`: `ExternalLink` (`newTab`, `allowedHosts`), `ResumeLink`, `StackList` (mono tech badges, optional `label`).
- `@/components/hero/useFrameLoop`: the page's only `requestAnimationFrame` loop; anything that animates in JS joins it.

## Change design values

- Edit `src/index.css` only: raw values in `.dark` (the shipped theme; `<html class="dark">`), Tailwind names in `@theme inline`.
- Available tokens:
  - Colours: `background foreground card card-foreground popover popover-foreground primary primary-foreground secondary secondary-foreground muted muted-foreground accent accent-foreground destructive border border-strong input ring surface surface-2 branch ok`, plus hero background tokens. `primary` is saffron (links, primary action, focus). shadcn's `accent` is the subtle hover fill, not saffron.
  - Fonts: `font-display` (= `font-heading`), `font-sans`, `font-mono`.
  - Sizes: `text-hero text-h2 text-h3 text-lead text-code` (line-height/tracking/weight included) plus Tailwind defaults.
  - Spacing: Tailwind's 4px scale, plus `section gutter header target` (e.g. `py-section px-gutter h-target`).
  - Width: `max-w-content` (70rem), `max-w-hero` (80rem), `max-w-measure` (62ch).
  - Radius: `rounded-sm` 4px, `rounded-md` and up = `--radius` (10px), `rounded-full`.
  - Motion: `ease-brand`, `duration-120 / 240 / 900`, `tw-animate-css` classes (`animate-in fade-in ...`), always with a `motion-reduce:` fallback.
- Changing the `.dark` `--background`: also update the `theme-color` literal in `index.html` (a content test fails until they match).

## Add a shadcn component

- `npx shadcn@latest add <name> -y`, then replace `from "cn"` with `from "@/lib/utils"` in the generated file (this project uses clsx + tailwind-merge, not the `cn` package) and remove `cn` from `package.json` if the CLI added it.

## Security rules (docs/SECURITY.md)

- CSP is injected at build: no inline scripts or `<style>` tags, no third-party hosts. Adding a host means editing the CSP in `vite.config.ts` and SECURITY.md together.
- No runtime network requests and no browser storage. Reintroducing either needs a SECURITY.md update first.
- Off-site links: `<ExternalLink>`; raw `<a href="https://...">` fails lint. GitHub and LinkedIn links use `newTab` (`target="_blank"`, `rel="noopener noreferrer"`, a screen-reader "opens in a new tab" note). The resume opens in a new tab through `<ResumeLink>`.
- No phone number in source or rendered page. The resume PDF carries it by the owner's choice; never copy it from there.

## Design work

- Read the brief, write `docs/DESIGN*.md`: palette, type, layout wireframes, copy, motion, component states. Avoid templated defaults.

## Implementation work

- Read `CONTRIBUTING.md`, `SKILLS.md`, the design docs (`docs/DESIGN-V3.md` and its addenda). Implement exactly; flag gaps instead of inventing.

## Verify

- `npm run typecheck && npm run lint && npm test && npm run build`, then `npm run preview`: console clean (no CSP errors), 320px and 1440px, keyboard order, reduced motion and the hero pause control, new-tab links, resume opens.

## Deploy (only when the user says so)

- Push `main` of repo `chandiimanpreet.github.io`; `.github/workflows/deploy.yml` runs audit, checks and build, then deploys to Pages (Settings > Pages > Source: GitHub Actions, Enforce HTTPS on).
