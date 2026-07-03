/**
 * Textindustry — i18n engine.
 * Applies translations from window.TEXTINDUSTRY_I18N and toggles
 * dir="rtl"/"ltr" + lang on <html> based on the selected language.
 * Persists the choice in localStorage.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "textindustry_lang";
  var SUPPORTED = ["en", "fr", "ar"];
  var DEFAULT_LANG = "en";

  function resolve(path, dict) {
    return path.split(".").reduce(function (acc, key) {
      return acc && typeof acc === "object" ? acc[key] : undefined;
    }, dict);
  }

  function detectInitialLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;

    var nav = (navigator.language || navigator.userLanguage || "").slice(0, 2).toLowerCase();
    if (SUPPORTED.indexOf(nav) !== -1) return nav;

    return DEFAULT_LANG;
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

  function init() {
    var lang = detectInitialLang();
    applyLang(lang);

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
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
