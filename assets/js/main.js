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
                    // Show secondary text with scale animation
                    announcementEl.style.fontWeight = "400";
                    announcementEl.style.fontSize = "1.5rem";
                    announcementEl.style.opacity = "0";
                    announcementEl.textContent = secondaryText;

                    announcementEl.style.display = "inline-block";

                    function animateSecondary() {
                        // initial scale
                        let scale = 0.05;
                        
                        function step() {
                            // variable speed: slower for first half, faster for second half
                            let speed = scale < 0.5 ? 0.005 : 0.008; 
                            scale += speed;
                            if (scale <= 1) {
                                announcementEl.style.transform = `scale(${scale})`;
                                announcementEl.style.opacity = scale;
                                requestAnimationFrame(step);
                            } else {
                                announcementEl.style.transform = `scale(1)`;
                                announcementEl.style.opacity = 1;
                            }
                        }
                        
                        step();
                    }
                    animateSecondary();
                }
            }
        }

        typeLoop();
    }
});