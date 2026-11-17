# Security checklist

Static Vite + React 19 + TS site on GitHub Pages (`chandiimanpreet.github.io`, base `/`). Implementers follow sections 1-9; the reviewer audits against section 11. Nothing here needs a server.

## 0. Threat model

- **Assets**: owner's reputation and domain trust (visitors must not be redirected, phished or served malware); owner's phone number and email (privacy); GitHub account and Actions deploy rights; visitors' browsers.
- **Attackers**: (a) content injector: anyone who can write text into GitHub fields the site renders (bio, repo descriptions, topics, homepage URL); (b) supply-chain attacker (malicious npm package or Action version); (c) scraper harvesting email/phone; (d) framer/clickjacker; (e) a visitor tampering with their own localStorage (self-XSS only, but the cache must still not break the page).
- **In scope**: XSS, unsafe URLs, malformed API data, cache poisoning, secret leakage, dependency and CI integrity, PII exposure, clickjacking caveat.
- **Out of scope**: server hardening, auth, DoS against GitHub Pages/GitHub API, HSTS and real response headers (GitHub Pages controls them; HTTPS is enforced by the Pages setting "Enforce HTTPS", verify it is on), a compromised GitHub account (enable 2FA, say so in the README).

## 1. Content-Security-Policy via meta

