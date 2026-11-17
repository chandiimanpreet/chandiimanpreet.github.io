# chandiimanpreet.github.io

Portfolio of Manpreet Singh, Backend Engineer: Go and Node.js/TypeScript services, distributed systems, durable workflows on Temporal, AWS and Kubernetes. A single static page with sections for About, Experience, Projects, Workflows (a replayable Temporal run), Skills, Showcase and Contact. The only live data is public repositories from the GitHub REST API.

## Stack

Vite, React 19, TypeScript (strict), Tailwind CSS v4 (CSS-first tokens in `src/index.css`), shadcn/ui on Radix, `lucide-react`, self-hosted fonts via `@fontsource-variable`. Tests: Vitest, Testing Library, jsdom. ESLint and Prettier. No animation, state or chart library.

## Scripts

| Command                    | Does                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`              | Dev server at http://localhost:5173                                           |
| `npm run typecheck`        | `tsc -b`                                                                      |
| `npm run lint`             | ESLint                                                                        |
| `npm test`                 | Vitest (unit, component and content tests)                                    |
| `npm run build`            | Typecheck and production build to `dist/` (CSP meta injected)                 |
| `sh scripts/check-dist.sh` | Post-build audit of `dist/` (inline scripts, source maps, phone numbers, ...) |
| `npm run preview`          | Serve `dist/`; use it to check the console for CSP errors                     |
| `npm run format`           | Prettier                                                                      |

## Folder map

```
index.html            meta, SEO, theme-color; loads public/theme-init.js
vite.config.ts        aliases, CSP plugin, build and test config
src/
  App.tsx             renders sections in the order of src/content/nav.ts
  index.css           palette and Tailwind tokens (the only place raw colours live)
  types/content.ts    every content type
  content/            resume facts and guarded UI copy (profile, experience, projects, skills,
                      showcase, socials, nav, hero, workflow, contact, ...); content.test.ts
  lib/                github (fetch, cache, parse), guards, url, anchors, styles, time, utils
  hooks/              useGithubRepos, useGithubResource, useTheme, useMinuteTick
  sections/           one <Name>Section.tsx per section
  components/         ui/ (shadcn), layout/, shared/, and one folder per section
public/               theme-init.js, favicon, robots.txt, .well-known/security.txt
scripts/check-dist.sh post-build audit
docs/                 RESUME.md (source of facts), DESIGN*.md, SECURITY.md
_legacy/              archived vanilla site, reference only
```

Working rules for contributors and agents: `CONTRIBUTING.md` and `SKILLS.md`.

## How to

- **Add a project:** add an entry to `projects` (or `systems` for closed-source work, linked from `experience[].systemIds`) in `src/content/projects.ts`. Every number must appear in `docs/RESUME.md`; `npm test` fails otherwise.
- **Add a showcase engineer:** append a GitHub login to `src/content/showcase.ts` (8 at most). Avatar and profile links are derived from the login; no API calls.
- **Add a section:** add the id to `SectionId` in `src/types/content.ts`, an entry in `src/content/nav.ts` (order is page order), create `src/sections/<Name>Section.tsx` (default export, wrapped in `<Section>`), and register it in `SECTION_COMPONENTS` in `src/App.tsx`.

## Deployment

GitHub Pages via Actions (`.github/workflows/deploy.yml`): on push to `main` it runs `npm ci`, `npm audit`, typecheck, lint, tests, build and `check-dist.sh`, plus a gitleaks scan, then deploys `dist/`. Pull requests run the checks without deploying. Vite `base` is `/`, so the site must live at the user-site root.

Owner setup (nothing has been pushed yet):

1. Create the repository `chandiimanpreet.github.io` and push `main`.
2. Settings > Pages > Source: **GitHub Actions**; turn on Enforce HTTPS.

## Open owner items

- LinkedIn and LeetCode URLs (`src/content/socials.ts`; shown as TODO until set).
- Showcase: confirm the six logins and write one line on why each is followed.
- Resume PDF: not linked because the file contains a phone number. Decide whether to publish a redacted copy; then set `profile.resumeUrl`.
- `public/.well-known/security.txt`: `Expires` is 2027-11-17; renew before then.
- Pin three actions to full commit SHAs: `gitleaks/gitleaks-action@v2` (`deploy.yml`) and `github/codeql-action/init@v4` / `analyze@v4` (`codeql.yml`).
- Natalie repository or demo URL (`src/content/projects.ts`).
- `[CONFIRM]` workflow details (`docs/DESIGN-V2.md` section 10): evaluators run concurrently, no separate aggregator step, and the request path hops (HTTP to Express API, API starts the Temporal workflow).

## Security posture

- Strict CSP injected at build: `script-src 'self'`, no inline scripts, no third-party hosts beyond `api.github.com` and GitHub avatars.
- GitHub responses are parsed by hand-written guards, never cast; cached in `localStorage` with a TTL and re-validated on read.
- Every remote URL passes `safeUrl` (https only, host allowlist); off-site links go through `<ExternalLink>`.
- No `dangerouslySetInnerHTML` (lint-enforced); remote text renders only as React children.
- No phone number anywhere (test and `check-dist.sh` enforced); the email is assembled at runtime.
- CI: least-privilege job permissions, `npm audit`, gitleaks, CodeQL, actions pinned by SHA (three still open, above), no source maps in `dist/`. Details in `docs/SECURITY.md`.
