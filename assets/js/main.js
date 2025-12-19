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
        const primaryKey = announcementEl.dataset.primaryKey;
        const secondaryKey = announcementEl.dataset.secondaryKey;

        let primaryText = primaryKey && window.I18N ? window.I18N[primaryKey][currentLanguage] : announcementEl.dataset.primary;
        let secondaryText = secondaryKey && window.I18N ? window.I18N[secondaryKey][currentLanguage] : announcementEl.dataset.secondary;

        announcementEl.dataset.animated = "true";
        announcementEl.textContent = "";
        announcementEl.style.fontWeight = "600";
        announcementEl.style.fontSize = "1.8rem";
        announcementEl.style.display = "inline-block";

        let index = 0;
        let deleting = false;
        let currentPrimaryText = primaryText;
        let currentSecondaryText = secondaryText;
        let btn; // secondary button reference

        function typeLoop() {
            // Use latest translated primary text if available
            if (primaryKey && window.I18N && window.I18N[primaryKey] && window.I18N[primaryKey][currentLanguage]) {
                currentPrimaryText = window.I18N[primaryKey][currentLanguage];
            }

            if (!deleting) {
                announcementEl.textContent = currentPrimaryText.substring(0, index + 1);
                index++;
                if (index <= currentPrimaryText.length) {
                    setTimeout(typeLoop, 100);
                } else {
                    setTimeout(() => {
                        deleting = true;
                        typeLoop();
                    }, 4000);
                }
            } else {
                announcementEl.textContent = currentPrimaryText.substring(0, index - 1);
                index--;
                if (index > 0) {
                    setTimeout(typeLoop, 50);
                } else {
                    showSecondaryButton();
                }
            }
        }

        function showSecondaryButton() {
            // Update secondary text with latest translation without touching DOM
            if (secondaryKey && window.I18N && window.I18N[secondaryKey] && window.I18N[secondaryKey][currentLanguage]) {
                currentSecondaryText = window.I18N[secondaryKey][currentLanguage];
            }

            announcementEl.textContent = "";
            if (!btn) {
                btn = document.createElement("button");
                btn.className = "enter-button";
                announcementEl.appendChild(btn);
            }
            btn.innerHTML = `<span>${currentSecondaryText}</span>`;
            btn.style.opacity = 0;
            let scale = 0.3;
            btn.style.transform = `scale(${scale})`;

            function step() {
                const speed = scale < 0.5 ? 0.01 : 0.015;
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

    let ipDetectedCountry = null;

    // Check if user previously selected a country
    const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (storedCountry) {
        setCountry(storedCountry);
    } else {
        // Fetch IP-based location
        fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => {
                if (data && data.country_name) {
                    ipDetectedCountry = data.country_name;
                    setCountry(ipDetectedCountry);
                    localStorage.setItem("artan_region", ipDetectedCountry);
                }
            })
            .catch(() => {
                /* silent fail — fallback remains unchanged */
            });
    }
});