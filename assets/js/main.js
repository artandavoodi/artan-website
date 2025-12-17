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

    // (Overlay close button logic is above; see new block.)

    // Handle country selection
    countryOptions.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const selectedCountry = e.currentTarget.dataset.country;
            if (selectedCountry) {
                setCountry(selectedCountry); // update footer and localStorage
                // Optional: close overlay after selection
                countryOverlay.classList.remove("visible");
                setTimeout(() => {
                    countryOverlay.classList.add("hidden");
                }, 400);
            }
        });
    });
});