# Needed From Client

Live checklist of information/assets needed from the site owner to keep moving. Not urgent — nothing here is blocking current work. Update as items are resolved or new ones surface. (Urgent, blocking items are asked for directly in chat, not listed here.)

---

## Phase 2 — Core Functionality

**M2 — Form backend**
- [ ] Preferred handling once submitted: send an email notification only, or also store submissions somewhere (spreadsheet, simple database)?
- [ ] Should attachments be size-capped differently than the current 10MB/file client-side limit (some mail/PHP configs cap total message size lower)?
- [ ] Any additional recipients besides quotes@textindustry.com who should be notified (e.g. Norma directly, or a second inbox)?

**M3 — Brand assets**
- [x] Logo/mark — custom-designed per client direction (geometric ن-inspired mark + TEXT/INDUSTRY two-tone lockup), doubling as favicon. Done 2026-07-03.
- [x] Palette — corporate ink/paper/blue-ink theme (#1d4ed8 accent, #0c111b ink, white paper), Manrope + Tajawal. Done 2026-07-03, superseding the original gold/serif draft.
- [x] Section imagery — Beirut skyline (hero), wax seal (Sworn Advantage), desk/paper (contact page), all free-license (Unsplash License, no attribution required), verified content-clean before use. Done 2026-07-03.
- [x] A photo of Norma Naboulsi — received 2026-07-03 (`assets/img/Norma_Naboulsi.png`, on disk, not yet used anywhere on the site per client instruction — "don't use it for now"). Ready whenever there's a go-ahead to add it (About page is the natural spot).

## Phase 4 — Content Expansion
- [x] About Us page — built 2026-07-03 (`about.html`, EN/FR/AR). Bio content deliberately kept to facts already established elsewhere on the site (her role as Sworn Translator, what that credential means, languages/region served) — **no specific biographical details were invented** (no education, career history, years of experience, or past employers, since none of that was provided). If a deeper personal bio is wanted, that content still needs to come from the client.
- [ ] Any past press releases, editorial samples, or case studies that could be used as portfolio proof points.
- [ ] Client testimonials or logos, if available and permitted for use.

## Phase 5 — SEO & Launch Readiness
- [x] Multilingual URL strategy — decided: subdomains (`fr.textindustry.com`, `ar.textindustry.com`), in progress as of 2026-07-03 (see PROJECT_LOG.md M6b/M6c).
- [x] Google Search Console / Analytics — **decided:** yes, include both. Reporting method decided too: just use Google's own dashboards directly (analytics.google.com, search.google.com/search-console) — no custom in-site reporting page, to avoid a real engineering lift (API integration, auth, ongoing maintenance) for a site this size.
  - [ ] **Still needed from you to actually wire this in:** (1) create a Search Console property for textindustry.com and send the verification snippet it gives you (usually an HTML meta tag or a DNS record), (2) create an Analytics property and send the Measurement ID (looks like `G-XXXXXXXXXX`).
- [ ] Any required legal footer text (business registration number, VAT/TVA if applicable in Lebanon) for compliance.
- [ ] Social media profile links (Instagram, LinkedIn, etc.) for the footer, if any exist.
- [ ] Whether you have WHM access (separate admin panel from cPanel) on the HostGator account — check the original signup email for "WHM"/"reseller," or try `https://textindustry.com:2087/`. Only relevant if you want the actual webmail login page (Roundcube) re-skinned with the Textindustry logo natively — otherwise the branded gateway page at `webmail.html` covers the branding need without it.

## General / ongoing
- [ ] Final sign-off on homepage/contact copy as currently written (all EN/FR/AR strings live in `js/translations.js`) — flag anything that reads off, especially the Arabic and French translations, which should get a native-speaker review before launch.
- [ ] Confirm quotes@textindustry.com is the only inbox in scope, or if a general info@ address should also appear anywhere.
