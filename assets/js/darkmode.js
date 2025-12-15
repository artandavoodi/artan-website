document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const toggle = document.getElementById("theme-toggle");

    const applyTheme = (theme) => {
        body.classList.remove("dark-mode", "light-mode");
        body.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
        localStorage.setItem("theme", theme);

        if (toggle) {
            toggle.setAttribute("aria-pressed", theme === "dark");
        }
    };

    // Initial theme resolution
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
        applyTheme(storedTheme);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }

    // Toggle interaction
    if (toggle) {
        toggle.addEventListener("click", () => {
            const isDark = body.classList.contains("dark-mode");
            applyTheme(isDark ? "light" : "dark");
        });
    }

    // React to system changes only if user hasn't chosen explicitly
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
            applyTheme(e.matches ? "dark" : "light");
        }
    });
});