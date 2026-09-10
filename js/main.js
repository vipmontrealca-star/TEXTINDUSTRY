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

  function showStatus(status, isError, message) {
    status.hidden = false;
    status.classList.toggle("is-error", isError);
    status.textContent = message;
  }

  function initQuoteForm() {
    var form = document.getElementById("quote-form");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll("[required]");
      var allValid = true;
      requiredFields.forEach(function (field) {
        if (!field.value || !field.value.trim()) allValid = false;
      });

      if (!allValid) {
        showStatus(status, true, t("form.errorStatus") || "Please fill in all required fields before sending.");
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(form.getAttribute("action"), {
        method: "POST",
        body: new FormData(form),
      })
        .then(function (res) {
          return res.json().catch(function () { return { ok: false }; }).then(function (data) {
            return { ok: res.ok && data.ok, message: data.message };
          });
        })
        .then(function (result) {
          if (result.ok) {
            showStatus(status, false, result.message || t("form.successStatus") || "Thanks — your request has been sent.");
            form.reset();
            var fileList = document.getElementById("file-list");
            if (fileList) fileList.innerHTML = "";
          } else {
            showStatus(status, true, result.message || t("form.genericError") || "Something went wrong. Please try again or email quotes@textindustry.com directly.");
          }
        })
        .catch(function () {
          showStatus(status, true, t("form.networkError") || "Could not reach the server. Please email quotes@textindustry.com directly.");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
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
