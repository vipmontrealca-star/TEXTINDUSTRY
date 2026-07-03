# Textindustry.com — Project Log

Live record of what's built, decisions made, and what's next. Update this on every milestone instead of relying on chat history.

## Working style

Built in small, modular milestones grouped into phases — each milestone checkpointed and verified (browser preview, console check) before moving to the next. See "Phases & Backlog" below for the current breakdown.

---

## Phases & Backlog

### Phase 1 — Foundation ✅ complete
- [x] **M1** — Initial scaffold (site structure, pages, i18n/RTL, styling, contact form UI)
- [x] **M1.1** — Local git repository initialized

### Phase 2 — Core Functionality (in progress)
- [ ] **M2** — Form backend: replace `mailto:` placeholder with a real endpoint that accepts `multipart/form-data` and forwards to quotes@textindustry.com
- [ ] **M3** — Brand assets: logo, favicon, Open Graph image in `assets/img/`; wire up `<link rel="icon">` and OG/Twitter meta tags
- [ ] **M4** — Accessibility pass: keyboard nav on mobile menu/language switcher, focus states, `aria-live` review, color contrast check on gold-on-charcoal accents

### Phase 3 — Infrastructure & Version Control (in progress)
- [x] **M3.1** — `.gitignore` + local git repo initialized
- [x] **M3.2** — GitHub remote connected: `https://github.com/vipmontrealca-star/TEXTINDUSTRY.git`; commit identity set to `Textindustry` / `quotes@textindustry.com`; first push done
- [ ] **M3.3** — HostGator deployment via **FTP/SFTP** (decided over cPanel Git Version Control) — deploy-ready build/zip to be prepared when user is ready; credentials handled outside chat
- [ ] **M3.4** — Domain/DNS pointed at HostGator hosting, first live deploy verified

### Phase 4 — Content Expansion (not started, only if requested)
- [ ] **M5** — Additional pages: About/Team (Norma Naboulsi bio), individual service detail pages

### Phase 5 — SEO & Launch Readiness (not started)
- [ ] **M6** — SEO base: sitemap.xml, robots.txt, per-language `hreflang` (once URL/language strategy is decided — currently client-side switch only, no distinct URLs per language)
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
