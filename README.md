# chandiimanpreet.github.io

Portfolio of Manpreet Singh, Backend Engineer: Go and Node.js/TypeScript services, distributed systems, durable workflows on Temporal, AWS and Kubernetes. A single static, dark-only page: a hero (typed tagline, request-flow diagram, animated background), About, Projects (terminal-window cards from a curated list) and Contact. No runtime network requests; all content is in `src/content/`.

Live: https://chandiimanpreet.github.io/ (deployed by GitHub Actions on every push to `main`).

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
index.html            meta, SEO, theme-color (dark only)
vite.config.ts        alias, CSP plugin, build and test config
src/
  App.tsx             renders sections in the order of src/content/nav.ts
  index.css           palette and Tailwind tokens (the only place raw colours live)
  types/content.ts    every content type
  content/            profile, projects, socials, nav; content.test.ts
  lib/                url (safeUrl, resumeHref, host lists), styles, motion, utils
  sections/           HeroSection, AboutSection, ProjectsSection, ContactSection
  components/         ui/ (shadcn), layout/ (+ header/), shared/, hero/, projects/, contact/
public/               favicon, resume/ (PDF), robots.txt, .well-known/security.txt
scripts/check-dist.sh post-build audit
docs/                 RESUME.md (source of facts), DESIGN-V3*.md, SECURITY.md, AGENT-BRIEF.md
_legacy/              archived vanilla site, reference only
```

Working rules for contributors and agents: `CONTRIBUTING.md` and `SKILLS.md`.

## How to

- **Add a project:** replace a placeholder (or append) in `projects` in `src/content/projects.ts`: `{ id, name, description, stack, repoUrl, liveUrl? }`. `repoUrl` must be a GitHub https URL, `liveUrl` https, at most 6 stack items; `npm test` checks all three. Facts and numbers must be in `docs/RESUME.md`.
- **Change the resume:** replace the PDF in `public/resume/` or set `profile.resumeUrl` in `src/content/profile.ts` to a Google Drive link (`drive.google.com` or `docs.google.com`); `null` shows the resume controls disabled.
- **Add a section:** add the id to `SectionId` in `src/types/content.ts`, an entry in `src/content/nav.ts` (order is page order), create `src/sections/<Name>Section.tsx` (default export, wrapped in `<Section>`), and register it in `SECTION_COMPONENTS` in `src/App.tsx`.

## Deployment

GitHub Pages via Actions (`.github/workflows/deploy.yml`): on push to `main` it runs `npm ci`, `npm audit`, typecheck, lint, tests, build and `check-dist.sh`, plus a gitleaks scan, then deploys `dist/`. Pull requests run the checks without deploying. Vite `base` is `/`, so the site must live at the user-site root.

Owner setup (nothing has been pushed yet):

1. Create the repository `chandiimanpreet.github.io` and push `main`.
2. Settings > Pages > Source: **GitHub Actions**; turn on Enforce HTTPS.

## Open owner items

- Projects: the three cards in `src/content/projects.ts` are placeholders; replace them with real repositories.
- `public/.well-known/security.txt`: `Expires` is 2027-11-17; renew before then.
- Pin `gitleaks/gitleaks-action@v2` (`deploy.yml`) to a full commit SHA.

## Security posture

- Strict CSP injected at build: `script-src 'self'`, no inline scripts, no third-party scripts or styles.
- No runtime network requests and nothing stored in the browser.
- Every off-site URL passes `safeUrl` (https only, host allowlist) through `<ExternalLink>`; the resume link passes `resumeHref`. GitHub, LinkedIn and resume links open in a new tab with `rel="noopener noreferrer"`.
- No `dangerouslySetInnerHTML` (lint-enforced).
- No phone number in the site source or rendered page (test and `check-dist.sh` enforced). The resume PDF contains it by the owner's choice. The email is assembled at runtime.
- CI: least-privilege job permissions, `npm audit`, gitleaks, CodeQL, actions pinned by SHA (one still open, above), no source maps in `dist/`. Details in `docs/SECURITY.md`.
