/**
 * ============================================================
 * ARTAN — TRANSLATION ENGINE
 * Single responsibility: language translation only
 * Deterministic · Cache-aware · No IP · No Region logic
 * ============================================================
 */

window.ARTAN_TRANSLATION = (function () {

  /* =================== Storage Keys =================== */
  const LANGUAGE_KEY = "artan_language";
  const EN_OVERRIDE_KEY = "artan_en_override";

  /* =================== Runtime State =================== */
  let currentLanguage = "en";
  const translationCache = new Map();

  /* =================== Direction Utilities =================== */
  function isRTL(lang) {
    return ["ar", "fa", "ur", "he"].includes(lang);
  }

  function applyDirection(lang) {
    if (isRTL(lang)) {
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      document.documentElement.removeAttribute("dir");
    }
  }

  /* =================== Core Translator =================== */
  async function translateText(text, lang) {
    if (!text || lang === "en") return text;

    const cacheKey = `${text}__${lang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      const res = await fetch(
        "https://translate.googleapis.com/translate_a/single" +
        `?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      const translated = data[0].map(chunk => chunk[0]).join("");
      translationCache.set(cacheKey, translated);
      return translated;
    } catch {
      return text;
    }
  }

  /* =================== Apply Language =================== */
  async function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem(LANGUAGE_KEY, lang);

    applyDirection(lang);

    const nodes = document.querySelectorAll("[data-i18n-key]");
    for (const el of nodes) {
      if (!el.dataset.originalText) {
        el.dataset.originalText = el.textContent.trim();
      }
      const source = el.dataset.originalText;
      el.textContent = await translateText(source, lang);
    }
  }

  /* =================== Language Toggle =================== */
  function initLanguageToggle() {
    const toggle = document.getElementById("language-toggle");
    if (!toggle) return;

    function syncToggle() {
      const override = localStorage.getItem(EN_OVERRIDE_KEY) === "true";
      toggle.classList.toggle("active", !override);
    }

    toggle.addEventListener("click", async () => {
      const overrideActive = localStorage.getItem(EN_OVERRIDE_KEY) === "true";

      if (overrideActive) {
        localStorage.removeItem(EN_OVERRIDE_KEY);
        const lang = localStorage.getItem(LANGUAGE_KEY) || "en";
        await applyLanguage(lang);
      } else {
        localStorage.setItem(EN_OVERRIDE_KEY, "true");
        await applyLanguage("en");
      }

      syncToggle();
    });

    syncToggle();
  }

  /* =================== Init =================== */
  async function init() {
    const storedLang = localStorage.getItem(LANGUAGE_KEY);
    const enOverride = localStorage.getItem(EN_OVERRIDE_KEY) === "true";

    const langToApply = enOverride ? "en" : (storedLang || "en");
    await applyLanguage(langToApply);

    initLanguageToggle();
  }

  return {
    init,
    applyLanguage
  };

})();

/* =================== Boot =================== */
document.addEventListener("DOMContentLoaded", () => {
  window.ARTAN_TRANSLATION.init();
});