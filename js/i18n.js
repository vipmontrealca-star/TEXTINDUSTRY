/**
 * Textindustry — i18n engine.
 *
 * Each language now lives at its own URL (textindustry.com = English,
 * fr.textindustry.com = French, ar.textindustry.com = Arabic) so search
 * engines and AI assistants can index each language independently —
 * that's the whole point of the subdomain split (see PROJECT_LOG M6).
 * This file therefore does NOT auto-detect/override the page's language
 * on load (a stored preference or browser language silently swapping
 * pre-rendered French content back to English would defeat that). It
 * only syncs the UI to whatever language the page already is, and lets
 * the language-switcher buttons navigate to the matching subdomain.
 *
 * applyLang() itself is kept and exported because the build step
 * (scripts/build-i18n.js, run in a real browser via the dev preview)
 * uses this exact function to pre-render the static fr/ar HTML — the
 * static output and any live client-side use are guaranteed consistent
 * because they run the same code path.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "textindustry_lang";
  var SUPPORTED = ["en", "fr", "ar"];
  var DEFAULT_LANG = "en";
  var SUBDOMAINS = {
    en: "https://textindustry.com",
    fr: "https://fr.textindustry.com",
    ar: "https://ar.textindustry.com"
  };

  function resolve(path, dict) {
    return path.split(".").reduce(function (acc, key) {
      return acc && typeof acc === "object" ? acc[key] : undefined;
    }, dict);
  }

  function applyLang(lang) {
    var dict = window.TEXTINDUSTRY_I18N[lang];
    if (!dict) return;

    document.documentElement.lang = lang;
    document.documentElement.dir = dict.dir || "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = resolve(el.getAttribute("data-i18n"), dict);
      if (typeof value === "string") el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var value = resolve(el.getAttribute("data-i18n-placeholder"), dict);
      if (typeof value === "string") el.setAttribute("placeholder", value);
    });

    document.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      var value = resolve(el.getAttribute("data-i18n-content"), dict);
      if (typeof value === "string") el.setAttribute("content", value);
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
    document.dispatchEvent(new CustomEvent("textindustry:langchange", { detail: { lang: lang, dict: dict } }));
  }

  function navigateToLang(lang) {
    var target = SUBDOMAINS[lang];
    if (!target) return;
    window.location.href = target + window.location.pathname + window.location.search;
  }

  function init() {
    // The page's own lang (baked in by the build step, or "en" on the
    // source/root files) is authoritative — just sync the button UI to it.
    var currentLang = document.documentElement.lang || DEFAULT_LANG;
    if (SUPPORTED.indexOf(currentLang) === -1) currentLang = DEFAULT_LANG;

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === currentLang);
    });
    localStorage.setItem(STORAGE_KEY, currentLang);

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigateToLang(btn.getAttribute("data-lang"));
      });
    });
  }

  window.TextindustryI18n = { applyLang: applyLang, SUPPORTED: SUPPORTED };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
