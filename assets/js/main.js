/* =================== Global Layout Injection (Future-Proof Chrome) =================== */

async function injectGlobalLayout() {
  const targets = document.querySelectorAll('[data-include]');
  for (const el of targets) {
    const name = el.getAttribute('data-include');
    try {
      const res = await fetch(`/partials/${name}.html`, { cache: 'no-store' });
      if (!res.ok) continue;
      const html = await res.text();
      el.innerHTML = html;
    } catch (_) {}
  }
}


injectGlobalLayout();

/* =================== Footer Fragment Injection =================== */
const FOOTER_FRAGMENT_URL = '/assets/fragments/footer.html';

async function injectFooterIfNeeded() {
  const existing = document.querySelector('footer.site-footer');
  if (existing) return true;

  const mount = document.getElementById('footer-mount');
  if (!mount) return false;

  if (mount.dataset.footerInjected === 'true') return true;
  mount.dataset.footerInjected = 'true';

  try {
    const res = await fetch(FOOTER_FRAGMENT_URL, { cache: 'no-cache' });
    if (!res.ok) return false;
    const html = await res.text();
    mount.innerHTML = html;
    // Notify locale systems that footer controls now exist
    document.dispatchEvent(new Event('footer-mounted'));
    return true;
  } catch (_) {
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  injectFooterIfNeeded();

  /* =================== Custom Cursor (RTL-safe + re-init on language/dir change) =================== */

  let cursorRAF = null;

  function ensureCursorNode() {
    let node = document.querySelector(".custom-cursor");
    if (!node) {
      node = document.createElement("div");
      node.className = "custom-cursor";
      document.body.appendChild(node);
    }
    return node;
  }

  function stopCursorLoop() {
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    cursorRAF = null;
  }

  function initCustomCursor() {
    stopCursorLoop();

    const customCursor = ensureCursorNode();
    if (!customCursor) return;

    customCursor.style.display = "";
    customCursor.style.opacity = "1";
    customCursor.style.transform = "translate(-50%, -50%) scale(1)";

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const speed = 0.15;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Hard-restore in case RTL/dir switches leave it invisible
      if (customCursor.style.display === "none") customCursor.style.display = "";
      if (customCursor.style.opacity === "0") customCursor.style.opacity = "1";
    };

    document.addEventListener("mousemove", onMove, { passive: true });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;
      customCursor.style.left = cursorX + "px";
      customCursor.style.top = cursorY + "px";
      cursorRAF = requestAnimationFrame(animateCursor);
    };

    animateCursor();

    // Pointer-based interaction feedback (RTL-safe)
    document.addEventListener(
      "pointerover",
      (e) => {
        const target = e.target;
        const interactive =
          target &&
          target.closest(
            "button, a, input, select, textarea, [role='button'], .enter-button, .logo-container, .country-option, #country-overlay-close, #country-selector, #language-toggle, #language-dropdown"
          );

        if (interactive) {
          customCursor.style.transform = "translate(-50%, -50%) scale(0.4)";
          customCursor.style.opacity = "0.35";
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerout",
      () => {
        customCursor.style.transform = "translate(-50%, -50%) scale(1)";
        customCursor.style.opacity = "1";
      },
      { passive: true }
    );
  }

  initCustomCursor();

  // Re-init cursor when language / direction changes (RTL flips)
  const reinitCursor = () => {
    // next paint: let other scripts finish updating DOM/dir
    requestAnimationFrame(() => initCustomCursor());
  };

  // Custom events (if your locale system dispatches any)
  window.addEventListener("languagechange", reinitCursor);
  window.addEventListener("artan:languageChanged", reinitCursor);
  window.addEventListener("artan:dirChanged", reinitCursor);

  // Mutation observer: catches dir/lang/class flips on html/body
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (
        m.type === "attributes" &&
        (m.attributeName === "dir" ||
          m.attributeName === "lang" ||
          m.attributeName === "class")
      ) {
        reinitCursor();
        break;
      }
    }
  });

  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir", "lang", "class"],
  });
  mo.observe(document.body, {
    attributes: true,
    attributeFilter: ["dir", "lang", "class"],
  });

  /* =================== Text Hover — Letter Drift (Luxury) =================== */

  function initLetterHover(root = document) {
    const hoverTimers = new WeakMap();

    const clearHoverTimer = (el) => {
      const t = hoverTimers.get(el);
      if (t) {
        clearTimeout(t);
        hoverTimers.delete(el);
      }
    };

    // Include all clickable text surfaces (static + overlays)
    const selectors = [
      "a",
      "button",
      "[role='button']",
      ".country-option",
      "#country-selector",
      "#language-toggle",
      "#language-dropdown button",
      ".language-dropdown button",
      ".language-dropdown a",
      ".language-option",
      ".lang-option",
      "[data-i18n][tabindex]",
      ".menu-list a",
      ".menu-list button"
    ];

    const RTL_SCRIPT_RE = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/; // Hebrew + Arabic ranges

    const isRTLContext = (el) => {
      if (!el) return false;
      if (el.closest("[dir='rtl']")) return true;
      const htmlDir = document.documentElement.getAttribute("dir");
      const bodyDir = document.body.getAttribute("dir");
      return htmlDir === "rtl" || bodyDir === "rtl";
    };

    const segmentGraphemes = (text) => {
      try {
        if ("Intl" in window && "Segmenter" in Intl) {
          const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
          return Array.from(seg.segment(text), (s) => s.segment);
        }
      } catch (_) {}
      return Array.from(text);
    };

    const shouldSkipLetterify = (el, text) => {
      // Don’t break RTL languages or RTL context
      const cs = window.getComputedStyle(el);
      if (cs.transform && cs.transform !== "none") return true;
      if (isRTLContext(el)) return true;
      if (RTL_SCRIPT_RE.test(text)) return true;

      // Don’t break vertical writing-mode by default.
      // Exception: allow vertical labels inside the menu overlay to use the same global hover.
      const wm = (cs.writingMode || cs["writing-mode"] || "").toLowerCase();
      if (wm && wm !== "horizontal-tb") {
        if (el.closest("#menu-overlay")) return false;
        return true;
      }

      return false;
    };

    const elements = root.querySelectorAll(selectors.join(","));

    elements.forEach((el) => {
      if (!el || el.dataset.letterified) return;

      // Skip structured controls (icons/SVG)
      if (el.children && el.children.length > 0) return;
      if (el.dataset.noLetterHover === "true") return;

      const raw = el.textContent || "";
      const text = raw.trim();
      if (!text) return;

      el.dataset.letterified = "true";

      // SAFE MODE: keep element layout/transform exactly as CSS defines (prevents menu mirroring)
      // We only animate inner spans when letterified.

      // For RTL / vertical / non-letterify cases: keep text intact, only micro-opacity
      if (shouldSkipLetterify(el, text)) {
        el.style.transition = "opacity 0.35s ease";

        el.addEventListener(
          "mouseenter",
          () => {
            clearHoverTimer(el);
            el.style.opacity = "0.98";
          },
          { passive: true }
        );

        el.addEventListener(
          "mouseleave",
          () => {
            clearHoverTimer(el);
            el.style.opacity = "1";
          },
          { passive: true }
        );

        return;
      }

      // Letter drift (LTR / Latin-like)
      const originalText = raw;
      el.textContent = "";

      // Keep element display natural (do NOT force inline-flex; avoids layout shifts)
      // Only spans are animated.
      const graphemes = segmentGraphemes(originalText);

      graphemes.forEach((char, i) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        span.style.transition =
          "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease";
        span.style.willChange = "transform";
        span.style.transitionDelay = `${i * 18}ms`;
        el.appendChild(span);
      });

      el.addEventListener(
        "mouseenter",
        () => {
          clearHoverTimer(el);

          const spans = el.querySelectorAll("span");
          const cs = window.getComputedStyle(el);
          const wm = (cs.writingMode || cs["writing-mode"] || "").toLowerCase();
          const isVertical = wm && wm !== "horizontal-tb";
          const drift = isVertical ? "translateX(-0.35em)" : "translateY(-0.35em)";

          spans.forEach((s) => {
            s.style.transform = drift;
            s.style.opacity = "0.95";
          });

          // Quick impulse: return while hover remains
          const t = setTimeout(() => {
            spans.forEach((s) => (s.style.transform = "translateX(0)"));
            spans.forEach((s) => (s.style.transform = "translateY(0)"));
            hoverTimers.delete(el);
          }, 140);

          hoverTimers.set(el, t);
        },
        { passive: true }
      );

      el.addEventListener(
        "mouseleave",
        () => {
          clearHoverTimer(el);
          el.querySelectorAll("span").forEach((s) => {
            s.style.transform = "translateX(0)";
            s.style.transform = "translateY(0)";
            s.style.opacity = "1";
          });
        },
        { passive: true }
      );
    });
  }

  // Init once for the page
  initLetterHover(document);

  // Re-init for dynamically injected overlay items (country/language/menu)
  const hoverMO = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList" && (m.addedNodes?.length || 0) > 0) {
        m.addedNodes.forEach((n) => {
          if (n && n.nodeType === 1) initLetterHover(n);
        });
      }
    }
  });

  hoverMO.observe(document.body, { childList: true, subtree: true });

});