# Security checklist

Static Vite + React 19 + TS site on GitHub Pages (`chandiimanpreet.github.io`, base `/`), dark only, no runtime network requests. Implementers follow sections 1-9; the reviewer audits against section 11. Section and audit-item numbers are referenced from code and `scripts/check-dist.sh`; keep them stable. Nothing here needs a server.

## 0. Threat model

- **Assets**: owner's reputation and domain trust (visitors must not be redirected, phished or served malware); owner's phone number and email (privacy); GitHub account and Actions deploy rights; visitors' browsers.
- **Attackers**: (a) supply-chain attacker (malicious npm package or Action version); (b) scraper harvesting email/phone; (c) framer/clickjacker; (d) anyone who gets a bad URL into `src/content` through a PR (caught by `safeUrl` and the content tests).
- **In scope**: XSS, unsafe URLs, secret leakage, dependency and CI integrity, PII exposure, clickjacking caveat.
- **Out of scope**: server hardening, auth, DoS against GitHub Pages, HSTS and real response headers (GitHub Pages controls them; HTTPS is enforced by the Pages setting "Enforce HTTPS", verify it is on), a compromised GitHub account (enable 2FA).

## 1. Content-Security-Policy via meta

GitHub Pages cannot set response headers, so `vite.config.ts` injects this as the first `<meta>` in `<head>` at build time (not in dev). Meta CSP ignores `frame-ancestors`, `report-uri`, `report-to` and `sandbox`; do not include them.

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests"
/>
```

Rationale, each must hold in the final build:

- `script-src 'self'`: no inline scripts, no `eval`. There is no theme bootstrap script: the site is dark only and `index.html` ships `<html class="dark">`. Vite's own module script is same-origin and fine. If an inline script ever becomes unavoidable, allow it only by hash (`'sha256-<base64>'`), recomputed on every edit.
- `style-src 'self'`: Tailwind v4 is compiled to a CSS file by `@tailwindcss/vite`; shadcn adds no runtime CSS. `style-src-attr 'unsafe-inline'` allows inline `style` attributes only (not `<style>` elements or scripts). No source file sets a `style` attribute today (setting `element.style` from JS is CSSOM and is not blocked), so it can be dropped once a preview shows no violations. If the build injects a `<style>` tag, fix the cause; never add `'unsafe-inline'` to `style-src`.
- Fonts: `@fontsource-*` packages are bundled and self-hosted, so `font-src 'self'`. `build.assetsInlineLimit: 0` keeps fonts and images out of `data:` URIs.
- `img-src` and `connect-src` are `'self'` only: the site makes no requests at runtime and renders no remote images. Add hosts only with a written reason in this file, in `vite.config.ts` and here together (`check-dist.sh` compares `img-src`).
- `object-src 'none'`, `base-uri 'self'`, `form-action 'none'` (there are no forms; email is a `mailto:` link). `default-src 'none'` blocks every unlisted type; `upgrade-insecure-requests` is harmless on Pages.
- `frame-ancestors` cannot be enforced via meta (see section 9).
- Dev note: Vite dev (HMR, React refresh) needs inline scripts and `ws:`, so the CSP is build-only. Test with `npm run build && npm run preview`; the console must show zero CSP violations.

## 2. Other meta and link hygiene

- `<meta name="referrer" content="strict-origin-when-cross-origin">` and `<meta name="color-scheme" content="dark">` are in `index.html`; no `<meta http-equiv="refresh">`.
- Every off-site link carries `rel="noopener noreferrer"`. It is set in one place, `src/components/shared/ExternalLink.tsx`; ESLint (`no-restricted-syntax`) bans raw `<a href="http...">` elsewhere.
- New tabs: GitHub and LinkedIn links (`<ExternalLink newTab>`) and the resume (`src/components/shared/ResumeLink.tsx`) open with `target="_blank" rel="noopener noreferrer"` and a screen-reader note that they open a new tab. No other code sets `target="_blank"`.
- No `<iframe>`, `<embed>`, `<object>`, `<form>` unless added here with justification.

## 3. XSS rules and URL allowlist

- **Never** `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string `setTimeout`. ESLint enforces the first five and `eval`/`new Function`. All content in `src/content` renders as React text, not HTML.
- **URL allowlist** (`src/lib/url.ts`, unit-tested in `url.test.ts`): every href comes from one of these.
  - `safeUrl(value, allowedHosts?)`: parses with `new URL`, accepts only `https:` without credentials, optionally only allowed hosts (exact host, or a suffix starting with `.`); otherwise `null`, which `<ExternalLink>` renders as plain text. Rejects `javascript:` (any case), `data:`, `blob:`, `http:`, `//evil.com`, relative URLs and anything over 2048 chars.
  - `GITHUB_LINK_HOSTS` (`github.com`, `.github.io`): project `repoUrl`s and the GitHub profile link (`githubProfileUrl`, which first checks the login with `isGithubLogin`).
  - `RESUME_HOSTS` (`drive.google.com`, `docs.google.com`) and `resumeHref(value)`: the resume link is either a same-origin `/resume/<name>.pdf` (no `..`, no other path) or an https link on those hosts. Anything else, or `null`, renders the resume controls disabled.
