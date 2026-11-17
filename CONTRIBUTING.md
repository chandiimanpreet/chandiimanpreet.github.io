# Portfolio: working agreement

Personal portfolio of **Manpreet Singh, Backend Engineer** (GitHub `chandiimanpreet`): backend systems in Go and Node.js/TypeScript, distributed systems, durable workflows, AWS and Kubernetes, plus experience shipping LLM agent services. Never describe him as an "AI engineer" or "AI backend engineer". Deployed to GitHub Pages at the user-site root (`chandiimanpreet.github.io`, Vite `base: '/'`).

The previous vanilla HTML/CSS/JS site is archived in `_legacy/` (read-only reference; do not import from it).

## Stack

- Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`).
- Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first config in `src/index.css` (`@theme inline`). No `tailwind.config.js`.
- shadcn/ui (Radix base, `components.json`), `lucide-react` icons. No animation library.
- Fonts self-hosted via `@fontsource-variable/*` (Bricolage Grotesque, Instrument Sans, JetBrains Mono). No font CDNs.
- Vitest + Testing Library + jsdom. ESLint (flat config, typescript-eslint, react-hooks) and Prettier.
- Data: static content in `src/content/*.ts` only. The site makes no network requests at runtime (no GitHub API).

## Sources of truth

- Content: `docs/RESUME.md` -> `src/content/*.ts`. Every number on the site must be on the resume (a review rule, not a test). Exception: the simulated readouts in the hero's request-flow diagram and background are decoration, not claims.
- Visual design: `docs/DESIGN-V3.md`, with the addenda `docs/DESIGN-V3-HEADER.md` (header) and `docs/DESIGN-V3-BACKGROUND.md` (hero background); an addendum wins where it disagrees. Older `DESIGN*.md` files are history.
- Security: `docs/SECURITY.md` (CSP, URL allowlist, PII, CI).

## Roles

- **Design** (palette, type, layout, copy, wireframes): a design agent, writes to `docs/DESIGN*.md`.
- **Implementation**: an implementation agent working strictly from the design docs. Implementation never invents design decisions; it asks or follows the docs.

## Folder map

```
index.html                 meta/SEO/OG, theme-color, <html class="dark"> (CSP meta injected at build)
vite.config.ts             alias, CSP plugin, build + test config
src/
  main.tsx  App.tsx        App renders sections in the order of src/content/nav.ts
  index.css                palette + Tailwind tokens (the only place raw colours live)
  types/content.ts         every content type
  content/                 profile (+ brand), projects, socials, nav (+ headingId); content.test.ts
  lib/                     utils (cn), url (safeUrl, resumeHref, githubProfileUrl, host lists),
                           styles (linkClass, targetLinkClass), motion (prefersReducedMotion)
  components/ui/           shadcn output only: badge, button (generated; do not hand-edit except the cn import)
  components/layout/       Layout, SiteHeader, SiteFooter, Section, useActiveSection; header/ (BrandMark, NavLink, useScrolled)
  components/shared/       cross-section components: ExternalLink, ResumeLink, StackList
  components/hero/         hero parts: typed tagline, request-flow diagram, background canvas, frame loop, motion toggle
  components/projects/     ProjectCard (terminal-window card)
  components/contact/      CopyEmailButton, SocialIcon, contact.ts (mailto, clipboard)
  sections/<Name>Section.tsx  Hero, About, Projects, Contact: one file per section, default export
public/                    favicon.svg, resume/ (PDF), robots.txt, .well-known/security.txt
scripts/check-dist.sh      post-build audit of dist/
.github/                   workflows/deploy.yml, workflows/codeql.yml, dependabot.yml
```

## Ownership rule (parallel work)

- Each section agent owns exactly `src/sections/<Name>Section.tsx`, plus new files it creates under `src/components/<name>/` (a folder named after the section, e.g. `src/components/projects/`).
- Do not edit another section's files, `src/components/ui/*`, `src/components/layout/*`, `src/components/shared/*`, `src/lib/*`, `src/types/*`, `src/content/*`, `src/index.css`, `App.tsx`, configs or CI. Need a change there? Ask the coordinator / foundation owner.
- A section keeps its `id`, `aria-labelledby={headingId(id)}` and heading. It must stay a direct child `<section>` of `<main>` (App test checks this).

## Engineering principles

- **SOLID**, applied to React: one component per file and one job per module (pure logic in `.ts` files, state in `use*.ts` hooks next to the components that use them, rendering in components). Components receive data from props or `@/content`; nothing calls `fetch`. Add a section or card type by adding a file, not by editing core code.
- **DRY**: one source for design values (tokens in `src/index.css`), content (`src/content`), and helpers (`src/lib`). No repeated colours, magic numbers or URLs.
- **KISS / YAGNI**: no dependency or abstraction without a second user. No new runtime dependency without the coordinator's OK.
- Comments explain why, not what.

## Conventions

- Tailwind only, tokens only: no hex/rgb/hsl, no arbitrary colour values (`bg-[#...]`), no inline colour styles. Use the semantic classes (`bg-background`, `text-muted-foreground`, `text-primary`, `border-border-strong`, `text-branch`, ...).
- Merge classes with `cn()` from `@/lib/utils` (it knows the custom `text-hero/h2/h3/lead/code` sizes).
- Named exports for components; **no default exports except section files**.
- Props typed with `interface XProps`. Files: `PascalCase.tsx` for components, `camelCase.ts` for hooks/lib.
- Off-site links only via `<ExternalLink>` (`newTab` for GitHub/LinkedIn); the resume only via `<ResumeLink>`. Remote URLs only after `safeUrl` / `resumeHref`. No `dangerouslySetInnerHTML` (lint enforces).
- Motion: UI transitions are CSS (Tailwind transitions or `tw-animate-css` with the `ease-brand` / `duration-120|240|900` tokens, plus `motion-reduce:` variants and the global `prefers-reduced-motion` rule in `src/index.css`); the hero entrance is CSS (`animate-in`). The hero's canvas, diagram and typed tagline run on the single `requestAnimationFrame` loop (`useFrameLoop`), which pauses off-screen, on hidden tabs, under reduced motion and via the hero's pause control.
- Text links: `linkClass` (inline) or `targetLinkClass` (standalone, 44px) from `@/lib/styles`; never restate the class string.

## Quality bar (every change)

- Semantic HTML, one `<h1>` (hero), landmarks, alt text, visible focus, keyboard reachable, WCAG AA (dark theme only, no toggle).
- Responsive from 320px, no horizontal scroll. Respect `prefers-reduced-motion`.
- No phone number in the site source or rendered page (test enforced). The resume PDF in `public/resume/` is the one exception, by the owner's choice. Email only via `profile.email` (assembled at runtime).
- Before claiming done: `npm run typecheck && npm run lint && npm test && npm run build`.

## Behavior

- Be concise. Say what was done and what is left.
- Confirm before anything outward-facing: pushing, creating repos, enabling Pages, publishing.
- Do not fetch external websites unless the user asks.
- Never commit secrets or tokens.