GitHub Pages cannot set response headers, so put this as the first `<meta>` in `<head>` of `index.html` (before any script/style/link). Meta CSP ignores `frame-ancestors`, `report-uri`, `report-to` and `sandbox`; do not include them (browsers warn).

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' https://avatars.githubusercontent.com; font-src 'self'; connect-src 'self' https://api.github.com; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests"
/>
```

Rationale, each must hold in the final build:

- `script-src 'self'`: no inline scripts, no `eval`. The theme bootstrap (set `data-theme`/class before paint) is a **classic blocking file** `public/theme-init.js`, loaded as `<script src="/theme-init.js"></script>` in `<head>` (not `type=module`, not async/defer, so no flash). If an inline script is unavoidable instead, allow it only by hash: `script-src 'self' 'sha256-<base64>'`, recomputed on every edit. Prefer the file. Vite's own module script is same-origin and fine.
- `style-src 'self'`: Tailwind v4 is compiled to a CSS file by `@tailwindcss/vite`; shadcn adds no runtime CSS. `style-src-attr 'unsafe-inline'` is needed only because React `style={{}}` props (timeline bar geometry, the showcase spotlight's CSS variables) write inline `style` attributes. That is the accepted trade-off: it does not permit `<style>` elements or inline scripts. If the build injects a `<style>` tag (Vite dev does; prod CSS is extracted), fix the cause, do not add `'unsafe-inline'` to `style-src`.
  - Mobile menu: a native `<dialog>` opened with `showModal()` (no Radix Sheet), so nothing injects a `<style>`; page scroll lock is the `body:has(dialog[open])` rule in `src/index.css`. `style-src` stays strict; do not add `'unsafe-inline'` or a hash.
- Fonts: `@fontsource-*` packages are bundled and self-hosted, so `font-src 'self'`. Set `build.assetsInlineLimit: 0` in `vite.config.ts` so woff2/svg/png are never inlined as `data:` URIs (otherwise `font-src data:` would be needed). `img-src` has no `data:` because the audit found nothing using it.
- `img-src` lists exactly `self` and `avatars.githubusercontent.com` (showcase avatars).
- `connect-src` is `api.github.com` only (plus `'self'` for `/data/*.json`). Add hosts only with a written reason in this file.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'none'` (there are no forms; use `mailto:` links, which are not form submissions). `default-src 'none'` makes every unlisted type blocked; `upgrade-insecure-requests` is harmless on Pages.
- `frame-ancestors` cannot be enforced via meta (see section 9). Do not pretend it is.
- Dev note: Vite dev (HMR, React refresh) needs `'unsafe-inline'` and `ws:`. Inject the CSP meta only in production via a tiny `transformIndexHtml` plugin or keep it in `index.html` and test with `npm run build && npm run preview`. Verify there are zero CSP violations in the preview console.

## 2. Other meta and link hygiene

- `<meta name="referrer" content="strict-origin-when-cross-origin">` (or `no-referrer`; the site needs no referrer-based features).
- Every external link (`target="_blank"` or not, any non-same-origin href): `rel="noopener noreferrer"`. Implement once in a shared `ExternalLink` component and ban raw `<a href="http...">` elsewhere (ESLint `no-restricted-syntax` or the grep in section 11).
- `<meta name="color-scheme" content="dark light">` is fine; no `<meta http-equiv="refresh">`.
- No `<iframe>`, `<embed>`, `<object>`, `<form>` unless added here with justification.

## 3. XSS rules

- **Never** `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, string `setTimeout`. ESLint: add `react/no-danger` equivalent (`no-restricted-syntax` on `dangerouslySetInnerHTML`) as an error. Local static markdown/JSON content is also rendered as React text, not HTML.
- Everything from `api.github.com` is **untrusted text**: bio, name, company, location, blog, repo name/description/topics/language, `homepage`. Render only as React text children (React escapes). Never put it into an attribute that is interpreted (`style`, `href`, `src`, `srcDoc`, `on*`) without the validators below.
- Truncate remote strings (e.g. description max 300 chars, topics max 10 x 40 chars) to bound layout abuse; strip control and bidi-override characters (`/[\u0000-\u001f‪-‮⁦-⁩]/g`).
- **URL allowlist** for any href/src derived from remote data: parse with `new URL(value)` in try/catch, accept only `protocol === 'https:'`; for links additionally require a host that is `github.com` or ends in `.github.io`, or otherwise render the `homepage` as plain text when the host is unknown. Reject `javascript:`, `data:`, `http:`, `blob:`, credentials in URL (`username`/`password` non-empty). Image `src` must be `https://avatars.githubusercontent.com/...`. Single helper `safeUrl(value, allowedHosts): string | null` in `src/lib/url.ts` (with `isGithubLogin` and `githubProfileUrl` for logins), unit-tested with `javascript:alert(1)`, `JaVaScRiPt:`, `//evil.com`, `http://github.com`, `https://user:pw@github.com`.
- Local hard-coded links (LinkedIn, LeetCode, mailto) live in one `src/data/links.ts` and go through the same helper in tests.

## 4. API boundary: validate and type

`zod` is NOT a dependency; do not add one for two shapes (the resume says Zod, but this is a client bundle). Write `src/lib/guards.ts`: small functions `isRecord`, `str(x, max)`, `num(x)`, `arr(x, max)` and one parser per endpoint (today only `parseRepos`, in `src/lib/github.ts`) returning a typed, trimmed object or `null`. Rules:

- `fetch(url)` result: check `res.ok`, `content-type` includes `application/json`, then `res.json()` as `unknown`. No `as Type` casts on API data; only the parser produces typed values.
- The parser copies only the fields the UI uses (drop everything else), caps array length (e.g. 100 repos), coerces missing/wrong-typed fields to defaults, and runs `safeUrl` on every URL field.
- The only base URL is a constant `https://api.github.com`; the username is a constant, never read from `location`, query string or hash. No user-supplied path or query reaches `fetch`.
- Use `AbortController` with a timeout (8 s). On any failure render the static fallback from `data/profile.json`, never a blank section or a raw error message.

## 5. localStorage cache (poisoning and staleness)

- Single key namespace `pf:v1:<name>`. Stored value: `{ v: 1, t: <epoch ms>, data }`.
- On read: wrap in try/catch (storage can throw or be disabled), `JSON.parse`, check `v === 1`, `typeof t === 'number'`, `Date.now() - t` within TTL (e.g. 1 h) and not in the future, then **re-run the same API parser** on `data`. Any failure: delete the key and refetch. A tampered cache must degrade to a fetch, never to rendering raw stored HTML/URLs.
- Cap stored size (reject > 200 KB). Never store anything but already-parsed API data and the theme choice (`'dark' | 'light'`, validated against that set on read, including in `theme-init.js`).
- Store no tokens, emails or personal data.

## 6. Rate limiting (60 req/h unauthenticated)

- Serve from fresh cache first; fetch only when stale. One request per endpoint per page load, no polling or refetch-on-focus.
- On `403`/`429` with `x-ratelimit-remaining: 0`, read `x-ratelimit-reset`, store a `pf:v1:backoff` timestamp, stop fetching until then, and use stale cache (ignore TTL, but still validate shape) or the static fallback. Show a quiet "showing saved data" note, not an error wall.
- Never retry in a tight loop; at most one retry with a 2 s delay on network error.

## 7. Secrets and env

- No tokens, API keys or `.env` secrets in repo or bundle. Anything referenced as `import.meta.env.VITE_*` is public in the built JS. Do not add a GitHub PAT "to raise the rate limit"; use the cache and static fallback instead.
- `.gitignore` must contain `.env*` (except `.env.example` if ever added), `*.pem`, `*.key`. Run a secret scan (gitleaks) in CI.
- Do not commit source maps with sensitive paths: `build.sourcemap: false` in production (nothing here is secret, but it removes noise).

## 8. Personal data: email, phone, resume PDF

- **Phone**: never in HTML, JSON, meta, JSON-LD, `tel:` links, PDF served from the site, filenames or git history of published files. `docs/RESUME.md` is internal; if `docs/` is published or the repo is public, remove the phone there too (the repo is public if Pages is on a free account; treat `docs/` and `_legacy/` as public).
- **Email** (`manpreetchandi555@gmail.com`): scraping cannot be fully stopped; do modestly, keep accessibility:
  - Do not write the address as a literal in the HTML or in static JSON. Keep it in `src/data/links.ts` split into parts (`['manpreetchandi555','gmail.com']`) and assemble at runtime into a real `<a href="mailto:...">` with the visible text, so screen readers, keyboards and copy work. Do not use CSS reversal tricks or images (they break a11y).
  - Provide a "Copy email" button (clipboard API, `aria-live` confirmation).
  - Accept that bundled JS may still be parsed by determined scrapers; the aim is to defeat naive regex crawlers only. Do not publish the email in `security.txt` beyond what is needed (see section 9); a `mailto:` there is acceptable, it is the stated purpose.
- **Resume PDF**: OWNER DECISION NEEDED before it ships in `public/`. The source PDF contains the phone number, email, city (Patiala), education history with CGPA, and employer names. Options: (1) publish a redacted web copy with no phone (recommended); (2) link nothing and offer "request resume by email"; (3) publish the full PDF and accept permanent public exposure (cached by crawlers, cannot be recalled). Until decided, do not add any PDF to `public/` and do not link one. If published: strip PDF metadata (author, creator, file path) with `exiftool -all= file.pdf` or `qpdf`, and name it `Manpreet-Singh-Resume.pdf`.

## 9. Supply chain, CI, deploy

- Install with `npm ci` only; `package-lock.json` is committed and CI fails if it is out of sync. Use exact-enough ranges (lockfile is the pin). `.npmrc`: `ignore-scripts=true` is recommended; if a dep needs a postinstall (esbuild/rolldown binaries ship via optional deps and do not), whitelist explicitly. Add no dependency without a one-line justification in the PR (YAGNI; the standard lib covers the guards and `safeUrl`).
- `npm audit --omit=dev --audit-level=high` in CI as a failing check; full `npm audit` as informational. Dev-only advisories do not ship to visitors, but note them.
- Workflow `.github/workflows/deploy.yml`:
  - Top level `permissions: {}` (or `contents: read`). Build job: `permissions: { contents: read }` only. Deploy job: `permissions: { pages: write, id-token: write }` plus `environment: github-pages`; nothing else.
  - Pin every third-party action to a full commit SHA with the version in a comment (`uses: actions/checkout@<40-hex> # v4.x.x`), including `actions/setup-node`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`. Do not copy SHAs from memory; look them up when writing the file.
  - `actions/checkout` with `persist-credentials: false`. Trigger on `push` to `main` and `pull_request` (PRs run build/test/audit only, never deploy). No `pull_request_target`. No secrets used.
  - Set `concurrency: { group: pages, cancel-in-progress: false }`; add `timeout-minutes`.
- `.github/dependabot.yml`: ecosystems `npm` and `github-actions`, `directory: "/"`, `schedule: weekly`, group minor/patch updates, `open-pull-requests-limit: 5`. Dependabot also bumps the pinned Action SHAs.
- **SRI / third parties**: prefer none. No CDN scripts, no Google Fonts (fonts are self-hosted via fontsource), no analytics, trackers, chat widgets, embeds or tag managers by default. If one is ever approved: add its host to the CSP, add `integrity="sha384-..." crossorigin="anonymous"` to the tag, and record the decision here.
- **`public/.well-known/security.txt`** (served at `/.well-known/security.txt`; Vite copies `public/` as-is, and dotfolders are copied; verify in `dist/`):
  ```
  Contact: mailto:manpreetchandi555@gmail.com
  Expires: 2027-11-17T00:00:00.000Z
  Preferred-Languages: en
  Canonical: https://chandiimanpreet.github.io/.well-known/security.txt
  ```
  RFC 9116 requires `Contact` and `Expires` (max 1 year ahead); put a calendar reminder to renew. The owner must confirm the contact address. Add `public/.nojekyll` is not needed (Pages deploys the built artifact, not Jekyll).
- **Clickjacking caveat**: `X-Frame-Options` and `frame-ancestors` need response headers, which Pages cannot send; meta CSP ignores `frame-ancestors`. A JS frame-buster is the only in-page option and is weak (sandboxed iframes defeat it). Residual risk is accepted because the site has no authenticated or state-changing actions. Optional: a tiny external-file script `if (top !== self) document.documentElement.hidden = true` in `theme-init.js`. If real header control is ever needed, put Cloudflare in front; out of scope now.
- Pages settings: "Enforce HTTPS" on; custom domain (if added later) needs a verified domain to prevent takeover; never leave a dangling CNAME.

## 10. Testing hooks (Vitest, already installed)

Unit tests for: `safeUrl` (cases in section 3), each parser given hostile input (non-object, huge strings, `javascript:` homepage, wrong types), the cache reader given tampered/expired/future-dated/oversized entries, and the rate-limit backoff. Component test: render a profile whose bio is `<img src=x onerror=alert(1)>` and assert it appears as literal text and no `img` element is created.

## 11. Audit checklist (reviewer runs these)

Items marked **(CI)** are enforced by `scripts/check-dist.sh` after `npm run build` (run it locally with `sh scripts/check-dist.sh`); the rest are manual or covered by `npm test`.

1. **(CI)** CSP meta exists, is the first element of `<head>`, and its `script-src`, `style-src` and `img-src` equal the policy in `vite.config.ts`. `grep -n 'Content-Security-Policy' dist/index.html`; confirm no `unsafe-eval`, no `unsafe-inline` in `script-src`/`style-src`: `grep -c "script-src[^;]*unsafe" dist/index.html` returns 0.
2. **(CI)** No inline scripts in the build: `grep -c '<script>' dist/index.html` is 0 (every script has `src`), unless a matching `sha256-` is in the CSP.
3. Zero CSP violations: `npm run build && npm run preview`, open in browser, console is clean in both themes, theme toggle works, fonts and avatar load. Expected exception: one blocked `<style>` report when the mobile menu opens (section 1, Radix scroll lock); the menu must still lock page scroll.
4. Theme bootstrap is a file: `ls public/theme-init.js` and it is referenced in `index.html` before the module script.
5. Referrer meta present: `grep -n 'name="referrer"' index.html`.
6. External links all have `noopener noreferrer`: `grep -rnE 'href=.?"?https?:' src | grep -v noreferrer` returns nothing outside `ExternalLink`; `grep -rn 'target="_blank"' src | grep -v noreferrer` is empty.
7. No raw HTML sinks: `grep -rnE 'dangerouslySetInnerHTML|innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function' src index.html` returns nothing.
8. Remote-derived hrefs/srcs go through `safeUrl`: `grep -rn 'safeUrl' src` covers every component that renders `homepage`, `html_url`, `avatar_url`; `npm test` passes the hostile-URL cases.
9. API responses are parsed, not cast: `grep -rnE 'as (GitHub|Repo|User|Profile)|\.json\(\) as' src` returns nothing; `src/lib/guards.ts` exists with tests.
10. Fetch targets: `grep -rnE "fetch\(|https?://" src | grep -v 'api.github.com'` shows no other network host except allowlisted link targets.
11. Cache reader validates version, TTL, shape and size, and re-parses: read `src` cache module; `npm test` includes tampered-entry cases; manually set `localStorage['pf:v1:repos']='{"x":1}'` and reload: page falls back, no crash.
12. Rate-limit path: simulate `403` with `x-ratelimit-remaining: 0` in a test; UI shows stale/static data and no further requests fire.
13. **(CI, gitleaks job)** No secrets: `gitleaks detect --no-banner` (or `grep -rniE 'ghp_|github_pat_|api[_-]?key|secret|token' src public .github` reviewed); `grep -rn 'VITE_' src .env* 2>/dev/null` shows no sensitive values.
14. **(CI for dist)** No phone number anywhere in shipped files: `grep -rnE '[+]9[1]|\b[6-9][0-9]{9}\b' dist src public docs index.html` returns nothing (generic Indian-mobile pattern; never write the real number here). `npm test` enforces the same for src, public and docs.
15. **(CI for dist, except `security.txt`)** Email not a literal in static markup: `grep -rn 'manpreetchandi555@gmail.com' dist/index.html public` returns nothing; the rendered link is a working `mailto:` and keyboard/screen-reader reachable (axe/Lighthouse a11y 90+).
16. Resume decision recorded: `ls public/*.pdf` is empty OR the owner's decision (redacted version) is noted in the PR; `exiftool public/*.pdf` shows no author/path metadata.
17. **(CI)** `public/.well-known/security.txt` exists in `dist/.well-known/`, has `Contact` and a future `Expires` within 1 year.
18. **(CI)** No third-party scripts/analytics/CDN: `grep -rnE '<script[^>]+src="https?:|<link[^>]+href="https?:' dist/index.html` returns nothing; if something is found it has `integrity=`.
19. `package-lock.json` committed and in sync: `git ls-files package-lock.json` and `npm ci --dry-run` succeeds.
20. `npm audit --omit=dev --audit-level=high` exits 0.
21. Workflow permissions: `grep -nE 'permissions|pages: write|id-token: write' .github/workflows/*.yml` shows `pages`/`id-token: write` only inside the deploy job; top-level is read-only or empty.
22. Actions pinned by SHA: `grep -rnE 'uses: .+@' .github/workflows | grep -vE '@[0-9a-f]{40}'` returns nothing; no `pull_request_target`. Open item: `gitleaks/gitleaks-action` and `github/codeql-action/{init,analyze}` are on version tags marked `# TODO pin to commit SHA` until the owner pins them.
23. `.github/dependabot.yml` covers `npm` and `github-actions`.
24. `.gitignore` covers `.env*`, `dist`, `node_modules`: `git check-ignore .env dist node_modules`.
25. Pages "Enforce HTTPS" on (Settings > Pages) and **(CI)** no source maps in dist: `find dist -name '*.map'` is empty.
26. Clickjacking residual risk acknowledged (section 9); no state-changing UI exists.

## 12. CI

What runs now:

- `.github/workflows/deploy.yml`, job `build` (push to `main`, PRs, manual): `npm ci`, `npm audit --omit=dev --audit-level=high` (blocking), `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then `sh scripts/check-dist.sh`.
- `scripts/check-dist.sh` (POSIX sh) fails the build if `dist/` has: an inline `<script>` without `src`; any `.map` file; a `data:` URL in a font or script context; a phone-number pattern (country code, 10-digit mobile, 5+5 grouped digits); the email literal outside `.well-known/security.txt`; a CSP meta that is not the first element of `<head>`; `script-src`/`style-src`/`img-src` that differ from `vite.config.ts`; a third-party script or stylesheet; or a missing `.well-known/security.txt` (or one without `Contact` or with a past `Expires`). Covers audit items 1, 2, 14, 15, 17, 18, 25 for `dist/`; item 7 (raw HTML sinks) stays a source grep.
- Job `secrets-scan`: gitleaks over the pushed/PR commit range (full-history checkout, `contents: read`, `pull-requests: read`, PR comments off).
- Job `deploy` needs `build` and `secrets-scan` and runs only on `main` (not PRs).
- `.github/workflows/codeql.yml`: CodeQL `javascript-typescript`, `build-mode: none`, `security-and-quality` queries, on push to `main`, PRs and weekly; `security-events: write` + `contents: read` on that job only.
- `.github/dependabot.yml`: weekly `npm` and `github-actions` updates.

Open:

- Pin `gitleaks/gitleaks-action@v2` and `github/codeql-action/init@v4` / `analyze@v4` to full commit SHAs (marked `# TODO pin to commit SHA`).
- Optional: `actions/dependency-review-action` on PRs; `zizmor` or `actionlint` for workflow linting.
