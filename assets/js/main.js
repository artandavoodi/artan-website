/**
 * Utils
 */
const throttle = (callback, limit) => {
  let timeoutHandler = null;
  return () => {
    if (timeoutHandler == null) {
      timeoutHandler = setTimeout(() => {
        callback();
        timeoutHandler = null;
      }, limit);
    }
  };
};

const listen = (selector, event, callback) => {
  const ele = document.querySelector(selector);
  if (ele) ele.addEventListener(event, callback);
};

/**
 * Other site functions (header, menu, etc.) remain intact
 * ... existing functions ...
 */

/**
 * DOMContentLoaded - Theme + Announcement
 */
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggle = document.getElementById("theme-toggle");
    const footer = document.querySelector("footer");

    // Theme colors
    const darkBg = "#000000";
    const darkText = "#ffffff";
    const lightBg = "#ffffff";
    const lightText = "#000000";

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

    const applyTheme = (theme) => {
        currentTheme = theme;
        if (theme === "dark") {
            body.style.backgroundColor = darkBg;
            body.style.color = darkText;
            toggle.style.backgroundColor = darkText;
            if (footer) footer.style.color = darkText;
        } else {
            body.style.backgroundColor = lightBg;
            body.style.color = lightText;
            toggle.style.backgroundColor = lightText;
            if (footer) footer.style.color = lightText;
        }
        localStorage.setItem("theme", theme);
    };

    applyTheme(currentTheme);

    if (toggle) {
        toggle.addEventListener("click", () => {
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(newTheme);
        });
    }

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        const systemTheme = e.matches ? "dark" : "light";
        if (!savedTheme) applyTheme(systemTheme);
    });

    // Announcement container typewriter
    const announcementEl = document.getElementById("announcement");
    if (announcementEl) {
        const primaryText = announcementEl.dataset.primary;
        const secondaryText = announcementEl.dataset.secondary;

        announcementEl.textContent = "";
        announcementEl.style.fontWeight = "600";
        announcementEl.style.fontSize = "1.8rem";
        announcementEl.style.display = "inline-block";

        let index = 0;
        let deleting = false;

        function typeLoop() {
            if (!deleting) {
                announcementEl.textContent = primaryText.substring(0, index + 1);
                index++;
                if (index <= primaryText.length) {
                    setTimeout(typeLoop, 100); // typing speed
                } else {
                    // Pause before backward deletion
                    setTimeout(() => {
                        deleting = true;
                        typeLoop();
                    }, 4000); // longer pause
                }
            } else {
                announcementEl.textContent = primaryText.substring(0, index - 1);
                index--;
                if (index > 0) {
                    setTimeout(typeLoop, 50); // deletion speed
                } else {
                    // Show secondary text as button with scale animation
                    showSecondaryButton();
                }
            }
        }

        function showSecondaryButton() {
            // Clear container
            announcementEl.textContent = "";

            // Create button for secondary text
            const btn = document.createElement("button");
            btn.className = "enter-button";
            btn.innerHTML = `<span>${secondaryText}</span>`;

            announcementEl.appendChild(btn);

            // initial scale and opacity
            let scale = 0.3;  // adjusted from 0.05 to match previous animation size
            btn.style.opacity = 0;
            btn.style.transform = `scale(${scale})`;

            function step() {
                let speed = scale < 0.5 ? 0.01 : 0.015; // adjusted for smoother/faster scaling
                scale += speed;
                if (scale <= 1) {
                    btn.style.transform = `scale(${scale})`;
                    btn.style.opacity = scale;
                    requestAnimationFrame(step);
                } else {
                    btn.style.transform = "scale(1)";
                    btn.style.opacity = 1;
                }
            }
            step();
        }

        typeLoop();
    }

    /* Smooth custom cursor movement with global hover effect including overlay */
    const customCursor = document.querySelector('.custom-cursor');
    if (customCursor) {
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        const speed = 0.15; // lower = slower, smoother follow

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;
            customCursor.style.top = `${cursorY}px`;
            customCursor.style.left = `${cursorX}px`;
            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        /* Global cursor hover effect - fully universal */
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            const interactive = target.closest(
                'button, a, input, select, textarea, label, [role="button"], [onclick], .enter-button, .logo-container, .country-option, #country-overlay-close'
            );

            if (customCursor) {
                // Maintain existing behavior:
                // On interactive elements, the cursor circle disappears
                // On non-interactive areas, circle is visible
                customCursor.style.opacity = interactive ? '0' : '1';
            }
        });
    }


    /**
     * Country detection (IP-based) + persistence
     * Non-blocking, silent, Apple-like
     */
    const countryLabel = document.getElementById("current-country");
    const COUNTRY_STORAGE_KEY = "artan_country";

    const setCountry = (countryName) => {
        if (!countryName || !countryLabel) return;
        countryLabel.textContent = countryName;
        localStorage.setItem(COUNTRY_STORAGE_KEY, countryName);
    };

    const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (storedCountry) {
        setCountry(storedCountry);
    } else {
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (data && data.country_name) {
                    setCountry(data.country_name);
                }
            })
            .catch(() => {
                /* silent fail — fallback remains unchanged */
            });
    }

    /**
     * Global localization system: region vs language
     */
    /**
     * I18N dictionary (additive, scalable)
     * Text is keyed semantically, not structurally
     */
    window.I18N = window.I18N || {
        site_title: {
            en: "Artan",
            de: "Artan",
            fr: "Artan",
            fa: "آرتان",
            hi: "आर्तन",
            ja: "アルタン",
            zh: "阿尔坦"
        },
        enter_button: {
            en: "Enter",
            de: "Eintreten",
            fr: "Entrer",
            fa: "ورود",
            hi: "प्रवेश",
            ja: "入る",
            zh: "进入"
        },
        footer_country: {
            en: "Choose your country or region",
            de: "Land oder Region wählen",
            fr: "Choisir le pays ou la région",
            fa: "کشور یا منطقه را انتخاب کنید",
            hi: "देश या क्षेत्र चुनें",
            ja: "国または地域を選択",
            zh: "选择国家或地区"
        }
    };
    const LANGUAGE_STORAGE_KEY = "artan_language";
    const REGION_STORAGE_KEY = "artan_region";

    // Default language and region
    let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
    let currentRegion = localStorage.getItem(REGION_STORAGE_KEY) || storedCountry || "Germany";

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

    // Function to apply language globally
    const applyLanguage = (lang) => {
        currentLanguage = lang;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

        // Translate all elements with data-i18n-key attribute
        document.querySelectorAll("[data-i18n-key]").forEach((el) => {
            const key = el.dataset.i18nKey;
            if (window.I18N && window.I18N[key] && window.I18N[key][lang]) {
                el.textContent = window.I18N[key][lang];
            }
        });

        // Translate text nodes without data-i18n-key by scanning known keys in I18N
        // This handles elements that might not have data-i18n-key but have text matching keys
        const allElements = document.body.querySelectorAll("*");
        allElements.forEach((el) => {
            // Skip elements with data-i18n-key since already handled
            if (el.hasAttribute("data-i18n-key")) return;

            // For elements with a single text node child only
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                const text = el.textContent.trim();
                if (text && window.I18N[text]) {
                    const translation = window.I18N[text][lang];
                    if (translation) {
                        el.textContent = translation;
                    }
                }
            }
        });

        document.documentElement.setAttribute("lang", lang);
    };

    // Function to apply region-specific settings (currency, services, etc.)
    const applyRegion = (region) => {
        currentRegion = region;
        localStorage.setItem(REGION_STORAGE_KEY, region);

        // Example: update currency display or other region-dependent logic
        document.querySelectorAll("[data-region-currency]").forEach((el) => {
            if (window.CURRENCY && window.CURRENCY[region]) {
                el.textContent = window.CURRENCY[region];
            }
        });
    };

    // Initialize stored language and region
    applyLanguage(currentLanguage);
    applyRegion(currentRegion);

    /**
     * Country overlay interactivity
     */
    const countryOverlay = document.getElementById("country-overlay");
    const countrySelectorButton = document.getElementById("country-selector");
    const countryOverlayClose = document.getElementById("country-overlay-close");
    const countryOptions = document.querySelectorAll(".country-option");

    // Overlay close button animation: ensure spans animate X <-> horizontal
    if (countryOverlayClose) {
        countryOverlayClose.classList.add("global-close-button");
        countryOverlayClose.removeAttribute("style");

        const spans = countryOverlayClose.querySelectorAll("span");
        countryOverlayClose.addEventListener("mouseenter", () => {
            countryOverlayClose.classList.add("hovering");
            spans.forEach(span => {
                span.style.transform = "rotate(0deg)"; // X to horizontal minus
            });
        });

        countryOverlayClose.addEventListener("mouseleave", () => {
            countryOverlayClose.classList.remove("hovering");
            spans.forEach((span, idx) => {
                span.style.transform = idx === 0 ? "rotate(45deg)" : "rotate(-45deg)"; // revert back to X
            });
        });

        countryOverlayClose.addEventListener("click", () => {
            countryOverlayClose.classList.remove("hovering");
            spans.forEach(span => {
                span.style.transform = "rotate(0deg)"; // final horizontal line
            });
            countryOverlay.classList.remove("visible");
            setTimeout(() => {
                countryOverlay.classList.add("hidden");
            }, 600);
        });
    }

    // Open overlay on footer button click
    if (countrySelectorButton && countryOverlay) {
        countrySelectorButton.addEventListener("click", () => {
            countryOverlay.classList.remove("hidden");
            setTimeout(() => {
                countryOverlay.classList.add("visible");
            }, 20); // allow transition to trigger
        });
    }

    // Extend existing country selection with language and region separation
    countryOptions.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const selectedCountry = e.currentTarget.dataset.country;
            if (selectedCountry) {
                // Update region for services
                applyRegion(selectedCountry);

                // Check if English override is active
                const isEnglishOverride = localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en";
                if (!isEnglishOverride) {
                    const regionLang = REGION_LANGUAGE_MAP[selectedCountry] || "en";
                    applyLanguage(regionLang);
                    localStorage.setItem(LANGUAGE_STORAGE_KEY, regionLang);
                } else {
                    // Language remains as currentLanguage (manual selection)
                    applyLanguage("en");
                }

                // Update footer display
                setCountry(selectedCountry);

                // Translate all overlay elements (ensure local/offline translation)
                if (countryOverlay) {
                    countryOverlay.querySelectorAll("[data-i18n-key]").forEach((el) => {
                        const key = el.dataset.i18nKey;
                        if (window.I18N && window.I18N[key]) {
                            const lang = isEnglishOverride ? "en" : (REGION_LANGUAGE_MAP[selectedCountry] || "en");
                            if (window.I18N[key][lang]) {
                                el.textContent = window.I18N[key][lang];
                            }
                        }
                    });
                }

                // Close overlay after selection
                countryOverlay.classList.remove("visible");
                setTimeout(() => {
                    countryOverlay.classList.add("hidden");
                }, 400);
            }
        });
    });

    // Example language selector (dropdown, overlay, or buttons)
    document.querySelectorAll(".language-option").forEach((langBtn) => {
        langBtn.addEventListener("click", (e) => {
            const lang = e.currentTarget.dataset.lang;
            if (lang) {
                applyLanguage(lang); // override language globally
            }
        });
    });

    /**
     * Language toggle (EN) – additive, non-destructive
     * Language overrides region language when active
     * When toggled off, restores region language.
     */
    const languageToggle = document.getElementById("language-toggle");

    if (languageToggle) {
        const updateLanguageState = () => {
            const isActive = localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en";
            languageToggle.classList.toggle("active", isActive);
        };

        languageToggle.addEventListener("click", () => {
            const isActive = localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en";

            if (isActive) {
                // Deactivate English override, restore region language
                const regionLang = REGION_LANGUAGE_MAP[currentRegion] || "en";
                localStorage.setItem(LANGUAGE_STORAGE_KEY, regionLang);
                applyLanguage(regionLang);
                // Also update overlay translations if open
                if (countryOverlay && countryOverlay.classList.contains("visible")) {
                    countryOverlay.querySelectorAll("[data-i18n-key]").forEach((el) => {
                        const key = el.dataset.i18nKey;
                        if (window.I18N && window.I18N[key] && window.I18N[key][regionLang]) {
                            el.textContent = window.I18N[key][regionLang];
                        }
                    });
                }
            } else {
                // Activate English override
                localStorage.setItem(LANGUAGE_STORAGE_KEY, "en");
                applyLanguage("en");
                // Also update overlay translations if open
                if (countryOverlay && countryOverlay.classList.contains("visible")) {
                    countryOverlay.querySelectorAll("[data-i18n-key]").forEach((el) => {
                        const key = el.dataset.i18nKey;
                        if (window.I18N && window.I18N[key] && window.I18N[key]["en"]) {
                            el.textContent = window.I18N[key]["en"];
                        }
                    });
                }
            }

            updateLanguageState();
        });

        updateLanguageState();
    }

    /**
     * New translation observer logic:
     * Automatically observe the DOM for newly added elements and apply translations
     * to elements with data-i18n-key or text nodes matching I18N keys.
     */
    function autoTranslateNewContent() {
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    // Only process element nodes
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Translate elements with data-i18n-key attribute
                        if (node.hasAttribute && node.hasAttribute("data-i18n-key")) {
                            const key = node.dataset.i18nKey;
                            if (window.I18N && window.I18N[key] && window.I18N[key][currentLanguage]) {
                                node.textContent = window.I18N[key][currentLanguage];
                            }
                        }

                        // Also translate descendants with data-i18n-key
                        node.querySelectorAll && node.querySelectorAll("[data-i18n-key]").forEach(el => {
                            const key = el.dataset.i18nKey;
                            if (window.I18N && window.I18N[key] && window.I18N[key][currentLanguage]) {
                                el.textContent = window.I18N[key][currentLanguage];
                            }
                        });

                        // Translate text nodes without data-i18n-key by scanning known keys in I18N
                        const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
                        let textNode;
                        while (textNode = treeWalker.nextNode()) {
                            const parent = textNode.parentElement;
                            if (parent && !parent.hasAttribute("data-i18n-key")) {
                                const text = textNode.textContent.trim();
                                if (text && window.I18N[text]) {
                                    const translation = window.I18N[text][currentLanguage];
                                    if (translation) {
                                        textNode.textContent = translation;
                                    }
                                }
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize the translation observer
    autoTranslateNewContent();
});