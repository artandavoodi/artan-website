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
    const enterButton = document.getElementById("enter-button");
    const announcementWrapper = announcementEl ? announcementEl.parentElement : null;
    const stageContainer = announcementEl ? announcementEl.closest('.stage-container') : null;
    const announcementSlot = announcementEl ? announcementEl.parentElement : null;
    const enterContainer = document.getElementById("enter-container");
    if (announcementEl) {
        const primaryKey = announcementEl.dataset.i18nKey;

        let currentLang = 'en';
        let primaryText = '';
        const resolvePrimaryText = (lang = 'en') => {
            if (
                announcementEl.dataset.i18nKey &&
                window.I18N &&
                window.I18N[announcementEl.dataset.i18nKey] &&
                window.I18N[announcementEl.dataset.i18nKey][lang]
            ) {
                return window.I18N[announcementEl.dataset.i18nKey][lang];
            }
            return announcementEl.dataset.primary || '';
        };

        primaryText = resolvePrimaryText('en');
        let currentPrimaryText = primaryText;

        announcementEl.dataset.animated = "true";
        announcementEl.textContent = "";
        announcementEl.style.opacity = "1";
        announcementEl.style.visibility = "visible";
        announcementEl.style.pointerEvents = "auto";
        announcementEl.style.fontWeight = "600";
        announcementEl.style.fontSize = "1.8rem";
        announcementEl.style.display = "inline-block";

        // Lock layout height BEFORE animation starts (prevents jumping)
        if (announcementWrapper) {
            const h = announcementWrapper.offsetHeight;
            announcementWrapper.style.minHeight = h + "px";
        }

        if (enterButton) {
            enterButton.style.opacity = "0";
            enterButton.style.pointerEvents = "none";
            enterButton.style.display = "inline-flex";
            enterButton.style.visibility = "hidden";
        }

        let index = 0;
        let deleting = false;

        // Expose safe language update hook for announcement (no DOM mutation)
        window.__UPDATE_ANNOUNCEMENT_LANGUAGE__ = function (lang) {
            currentLang = lang || 'en';
            primaryText = resolvePrimaryText(currentLang);

            index = 0;
            deleting = false;
            announcementEl.textContent = '';
            announcementEl.style.opacity = '1';
            announcementEl.style.visibility = 'visible';

            if (enterButton) {
                const translated =
                    window.I18N &&
                    enterButton.dataset.i18nKey &&
                    window.I18N[enterButton.dataset.i18nKey] &&
                    window.I18N[enterButton.dataset.i18nKey][currentLang];

                if (translated) enterButton.textContent = translated;
            }
        };

        function typeLoop() {
            // Use latest translated primary text if available

            if (!deleting) {
                announcementEl.textContent = primaryText.substring(0, index + 1);
                index++;
                if (index <= primaryText.length) {
                    setTimeout(typeLoop, 100);
                } else {
                    setTimeout(() => {
                        deleting = true;
                        typeLoop();
                    }, 4000);
                }
            } else {
                announcementEl.textContent = primaryText.substring(0, index - 1);
                index--;
                if (index > 0) {
                    setTimeout(typeLoop, 50);
                } else {
                    if (announcementWrapper) {
                        const h = announcementWrapper.offsetHeight;
                        announcementWrapper.style.minHeight = h + "px";
                        announcementWrapper.dataset.lockedHeight = "true";
                        announcementWrapper.dataset.lockedHeightValue = h;
                    }
                    revealEnterButton();
                }
            }
        }

        function revealEnterButton() {
            if (!enterButton) return;

            document.dispatchEvent(new CustomEvent("announcementFinished"));

            if (stageContainer) {
                stageContainer.classList.add("stage-enter-visible");
            }

            if (announcementWrapper) {
                announcementWrapper.classList.add("announcement-replaced");
            }

            announcementEl.style.opacity = "0";
            announcementEl.style.pointerEvents = "none";
            announcementEl.style.visibility = "hidden";
            announcementEl.textContent = "";

            if (enterButton.dataset.i18nKey && window.I18N && window.I18N[enterButton.dataset.i18nKey]) {
                const lang = currentLang || 'en';
                const translated = window.I18N[enterButton.dataset.i18nKey][lang];
                if (translated) enterButton.textContent = translated;
            }

            enterButton.style.margin = "0";
            enterButton.style.opacity = "0";
            enterButton.style.transform = "scale(0.75)";
            enterButton.style.pointerEvents = "auto";
            enterButton.style.display = "inline-flex";
            enterButton.style.visibility = "visible";
            enterButton.style.alignSelf = "center";

            if (announcementSlot) {
                announcementSlot.style.minHeight = announcementSlot.offsetHeight + "px";
            }

            requestAnimationFrame(() => {
                enterButton.style.transition =
                    "opacity 0.9s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
                enterButton.style.opacity = "1";
                enterButton.style.transform = "scale(1)";
            });
            enterButton.style.opacity = '1';
            enterButton.style.visibility = 'visible';
            enterButton.style.pointerEvents = 'auto';
        }

        typeLoop();

        const storedCountry = localStorage.getItem("artan_country");
        if (storedCountry && window.I18N_LANG_MAP && window.I18N_LANG_MAP[storedCountry]) {
            window.__UPDATE_ANNOUNCEMENT_LANGUAGE__(window.I18N_LANG_MAP[storedCountry]);
        }
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
    const REGION_STORAGE_KEY = "artan_region";

    // Unified function to set both country label and storage
    const setCountry = (countryName) => {
        if (!countryName || !countryLabel) return;
        countryLabel.textContent = countryName;
        localStorage.setItem(COUNTRY_STORAGE_KEY, countryName);
        localStorage.setItem(REGION_STORAGE_KEY, countryName);
        if (window.__UPDATE_ANNOUNCEMENT_LANGUAGE__) {
            const lang = window.I18N_LANG_MAP && window.I18N_LANG_MAP[countryName] ? window.I18N_LANG_MAP[countryName] : 'en';
            window.__UPDATE_ANNOUNCEMENT_LANGUAGE__(lang);
        }
    };

    // Detect hard refresh using sessionStorage
    const sessionKey = "artan_session_active";
    const isHardRefresh = !sessionStorage.getItem(sessionKey);
    sessionStorage.setItem(sessionKey, "true");

    // Clear stored selections on hard refresh to fully reset
    if (isHardRefresh) {
        localStorage.removeItem(REGION_STORAGE_KEY);
        localStorage.removeItem(COUNTRY_STORAGE_KEY);
    }

    // Retrieve stored selections
    const storedRegion = localStorage.getItem(REGION_STORAGE_KEY);

    if (storedRegion) {
        // Normal refresh → respect stored region
        setCountry(storedRegion);
    } else {
        // First visit or hard refresh → detect by IP
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (data && data.country_name) {
                    setCountry(data.country_name);
                }
            })
            .catch(() => {});
    }

