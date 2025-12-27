/* =========================================================
   Country & Language Management — SINGLE SOURCE OF TRUTH
   File: country-language.js
   Deterministic · Apple-like · Drop-in Replacement
========================================================= */

/* =================== Storage Keys =================== */
const COUNTRY_STORAGE_KEY  = "artan_country";
const LANGUAGE_STORAGE_KEY = "artan_language";
const EN_OVERRIDE_KEY      = "artan_en_override";
const SESSION_KEY          = "artan_session_active";

/* =================== Native Country Labels =================== */
const nativeNameMap = {
  Germany: "Deutschland",
  France: "France",
  "United Kingdom": "United Kingdom",
  Ireland: "Ireland",
  Denmark: "Danmark",
  Sweden: "Sverige",
  Norway: "Norge",
  Finland: "Suomi",
  Netherlands: "Nederland",
  Belgium: "Belgique",
  Switzerland: "Schweiz",
  Austria: "Österreich",
  Italy: "Italia",
  Spain: "España",
  Portugal: "Portugal",
  Poland: "Polska",
  Serbia: "Srbija",
  Croatia: "Hrvatska",
  Slovenia: "Slovenija",
  Slovakia: "Slovensko",
  CzechRepublic: "Česká republika",
  Hungary: "Magyarország",
  Romania: "România",
  Bulgaria: "България",
  Greece: "Ελλάδα",
  Turkey: "Türkiye",
  Russia: "Россия",
  Ukraine: "Україна",
  China: "中国",
  Japan: "日本",
  "South Korea": "대한민국",
  India: "India",
  Egypt: "مصر",
  Morocco: "Maroc",
  Tunisia: "تونس",
  "United Arab Emirates": "الإمارات العربية المتحدة",
  Australia: "Australia",
  "New Zealand": "New Zealand",
  "United States": "United States"
};

/* =================== Region → Language =================== */
const REGION_LANGUAGE_MAP = {
  Germany: "de",
  France: "fr",
  "United Kingdom": "en",
  Ireland: "en",
  Denmark: "da",
  Sweden: "sv",
  Norway: "no",
  Finland: "fi",
  Netherlands: "nl",
  Belgium: "fr",
  Switzerland: "de",
  Austria: "de",
  Italy: "it",
  Spain: "es",
  Portugal: "pt",
  Poland: "pl",
  Serbia: "sr",
  Croatia: "hr",
  Slovenia: "sl",
  Slovakia: "sk",
  CzechRepublic: "cs",
  Hungary: "hu",
  Romania: "ro",
  Bulgaria: "bg",
  Greece: "el",
  Turkey: "tr",
  Russia: "ru",
  Ukraine: "uk",
  China: "zh",
  Japan: "ja",
  "South Korea": "ko",
  India: "hi",
  Egypt: "ar",
  Morocco: "ar",
  Tunisia: "ar",
  "United Arab Emirates": "ar",
  Australia: "en",
  "New Zealand": "en",
  "United States": "en"
};

/* =================== Runtime State =================== */
const STATE = {
  country: null,
  language: null,
  enOverride: false,
  firstSession: false
};

/* =================== Boot =================== */
document.addEventListener("DOMContentLoaded", () => {
  const countryEl  = document.getElementById("current-country");
  const langToggle = document.getElementById("language-toggle");

  /* ---------- Translation Barrier ---------- */
  function waitForTranslation(cb) {
    const max = 80;
    let i = 0;
    const t = setInterval(() => {
      if (window.ARTAN_TRANSLATION?.applyLanguage) {
        clearInterval(t);
        cb();
      }
      if (++i > max) clearInterval(t);
    }, 25);
  }

  /* ---------- Language Resolution ---------- */
  function resolveLanguage(country) {
    if (STATE.enOverride) return "en";
    return REGION_LANGUAGE_MAP[country] || "en";
  }

  /* ---------- Commit State ---------- */
  function commit() {
    if (countryEl && STATE.country) {
      countryEl.textContent =
        nativeNameMap[STATE.country] || STATE.country;
    }

    if (langToggle && STATE.language) {
      langToggle.textContent = STATE.language.toUpperCase();
    }

    localStorage.setItem(COUNTRY_STORAGE_KEY, STATE.country);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, STATE.language);
    localStorage.setItem(EN_OVERRIDE_KEY, STATE.enOverride ? "true" : "false");

    waitForTranslation(() => {
      window.ARTAN_TRANSLATION.applyLanguage(STATE.language);
    });
  }

  /* ---------- IP Detection (First Session Only) ---------- */
  function detectIP() {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        STATE.country  = d?.country_name || "United States";
        STATE.language = resolveLanguage(STATE.country);
        commit();
      })
      .catch(() => {
        STATE.country  = "United States";
        STATE.language = "en";
        commit();
      });
  }

  /* ---------- Session Resolution ---------- */
  function initSession() {
    STATE.firstSession = !sessionStorage.getItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, "true");

    STATE.enOverride =
      localStorage.getItem(EN_OVERRIDE_KEY) === "true";

    if (STATE.firstSession) {
      detectIP();
    } else {
      STATE.country =
        localStorage.getItem(COUNTRY_STORAGE_KEY) || "United States";

      STATE.language = STATE.enOverride
        ? "en"
        : localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
          resolveLanguage(STATE.country);

      commit();
    }
  }

  /* ---------- Language Toggle ---------- */
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      STATE.enOverride = !STATE.enOverride;
      STATE.language = STATE.enOverride
        ? "en"
        : resolveLanguage(STATE.country);
      commit();
    });
  }

  /* ---------- Public API ---------- */
  window.ARTAN_COUNTRY_LANGUAGE = {
    setCountry(country) {
      STATE.country  = country;
      STATE.language = resolveLanguage(country);
      STATE.enOverride = false;
      commit();
    }
  };

  initSession();
});