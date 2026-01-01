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