function initMenu({ onOpen, onClose } = {}) {
    const menuButton = document.getElementById('menu-button');
    const menuOverlay = document.getElementById('menu-overlay');
    const menuItems = menuOverlay.querySelectorAll('.menu-list li');

    if (!menuButton || !menuOverlay) return;

    let isOpen = false;
    let isAnimating = false;
    const CLOSE_ANIMATION_DURATION = 420; // ms — matches CSS exit rhythm

    function openMenu() {
        if (isAnimating) return;
        isAnimating = true;

        menuButton.classList.add('menu-open');
        menuOverlay.classList.add('active');
        menuOverlay.classList.remove('closing');
        menuItems.forEach((item) => {
            item.style.transitionDelay = '';
        });
        document.body.classList.add('menu-active');

        isOpen = true;
        if (typeof onOpen === 'function') onOpen();

        requestAnimationFrame(() => {
            isAnimating = false;
        });
    }

    function closeMenu() {
        if (isAnimating) return;
        isAnimating = true;

        isOpen = false;

        // Trigger graceful exit animation
        menuOverlay.classList.add('closing');

        const items = Array.from(menuItems).reverse();
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.06}s`;
        });

        document.body.classList.remove('menu-active');

        if (typeof onClose === 'function') onClose();

        // Allow exit animation to fully play before hiding overlay
        setTimeout(() => {
            menuOverlay.classList.remove('active');
            menuOverlay.classList.remove('closing');
            menuButton.classList.remove('menu-open');

            menuItems.forEach((item) => {
                item.style.transitionDelay = '';
            });

            isAnimating = false;
        }, CLOSE_ANIMATION_DURATION);
    }

    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen ? closeMenu() : openMenu();
    });

    // Optional: close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
        }
    });
}

/* expose safely to classic scripts */
window.initMenu = initMenu;

    // Initialize menu with cursor-safe orchestration
    if (typeof window.initMenu === 'function') {
        window.initMenu({
            onOpen: () => {
                const customCursor = document.querySelector('.custom-cursor');
                if (customCursor) customCursor.style.opacity = '0';
            },
            onClose: () => {
                const customCursor = document.querySelector('.custom-cursor');
                if (customCursor) customCursor.style.opacity = '1';
            }
        });
    }

document.addEventListener('countryOverlayOpen', () => {
    const header = document.getElementById('header-controls');
    if (header) header.style.display = 'none';
});

document.addEventListener('countryOverlayClose', () => {
    const header = document.getElementById('header-controls');
    if (header) header.style.display = '';
});
});

document.addEventListener("DOMContentLoaded", () => {
    const streamOverlay = document.getElementById("stream-overlay");
    const closeStreamBtn = document.getElementById("close-stream");
    const streamButtons = document.querySelectorAll(".stream-btn");

    if (!streamOverlay || !closeStreamBtn || streamButtons.length === 0) return;

    let isAnimating = false;

    function openStream() {
        if (isAnimating) return;
        isAnimating = true;
        streamOverlay.classList.add("visible");
        document.body.classList.add("overlay-active"); // mimic menu behavior
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => { isAnimating = false; });
    }

    function closeStream() {
        if (isAnimating) return;
        isAnimating = true;
        streamOverlay.classList.remove("visible");
        document.body.classList.remove("overlay-active");
        document.body.style.overflow = "";
        requestAnimationFrame(() => { isAnimating = false; });
    }

    streamButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            openStream();
        });
    });

    closeStreamBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeStream();
    });

    // Optional: close overlay with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && streamOverlay.classList.contains("visible")) {
            closeStream();
        }
    });
});
