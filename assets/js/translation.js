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
        India: "hi",
        Japan: "ja",
        China: "zh",
        Singapore: "en",
        Persia: "fa",
        Brazil: "pt",
        Mexico: "es",
        Argentina: "es",
        "United States": "en",
        Canada: "en"
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
            const originalText = el.dataset.originalText || el.textContent;
            if (el.closest(".enter-button") || el.closest("#announcement")) continue;
            if (!el.dataset.originalText) el.dataset.originalText = originalText; // store original

            if (el.dataset.animated === "true") {
                // Defer translation until animation completes
                el.addEventListener("animationend", async function handler() {
                    el.removeEventListener("animationend", handler);
                    el.textContent = await translateText(originalText, lang);
                });
            } else {
                el.textContent = await translateText(originalText, lang);
            }
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

        options.forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const country = e.currentTarget.dataset.country;
                if (country) {
                    const regionLang = REGION_LANGUAGE_MAP[country] || "en";
                    applyRegion(country);
                    await applyLanguage(regionLang);
                    document.getElementById("current-country").textContent = country;
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
                // Disable English → return to region language
                localStorage.removeItem(EN_OVERRIDE_KEY);
                const regionLang = REGION_LANGUAGE_MAP[currentRegion] || "en";
                applyLanguage(regionLang);
            } else {
                // Enable English → bypass translation
                localStorage.setItem(EN_OVERRIDE_KEY, "true");
                applyLanguage("en");
            }

            updateToggle();
        });

        updateToggle();
    };

    const init = async () => {
        await detectIP();
        await applyLanguage(currentLanguage);
        applyRegion(currentRegion);
        initCountryOverlay();
        initLanguageToggle();
    };

    return { init, applyLanguage, applyRegion };
})();

// Auto-start translation system on page load
document.addEventListener("DOMContentLoaded", () => {
    if (window.ARTAN_TRANSLATION && typeof window.ARTAN_TRANSLATION.init === "function") {
        window.ARTAN_TRANSLATION.init();
    }
});