- Hard-coded links live in `src/content/socials.ts` and `src/content/projects.ts`; `content.test.ts` runs them through `safeUrl` (socials: https or `mailto:`; `repoUrl` on `GITHUB_LINK_HOSTS`; `liveUrl` https).

## 4. Runtime data

None. The site makes no `fetch`/XHR/WebSocket requests; all data is static in `src/content`. Reintroducing an API means first adding rules here for response parsing (hand-written guards, no casts), timeouts and fallbacks, and adding the host to `connect-src`.

## 5. Browser storage

None. Nothing is read from or written to `localStorage`, `sessionStorage` or IndexedDB (no theme choice, no cache). Reintroducing storage means adding validation rules here first.

## 6. Rate limiting

Not applicable: no calls to the GitHub API or any other service.

## 7. Secrets and env

- No tokens, API keys or `.env` secrets in repo or bundle. Anything referenced as `import.meta.env.VITE_*` is public in the built JS.
- `.gitignore` contains `.env*` (except `.env.example`), `*.pem`, `*.key`. gitleaks runs in CI.
- `build.sourcemap: false`.

## 8. Personal data: email, phone, resume PDF

- **Phone**: never in the site source, HTML, meta, JSON-LD, `tel:` links, filenames, `docs/` or `_legacy/` (treat the repo as public). The one exception is the resume PDF (below). `content.test.ts` and `check-dist.sh` enforce this for text files.
- **Email** (`manpreetchandi555@gmail.com`): the aim is to defeat naive regex crawlers while keeping accessibility.
  - `src/content/profile.ts` stores it reversed and assembles it at runtime into a real `mailto:` link with the visible address, so screen readers, keyboards and copy work. No CSS reversal tricks or images.
  - A "Copy" button (`CopyEmailButton`, clipboard API with a `role="status"` confirmation, select-the-text fallback).
  - The only literal is the `Contact:` line of `security.txt` (its stated purpose).
- **Resume PDF**: OWNER DECISION, recorded: `public/resume/ManpreetSingh_Resume.pdf` ships with the phone number, email, city, education and employers, and is linked from the header chip and the hero (new tab). Crawlers will cache it permanently; to withdraw it, replace the file or point `profile.resumeUrl` at a Google Drive link (`RESUME_HOSTS`), or set it to `null`. The site source and the rendered page must still contain no phone number; never copy it out of the PDF. Strip PDF metadata (author, creator, file path) with `exiftool -all= file.pdf` or `qpdf` before replacing it.

## 9. Supply chain, CI, deploy

