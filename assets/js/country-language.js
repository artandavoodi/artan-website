/* =========================================================
   country-language.js
   SINGLE SOURCE OF TRUTH — FINAL DROP-IN
========================================================= */
(() => {
  const STORAGE = {
    COUNTRY: 'artan_country',
    LANGUAGE: 'artan_language',
    SESSION: 'artan_session'
  };

  const DEFAULT_COUNTRY = 'US';
  const DEFAULT_LANGUAGE = 'en';

  const qs = s => document.querySelector(s);
  const get = k => localStorage.getItem(k);
  const set = (k, v) => localStorage.setItem(k, v);

  let state = { country: null, language: DEFAULT_LANGUAGE };

  async function detectIP() {
    try {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json();
      return d.country_code?.toUpperCase() || null;
    } catch {
      return null;
    }
  }

  const resolveCountry = code =>
    window.COUNTRIES?.find(c => c.code === code) || null;

  function applyState() {
    const countryEl = qs('#country-selector');
    const langEl = qs('#language-toggle');

    if (countryEl && state.country)
      countryEl.textContent = state.country.nativeName;

    if (langEl)
      langEl.textContent = state.language.toUpperCase();

    window.applyTranslation?.(state.language);
  }

  function buildLanguageMenu() {
    const toggle = qs('#language-toggle');
    if (!toggle) return;

    let menu = qs('#language-menu');
    if (menu) menu.remove();

    menu = document.createElement('div');
    menu.id = 'language-menu';
    menu.className = 'language-menu';

    const languages = [...new Set([
      DEFAULT_LANGUAGE,
      state.country?.language
    ].filter(Boolean))];

    languages.forEach(code => {
      const btn = document.createElement('button');
      btn.textContent = code.toUpperCase();
      btn.onclick = () => {
        state.language = code;
        set(STORAGE.LANGUAGE, code);
        applyState();
        menu.classList.remove('visible');
      };
      menu.appendChild(btn);
    });

    toggle.parentElement.appendChild(menu);
    toggle.onclick = () => menu.classList.toggle('visible');
  }

  function bindCountryOverlay() {
    document.addEventListener('country-selected', e => {
      const c = resolveCountry(e.detail);
      if (!c) return;

      state.country = c;
      state.language = c.language || DEFAULT_LANGUAGE;

      set(STORAGE.COUNTRY, c.code);
      set(STORAGE.LANGUAGE, state.language);

      applyState();
      buildLanguageMenu();
    });
  }

  function bindFooterUI() {
    const countryBtn = qs('#country-selector');
    if (countryBtn) {
      countryBtn.onclick = () =>
        document.dispatchEvent(new CustomEvent('open-country-overlay'));
    }
  }

  async function init() {
    if (!sessionStorage.getItem(STORAGE.SESSION)) {
      const ip = await detectIP();
      state.country = resolveCountry(ip) || resolveCountry(DEFAULT_COUNTRY);
      state.language = state.country.language || DEFAULT_LANGUAGE;

      set(STORAGE.COUNTRY, state.country.code);
      set(STORAGE.LANGUAGE, state.language);
      sessionStorage.setItem(STORAGE.SESSION, '1');
    } else {
      state.country =
        resolveCountry(get(STORAGE.COUNTRY)) ||
        resolveCountry(DEFAULT_COUNTRY);

      state.language =
        get(STORAGE.LANGUAGE) ||
        state.country.language ||
        DEFAULT_LANGUAGE;
    }

    bindFooterUI();
    bindCountryOverlay();
    applyState();
    buildLanguageMenu();
  }

  document.addEventListener('DOMContentLoaded', init);
})();