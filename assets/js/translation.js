/**
 * Translation and Region Management - Apple.com inspired professional setup
 * Fully IP-detecting, real-time translation, EN toggle override, caching
 */

window.ARTAN_TRANSLATION = (function () {
    const LANGUAGE_STORAGE_KEY = "artan_language";
    const REGION_STORAGE_KEY = "artan_region";
    const REGION_LANGUAGE_MAP = {
        Germany: "de",
        France: "fr",
        "United Kingdom": "en",
        Denmark: "da",
        Switzerland: "de",
        Italy: "it",
        Spain: "es",
        Sweden: "sv",
        Netherlands: "nl",
        Norway: "no",
        Belgium: "fr",
        India: "hi",
        Japan: "ja",
        China: "zh",
        Singapore: "en",
        Persia: "fa",
        Brazil: "pt",
        Mexico: "es",
        Argentina: "es",
        "United States": "en",
        Canada: "en",
        "United Arab Emirates": "ar",
        Turkey: "tr",
        "South Korea": "ko",
        Thailand: "th",
        Indonesia: "id",
        Vietnam: "vi",
        Philippines: "en",
        Egypt: "ar",
        "Saudi Arabia": "ar",
        Morocco: "ar",
        Pakistan: "ur",
        Kenya: "en",
        Colombia: "es",
        Chile: "es",
        Peru: "es"
    };

    let currentLanguage = "en"; // default English
    let currentRegion = "United States"; // default region
    const translationCache = new Map(); // in-memory cache

    // Real-time translation function (free, browser-based Google Translate API)
    const translateText = async (text, targetLang) => {
        if (targetLang === "en") return text; // EN override
        const cacheKey = `${text}_${targetLang}`;
        if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
        try {
            const encoded = encodeURIComponent(text);
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`);
            const data = await response.json();
            const translated = data[0].map(item => item[0]).join("");
            translationCache.set(cacheKey, translated);
            return translated;
        } catch {
            return text; // fallback English
        }
    };

    // Detect IP and determine region/language
    const detectIP = async () => {
        try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            if (data && data.country_name && REGION_LANGUAGE_MAP[data.country_name]) {
                currentRegion = data.country_name;
                currentLanguage = REGION_LANGUAGE_MAP[currentRegion];
            } else {
                currentRegion = "United States";
                currentLanguage = "en";
            }
        } catch {
            currentRegion = "United States";
            currentLanguage = "en";
        }
    };

    // Apply language dynamically to all [data-i18n-key] elements
    const applyLanguage = async (lang) => {
        currentLanguage = lang;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        const nodes = document.querySelectorAll("[data-i18n-key]:not(.enter-button):not(.enter-button *)");
        for (const el of nodes) {
            if (el.closest(".enter-button") || el.closest("#announcement")) continue;
            const originalText = el.dataset.originalText || el.textContent;
            if (!el.dataset.originalText) el.dataset.originalText = originalText; // store original

            if (el.dataset.animated === "true") {
                el.addEventListener("animationend", async function handler() {
                    el.removeEventListener("animationend", handler);
                    el.textContent = await translateText(originalText, lang);
                });
            } else {
                el.textContent = await translateText(originalText, lang);
            }
        }

        if (typeof window.__UPDATE_ANNOUNCEMENT_LANGUAGE__ === "function") {
            window.__UPDATE_ANNOUNCEMENT_LANGUAGE__(lang);
        }
    };

    // Apply region-specific logic (e.g., currency)
    const applyRegion = (region) => {
        currentRegion = region;
        localStorage.setItem(REGION_STORAGE_KEY, region);
        document.querySelectorAll("[data-region-currency]").forEach((el) => {
            if (window.CURRENCY && window.CURRENCY[region]) {
                el.textContent = window.CURRENCY[region];
            }
        });
    };

    // Country overlay interactions
    const initCountryOverlay = () => {
        const overlay = document.getElementById("country-overlay");
        const selector = document.getElementById("country-selector");
        const closeBtn = document.getElementById("country-overlay-close");
        const options = document.querySelectorAll(".country-option");

        if (closeBtn) closeBtn.addEventListener("click", () => {
            overlay.classList.remove("visible");
            setTimeout(() => overlay.classList.add("hidden"), 400);
        });

        if (selector && overlay) selector.addEventListener("click", () => {
            overlay.classList.remove("hidden");
            setTimeout(() => overlay.classList.add("visible"), 20);
        });

        const nativeNameMap = {
            Germany: "Deutschland",
            France: "France",
            "United Kingdom": "United Kingdom",
            Denmark: "Danmark",
            Switzerland: "Schweiz",
            Italy: "Italia",
            Spain: "España",
            Sweden: "Sverige",
            Netherlands: "Nederland",
            Norway: "Norge",
            Belgium: "Belgique",
            India: "India",
            Japan: "日本",
            China: "中国",
            Singapore: "Singapore",
            Persia: "ایران",
            Brazil: "Brasil",
            Mexico: "México",
            Argentina: "Argentina",
            "United States": "United States",
            Canada: "Canada",
            "United Arab Emirates": "الإمارات العربية المتحدة",
            Turkey: "Türkiye",
            "South Korea": "대한민국",
            Thailand: "ไทย",
            Indonesia: "Indonesia",
            Vietnam: "Việt Nam",
            Philippines: "Philippines",
            Egypt: "مصر",
            "Saudi Arabia": "المملكة العربية السعودية",
            Morocco: "Maroc",
            Pakistan: "پاکستان",
            Kenya: "Kenya",
            Colombia: "Colombia",
            Chile: "Chile",
            Peru: "Perú"
        };

        options.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const country = e.currentTarget.dataset.country;
                if (country) {
                    const regionLang = REGION_LANGUAGE_MAP[country] || "en";
                    applyRegion(country);
                    await applyLanguage(regionLang);
                    const nativeName = nativeNameMap[country] || country;
                    const currentCountryEl = document.getElementById("current-country");
                    if (currentCountryEl) {
                        currentCountryEl.textContent = nativeName;
                    }
                    overlay.classList.remove("visible");
                    setTimeout(() => overlay.classList.add("hidden"), 400);
                }
            });
        });
    };

    // EN toggle override — pure on/off, no region mutation
    const initLanguageToggle = () => {
        const toggle = document.getElementById("language-toggle");
        if (!toggle) return;

        const EN_OVERRIDE_KEY = "artan_en_override";

        const updateToggle = () => {
            const isActive = localStorage.getItem(EN_OVERRIDE_KEY) === "true";
            toggle.classList.toggle("active", isActive);
        };

        toggle.addEventListener("click", () => {
            const isActive = localStorage.getItem(EN_OVERRIDE_KEY) === "true";

            if (isActive) {
                localStorage.removeItem(EN_OVERRIDE_KEY);
                const regionLang = REGION_LANGUAGE_MAP[currentRegion] || "en";
                applyLanguage(regionLang);
            } else {
                localStorage.setItem(EN_OVERRIDE_KEY, "true");
                applyLanguage("en");
            }

            updateToggle();
        });

        // On init, apply EN override if active
        const isActive = localStorage.getItem(EN_OVERRIDE_KEY) === "true";
        if (isActive) {
            applyLanguage("en");
        }

        updateToggle();
    };

    // FIXED INIT FUNCTION
    const init = async () => {
        const sessionKey = "artan_session_active";
        const isHardRefresh = !sessionStorage.getItem(sessionKey);
        sessionStorage.setItem(sessionKey, "true");

        const storedRegion = localStorage.getItem(REGION_STORAGE_KEY);
        const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const EN_OVERRIDE_KEY = "artan_en_override";
        const enOverrideActive = localStorage.getItem(EN_OVERRIDE_KEY) === "true";

        if (isHardRefresh || !storedRegion) {
            await detectIP();
            // Ensure IP-detected region/language is applied and stored
            localStorage.setItem(REGION_STORAGE_KEY, currentRegion);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
        } else {
            currentRegion = storedRegion;
            currentLanguage = storedLanguage || (REGION_LANGUAGE_MAP[storedRegion] || "en");
        }

        if (enOverrideActive) {
            await applyLanguage("en");
        } else {
            await applyLanguage(currentLanguage);
        }
        applyRegion(currentRegion);
        initCountryOverlay();
        initLanguageToggle();
    };

    return { init, applyLanguage, applyRegion };
})();

document.addEventListener("DOMContentLoaded", () => {
    if (window.ARTAN_TRANSLATION && typeof window.ARTAN_TRANSLATION.init === "function") {
        window.ARTAN_TRANSLATION.init();
    }
});