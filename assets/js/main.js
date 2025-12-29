document.addEventListener("DOMContentLoaded", () => {
  /* =================== Theme Management =================== */

  const body = document.body;
  const toggle = document.getElementById("theme-toggle");
  const footer = document.querySelector("footer");

  const darkBg = "#000000";
  const darkText = "#ffffff";
  const lightBg = "#ffffff";
  const lightText = "#000000";

  const savedTheme = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

  function applyTheme(theme) {
    currentTheme = theme;

    if (theme === "dark") {
      body.style.backgroundColor = darkBg;
      body.style.color = darkText;
      if (toggle) toggle.style.backgroundColor = darkText;
      if (footer) footer.style.color = darkText;
    } else {
      body.style.backgroundColor = lightBg;
      body.style.color = lightText;
      if (toggle) toggle.style.backgroundColor = lightText;
      if (footer) footer.style.color = lightText;
    }

    localStorage.setItem("theme", theme);
  }

  applyTheme(currentTheme);

  if (toggle) {
    toggle.addEventListener("click", () => {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  /* =================== Custom Cursor =================== */

  const customCursor = document.querySelector(".custom-cursor");

  if (customCursor) {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const speed = 0.15;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      customCursor.style.left = cursorX + "px";
      customCursor.style.top = cursorY + "px";
      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    document.addEventListener("mouseover", (e) => {
      const target = e.target;
      const interactive =
        target &&
        target.closest(
          "button, a, input, select, textarea, [role='button'], .enter-button, .logo-container, .country-option, #country-overlay-close"
        );
      customCursor.style.opacity = interactive ? "0" : "1";
    });
  }

  /* =================== Menu Overlay =================== */

  function initMenu() {
    const menuButton = document.getElementById("menu-button");
    const menuOverlay = document.getElementById("menu-overlay");

    if (!menuButton || !menuOverlay) return;

    let isOpen = false;
    let isAnimating = false;
    const CLOSE_DURATION = 420;

    function openMenu() {
      if (isAnimating) return;
      isAnimating = true;

      menuButton.classList.add("menu-open");
      menuOverlay.classList.add("active");
      document.body.classList.add("menu-active");

      isOpen = true;
      requestAnimationFrame(() => {
        isAnimating = false;
      });
    }

    function closeMenu() {
      if (isAnimating) return;
      isAnimating = true;

      isOpen = false;
      menuOverlay.classList.add("closing");
      document.body.classList.remove("menu-active");

      setTimeout(() => {
        menuOverlay.classList.remove("active", "closing");
        menuButton.classList.remove("menu-open");
        isAnimating = false;
      }, CLOSE_DURATION);
    }

    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) closeMenu();
    });
  }

  window.initMenu = initMenu;
  initMenu();

  /* =================== Country Overlay Events =================== */

  document.addEventListener("countryOverlayOpen", () => {
    const header = document.getElementById("header-controls");
    if (header) header.style.display = "none";
  });

  document.addEventListener("countryOverlayClose", () => {
    const header = document.getElementById("header-controls");
    if (header) header.style.display = "";
  });

  /* =================== Locale Trigger Safety =================== */

  const localeTriggers = document.querySelectorAll("[data-locale-trigger]");
  localeTriggers.forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
  });
});
