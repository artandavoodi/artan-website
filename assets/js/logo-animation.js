/**
 * Logo Intro Animation — PinkFloyd-style (CENTER POP → REVEAL)
 *
 * Behavior:
 * 1) New tab/session: show ONLY a centered logo overlay (no header/footer, no announcement/enter/essence).
 * 2) Logo does a visible pop (scale up/down) while staying centered.
 * 3) Logo overlay fades out.
 * 4) Stage UI appears in its normal layout (logo in place + announcement + enter + essence).
 * 5) On ENTER: hide announcement + enter, reveal header/footer. Logo remains.
 *
 * Session rules:
 * - Normal refresh keeps current state.
 * - Closing the tab/new session re-runs the intro.
 */

(() => {
  // ===== Timing (visible, no travel) =====
  // Total intro ≈ POP_IN + HOLD + FADE (POP_OUT overlaps) → ~5s
  const POP_IN_MS = 1400;   // noticeable scale-up
  const POP_OUT_MS = 900;   // settle
  const HOLD_MS = 2400;     // linger in center
  const FADE_MS = 1200;     // slow fade + scale-down exit

  const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
  const EASE_INOUT = "cubic-bezier(0.4, 0, 0.2, 1)";

  // Run once per session (normal refresh keeps it done)
  const INTRO_DONE_KEY = "artan_logo_intro_done_v4";
  const ENTERED_KEY = "artan_site_entered_v1";

  const qs = (sel) => document.querySelector(sel);

  const prefersReducedMotion = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const once = (fn) => {
    let done = false;
    return (...args) => {
      if (done) return;
      done = true;
      fn(...args);
    };
  };

  const setA11yHidden = (el, hidden) => {
    if (!el) return;
    if (hidden) el.setAttribute("aria-hidden", "true");
    else el.removeAttribute("aria-hidden");
  };

  const setInline = (el, styles) => {
    if (!el) return;
    Object.keys(styles).forEach((k) => {
      el.style[k] = styles[k];
    });
  };

  const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(async () => {
    const body = document.body;
    if (!body || body.hasAttribute("data-disable-logo-intro")) return;

    const logoEl = qs(".site-logo");
    if (!logoEl) return;

    // ===== Session gate =====
    const introDone = sessionStorage.getItem(INTRO_DONE_KEY) === "1";
    const entered = sessionStorage.getItem(ENTERED_KEY) === "1";

    // ===== Core stage elements =====
    const stage = qs("#stage") || qs(".stage-container");
    const stageCircle = qs(".stage-circle");
    const announcement = qs("#announcement");
    const enterButton = qs("#enter-button");
    const essence = qs(".site-essence");

    // ===== Global chrome =====
    const headerControls = qs("#header-controls");
    const footerSeparator = qs(".footer-separator");
    const footer = qs(".site-footer");
    const menuOverlay = qs("#menu-overlay");
    const customCursor = qs(".custom-cursor");

    // ===== Stage video mask (keeps video invisible during intro, then reveals softly) =====
    // IMPORTANT: Must be full-viewport, not constrained by the stage container.
    // We mount it on <body> as a fixed layer so it never becomes a small “box”.
    const getOrCreateStageVideoMask = () => {
      const existing =
        qs("#stage-video-mask") ||
        qs(".stage-video-mask") ||
        qs("[data-stage-video-mask]");

      if (existing) return existing;

      const mask = document.createElement("div");
      mask.id = "stage-video-mask";
      mask.setAttribute("data-stage-video-mask", "true");
      mask.setAttribute("aria-hidden", "true");

      // Mount on <body> so it always covers the full viewport.
      document.body.appendChild(mask);

      // Full-screen, behind stage content, above the video.
      setInline(mask, {
        position: "fixed",
        inset: "0",
        pointerEvents: "none",
        zIndex: "1",
        opacity: "1",
        background: "rgba(0,0,0,1)",
        transition: `opacity 1400ms ${EASE_OUT}, background-color 600ms ${EASE_OUT}`,
      });

      // Ensure stage content sits above the mask (future-proof, minimal impact).
      if (stage) {
        const cs = window.getComputedStyle(stage);
        if (cs.position === "static") stage.style.position = "relative";
        if (!stage.style.zIndex) stage.style.zIndex = "2";
      }

      return mask;
    };

    const setStageVideoMask = ({ opacity, hard } = {}) => {
      const mask = getOrCreateStageVideoMask();
      const isLight = body.classList.contains("light-mode");

      const targetBg = isLight ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)";

      if (hard) {
        mask.style.transition = "none";
        mask.style.background = targetBg;
        mask.style.opacity = String(opacity);
        // restore transition next tick
        requestAnimationFrame(() => {
          mask.style.transition = `opacity 1400ms ${EASE_OUT}, background-color 600ms ${EASE_OUT}`;
        });
        return;
      }

      mask.style.background = targetBg;
      if (typeof opacity === "number") mask.style.opacity = String(opacity);
    };

    // Persist original essence placement so we can restore on ENTER.
    const essenceOriginal = essence
      ? { parent: essence.parentElement, next: essence.nextElementSibling }
      : null;

    const mountEssenceIntoStage = () => {
      if (!essence || !stage) return;
      if (stage.contains(essence)) return;
      stage.appendChild(essence);
    };

    const restoreEssenceToOriginal = () => {
      if (!essence || !essenceOriginal?.parent) return;
      const { parent, next } = essenceOriginal;
      if (next && next.parentElement === parent) parent.insertBefore(essence, next);
      else parent.appendChild(essence);
    };

    // During intro: hide chrome and any overlays.
    const hideChrome = () => {
      setA11yHidden(headerControls, true);
      setA11yHidden(footerSeparator, true);
      setA11yHidden(footer, true);
      setA11yHidden(menuOverlay, true);
      setA11yHidden(customCursor, true);

      setInline(headerControls, { opacity: "0", pointerEvents: "none" });
      setInline(footerSeparator, { opacity: "0", pointerEvents: "none" });
      setInline(footer, { opacity: "0", pointerEvents: "none" });
      setInline(menuOverlay, { opacity: "0", pointerEvents: "none" });
      setInline(customCursor, { opacity: "0", pointerEvents: "none" });
    };

    const showChrome = () => {
      setA11yHidden(headerControls, false);
      setA11yHidden(footerSeparator, false);
      setA11yHidden(footer, false);
      setA11yHidden(menuOverlay, false);
      setA11yHidden(customCursor, false);

      [headerControls, footerSeparator, footer, customCursor].forEach((el) => {
        if (!el) return;
        el.style.transition = `opacity 600ms ${EASE_OUT}`;
        el.style.opacity = "1";
        el.style.pointerEvents = "";
      });

      if (menuOverlay) {
        menuOverlay.style.opacity = "";
        menuOverlay.style.pointerEvents = "";
      }
    };

    // During intro: hide stage content (and the in-layout logo) so ONLY overlay shows.
    const hideStageContent = () => {
      if (stageCircle) {
        stageCircle.setAttribute("aria-hidden", "true");
        stageCircle.style.pointerEvents = "none";
      }

      // Hide the in-layout logo during intro overlay.
      setA11yHidden(logoEl, true);
      setInline(logoEl, { opacity: "0", pointerEvents: "none" });

      [announcement, enterButton, essence].forEach((el) => {
        if (!el) return;
        setA11yHidden(el, true);
        setInline(el, {
          opacity: "0",
          transform: "translateY(10px)",
          pointerEvents: "none",
        });
      });

      if (enterButton) enterButton.tabIndex = -1;
    };

    const revealStageContent = () => {
      mountEssenceIntoStage();

      // Reveal the in-layout logo.
      setA11yHidden(logoEl, false);
      logoEl.style.transition = `opacity 700ms ${EASE_OUT}`;
      logoEl.style.opacity = "1";
      logoEl.style.pointerEvents = "";

      [announcement, enterButton, essence].forEach((el) => {
        if (!el) return;
        setA11yHidden(el, false);
        el.style.transition = [
          `opacity 800ms ${EASE_OUT}`,
          `transform 900ms ${EASE_OUT}`,
        ].join(", ");
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        el.style.pointerEvents = "";
      });

      if (enterButton) enterButton.tabIndex = 0;

      if (stageCircle) {
        stageCircle.removeAttribute("aria-hidden");
        stageCircle.style.pointerEvents = "";
      }
    };

    const hideIntroOnlyUI = () => {
      [announcement, enterButton].forEach((el) => {
        if (!el) return;
        setA11yHidden(el, true);
        setInline(el, { opacity: "0", transform: "translateY(6px)", pointerEvents: "none" });
      });
      if (enterButton) enterButton.tabIndex = -1;
    };

    const enterSite = once(() => {
      sessionStorage.setItem(ENTERED_KEY, "1");
      body.classList.remove("intro-loading", "intro-reveal");
      body.classList.add("site-entered");

      // Hide intro-only elements.
      [announcement, enterButton].forEach((el) => {
        if (!el) return;
        el.style.transition = `opacity 450ms ${EASE_OUT}, transform 600ms ${EASE_OUT}`;
        el.style.opacity = "0";
        el.style.transform = "translateY(6px)";
        el.style.pointerEvents = "none";
        setA11yHidden(el, true);
      });
      if (enterButton) enterButton.tabIndex = -1;

      // Essence returns to footer flow on enter.
      restoreEssenceToOriginal();

      // Show global chrome.
      showChrome();

      const mask = qs("#stage-video-mask");
      if (mask) {
        mask.style.transition = `opacity 700ms ${EASE_OUT}`;
        mask.style.opacity = "0";
        window.setTimeout(() => {
          if (mask && mask.parentNode) mask.parentNode.removeChild(mask);
        }, 760);
      }
    });

    if (enterButton) {
      enterButton.addEventListener("click", (e) => {
        e.preventDefault();
        enterSite();
      });
    }

    // ===== Restore state on refresh (before any animation) =====
    if (entered) {
      body.classList.remove("intro-loading", "intro-reveal");
      body.classList.add("site-entered");

      // Ensure intro-only UI is hidden
      hideIntroOnlyUI();

      // Ensure logo is visible
      setA11yHidden(logoEl, false);
      setInline(logoEl, { opacity: "1", pointerEvents: "" });

      // Put essence back to its original home and show chrome
      restoreEssenceToOriginal();
      showChrome();

      // Ensure stage remains interactive
      if (stageCircle) {
        stageCircle.removeAttribute("aria-hidden");
        stageCircle.style.pointerEvents = "";
      }

      setStageVideoMask({ opacity: 1, hard: true });
      const __mask = qs("#stage-video-mask");
      if (__mask) __mask.style.display = "none";

      return;
    }

    if (introDone) {
      // Stage revealed, but user hasn't entered yet (keep chrome hidden)
      body.classList.remove("intro-loading", "site-entered");
      body.classList.add("intro-reveal");
      hideChrome();
      hideStageContent();
      setStageVideoMask({ opacity: 0.5, hard: true });
      revealStageContent();
      return;
    }

    // Reduced motion: skip overlay pop; reveal stage content only.
    if (prefersReducedMotion()) {
      sessionStorage.setItem(INTRO_DONE_KEY, "1");
      hideChrome();
      hideStageContent();
      setStageVideoMask({ opacity: 0.5, hard: true });
      body.classList.add("intro-reveal");
      revealStageContent();
      return;
    }

    // Ensure logo is decoded before building overlay.
    try {
      if (logoEl.tagName === "IMG") {
        if (!logoEl.complete) {
          await new Promise((resolve) =>
            logoEl.addEventListener("load", resolve, { once: true })
          );
        }
        if (typeof logoEl.decode === "function") {
          await logoEl.decode().catch(() => {});
        }
      }
    } catch (_) {
      // fail open
    }

    await new Promise((r) => requestAnimationFrame(r));

    // Mark intro as done for this session once we begin.
    sessionStorage.setItem(INTRO_DONE_KEY, "1");

    // Start intro immediately (prevents first-paint video flash)
    body.classList.add("intro-loading");
    setStageVideoMask({ opacity: 1, hard: true });
    hideChrome();
    hideStageContent();

    // Build centered overlay logo (clone) so the real logo never "travels" and never shifts left.
    const overlay = document.createElement("div");
    overlay.setAttribute("data-logo-intro-overlay", "true");
    overlay.setAttribute("aria-hidden", "true");
    setInline(overlay, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      direction: "ltr",
      background: "transparent",
      zIndex: "2147483000",
      pointerEvents: "none",
      opacity: "1",
    });

    const overlayLogo = logoEl.cloneNode(true);
    overlayLogo.removeAttribute("id");

    // Strip any layout/positioning classes from the in-layout logo.
    // Keep only our intro class so CSS from `.site-logo` cannot shift the overlay logo.
    overlayLogo.className = "intro-logo";
    overlayLogo.removeAttribute("style");

    setInline(overlayLogo, {
      display: "block",
      position: "relative",
      left: "0",
      top: "0",
      margin: "0 auto",
      padding: "0",
      width: "auto",
      height: "auto",
      maxWidth: "min(72vw, 460px)",
      transformOrigin: "50% 50%",
      transform: "translate3d(0,0,0) scale(0.5)",
      opacity: "1",
      willChange: "transform, opacity",
      pointerEvents: "none",
      translate: "0 0",
    });

    overlay.appendChild(overlayLogo);
    document.body.appendChild(overlay);

    const finishIntro = once(() => {
      body.classList.remove("intro-loading");
      body.classList.add("intro-reveal");

      // After the intro, reveal the video softly behind the stage (keep luxury wash)
      setStageVideoMask({ opacity: 0.5 });

      // Remove overlay
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);

      // Reveal stage content (still no header/footer)
      revealStageContent();
    });

    raf2(() => {
      // Pop up
      overlayLogo.style.transition = `transform ${POP_IN_MS}ms ${EASE_OUT}`;
      overlayLogo.style.transform = "translate3d(0,0,0) scale(1.03)";

      // Settle
      window.setTimeout(() => {
        overlayLogo.style.transition = `transform ${POP_OUT_MS}ms ${EASE_INOUT}`;
        overlayLogo.style.transform = "translate3d(0,0,0) scale(1.0)";
      }, Math.max(0, POP_IN_MS - 120));

      // Hold, then fade away overlay
      window.setTimeout(() => {
        overlay.style.transition = `opacity ${FADE_MS}ms ${EASE_OUT}`;
        overlayLogo.style.transition = `transform ${FADE_MS}ms ${EASE_OUT}, opacity ${FADE_MS}ms ${EASE_OUT}`;

        overlay.style.opacity = "0";
        overlayLogo.style.opacity = "0";
        overlayLogo.style.transform = "translate3d(0,0,0) scale(0.15)";

        window.setTimeout(finishIntro, FADE_MS + 40);
      }, POP_IN_MS + HOLD_MS);

      // Safety: never get stuck.
      window.setTimeout(finishIntro, POP_IN_MS + HOLD_MS + FADE_MS + 1400);
    });

    // BFCache safety.
    window.addEventListener(
      "pageshow",
      () => {
        if (body.classList.contains("intro-loading")) finishIntro();
      },
      { once: true }
    );

    // Escape exits intro.
    window.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") finishIntro();
      },
      { once: true }
    );
  });
})();