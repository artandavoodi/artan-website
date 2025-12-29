/**
 * ============================================================
 * ARTAN — TRANSLATION ENGINE (LOCKED · SINGLE RESPONSIBILITY)
 * Translates DOM text ONLY.
 * No IP logic · No country logic · No UI logic.
 * Controlled exclusively by countrylanguage.js
 * ============================================================
 */

window.ARTAN_TRANSLATION = (() => {

  let currentLang = "en";
  const cache = new Map();

  /* ---------- RTL handling ---------- */
  const RTL_LANGS = ["ar", "fa", "ur", "he"];
  const applyDir = lang => {
    document.documentElement.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  };

  /* ---------- Google translate fetch ---------- */
  async function translate(text, lang) {
    if (!text || lang === "en") return text;

    const key = `${lang}::${text}`;
    if (cache.has(key)) return cache.get(key);

    try {
      const res = await fetch(
        "https://translate.googleapis.com/translate_a/single" +
        `?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const json = await res.json();
      const out = json[0].map(x => x[0]).join("");
      cache.set(key, out);
      return out;
    } catch {
      return text;
    }
  }

  /* ---------- Apply language to DOM ---------- */
  async function applyLanguage(lang) {
    if (!lang || lang === currentLang) return;

    currentLang = lang;
    applyDir(lang);

    const nodes = document.querySelectorAll("[data-i18n-key]");
    for (const el of nodes) {
      if (!el.dataset.sourceText) {
        el.dataset.sourceText = el.textContent.trim();
      }
      el.textContent = await translate(el.dataset.sourceText, lang);
    }
  }

  return { applyLanguage };

})();