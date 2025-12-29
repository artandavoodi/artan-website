/* =========================================================
   country-language.js
   SINGLE SOURCE OF TRUTH — STABLE BASELINE (FIXED)
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
    const countryLabel = qs('#current-country');
    const languageLabel = qs('#current-language');

    if (countryLabel && state.country)
      countryLabel.textContent = state.country.nativeName;

    if (languageLabel)
      languageLabel.textContent = state.language.toUpperCase();

    if (typeof window.applyTranslation === 'function')
      window.applyTranslation(state.language);
  }

  function buildLanguageDropdown() {
    const dropdown = qs('#language-dropdown');
    const toggle = qs('#language-toggle');
    if (!dropdown || !toggle || !state.country) return;

    dropdown.innerHTML = '';
    dropdown.setAttribute('aria-hidden', 'true');

    const languages = Array.from(
      new Set([DEFAULT_LANGUAGE, state.country.language].filter(Boolean))
    );

    languages.forEach(code => {
      const btn = document.createElement('button');
      btn.className = 'language-option';
      btn.textContent = code.toUpperCase();
      btn.addEventListener('click', () => {
        state.language = code;
        set(STORAGE.LANGUAGE, code);
        dropdown.setAttribute('aria-hidden', 'true');
        applyState();
      });
      dropdown.appendChild(btn);
    });

    toggle.addEventListener('click', () => {
      const hidden = dropdown.getAttribute('aria-hidden') === 'true';
      dropdown.setAttribute('aria-hidden', hidden ? 'false' : 'true');
    });
  }

  function bindCountryOverlay() {
    const overlay = qs('#country-overlay');
    const closeBtn = qs('#country-overlay-close');

    document.addEventListener('open-country-overlay', () => {
      if (overlay) overlay.classList.add('is-visible');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (overlay) overlay.classList.remove('is-visible');
      });
    }

    document.addEventListener('country-selected', e => {
      const c = resolveCountry(e.detail);
      if (!c) return;

      state.country = c;
      state.language = c.language || DEFAULT_LANGUAGE;

      set(STORAGE.COUNTRY, c.code);
      set(STORAGE.LANGUAGE, state.language);

      if (overlay) overlay.classList.remove('is-visible');

      applyState();
      buildLanguageDropdown();
    });
  }

  function bindFooterTriggers() {
    const countryBtn = qs('#country-selector');
    if (countryBtn) {
      countryBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('open-country-overlay'));
      });
    }
  }

  async function init() {
    if (!sessionStorage.getItem(STORAGE.SESSION)) {
      const ip = await detectIP();
      state.country =
        resolveCountry(ip) || resolveCountry(DEFAULT_COUNTRY);
      state.language =
        state.country.language || DEFAULT_LANGUAGE;

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

    bindFooterTriggers();
    bindCountryOverlay();
    applyState();
    buildLanguageDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);
})();