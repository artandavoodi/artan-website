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

    /* Smooth custom cursor movement */
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
    }

    /* Hide custom cursor on hover over all clickable or interactive elements */
    document.addEventListener('mouseover', (e) => {
        const target = e.target;
        const interactive = target.closest('button, a, input, select, textarea, label, [role="button"], [onclick], .enter-button, .logo-container');
        if (customCursor) {
            if (interactive) {
                customCursor.style.opacity = '0';
            } else {
                customCursor.style.opacity = '1';
            }
        }
    });
});