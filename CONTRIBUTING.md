# Portfolio: working agreement

Personal portfolio of **Manpreet Singh, Backend Engineer** (GitHub `chandiimanpreet`): backend systems in Go and Node.js/TypeScript, distributed systems, durable workflows, AWS and Kubernetes, plus experience shipping LLM agent services. Never describe him as an "AI engineer" or "AI backend engineer". Deployed to GitHub Pages at the user-site root (`chandiimanpreet.github.io`, Vite `base: '/'`).

The previous vanilla HTML/CSS/JS site is archived in `_legacy/` (read-only reference; do not import from it).

## Stack

- Vite + React 19 + TypeScript (strict, `noUncheckedIndexedAccess`).
- Tailwind CSS v4 via `@tailwindcss/vite`, CSS-first config in `src/index.css` (`@theme inline`). No `tailwind.config.js`.
- shadcn/ui (Radix base, `components.json`), `lucide-react` icons. No animation library: CSS transitions and `tw-animate-css` classes only.
- Fonts self-hosted via `@fontsource-variable/*` (Bricolage Grotesque, Instrument Sans, JetBrains Mono). No font CDNs.
- Vitest + Testing Library + jsdom. ESLint (flat config, typescript-eslint, react-hooks) and Prettier.
- Data: static content in `src/content/*.ts`; live data only from the GitHub REST API through `src/lib/github.ts`.

## Sources of truth

- Content: `docs/RESUME.md` -> `src/content/*.ts`. Every number on the site must be on the resume; a content test enforces it.
- Visual design: `docs/DESIGN.md` + `docs/DESIGN-BACKEND.md` (the addendum wins where they disagree).
- Security: `docs/SECURITY.md` (CSP, URL allowlist, API guards, cache rules, PII, CI).

## Roles and models

- **Design** (palette, type, layout, copy, wireframes): a subagent with `model: "fable"`, writes to `docs/DESIGN*.md`.
- **Implementation**: a subagent with `model: "opus"`, working strictly from the design docs. Implementation never invents design decisions; it asks or follows the docs.

## Folder map

```
index.html                 meta/SEO/OG, loads public/theme-init.js (CSP meta injected at build)
vite.config.ts             aliases, CSP plugin, build + test config
src/
  main.tsx  App.tsx        App renders sections in the order of src/content/nav.ts
  index.css                palette + Tailwind tokens (the only place raw colours live)
  types/content.ts         every content type
  content/                 profile, experience, projects (+ systems), skills, education,
                           achievements, socials, showcase, nav, hero (stat picks),
                           workflow (request path, Temporal lines), contact (mailto templates)
  lib/                     utils (cn, relativeTime, formatPeriod), github, guards,
                           url (safeUrl, isGithubLogin, githubProfileUrl),
                           anchors (headingId, projectAnchorId, systemAnchorId),
                           styles (linkClass, targetLinkClass, projectGridClass),
                           time (formatClock, formatLocalTime, msUntilNextMinute)
  hooks/                   useGithubRepos, useGithubResource, useTheme, useMinuteTick
  components/ui/           shadcn output only (generated; do not hand-edit except the cn import)
  components/layout/       Layout, SiteHeader, SiteFooter, Section, ThemeToggle, Rail
  components/shared/       cross-section components: ExternalLink, Todo, PeriodTime, StackList
  sections/<Name>Section.tsx  one file per section, default export
public/                    theme-init.js, favicon.svg, robots.txt, .well-known/security.txt
.github/                   workflows/deploy.yml, dependabot.yml
```

## Ownership rule (parallel work)

- Each section agent owns exactly `src/sections/<Name>Section.tsx`, plus new files it creates under `src/components/<name>/` (a folder named after the section, e.g. `src/components/projects/`).
- Do not edit another section's files, `src/components/ui/*`, `src/components/layout/*`, `src/lib/*`, `src/hooks/*`, `src/types/*`, `src/content/*`, `src/index.css`, `App.tsx`, configs or CI. Need a change there? Ask the coordinator / foundation owner.
- A section keeps its `id`, `aria-labelledby={headingId(id)}` and heading. It must stay a direct child `<section>` of `<main>` (App test checks this).

## Engineering principles

- **SOLID**, applied to React: one component per file and one job per module (fetching in `lib`, state in `hooks`, rendering in components). Components receive data; they never call `fetch`. Add a section or card type by adding a file, not by editing core code.
- **DRY**: one source for design values (tokens in `src/index.css`), content (`src/content`), and helpers (`src/lib`). No repeated colours, magic numbers or URLs.
- **KISS / YAGNI**: no dependency or abstraction without a second user. No new runtime dependency without the coordinator's OK.
- Comments explain why, not what.

## Conventions

- Tailwind only, tokens only: no hex/rgb/hsl, no arbitrary colour values (`bg-[#...]`), no inline colour styles. Use the semantic classes (`bg-background`, `text-muted-foreground`, `text-primary`, `border-border-strong`, `text-branch`, ...).
- Merge classes with `cn()` from `@/lib/utils` (it knows the custom `text-hero/h2/h3/lead/code` sizes).
- Named exports for components; **no default exports except section files**.
- Props typed with `interface XProps`. Files: `PascalCase.tsx` for components, `camelCase.ts` for hooks/lib.
- Off-site links only via `<ExternalLink>`; remote URLs only after `safeUrl`. No `dangerouslySetInnerHTML` (lint enforces).
- Animation via CSS only: Tailwind transitions or `tw-animate-css` with the `ease-brand` / `duration-120|240|900` tokens, plus `motion-reduce:` variants (and the global `prefers-reduced-motion` rule in `src/index.css`). The hero entrance is CSS (`animate-in`), not JS.
- Text links: `linkClass` (inline) or `targetLinkClass` (standalone, 44px) from `@/lib/styles`; never restate the class string.

## Quality bar (every change)

- Semantic HTML, one `<h1>` (hero), landmarks, alt text, visible focus, keyboard reachable, WCAG AA in both themes.
- Responsive from 320px, no horizontal scroll. Respect `prefers-reduced-motion`.
- GitHub data: handle loading, error and rate limit (60 req/h): never a blank section.
- No phone number anywhere (test enforced). Email only via `profile.email` (assembled at runtime).
- Before claiming done: `npm run typecheck && npm run lint && npm test && npm run build`.

## Behavior

- Be concise. Say what was done and what is left.
- Confirm before anything outward-facing: pushing, creating repos, enabling Pages, publishing.
- Do not fetch external websites unless the user asks.
- Never commit secrets or tokens.