- Install with `npm ci` only; `package-lock.json` is committed and CI fails if it is out of sync. Add no dependency without a one-line justification in the PR.
- `npm audit --omit=dev --audit-level=high` in CI as a failing check.
- Workflow `.github/workflows/deploy.yml`:
  - Top level `permissions: {}`. Build job: `contents: read` only. Deploy job: `pages: write`, `id-token: write`, `environment: github-pages`; nothing else.
  - Every third-party action pinned to a full commit SHA with the version in a comment. Do not copy SHAs from memory; look them up.
  - `actions/checkout` with `persist-credentials: false`. Triggers: `push` to `main`, `pull_request` (checks only, never deploy), manual. No `pull_request_target`. No secrets used.
  - `concurrency: { group: pages, cancel-in-progress: false }` and `timeout-minutes`.
- `.github/dependabot.yml`: `npm` and `github-actions`, weekly, minor/patch grouped. Dependabot also bumps pinned SHAs.
- **Third parties**: none. No CDN scripts, no Google Fonts, no analytics, trackers, embeds or tag managers. If one is ever approved: add its host to the CSP, add `integrity="sha384-..." crossorigin="anonymous"`, and record the decision here.
- **`public/.well-known/security.txt`** (copied to `dist/.well-known/`): `Contact: mailto:manpreetchandi555@gmail.com`, `Expires: 2027-11-17T00:00:00.000Z`, `Preferred-Languages: en`, `Canonical`. RFC 9116 requires `Contact` and `Expires` (max 1 year ahead); renew before it expires.
- **Clickjacking caveat**: `X-Frame-Options` and `frame-ancestors` need response headers, which Pages cannot send. Residual risk is accepted: the site has no authenticated or state-changing actions. If header control is ever needed, put a CDN in front; out of scope now.
- Pages settings: "Enforce HTTPS" on; a custom domain (if added later) needs a verified domain; never leave a dangling CNAME.

## 10. Tests

- `src/lib/url.test.ts`: `safeUrl` hostile cases (section 3), host allowlist suffix tricks, `isGithubLogin`/`githubProfileUrl`, `resumeHref` accept/reject cases.
- `src/components/shared/ExternalLink.test.tsx` and `ResumeLink.test.tsx`: `rel`, new-tab behaviour, invalid URLs render as text, disabled resume state.
- `src/content/content.test.ts`: no phone number in `src/`, `public/`, `docs/`, `_legacy/`, `index.html` (text files); runtime email; socials, project URLs and `resumeUrl` pass the allowlist; `theme-color` matches the `.dark` background.

## 11. Audit checklist (reviewer runs these)

Items marked **(CI)** are enforced by `scripts/check-dist.sh` after `npm run build` (run it locally with `sh scripts/check-dist.sh`); the rest are manual or covered by `npm test`.

