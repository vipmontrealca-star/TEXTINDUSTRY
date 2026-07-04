# Textindustry.com — Project Log

Live record of what's built, decisions made, and what's next. Update this on every milestone instead of relying on chat history.

## Working style

Built in small, modular milestones grouped into phases — each milestone checkpointed and verified (browser preview, console check) before moving to the next. See "Phases & Backlog" below for the current breakdown.

## ⚠️ Maintenance note: fr/ar are NOT auto-rebuilt

Since M6c (2026-07-03), the site has three language deploy targets, but only one of them is a live source: `index.html`, `about.html`, `contact.html`, and `js/translations.js` at the repo root are the actual source of truth (English). The **`fr/` and `ar/` folders are pre-built static snapshots**, generated once by rendering each page in a browser and extracting the result — they are not regenerated automatically by the GitHub Actions workflow or by editing the source files.

**This means: any future change to page content, structure, or `translations.js` must be manually re-propagated to `fr/` and `ar/` before pushing, or those two subdomains will silently drift out of sync with the English site** (stale copy, not a broken deploy — the workflow will happily re-upload the same outdated `fr/`/`ar/` files forever until someone regenerates them). There is no automated warning if this is forgotten.

Regeneration process (until/unless a real build step replaces this): open the dev preview, navigate to each of the 3 pages, call `window.TextindustryI18n.applyLang('fr')` (or `'ar'`), extract `document.documentElement.outerHTML`, and re-apply the same post-processing used originally — absolute-ify `css/`/`js/`/`assets/`/`php/` paths to `https://textindustry.com/...`, set canonical/`og:url` to the subdomain's own URL, and set the contact form's `action` to the absolute PHP endpoint. Full detail of the original process is in the M6c log entry below.

---

## Phases & Backlog

### Phase 1 — Foundation ✅ complete
- [x] **M1** — Initial scaffold (site structure, pages, i18n/RTL, styling, contact form UI)
- [x] **M1.1** — Local git repository initialized

### Phase 2 — Core Functionality (in progress)
- [ ] **M2** — Form backend: `php/send-quote.php` built (PHPMailer, validation, honeypot) and front-end wired up — **paused, awaiting user decision** on how to execution-test it (no local PHP available); not yet marked complete.
- [x] **M3a** — Design overhaul + logo (2026-07-03): corporate ink/paper/blue-ink theme replacing the gold/serif look; TEXTINDUSTRY two-tone lockup + ن-inspired mark; favicon wired up
- [x] **M3b** — Open Graph image (`assets/img/og-image.jpg`, 1200×630) + OG/Twitter meta tags + theme-color on both pages (2026-07-03)
- [ ] **M4** — Accessibility pass: keyboard nav on mobile menu/language switcher, focus states, `aria-live` review, color contrast check (blue-on-dark accents)

