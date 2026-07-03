# Textindustry.com

Base front-end for **Textindustry** — a translation, localization and creative
editorial agency based in Beirut, led by Norma Naboulsi (Sworn Translator, Lebanon).

Built as static HTML/CSS/JS (no build step required) so it can be opened directly
or dropped into any static host / future framework migration.

## Structure

```
index.html          Homepage — hero, services grid, "Sworn Advantage" section, footer
contact.html         Contact/order page — quote form with multi-file attachments
css/styles.css       All styling, using CSS logical properties (margin-inline,
                     padding-inline, border-inline-start, etc.) so RTL mirrors
                     automatically when html[dir="rtl"] is set — no separate
                     RTL stylesheet needed.
js/translations.js   EN/FR/AR string dictionary
js/i18n.js           Applies translations + toggles lang/dir on <html>,
                     persists choice in localStorage
js/main.js           Mobile nav toggle, quote-form validation, drag-and-drop
                     multi-file attachment picker (.pdf/.docx/.png/.jpg, 10MB cap)
locales/             Reserved for future per-route JSON locale files if the
                     project migrates to a framework with file-based i18n
assets/img/          Reserved for logo, photography, and Open Graph images
```

## Language / RTL handling

- Language buttons (EN / FR / AR) in the header call `TextindustryI18n.applyLang(lang)`.
- Switching to Arabic sets `dir="rtl"` and swaps the type pairing to Amiri/Tajawal;
  English and French use `dir="ltr"` with Cormorant Garamond/Inter.
- Because the CSS uses logical properties throughout, no mirrored/RTL-specific
  overrides were needed for layout — only the font-family swap is conditional.

## Contact form

- Fields: name, company, email, phone, source language, target language, service, message.
- Multi-file attachment input (drag-and-drop + click-to-browse) restricted to
  `.pdf .docx .png .jpg/.jpeg`, 10MB per file, with a removable file list.
- Primary inbox: **quotes@textindustry.com**.
- The form currently submits via `mailto:` as a static-site placeholder. Browsers
  cannot attach binary files through `mailto:` — wire this form to a real backend
  or form service (e.g. an API route, Formspree, AWS SES/Lambda) before launch so
  attachments actually transmit.

## Next steps for production

- Replace the `mailto:` submission in `contact.html` with a real endpoint that
  accepts `multipart/form-data` and forwards to quotes@textindustry.com.
- Add logo/brand imagery to `assets/img/`.
- Consider migrating to Next.js if server-side rendering, routing, or a CMS
  becomes necessary — the current i18n/RTL structure ports directly.