1. **(CI)** CSP meta exists, is the first element of `<head>`, and its `script-src`, `style-src` and `img-src` equal the policy in `vite.config.ts`. No `unsafe-eval`, no `unsafe-inline` in `script-src`/`style-src`: `grep -c "script-src[^;]*unsafe" dist/index.html` returns 0.
2. **(CI)** No inline scripts in the build: every `<script>` in `dist/*.html` has `src`.
3. Zero CSP violations: `npm run build && npm run preview`, open in a browser; the console is clean, fonts load, the hero animates (and stops with the pause control and under reduced motion), the resume opens in a new tab.
4. Dark only: `<html class="dark">` in `index.html`; no theme script, nothing stored.
5. Referrer meta present: `grep -n 'name="referrer"' index.html`.
6. External links all have `noopener noreferrer`: `grep -rn 'target="_blank"\|target={' src | grep -v test` shows only `ExternalLink.tsx` and `ResumeLink.tsx`, both with `rel="noopener noreferrer"`; `npm run lint` passes (no raw off-site `<a>`).
7. No raw HTML sinks: `grep -rnE 'dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' src index.html` returns nothing.
8. Every href goes through the allowlist: off-site links use `<ExternalLink>` (`safeUrl`), the resume uses `<ResumeLink>` (`resumeHref`); `npm test` passes the hostile-URL cases.
9. No runtime requests: `grep -rnE 'fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon' src | grep -v test` returns nothing.
10. Hosts in source are link targets only: `grep -rnoE 'https://[a-z0-9.-]+' src | grep -v test | sort -u` shows only GitHub, LinkedIn, Google Drive/Docs (resume) and `github.io`.
11. No browser storage: `grep -rnE 'localStorage|sessionStorage|indexedDB' src` returns nothing.
12. Resume link: `profile.resumeUrl` is `null`, a `/resume/*.pdf` that exists in `public/resume/`, or an https `drive.google.com`/`docs.google.com` link (`npm test`).
13. **(CI, gitleaks job)** No secrets: `gitleaks detect --no-banner`; `grep -rn 'VITE_' src .env* 2>/dev/null` shows no sensitive values.
14. **(CI for dist)** No phone number in shipped text files: `grep -rInE '[+]9[1]|\b[6-9][0-9]{9}\b' dist src public docs index.html` returns nothing (`-I` skips the resume PDF, the recorded exception; never write the real number here). `npm test` enforces the same for src, public and docs.
15. **(CI for dist, except `security.txt`)** Email not a literal in static markup: `grep -rn 'manpreetchandi555@gmail.com' dist/index.html src` returns nothing; the rendered link is a working `mailto:` and keyboard/screen-reader reachable.
16. Resume PDF: the owner's decision (section 8) still stands; `exiftool public/resume/*.pdf` shows no author/path metadata.
17. **(CI)** `dist/.well-known/security.txt` exists, has `Contact` and a future `Expires` within 1 year.
18. **(CI)** No third-party scripts/stylesheets: `grep -rnE '<script[^>]+src="https?:|<link[^>]+href="https?:' dist/index.html` returns nothing (or it has `integrity=`).
19. `package-lock.json` committed and in sync: `npm ci --dry-run` succeeds.
20. `npm audit --omit=dev --audit-level=high` exits 0.
21. Workflow permissions: `grep -nE 'permissions|pages: write|id-token: write' .github/workflows/*.yml` shows `pages`/`id-token: write` only inside the deploy job; top-level is empty.
22. Actions pinned by SHA: `grep -rnE 'uses: .+@' .github/workflows | grep -vE '@[0-9a-f]{40}'` returns nothing; no `pull_request_target`.
23. `.github/dependabot.yml` covers `npm` and `github-actions`.
24. `.gitignore` covers `.env*`, `dist`, `node_modules`: `git check-ignore .env dist node_modules`.
25. Pages "Enforce HTTPS" on (Settings > Pages) and **(CI)** no source maps in dist: `find dist -name '*.map'` is empty.
26. Clickjacking residual risk acknowledged (section 9); no state-changing UI exists.

## 12. CI

What runs now:

- `.github/workflows/deploy.yml`, job `build` (push to `main`, PRs, manual): `npm ci`, `npm audit --omit=dev --audit-level=high` (blocking), `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then `sh scripts/check-dist.sh`.
- `scripts/check-dist.sh` (POSIX sh) fails the build if `dist/` has: an inline `<script>` without `src`; any `.map` file; a `data:` URL in a font or script context; a phone-number pattern in a text file; the email literal outside `.well-known/security.txt`; a CSP meta that is not the first element of `<head>`; `script-src`/`style-src`/`img-src` that differ from `vite.config.ts`; a third-party script or stylesheet; or a missing `.well-known/security.txt` (or one without `Contact` or with a past `Expires`). Covers audit items 1, 2, 14, 15, 17, 18, 25 for `dist/`; item 7 stays a source grep.
- Job `secrets-scan`: gitleaks over the pushed/PR commit range (full-history checkout, `contents: read`, `pull-requests: read`, PR comments off).
- Job `deploy` needs `build` and `secrets-scan` and runs only on `main`.
- `.github/workflows/codeql.yml`: CodeQL `javascript-typescript`, `build-mode: none`, `security-and-quality` queries, on push to `main`, PRs and weekly; `security-events: write` + `contents: read` on that job only; actions pinned by SHA.
- `.github/dependabot.yml`: weekly `npm` and `github-actions` updates.

Open:

- Optional: `actions/dependency-review-action` on PRs; `zizmor` or `actionlint` for workflow linting.
