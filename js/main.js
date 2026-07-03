/**
 * Textindustry — site interactions:
 * mobile nav toggle, quote form validation, and multi-file attachment picker.
 */
(function () {
  "use strict";

  function t(path) {
    var lang = document.documentElement.lang || "en";
    var dict = window.TEXTINDUSTRY_I18N && window.TEXTINDUSTRY_I18N[lang];
    if (!dict) return "";
    return path.split(".").reduce(function (acc, key) {
      return acc && typeof acc === "object" ? acc[key] : undefined;
    }, dict) || "";
  }

  /* ---------- Mobile nav ---------- */
  function initNavToggle() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ---------- Quote form: attachments + validation ---------- */
  var ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg"];
  var MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function isAcceptedFile(file) {
    var name = file.name.toLowerCase();
    var extOk = ACCEPTED_EXTENSIONS.some(function (ext) { return name.endsWith(ext); });
    return extOk && file.size <= MAX_FILE_SIZE;
  }

  function initFileUpload() {
    var input = document.getElementById("attachments");
    var drop = document.getElementById("file-drop");
    var list = document.getElementById("file-list");
    var errorEl = document.getElementById("file-error");
    if (!input || !drop || !list) return;

    // DataTransfer-backed store so we can remove individual files
    // and keep the native <input> in sync for the real form submission.
    var store = new DataTransfer();

    function render() {
      list.innerHTML = "";
      Array.prototype.forEach.call(store.files, function (file, index) {
        var li = document.createElement("li");

        var label = document.createElement("span");
        label.textContent = file.name + " — " + formatSize(file.size);

        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "file-remove";
        removeBtn.setAttribute("aria-label", "Remove " + file.name);
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", function () {
          var next = new DataTransfer();
          Array.prototype.forEach.call(store.files, function (f, i) {
            if (i !== index) next.items.add(f);
          });
          store = next;
          input.files = store.files;
          render();
        });

        li.appendChild(label);
        li.appendChild(removeBtn);
        list.appendChild(li);
      });
    }

    function addFiles(fileList) {
      var rejected = false;
      Array.prototype.forEach.call(fileList, function (file) {
        if (isAcceptedFile(file)) {
          store.items.add(file);
        } else {
          rejected = true;
        }
      });
      input.files = store.files;
      if (errorEl) errorEl.hidden = !rejected;
      render();
    }

    input.addEventListener("change", function (e) {
      addFiles(e.target.files);
    });

    ["dragenter", "dragover"].forEach(function (evt) {
      drop.addEventListener(evt, function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach(function (evt) {
      drop.addEventListener(evt, function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
      });
    });

    drop.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  function initQuoteForm() {
    var form = document.getElementById("quote-form");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (e) {
      var requiredFields = form.querySelectorAll("[required]");
      var allValid = true;
      requiredFields.forEach(function (field) {
        if (!field.value || !field.value.trim()) allValid = false;
      });

      if (!allValid) {
        e.preventDefault();
        status.hidden = false;
        status.classList.add("is-error");
        status.textContent = t("form.errorStatus") || "Please fill in all required fields before sending.";
        return;
      }

      // NOTE: mailto: submission cannot carry binary attachments — the
      // browser dialog opens with the form fields, and the user is asked
      // to attach files manually. A backend/API endpoint is required to
      // submit attachments programmatically; this is a static front-end base.
      status.hidden = false;
      status.classList.remove("is-error");
      status.textContent = t("form.successStatus") || "Thanks — your default email client will open to send this request.";
    });
  }

  function init() {
    initNavToggle();
    initFileUpload();
    initQuoteForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