### Phase 3 — Infrastructure & Version Control (in progress)
- [x] **M3.1** — `.gitignore` + local git repo initialized
- [x] **M3.2** — GitHub remote connected: `https://github.com/vipmontrealca-star/TEXTINDUSTRY.git`; commit identity set to `Textindustry` / `quotes@textindustry.com`; first push done
- [x] **M3.3a** — Deploy package built: `textindustry-deploy-2026-07-03.zip` at project root, contents at archive root (extracts directly into `public_html`, no wrapper folder). Contains only production files (`index.html`, `contact.html`, `css/`, `js/`, `assets/`, `php/` incl. vendored PHPMailer) — repo/project-management files (`PROJECT_LOG.md`, `README.md`, `NEEDED_FROM_CLIENT.md`, `.claude/`, `.gitignore`) intentionally excluded. `deploy/` (loose folder) and the zip are both gitignored — build artifacts, not source.
- [x] **M3.3b (superseded)** — Manual zip upload was the plan, but user opted into automated GitHub Actions deploy instead (see M3.5). Manual zip still available as a one-off/fallback if needed.
- [x] **M3.5** — GitHub Actions auto-deploy pipeline built and *pipeline itself* verified working (FTP transfer succeeds), but see M3.6 — the deploy was landing in the wrong server-side folder, so the live site stayed broken despite "successful" runs. Dedicated FTP account `deploy_textindustry@textindustry.com`, secrets `HOSTGATOR_FTP_SERVER=ftp.iva.fxh.temporary.site` / `HOSTGATOR_FTP_USERNAME` / `HOSTGATOR_FTP_PASSWORD` / `HOSTGATOR_FTP_SERVER_DIR=/`. Fixed one real bug along the way: run #2 failed with "Input required and not supplied: server" (secret-name mismatch), corrected by the user, run #3 succeeded.
- [x] **M3.4** — Domain/DNS pointed at HostGator. Originally done via A-record-only at GoDaddy (keeping GoDaddy as nameserver); **superseded since** — user switched nameservers at GoDaddy to HostGator's (`hgns1.hostgator.com` / `hgns2.hostgator.com`), confirmed via `nslookup` on 2026-07-03. HostGator's cPanel Zone Editor is now authoritative for all DNS on this domain, not GoDaddy — relevant going forward since new subdomains (M6c) will auto-provision their own DNS records there, no manual GoDaddy step needed.
- [x] **M3.6** — Fixed: deploy was landing in `/home1/ivafxhte/textindustry.com/deploy/` instead of `/home1/ivafxhte/textindustry.com/` directly (one folder too deep), which is why `www.textindustry.com` kept returning 403 even after "successful" GitHub Actions runs and correct DNS. Root cause: when the FTP account was deleted and recreated earlier (after the first misconfiguration), it ended up jailed one level too deep again. **Diagnosed and fixed primarily by the user, with help from a separate AI assistant session** (not this one) — cross-referenced their transcript against this project's actual state (repo structure, workflow file, PROJECT_LOG history) to confirm the diagnosis was consistent with what's documented here. Fix applied: user manually moved the site files up one level in File Manager (immediate fix, confirmed working), then removed the now-empty leftover `deploy/` subfolder. **Verified independently from this session:** `curl` against `http://www.textindustry.com/` (2026-07-03) previously returned the exact same static 403 error page across multiple checks (same `Last-Modified` header each time, confirming it was the server's canned error page, not a caching artifact) — this was the evidence that pinpointed the "no valid content at the document root" theory before the fix. Not yet re-verified post-fix from this session (see follow-up note below).
  - **Verified live (2026-07-03, this session):** `curl http://www.textindustry.com/` now returns **HTTP 200** with the real site HTML (title, meta tags all match `index.html`) — first successful independent confirmation that the site is actually reachable. `Last-Modified: Fri, 03 Jul 2026 16:00:56 GMT` matches the timestamp of the successful deploy run (#3), consistent with the current file being the one GitHub Actions uploaded.
  - **Stress-tested and confirmed durable (2026-07-03, same session):** the very next commit (the RTL logo fix below) was pushed to `main` and auto-deployed via the normal pipeline (run id 28685003606). Waited for it to finish, then `curl`'d `http://www.textindustry.com/css/styles.css` directly and confirmed the new `direction: ltr` rule was live — the push-triggered deploy landed in the correct folder with no manual File Manager step. **M3.6 is fully resolved**, not just patched: the FTP account is correctly jailed and ordinary `git push` → live site now works end-to-end.

### Phase 4 — Content Expansion (in progress)
- [x] **M5a** — About Us page (2026-07-03): `about.html`, EN/FR/AR, added to nav on all 3 pages + `sitemap.xml`. Founder section grounded entirely in facts already established elsewhere on the site (role, credential meaning, languages/region) — deliberately no invented biographical specifics (no fabricated education/career history/years-of-experience), since none were provided. Reuses `.services-grid`/`.service-card` for a 3-item values section (Precision, Cultural Fluency, Confidentiality) and the existing `cta-strip` component — new CSS only for `.founder`/`.founder-inner`.
- [ ] **M5b** — Individual service detail pages (not started, only if requested).
- [ ] **M5c** — Norma Naboulsi photo received (`assets/img/Norma_Naboulsi.png`) but **explicitly not to be used yet** per client instruction — ready to add to the About page's founder section whenever there's a go-ahead.

### Phase 5 — SEO & Launch Readiness (in progress)
- [x] **M6a** — SEO/AEO base (2026-07-03): `sitemap.xml`, `robots.txt`, canonical links, `ProfessionalService` JSON-LD structured data on both pages, `FAQPage` JSON-LD + a genuine visible FAQ section on the homepage. `hreflang` intentionally still deferred — needs the per-language URL strategy decision first (see M6b).
- [x] **M6b** — Per-language URL strategy decided: **subdomains** (`fr.textindustry.com`, `ar.textindustry.com`), not subfolders (which was the recommendation) or staying client-side-only. User's call. Flagged clearly before proceeding: this means 2 more DNS entries, 2 more cPanel subdomains, **2 more dedicated FTP accounts (same wrong-folder-jailing risk as M3.6 — see [[feedback_cpanel_ftp_deploy_verification]], watch for this)**, a 3-target GitHub Actions workflow, and a new build step to pre-render each subdomain's default language into static HTML (translations.js is already the single source of truth, so this can be generated rather than hand-duplicated).
- [ ] **M6c** — Subdomain setup (in progress, 2026-07-03). **Bonus simplification discovered:** user had separately switched GoDaddy nameservers to HostGator's (`hgns1.hostgator.com`/`hgns2.hostgator.com`) — confirmed via `nslookup` — so HostGator's cPanel Zone Editor is now authoritative for all DNS on this domain, meaning creating the two subdomains in cPanel auto-provisions their DNS records with no manual GoDaddy step needed.
  - [x] `fr.textindustry.com` and `ar.textindustry.com` created in cPanel. Document roots confirmed by the user, exactly as intended, siblings of the main folder: `/home1/ivafxhte/fr.textindustry.com/` and `/home1/ivafxhte/ar.textindustry.com/`. Cross-checked independently via `nslookup` (both resolve to `50.6.245.61`) and `curl` (both return a distinct `302 → /404.html`, confirming Apache has them correctly vhosted and isolated from the main site's document root — just empty of files, as expected).
  - [x] `deploy_fr@fr.textindustry.com` and `deploy_ar@ar.textindustry.com` FTP accounts created by the user, confirmed matching expectations (server `ftp.iva.fxh.temporary.site`, port 21, same as the main account; no stray folders) before proceeding — per [[feedback_cpanel_ftp_deploy_verification]].
  - [x] **Architecture decision:** rather than deploying a full separate copy of css/js/assets/php to each subdomain (tripling the codebase and the mail backend across 3 deploy targets), `fr.`/`ar.` serve lightweight static HTML only, referencing the main domain's assets via **absolute URLs** (`https://textindustry.com/css/styles.css` etc.). One stylesheet, one JS bundle, one PHP mail backend to maintain — not three.
  - [x] **`js/i18n.js` redesigned:** each language now lives at its own URL, so auto-detecting/overriding the page's language from `localStorage`/browser language on load was removed entirely (it would silently swap pre-rendered French content back to a stored English preference, defeating the whole point of the subdomain split). `init()` now just syncs the button UI to whatever language the page already declares. Clicking a language button now **navigates to the matching subdomain** (`navigateToLang()`) instead of re-rendering text in place. `applyLang()` itself is unchanged and still exported — it's what the build step uses to pre-render the static pages, guaranteeing the static output and any live client-side behavior stay consistent (same code path).
  - [x] **`hreflang` added** to all three source pages (`index.html`, `about.html`, `contact.html`), each listing all three language URLs + `x-default` → English.
  - [x] **CORS added to `php/send-quote.php`:** the fr/ar contact forms POST cross-origin to the main domain's PHP endpoint (shared backend, see above) — added an explicit origin allow-list (`textindustry.com`, `www.`, `fr.`, `ar.` — not a wildcard, since this endpoint handles file uploads) and OPTIONS-preflight handling.
  - [x] **Static fr/ar pages generated** (`fr/index.html`, `fr/about.html`, `fr/contact.html`, `ar/` same) — **method:** rather than hand-writing a second HTML parser/build tool (risk of subtly diverging from the site's actual, already-trusted rendering logic), rendered each page in a real browser via the dev preview, called the site's own `applyLang()`, then extracted `document.documentElement.outerHTML` and post-processed it (asset URLs → absolute, canonical/`og:url` → this variant's own URL, contact form action → absolute PHP endpoint). Transferred out of the browser via a local Node receiver with SHA-256 verification on each file (same reliable method as the OG-image transfer earlier — hand-copying large text out of a browser eval previously failed a hash check and was abandoned for this reason).
  - [x] **Real bug caught and fixed during generation, twice:** (1) the homepage variant's `canonical`/`og:url` initially came out as `.../index.html`, inconsistent with the `hreflang` tags which correctly used the clean root URL (`.../`) — fixed by distinguishing the saved filename from the canonical "self path". (2) `og:title`/`og:description` on all three source pages were plain hardcoded English with no `data-i18n-content` wiring at all — meaning shared links would've shown English social previews even on the French/Arabic pages. Wired them to the existing `meta.*Title`/`meta.*Description` translation keys (reused, not duplicated) across all three pages, then regenerated all 6 static files. Caught by actually reading the generated output rather than assuming the render step "just worked."
  - [x] Verified across all 6 generated files: JSON-LD parses valid (Node `JSON.parse`, not just eyeballed), no leftover relative `css/`/`js/`/`assets/`/`php/` paths (full regex sweep, zero matches), internal nav links correctly stayed *relative* (same-subdomain navigation), Arabic variants correctly `lang="ar" dir="rtl"`, and the language-switcher's `is-active` class baked onto the correct button per language.
  - [x] `sitemap.xml` rewritten with all 9 URLs (3 pages × 3 languages/subdomains).
  - [x] `.github/workflows/deploy.yml` extended to 3 sequential FTP-deploy steps in the same job: main domain (now excluding the new `fr/`/`ar/` source folders from its own upload), then `fr/` → `deploy_fr` account, then `ar/` → `deploy_ar` account. Same already-approved `SamKirkland/FTP-Deploy-Action@v4.4.0` — no new dependency, just more steps.
- [x] **M6c complete (2026-07-03).** 4 secrets added by user, then pushed (commit `e608496`). First 3-target run (id `28690757803`) succeeded in 18s. **Verified live, all real checks, not just the green checkmark:**
  - `textindustry.com`, `fr.textindustry.com`, `ar.textindustry.com` — all 3 homepages return HTTP 200 with correct `lang`/`dir` (`en`/`ltr`, `fr`/`ltr`, `ar`/`rtl`) and real translated body content (French text confirmed present verbatim).
  - All 6 subpages (`about.html`/`contact.html` × fr/ar) return HTTP 200.
  - Shared CSS (`https://textindustry.com/css/styles.css`) resolves 200 and is correctly referenced by absolute URL from the fr/ar pages — the shared-asset architecture works.
  - `hreflang` tags present and correct in the live HTML.
  - CORS preflight (`OPTIONS` with `Origin: https://fr.textindustry.com` / `https://ar.textindustry.com`) both return `204` with the correct reflected `Access-Control-Allow-Origin` — the cross-subdomain contact form has a real, working path to the shared PHP backend, not just a config that looks right on paper.
- [ ] **M6d (not started):** submit the sitemap to Google Search Console once an account/property exists for the domain (still an open item in `NEEDED_FROM_CLIENT.md`); monitor whether fr/ar actually get indexed and ranked separately over the following weeks — that's the real test of whether this whole effort paid off, and it's on a timescale of weeks, not something verifiable today.
- [ ] **M7** — Final launch checklist: broken-link check, cross-browser pass, go-live sign-off

Each milestone should be scoped, built, verified, and logged below before starting the next.

---

## Log

### 2026-07-03 — M1: Initial scaffold
**Delivered:**
- Directory structure: `css/`, `js/`, `locales/`, `assets/img/`
- `index.html` — homepage: hero, 4-service grid, "Sworn Advantage" trust section, footer
- `contact.html` — quote/order page with full contact form
- `css/styles.css` — styling using CSS logical properties (`margin-inline`, `border-inline-start`, etc.) so RTL mirrors automatically from a single stylesheet
- `js/translations.js` — EN/FR/AR string dictionary
- `js/i18n.js` — language switcher, sets `lang`/`dir` on `<html>`, persists to localStorage
- `js/main.js` — mobile nav toggle, drag-and-drop multi-file attachment picker (.pdf/.docx/.png/.jpg, 10MB cap, removable list), form validation
- `README.md` — structure + production next-steps

**Verified:** Homepage and contact page in all 3 languages; Arabic RTL flips full layout correctly (nav, buttons, badges, form field order); file picker accepts valid types and rejects invalid ones with visible error; no console errors.

**Decision:** Plain HTML/CSS/JS, no framework — nothing was pre-configured in the workspace, so a static base keeps things simple and portable to a framework later if needed.

**Known gap (not yet fixed):** Contact form submits via `mailto:` placeholder. Browsers cannot attach binary files through `mailto:` links — this needs a real backend endpoint (API route / Formspree / SES+Lambda) before launch, or attachments will not actually reach quotes@textindustry.com.

**Process note:** This milestone was delivered as one large batch. Going forward, work is split into smaller milestones grouped by phase (see "Phases & Backlog" above), each checkpointed independently.

### 2026-07-03 — M1.1 / M3.1: Git initialized
- Ran `git init` in the project root (was not previously a git repository).
- Added `.gitignore` (node_modules, OS cruft, .env files).
- Set local (repo-scoped, not global) git identity as a placeholder — **needs user confirmation/correction**: `user.name "Sam"`, `user.email "sam@vipmontreal.ca"`.
- No commits yet — first commit pending GitHub remote decision (see M3.2 in backlog).

### 2026-07-03 — M3.2: Connected to GitHub
- Confirmed commit identity: `Textindustry` / `quotes@textindustry.com` (repo-local git config only, not global).
- Remote added: `origin` → `https://github.com/vipmontrealca-star/TEXTINDUSTRY.git`
- HostGator deployment decided: FTP/SFTP upload (not cPanel Git Version Control) — deploy build to be prepared when user is ready to upload; no credentials handled in chat.
- First commit created and pushed to `main` on GitHub.

### 2026-07-03 — M2: Form backend (in progress, paused)
**Delivered:**
- Confirmed with user: HostGator plan supports PHP → chose a PHP mail handler over a separate serverless service.
- Confirmed with user: domain `textindustry.com` DNS is still at GoDaddy, not yet pointed to HostGator — logged as a blocker on M3.4, does not block M2/M3.3 build work.
- User explicitly approved vendoring PHPMailer v7.1.1 (LGPL 2.1) after the harness flagged the third-party download for confirmation. Vendored (not Composer, since SSH/Composer access on the HostGator plan is unconfirmed): `php/vendor/PHPMailer/src/{PHPMailer.php, SMTP.php, Exception.php}`, plus `php/vendor/PHPMailer/ATTRIBUTION.txt` noting source/version/license.
- Built `php/send-quote.php`: validates required fields + email format, whitelists attachment extensions/MIME types (pdf/docx/png/jpg, finfo-checked not just extension), enforces 10MB/file + 25MB total caps, honeypot spam check, sends via PHPMailer using PHP's built-in `mail()` transport (no SMTP credentials needed for now), replies-to the submitter, returns JSON.
- Updated `contact.html`: form now posts to `php/send-quote.php` instead of `mailto:`; added a hidden honeypot field (`name="website"`, off-screen via new `.form-field--honeypot` CSS, not `display:none`).
- Updated `js/main.js`: form submission now goes through `fetch()` + `FormData`, handles JSON success/error responses, resets the form and file list on success, disables the submit button while in flight.
- Added `form.networkError` and `form.genericError` translation keys (EN/FR/AR) in `js/translations.js`.

**Verified (front-end only, in browser preview):** honeypot field confirmed off-screen; form correctly targets `php/send-quote.php`; required-field validation still blocks empty submissions with the correct message; POST request fires correctly with `FormData`; submit button disables during the request.

**Bug found and fixed during testing:** the failure-path fallback message incorrectly reused `form.errorStatus` ("please fill required fields") for *any* non-JSON/failed response, which would have shown a misleading message to real users on a genuine server error. Replaced with a new, distinct `form.genericError` key.

**Not yet verified — blocking item:** `send-quote.php` itself has not been execution-tested. No PHP runtime is available in this environment (`php` and `docker` both absent). Static syntax/logic review only. Asked the user how to proceed (install PHP locally via `winget` to fully test now, vs. defer first real test to after HostGator upload in M3.3) — **user paused here, no decision made yet.** Do not consider M2 complete until this is resolved one way or the other.

**Also worth flagging before go-live (not blocking):** HostGator's default `php.ini` `post_max_size`/`upload_max_filesize` may be lower than the 25MB total this script allows — worth confirming/adjusting via cPanel's MultiPHP INI Editor after deployment. And `mail()` deliverability (landing in spam) should be checked once live; an SMTP-auth fallback using a real HostGator mailbox password is the documented Plan B if so.

### 2026-07-03 — M3a: Design overhaul + logo (corporate ink/paper theme)
**Client direction:** drop the gold/serif "editorial" look entirely. Wanted: corporate, lots of paper-white and ink-black, blue ink acceptable; logo all-caps with a rounded font (explicitly no Times/serif style), "TEXT" bold + "INDUSTRY" fine/light, each word on a different colored background rectangle; a design mark with resemblance to the Arabic letter ن; modern, corporate-level.

**Delivered:**
- New logo mark `assets/img/mark.svg`: abstracted ن (open bowl + dot above) in white on a rounded ink-blue tile; also wired as the favicon on both pages.
- Wordmark lockup in header + footer of both pages: `TEXT` (weight 800, white on ink-blue rectangle) + `INDUSTRY` (weight 300, wide tracking, white on ink-black rectangle), rounded outer corners via logical border-radius properties so the lockup mirrors correctly in RTL. Footer variant flips INDUSTRY to white-on-dark-readable (white bg, ink text).
- Full palette swap in `css/styles.css`: paper `#ffffff`/`#f4f6fa`, ink `#0c111b`/`#10151d`, blue-ink accent `#1d4ed8` (dark `#16389c`, light `#93b8f8` for dark backgrounds). All gold references gone.
- Typography swap: Cormorant Garamond (serif) and Amiri dropped; Manrope (rounded geometric sans, 300–800) for Latin, Tajawal for Arabic across display and body. Headings now weight 800 with tight tracking.
- Component restyling: blue primary buttons/nav CTA, featured service card now ink-blue, blue focus rings and form accents, `--radius` up to 12px for the softer corporate look. Renamed `btn-gold`→`btn-light` and `aside-card--gold`→`aside-card--dark` in HTML+CSS.

**Verified (browser preview, computed styles + accessibility snapshot):** lockup renders flush (no gap) with correct colors/weights per side; ن mark renders 36×36 with blue tile; Manrope active LTR, Tajawal active RTL; RTL flips the lockup order and corner rounding correctly; dark aside card and blue contact-email confirmed on contact page; no console errors. Note: the preview screenshot tool timed out repeatedly this session (renderer responded fine to all other tools), so verification proof is computed-style based rather than visual screenshots.

**Still open under M3b:** Open Graph image + OG/Twitter meta tags. `NEEDED_FROM_CLIENT.md` logo request now partially resolved — a logo now exists; client feedback on it welcome, and any official brand assets can replace/refine it.

### 2026-07-03 — M3a follow-up: mark redrawn geometric (client reference image)
**Client direction:** shared a reference image of the desired mark style — angular, diamond/chevron-based geometry (not the soft rounded bowl of the first draft), reading as both an abstracted ن and an open book.

**Delivered:** redrew `assets/img/mark.svg` and the inline header SVG on both pages to match the reference: an open-diamond bowl (book cover) with a nested inner chevron (pages), a diamond outline above holding a solid diamond dot (the ن dot). Miter joins, butt caps, stroke 3.2 — fully angular. Same rounded ink-blue tile and white glyph retained.

**Verified (browser preview, DOM inspection):** all four glyph elements render on both pages at 36×36 with correct white-on-blue colors; standalone mark.svg serves correctly (used as favicon); no console errors. Screenshot tool remained broken this session (times out; all other preview tools fine), so verification is computed-style/DOM-based.

### 2026-07-03 — M3b: OG image + social meta tags
**Delivered:**
- `assets/img/og-image.jpg` (1200×630, 38KB JPEG): brand card with the ن mark tile, TEXT/INDUSTRY lockup, eyebrow line, tagline and "Beirut, Lebanon · EN · FR · AR". Rendered on an HTML canvas in the preview browser with the real Manrope font, so it exactly matches the site brand (no local design tooling exists in this environment).
- OG/Twitter meta tags + `theme-color` (#1d4ed8) on both pages; `og:image` points at the absolute production URL `https://textindustry.com/assets/img/og-image.jpg` (will only resolve once the site is live on the domain — fine for launch, untestable before it).
- Transfer pipeline note: canvas → base64 → POSTed to a one-shot local Node receiver (scratchpad) → decoded to JPEG. SHA-256 verified end-to-end (browser hash = received hash). Manual chunk copying was attempted first and failed hash verification — do not hand-copy binary data between browser and disk; use the upload-server approach if this ever needs redoing.
- Visual verification: the decoded JPEG was viewed directly (Read tool renders images) — confirmed mark geometry, lockup, and layout; first render had the tagline overflowing the right edge, fixed by shortening it and re-rendering.

### 2026-07-03 — M3.3a: Deploy package built
**Delivered:** `textindustry-deploy-2026-07-03.zip` (~113KB) built from a clean `deploy/` staging folder containing exactly the production file tree — `index.html`, `contact.html`, `css/styles.css`, `js/{i18n,main,translations}.js`, `assets/img/{mark.svg,og-image.jpg}`, `php/send-quote.php`, `php/vendor/PHPMailer/{ATTRIBUTION.txt,src/*}`. Verified via `System.IO.Compression.ZipFile` listing that all 14 files sit at the archive root (no wrapping folder) so extracting the zip directly into `public_html` (or wherever the domain root is) reproduces the site correctly. Both `deploy/` and `textindustry-deploy-*.zip` added to `.gitignore` — they're build output, regenerated from source, not tracked.

**Not included on purpose:** `PROJECT_LOG.md`, `README.md`, `NEEDED_FROM_CLIENT.md`, `.gitignore`, `.claude/` — internal project-management files with no reason to be publicly reachable on the live domain.

**Still open:** the user needs to actually upload/extract this on HostGator (M3.3b) — that's a manual action on their end since no FTP/cPanel credentials are handled in this session. Reminder still pending from the M2 log entry: check HostGator's `post_max_size`/`upload_max_filesize` via cPanel's MultiPHP INI Editor after upload, since the form allows up to 25MB total attachments.

### 2026-07-03 — M3.5: Automated GitHub Actions deploy
**Client direction:** wants push-to-deploy from GitHub instead of manual zip uploads.

**Decision process:** presented three options (GitHub Actions automated FTP, cPanel Git Version Control pull-based, or keep the manual zip workflow) — user chose GitHub Actions. Then, before wiring in a third-party GitHub Action that would run with FTP credential access, asked for explicit sign-off on the specific dependency (`SamKirkland/FTP-Deploy-Action`, MIT license, ~1.8k stars) — same standard applied as the PHPMailer vendoring decision earlier. User approved.

**Delivered:** `.github/workflows/deploy.yml` — triggers on push to `main` (plus manual `workflow_dispatch`), checks out the repo, and runs `SamKirkland/FTP-Deploy-Action@v4.4.0` (pinned, not floating on a tag) over FTPS. Excludes `.git*`, `.github/`, `deploy/`, the zip, and the project-management markdown files (`PROJECT_LOG.md`, `README.md`, `NEEDED_FROM_CLIENT.md`, `.claude/`) from what gets uploaded — mirrors exactly what the manual deploy zip contained.

**Blocking, on the user's side (cannot be done from this session):** four GitHub repo secrets need to be added at github.com → repo → Settings → Secrets and variables → Actions:
- `HOSTGATOR_FTP_SERVER` — FTP host/IP from HostGator cPanel → FTP Accounts
- `HOSTGATOR_FTP_USERNAME` — FTP account username
- `HOSTGATOR_FTP_PASSWORD` — FTP account password
- `HOSTGATOR_FTP_SERVER_DIR` — target path, typically `/public_html/` (or an addon-domain subfolder)

Once those exist, the workflow runs automatically on the next push to `main`, or can be triggered immediately via the repo's **Actions** tab → "Deploy to HostGator" → **Run workflow**. If FTPS fails to connect (some HostGator configs), the `protocol: ftps` line in the workflow can be changed to `ftp` or `sftp`.

**Superseded:** M3.3b (manual zip upload) is no longer the primary path — the zip built in M3.3a still works as a one-off fallback if ever needed, but the intended ongoing workflow is now push-to-main → auto-deploy.

### 2026-07-03 — M3.6: Wrong-folder deploy diagnosed and fixed (see Phase 3 checklist above for full detail)
Site was returning 403 despite "successful" GitHub Actions runs because the FTP account was jailed one folder too deep (`.../textindustry.com/deploy/` instead of `.../textindustry.com/`). Diagnosed/fixed primarily outside this session; verified consistent with this repo's actual structure and confirmed live afterward (`curl` → HTTP 200, real site content). Full writeup is in the Phase 3 checklist entry for M3.6 above rather than duplicated here.

### 2026-07-03 — Bug fix: brand logotype was mirroring under Arabic (RTL)
**Report:** in Arabic mode, the header/footer logo visually read "INDUSTRY TEXT" instead of "TEXT INDUSTRY" — the two-tone wordmark was flipping order.

**Root cause:** `.brand` (icon + wordmark, header) and `.brand-lockup` (the TEXT/INDUSTRY pair itself, used standalone in the footer too) are flex containers with no explicit `direction`, so they inherited `dir="rtl"` from `<html>` when Arabic was active. Flexbox lays out `row` from the writing-direction's start edge — in RTL that's the right — so the DOM order (TEXT, then INDUSTRY) rendered right-to-left, visually reading INDUSTRY-then-TEXT to an LTR-scanning eye. This is a real bug, not cosmetic: a brand logotype in Latin script must stay fixed regardless of page language, the same way "BBC" or "IBM" logos never reorder on Arabic news sites.

**Fix (`css/styles.css`):** added `direction: ltr;` to both `.brand` and `.brand-lockup` — pinning their internal flex order permanently, independent of the page's `dir`. Added a comment explaining why this override is intentional and must not be "corrected" back to inherit page direction later. Fixed at the CSS level (not per-instance) so it covers both the header lockup (wrapped in `.brand`, icon+wordmark) and the footer lockup (standalone `.brand-lockup`, no icon) with one change each.

**Verified:** in Arabic mode, on both `index.html` and `contact.html`, in both header and footer — `getComputedStyle(...).direction` reports `"ltr"` on both elements, and TEXT's bounding-box left edge is confirmed left of INDUSTRY's in all four locations (2 pages × 2 lockup instances). Cross-checked with two independent preview tools (`preview_eval` and `preview_inspect`) since `preview_screenshot` and `window.innerWidth` were both misbehaving in this session's preview browser instance (returning 0/timing out — a tooling artifact, confirmed unrelated to the fix since relative element positions computed correctly regardless). No console errors.

### 2026-07-03 — M3c: Section imagery sourced and integrated
**Client request:** "no license needed" corporate visuals to make the site less bare, plus asked whether SEO/AEO had been kept in mind throughout (see M6a below — answer at the time was: not yet, it's its own backlog item).

**Delivered — three images, all Unsplash License (free commercial use, no attribution legally required), found via `WebSearch`/`WebFetch` and verified before use:**
- `assets/img/hero-beirut.jpg` — Beirut dusk skyline (Sara Calado). Used as the homepage hero's full-bleed background with a dark ink-blue scrim; hero text/buttons switched from dark-on-paper to white-on-photo (`.hero-title`, `.hero-subtitle`, `.hero .btn-ghost` recolored; `.hero-badges` white pills kept as-is, already worked against the photo).
- `assets/img/sworn-seal.jpg` — wax seal stamp on a desk (Raymond Petrik). Used as the Sworn Advantage section's background (that section was already dark/white-text, so only a scrim was needed, no text-color changes).
- `assets/img/contact-documents.jpg` — blank paper + pens on a desk (Kelly Sikkema). Added as a real `<img>` (not CSS background) in a new two-column `page-hero-inner` layout on `contact.html`, `alt=""` since it's decorative, stacks to one column under 860px.

**Caught and avoided one real problem during sourcing:** an initial candidate for the contact-page image ("stack of papers on a table") turned out, on closer inspection of the actual photo content, to be a photographed branding/website-planning worksheet with a third-party company name and its own separately-printed Creative Commons BY-SA license notice visible in the shot — a different and more restrictive license than Unsplash's blanket grant, and thematically confusing besides. Discarded before use; replaced with the blank-paper-and-pens image after confirming no readable third-party text/logos in it. Lesson: Unsplash's license covers the photograph, not necessarily copyrighted material the photo happens to depict — worth eyeballing content, not just trusting the search snippet's description.

**Verified:** all three images return HTTP 200 in the preview's network log; computed-style checks confirm the composited `background-image` layers (scrim + photo) on `.hero`/`.sworn`, and `object-fit: cover` + rounded corners on the contact-page `<img>`; hero title/subtitle confirmed white (`rgb(255,255,255)`) in both English and Arabic; no console errors; responsive stacking rule added for `.page-hero-inner` at the existing 860px breakpoint.

### 2026-07-03 — M6a: SEO/AEO base
**Client question:** whether SEO and AEO (how AI assistants like ChatGPT/Perplexity surface and quote sites) had been considered so far. Honest answer at the time: no, only basic meta/OG tags existed — this was already flagged as backlog item M6, not started. Client asked to do it now.

**Delivered:**
- `sitemap.xml` and `robots.txt` at the repo/site root (referencing the sitemap). Both already covered by the existing GitHub Actions deploy exclude-list logic — nothing in that list blocks root-level files, so no workflow change was needed.
- `<link rel="canonical">` on both pages, pointing at their production URLs.
- `ProfessionalService` JSON-LD structured data on both pages: name, logo, description, Beirut address, MENA `areaServed`, `founder` (Norma Naboulsi, Sworn Translator — matching the site's existing "led by" framing, not a new/unverified claim), `knowsLanguage` (en/fr/ar), and a `makesOffer` list mirroring the four service cards. Deliberately omitted fields with no verified real value (`telephone`, `priceRange`, `sameAs` social links) rather than fabricate placeholders.
- A genuine, visible FAQ section on the homepage (`#faq`, six questions, native `<details>/<summary>` — accessible with zero JS) plus matching `FAQPage` JSON-LD on the same page only, mirroring the visible text exactly (required for the schema to be considered valid/non-spammy by search engines). All six Q&As translated EN/FR/AR. Content is grounded entirely in facts already stated elsewhere on the site (what a sworn translation is, languages served, area served, services offered, how to request a quote, confidentiality) — nothing new or unverifiable was invented for SEO purposes.

**Verified:** both pages' JSON-LD blocks parse as valid JSON (checked with Node, not just eyeballed); FAQ section renders correctly in EN and AR with correct translations; native `<details>` open/close behavior and the CSS `+`/`−` marker confirmed working via direct property manipulation (the preview tool's synthetic click wasn't reliably toggling `<summary>` elements this session — consistent with earlier language-switcher click flakiness, a tooling issue, not a site bug); `sitemap.xml` and `robots.txt` both serve correctly with expected content; no console errors.

**Still open (M6b):** `hreflang` was deliberately not added — it needs a real per-language URL strategy first (subfolders like `/fr/`, subdomains, or staying client-side-only), which was already flagged as an unresolved decision before this session and remains one.

**Deploy verified live (post-push, same session):** run id 28686584109 succeeded; `curl` confirmed `assets/img/hero-beirut.jpg` and `sitemap.xml` both return HTTP 200, and following the `www` → root redirect, the live homepage contains 6 `faq-item` matches — the FAQ section is genuinely live, not just committed.

**Unprompted bonus finding:** `www.textindustry.com` now 301-redirects to `https://textindustry.com/`, and `https://textindustry.com/` returns a clean **HTTP 200 with a valid, trusted SSL certificate** (`curl` succeeds without `-k`/insecure mode). AutoSSL has caught up since the certificate-mismatch issue noted earlier in the session — HTTPS is fully working now, no manual action needed.

### 2026-07-03 — Two design bugs fixed (client visual QA)
**Client report 1:** the ن mark and the TEXT/INDUSTRY wordmark should read visually as "a square and a rectangle" of the same height — they didn't match.

**Root cause:** `.brand-mark` is a fixed 36×36 square, but `.brand-word` sized itself from `font-size + line-height + padding` (≈28.7px tall) — shorter than the mark, so the pairing looked visually unbalanced.

**Fix (`css/styles.css`):** gave `.brand-word` an explicit `height: 36px` with `display: flex; align-items: center;` to vertically center the text, replacing the old line-height/vertical-padding approach. Now both wordmark pieces render at exactly 36px tall (rectangle), matching the mark's 36×36 (square).

**Verified:** `getBoundingClientRect()` on both `.brand-mark` and both `.brand-word` elements confirms `height === 36` for all three, on `index.html` and `contact.html`, in both header and footer instances, and the RTL fix from earlier (`direction: ltr`, TEXT-left-of-INDUSTRY) still holds correctly after this change. No console errors.

**Client report 2:** on the blue-highlighted "Professional Legal Translation" card, the white heading is readable but the body paragraph isn't.

**Root cause:** a real CSS specificity/order bug. `.service-card--featured p { color: rgba(255,255,255,0.82); }` was declared *before* the base `.service-card p { color: var(--color-muted); }` rule in the stylesheet. Both selectors have identical specificity (one class + one element each), so **source order decided the winner** — the later, generic gray rule silently overrode the earlier white one on every card, including the featured one. The heading (`h3`) was unaffected because there was no competing `h3` color rule to lose to.

**Fix:** reordered the rules so `.service-card--featured p` comes *after* `.service-card p`, with a comment explaining why the order matters (to stop a future edit from innocently breaking it again).

**Verified:** computed `color` on `.service-card--featured p` now reports `rgba(255, 255, 255, 0.82)` (was incorrectly inheriting the gray `--color-muted`); heading and the "SWORN & CERTIFIED" tag pill both confirmed still white/readable. No console errors.

**Lesson worth remembering:** two same-specificity selectors targeting the same element — whichever is declared later in the file wins, regardless of which one "sounds" more specific (`--featured p` reads like it should win over plain `p`, but CSS doesn't care about semantic specificity, only selector structure + source order). Worth double-checking rule order whenever a themed/variant override doesn't seem to take effect.

### 2026-07-03 — Webmail access diagnosed; branded gateway page built
**Client question:** tried `mail.textindustry.com` expecting webmail access — it didn't work.

**Diagnosed directly (not guessed):** `mail.textindustry.com` resolves in DNS, but serves **byte-for-byte identical content** to the main homepage (confirmed via matching SHA-256 hashes) — it's just falling through to the default vhost, not a real webmail portal. The actual working webmail URL, confirmed via `curl` (found Roundcube session cookies in the response — `roundcube_sessid`, `roundcube_cookies`), is **`https://webmail.textindustry.com/`** — already works today, clean URL, no port number, no setup needed. This was news to the client and to this log.

**Client ask:** a clean URL (✅ already solved above) plus the Textindustry logo shown somewhere in the webmail experience.

**Constraint surfaced:** natively re-skinning the actual Roundcube login page requires WHM-level server access, which most standard shared-hosting cPanel accounts (this one included, most likely — unconfirmed, added to `NEEDED_FROM_CLIENT.md`) don't have.

**Delivered instead:** `webmail.html` — a small standalone branded gateway page (not part of the main site nav/i18n system, since it's an internal utility, not customer-facing content): Textindustry logo lockup, a "Log in to Webmail" button through to `https://webmail.textindustry.com/`, and a link back to the homepage. Marked `noindex, nofollow` and deliberately left out of `sitemap.xml` and the nav — this is a bookmark-style utility page, not content. No new security exposure — it just links to the same publicly-reachable login page that was already directly accessible.

**Verified:** logo mark renders 36×36, wordmark pieces both 36px tall (same height-match fix as the main site), button correctly points at `https://webmail.textindustry.com/`, `noindex` meta tag present, no console errors.

**Still open:** whether the account actually has WHM access (client wasn't sure) — if it does, the real Roundcube login page could additionally be re-skinned with the logo as a bonus. Added to `NEEDED_FROM_CLIENT.md`.
