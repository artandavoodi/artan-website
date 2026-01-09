/* =================== HOME (ARTAN) — HERO LOGO STICK + SCALE =================== */
/*
  Behavior:
  - After ENTER (body.site-entered), the Home Hero logo stays in its designed place.
  - On scroll, it becomes fixed, shrinks hard, and holds in the corner.
  - Content scrolls behind it. No dependencies.
*/

(() => {
  const hero = document.querySelector('#home-hero');

  // Tuning knobs (adjust freely)
  const STUCK_TOP_DESKTOP = 86; // px (sits below the menu area)
  const STUCK_TOP_MOBILE = 72;  // px
  const STUCK_LEFT = 18;        // px
  const STUCK_SCALE = 0.50;     // 0.50 = 50%

  const logoLayer = document.querySelector('.home-hero-logo-layer');
  if (!hero || !logoLayer) return;

  let enabled = false;
  let stuck = false;
  let raf = false;
  let thresholdY = 0;

  const restore = {
    style: logoLayer.getAttribute('style') || '',
    aria: logoLayer.getAttribute('aria-hidden'),
  };

  const computeThreshold = () => {
    const rect = hero.getBoundingClientRect();
    const pageY = window.scrollY || window.pageYOffset || 0;
    const heroTop = rect.top + pageY;
    return Math.max(0, heroTop + 24);
  };

  const applyStuck = () => {
    logoLayer.style.position = 'fixed';
    const stuckTop = window.matchMedia('(max-width: 640px)').matches
      ? STUCK_TOP_MOBILE
      : STUCK_TOP_DESKTOP;

    logoLayer.style.top = `${stuckTop}px`;
    logoLayer.style.left = `${STUCK_LEFT}px`;
    logoLayer.style.right = 'auto';
    logoLayer.style.bottom = 'auto';
    logoLayer.style.zIndex = '400000';
    logoLayer.style.pointerEvents = 'auto';

    logoLayer.style.transformOrigin = 'top left';
    logoLayer.style.transform = `scale(${STUCK_SCALE})`;
    logoLayer.style.transition =
      'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)';

    document.body.classList.add('home-hero-logo-stuck');
    stuck = true;
  };

  const removeStuck = () => {
    if (restore.style) logoLayer.setAttribute('style', restore.style);
    else logoLayer.removeAttribute('style');

    if (restore.aria === null) logoLayer.removeAttribute('aria-hidden');
    else logoLayer.setAttribute('aria-hidden', restore.aria);

    document.body.classList.remove('home-hero-logo-stuck');
    stuck = false;
  };

  const overlaysActive = () => {
    // Menu overlay (cover multiple class/attribute variants)
    const menuOverlay = document.querySelector('#menu-overlay');
    const menuOpenByBody =
      document.body.classList.contains('menu-open') ||
      document.body.classList.contains('menu-active') ||
      document.body.classList.contains('menu-visible');

    const menuOpenByOverlay = !!(
      menuOverlay &&
      (
        menuOverlay.classList.contains('active') ||
        menuOverlay.classList.contains('is-open') ||
        menuOverlay.getAttribute('aria-hidden') === 'false' ||
        menuOverlay.style.visibility === 'visible' ||
        menuOverlay.style.opacity === '1'
      )
    );

    if (menuOpenByBody || menuOpenByOverlay) return true;

    // Country overlay
    const countryOverlay = document.querySelector('.country-overlay');
    const countryOpen = !!(
      countryOverlay &&
      (
        countryOverlay.classList.contains('visible') ||
        countryOverlay.classList.contains('active') ||
        countryOverlay.getAttribute('aria-hidden') === 'false'
      )
    );

    if (countryOpen) return true;

    return false;
  };

  const setLogoHidden = (hide) => {
    if (hide) {
      logoLayer.style.opacity = '0';
      logoLayer.style.visibility = 'hidden';
      logoLayer.style.pointerEvents = 'none';
      logoLayer.setAttribute('aria-hidden', 'true');
    } else {
      logoLayer.style.opacity = '';
      logoLayer.style.visibility = '';
      logoLayer.style.pointerEvents = '';
      logoLayer.removeAttribute('aria-hidden');
    }
  };

  const update = () => {
    // Never show this logo above overlays (menu, country selector)
    if (overlaysActive()) {
      setLogoHidden(true);
      return;
    }

    setLogoHidden(false);

    const y = window.scrollY || window.pageYOffset || 0;
    const shouldStick = y > thresholdY;

    if (shouldStick && !stuck) applyStuck();
    if (!shouldStick && stuck) removeStuck();
  };

  const onScroll = () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      update();
    });
  };

  const observeOverlayState = () => {
    const targets = [document.body];

    const menuOverlay = document.querySelector('#menu-overlay');
    if (menuOverlay) targets.push(menuOverlay);

    const countryOverlay = document.querySelector('.country-overlay');
    if (countryOverlay) targets.push(countryOverlay);

    const mo = new MutationObserver(() => {
      update();
    });

    targets.forEach((t) => {
      mo.observe(t, {
        attributes: true,
        attributeFilter: ['class', 'style', 'aria-hidden'],
      });
    });

    // Also catch click-driven overlay toggles immediately
    document.addEventListener(
      'click',
      () => {
        requestAnimationFrame(update);
      },
      true
    );
  };

  const enable = () => {
    if (enabled) return;
    enabled = true;

    thresholdY = computeThreshold();
    update();

    observeOverlayState();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener(
      'resize',
      () => {
        thresholdY = computeThreshold();
        update();
      },
      { passive: true }
    );
  };

  // Gate-aware: prefers enabling after ENTER, but still works if gate is absent.
  const boot = () => {
    if (document.body.classList.contains('site-entered')) {
      enable();
      return;
    }

    const mo = new MutationObserver(() => {
      if (document.body.classList.contains('site-entered')) {
        mo.disconnect();
        enable();
      }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Fallback (safe): enable anyway after a short delay if the gate class isn't used.
    setTimeout(() => {
      if (!enabled) enable();
    }, 1200);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* =================== HOME (ARTAN) — SCROLL GRADIENT STATES =================== */
/* Adds body state classes for CSS-driven gradient transitions */

(() => {
  let raf = false;

  const updateScrollState = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? y / h : 0;

    document.body.classList.remove('scroll-top', 'scroll-mid', 'scroll-deep');

    if (p < 0.25) document.body.classList.add('scroll-top');
    else if (p < 0.65) document.body.classList.add('scroll-mid');
    else document.body.classList.add('scroll-deep');
  };

  const onScroll = () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      updateScrollState();
    });
  };

  const boot = () => {
    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* =================== HOME (ARTAN) — HERO HEADLINE SCROLL FOCUS =================== */
/* Cycles focus across hero headlines, then hides them after hero section */

(() => {
  if (document.body.classList.contains('hero-lock-enabled')) return;

  const hero = document.querySelector('#home-hero');
  const headlines = document.querySelectorAll('.home-hero-headline');
  if (!hero || !headlines.length) return;

  const total = headlines.length; // 4
  let raf = false;

  const update = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    const rect = hero.getBoundingClientRect();
    const heroTop = rect.top + y;
    const heroHeight = rect.height;

    const start = heroTop + heroHeight * 0.25;
    const end   = heroTop + heroHeight * 0.95;

    document.body.classList.remove('hl-1','hl-2','hl-3','hl-4','hl-hide');

    if (y < start) {
      document.body.classList.add('hl-1');
      return;
    }

    if (y > end) {
      document.body.classList.add('hl-hide');
      return;
    }

    const progress = (y - start) / (end - start);
    const index = Math.min(total - 1, Math.floor(progress * total));

    document.body.classList.add(`hl-${index + 1}`);
  };

  const onScroll = () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      update();
    });
  };

  const boot = () => {
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* =================== HOME (ARTAN) — HERO 5-SCROLL LOCK (ADDITIVE) =================== */
(() => {
  // Disables the legacy scroll-focus block above.
  document.body.classList.add('hero-lock-enabled');

  const hero = document.querySelector('#home-hero');
  const headlines = document.querySelectorAll('.home-hero-headline');
  const wrap = document.querySelector('.home-hero-headlines');
  if (!hero || !headlines.length || !wrap) return;

  const STEPS = 4;

  let raf = false;
  let active = false;
  let released = false;

  // Create a scroll runway (additive, no index.html edits)
  const ensureSpacer = () => {
    let spacer = document.querySelector('#hero-scroll-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'hero-scroll-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      hero.insertAdjacentElement('afterend', spacer);
    }
    return spacer;
  };

  const spacer = ensureSpacer();

  const restore = {
    heroStyle: hero.getAttribute('style') || '',
    wrapStyle: wrap.getAttribute('style') || '',
  };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const clearStepClasses = () => {
    document.body.classList.remove('hl-1', 'hl-2', 'hl-3', 'hl-4');
  };

  const setStep = (idx0) => {
    clearStepClasses();
    const i = clamp(idx0, 0, STEPS - 1);
    document.body.classList.add(`hl-${i + 1}`);
  };

  const setRunwayHeight = () => {
    // ~Apple-like: long, smooth narrative without wheel hijack.
    // 4 steps over ~3.2 viewports.
    const h = Math.round(window.innerHeight * 3.2);
    spacer.style.height = `${h}px`;
    spacer.style.width = '1px';
  };

  const setPinned = (on) => {
    if (on) {
      // Pin headlines to viewport; hero layout remains as authored in CSS.
      wrap.style.position = 'fixed';
      wrap.style.left = '0';
      wrap.style.top = '58%';
      wrap.style.transform = 'translateY(-50%)';
      wrap.style.width = '100%';
      wrap.style.zIndex = '3';

      document.body.classList.remove('hero-lock-released');
    } else {
      if (restore.wrapStyle) wrap.setAttribute('style', restore.wrapStyle);
      else wrap.removeAttribute('style');
    }
  };

  const getRanges = () => {
    const rect = hero.getBoundingClientRect();
    const pageY = window.scrollY || window.pageYOffset || 0;
    const heroTop = rect.top + pageY;

    const start = heroTop + Math.round(window.innerHeight * 0.10);
    const length = spacer.getBoundingClientRect().height || Math.round(window.innerHeight * 3.2);
    const end = start + length;

    return { start, end, length, heroTop };
  };

  const resetIfAboveHero = (y, heroTop) => {
    if (y < heroTop - 40) {
      active = false;
      released = false;
      document.body.classList.remove('hero-lock-released');
      clearStepClasses();
      setPinned(false);
      return true;
    }
    return false;
  };

  const update = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    const { start, end, length, heroTop } = getRanges();

    if (resetIfAboveHero(y, heroTop)) return;

    // After narrative completes, release and let normal scroll continue.
    if (y >= end) {
      if (active) {
        active = false;
        released = true;
        setPinned(false);
      }

      document.body.classList.add('hero-lock-released');
      // Keep last highlight while exiting upward (CSS handles motion).
      setStep(STEPS - 1);
      return;
    }

    // Before start: show first headline state (no pin)
    if (y < start) {
      document.body.classList.remove('hero-lock-released');
      setPinned(false);
      setStep(0);
      active = false;
      released = false;
      return;
    }

    // Inside narrative: pin and map scroll progress to steps.
    if (!active) {
      active = true;
      released = false;
      setPinned(true);
    }

    const p = clamp((y - start) / length, 0, 0.999999);
    const idx = Math.floor(p * STEPS);
    setStep(idx);
  };

  const onScroll = () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      raf = false;
      update();
    });
  };

  const boot = () => {
    setRunwayHeight();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      setRunwayHeight();
      update();
    }, { passive: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();