/* =============================================================================
   01) HOME HERO — LOGO STICK + SCALE
   - After ENTER (body.site-entered), logo stays in place.
   - On scroll, logo pins, shrinks, and holds.
   - Content scrolls behind it.
============================================================================= */

(() => {
  const hero = document.querySelector('#home-hero');

  // Tuning knobs (adjust freely)
  const STUCK_TOP_DESKTOP = 86; // px (sits below the menu area)
  const STUCK_TOP_MOBILE = 72;  // px
  const STUCK_LEFT = 18;        // px
  const STUCK_SCALE = 0.50;     // 0.50 = 50%

  const logoLayer = document.querySelector('.home-hero-logo-layer');
  if (!hero || !logoLayer) return;

  // Fade-out target: Home — Music (Sound) entry
  const soundAnchor = document.querySelector('#home-sound-figure');
  const getSoundTop = () => {
    if (!soundAnchor) return Infinity;
    const r = soundAnchor.getBoundingClientRect();
    const pageY = window.scrollY || window.pageYOffset || 0;
    return r.top + pageY;
  };

  let soundTop = getSoundTop();

  let enabled = false;
  let stuck = false;
  let raf = false;
  let thresholdY = 0;
  let logoFadeLock = false;

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
    // Smooth fade (does not affect scale/stick transform)
    logoLayer.style.transition =
      (logoLayer.style.transition ? logoLayer.style.transition + ', ' : '') +
      'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)';
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

    // Earlier fade: during the hero headline sequence, hide from step 3 onward.
    // hl-1: original, hl-2: shrunk, hl-3/hl-4: fade out + stay hidden.
    const inHl1 = document.body.classList.contains('hl-1');
    const inHl2 = document.body.classList.contains('hl-2');
    const inHl3 = document.body.classList.contains('hl-3');
    const inHl4 = document.body.classList.contains('hl-4');
    const heroReleased = document.body.classList.contains('hero-lock-released');

    if (inHl3 || inHl4 || heroReleased) {
      logoFadeLock = true;
      setLogoHidden(true);
      return;
    }

    if (logoFadeLock && (inHl1 || inHl2) && !heroReleased) {
      logoFadeLock = false;
    }

    setLogoHidden(false);

    // Fade out the logo as we approach Home — Music (Sound), then keep it hidden below.
    // Prevents logo presence after the Essence → Sound transition.
    const y = window.scrollY || window.pageYOffset || 0;
    const fadeEnd = soundTop - 6;
    const fadeStart = fadeEnd - Math.round(window.innerHeight * 0.35);

    if (y >= fadeEnd) {
      logoFadeLock = true;
      setLogoHidden(true);
      return;
    }

    if (logoFadeLock && y < fadeStart) {
      logoFadeLock = false;
    }

    if (y > fadeStart && y < fadeEnd) {
      const t = Math.min(1, Math.max(0, (y - fadeStart) / (fadeEnd - fadeStart)));
      logoLayer.style.opacity = String(1 - t);
      logoLayer.style.visibility = 'visible';
      logoLayer.style.pointerEvents = 'none';
      logoLayer.setAttribute('aria-hidden', 'true');
    } else {
      // Ensure fully visible when above fade region
      logoLayer.style.opacity = '';
      logoLayer.style.visibility = '';
      logoLayer.style.pointerEvents = '';
      logoLayer.removeAttribute('aria-hidden');
    }

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
    soundTop = getSoundTop();
    update();

    observeOverlayState();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener(
      'resize',
      () => {
        thresholdY = computeThreshold();
        soundTop = getSoundTop();
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

/* =============================================================================
   02) HOME — SCROLL GRADIENT STATES
   - Adds body classes for CSS-driven gradient transitions.
============================================================================= */

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

/* =============================================================================
   03) HOME HERO — HEADLINE SCROLL FOCUS (LEGACY)
   - Cycles focus across hero headlines.
   - Disabled when hero-lock-enabled is present.
============================================================================= */

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

/* =============================================================================
   04) HOME HERO — PINNED HEADLINE SEQUENCE (ACTIVE)
   - Pins the hero headline stack.
   - Steps through headlines via scroll runway.
   - Releases scroll after the sequence.
============================================================================= */
(() => {
  // Disables the legacy scroll-focus block above.
  document.body.classList.add('hero-lock-enabled');

  const hero = document.querySelector('#home-hero');
  const headlines = document.querySelectorAll('.home-hero-headline');
  const wrap = document.querySelector('.home-hero-headlines');
  if (!hero || !headlines.length || !wrap) return;

  // Hero background (video/image) pinning during the sequence
  const heroBg = hero.querySelector(
    '.home-hero-bg, .home-hero-media, .home-hero-video, video, picture, img'
  );

  // Matte / blur layer that sits above the background (must stay pinned too)
  const heroMatte = hero.querySelector('.home-hero-matte');

  // Portal restore for matte (fixed inside transformed ancestors can behave like absolute)
  const matteRestore = {
    parent: heroMatte ? heroMatte.parentNode : null,
    next: heroMatte ? heroMatte.nextSibling : null,
  };

  const STEPS = 4;

  let raf = false;
  let active = false;
  let snapped = false;
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


  // Backdrop to prevent next section from bleeding in while pinned (no CSS dependency)
  const ensureBackdrop = () => {
    let bd = document.querySelector('#hero-pin-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.id = 'hero-pin-backdrop';
      bd.setAttribute('aria-hidden', 'true');
      bd.style.position = 'fixed';
      bd.style.inset = '0';
      bd.style.pointerEvents = 'none';
      bd.style.opacity = '1';
      bd.style.display = 'none';
      bd.style.zIndex = '2';
      document.body.appendChild(bd);
    }
    return bd;
  };

  const backdrop = ensureBackdrop();

  const setBackdropOpacity = (o) => {
    backdrop.style.opacity = String(o);
  };

  const showBackdrop = () => {
    backdrop.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
    backdrop.style.display = 'block';
    setBackdropOpacity(0);
  };

  const hideBackdrop = () => {
    backdrop.style.display = 'none';
    setBackdropOpacity(0);
  };

  const restore = {
    heroStyle: hero.getAttribute('style') || '',
    wrapStyle: wrap.getAttribute('style') || '',
    bgStyle: heroBg ? (heroBg.getAttribute('style') || '') : '',
    matteStyle: heroMatte ? (heroMatte.getAttribute('style') || '') : '',
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
      showBackdrop();

      // Pin background so it doesn’t scroll away during the headline sequence.
      // Keep layering: bg (0) → matte (1) → backdrop (2) → headlines (3)
      if (heroBg) {
        heroBg.style.setProperty('position', 'fixed', 'important');
        heroBg.style.setProperty('top', '0', 'important');
        heroBg.style.setProperty('right', '0', 'important');
        heroBg.style.setProperty('bottom', '0', 'important');
        heroBg.style.setProperty('left', '0', 'important');
        heroBg.style.setProperty('inset', '0', 'important');
        heroBg.style.setProperty('width', '100%', 'important');
        heroBg.style.setProperty('height', '100%', 'important');
        heroBg.style.setProperty('transform', 'none', 'important');
        heroBg.style.setProperty('z-index', '0', 'important');
        heroBg.style.setProperty('pointer-events', 'none', 'important');
      }

      // Pin matte/blur overlay so it stays with the background during the sequence.
      // If an ancestor is transformed, fixed positioning can become relative; portal to body for true pin.
      if (heroMatte) {
        if (heroMatte.parentNode !== document.body) {
          matteRestore.parent = heroMatte.parentNode;
          matteRestore.next = heroMatte.nextSibling;
          document.body.appendChild(heroMatte);
        }

        heroMatte.style.setProperty('position', 'fixed', 'important');
        heroMatte.style.setProperty('top', '0', 'important');
        heroMatte.style.setProperty('right', '0', 'important');
        heroMatte.style.setProperty('bottom', '0', 'important');
        heroMatte.style.setProperty('left', '0', 'important');
        heroMatte.style.setProperty('inset', '0', 'important');
        heroMatte.style.setProperty('width', '100%', 'important');
        heroMatte.style.setProperty('height', '100%', 'important');
        heroMatte.style.setProperty('transform', 'none', 'important');
        heroMatte.style.setProperty('z-index', '1', 'important');
        heroMatte.style.setProperty('pointer-events', 'none', 'important');
      }

      // Pin headlines to viewport; hero layout remains as authored in CSS.
      wrap.style.setProperty('position', 'fixed', 'important');
      wrap.style.left = '0';
      wrap.style.top = '58%';
      wrap.style.transform = 'translateY(-50%)';
      wrap.style.width = '100%';
      wrap.style.zIndex = '3';

      document.body.classList.remove('hero-lock-released');
    } else {
      hideBackdrop();

      if (heroBg) {
        if (restore.bgStyle) heroBg.setAttribute('style', restore.bgStyle);
        else heroBg.removeAttribute('style');
      }

      if (heroMatte) {
        if (restore.matteStyle) heroMatte.setAttribute('style', restore.matteStyle);
        else heroMatte.removeAttribute('style');

        // Restore DOM position inside hero
        if (matteRestore.parent && heroMatte.parentNode !== matteRestore.parent) {
          if (matteRestore.next) matteRestore.parent.insertBefore(heroMatte, matteRestore.next);
          else matteRestore.parent.appendChild(heroMatte);
        }
      }

      if (restore.wrapStyle) wrap.setAttribute('style', restore.wrapStyle);
      else wrap.removeAttribute('style');
    }
  };

  const getRanges = () => {
    const rect = hero.getBoundingClientRect();
    const pageY = window.scrollY || window.pageYOffset || 0;
    const heroTop = rect.top + pageY;

    const start = Math.max(0, heroTop - 1);
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
      hideBackdrop();
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
        hideBackdrop();
      }

      document.body.classList.add('hero-lock-released');
      // Keep last highlight while exiting upward (CSS handles motion).
      setStep(STEPS - 1);
      setBackdropOpacity(1);
      return;
    }

    // Before start: show first headline state (no pin)
    if (y < start) {
      document.body.classList.remove('hero-lock-released');
      setPinned(false);
      setStep(0);
      active = false;
      released = false;
      setBackdropOpacity(0);
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

    // Backdrop fade: keep hero video visible early, then fade to solid as the sequence progresses.
    // 0.00–0.20: fully transparent (no cover)
    // 0.20–0.95: smooth fade to full cover
    const fadeStart = 0.20;
    const fadeEnd = 0.95;
    const o = clamp((p - fadeStart) / (fadeEnd - fadeStart), 0, 1);
    setBackdropOpacity(o);
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

/* =============================================================================
   05) HOME ESSENCE — PINNED LIGHT PASS (3-LINE)
   - Pins the essence lines in-frame.
   - Drives the internal light sweep via scroll runway.
   - Releases scroll after completion.
============================================================================= */
(() => {
  const section = document.querySelector('.home-essence');
  const wrap = document.querySelector('.home-ink-reveal');
  const lines = document.querySelectorAll(
    '.home-ink-reveal .home-ink-layer, .home-ink-reveal .ink-line'
  );
  if (!section || !wrap || lines.length < 3) return;

  // Ensure CSS overlay-sheen has a stable text source (future-proof across i18n swaps)
  const syncEssenceText = () => {
    for (const el of lines) {
      const txt = (el.textContent || '').trim();
      if (txt) el.setAttribute('data-essence-text', txt);
    }
  };

  // Watch for translation updates inside the essence block
  const mo = new MutationObserver(() => {
    syncEssenceText();
  });
  mo.observe(wrap, { subtree: true, childList: true, characterData: true });

  let raf = false;
  let active = false;
  let snapped = false;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const setOnly = (idx) => {
    for (let i = 0; i < lines.length; i++) {
      lines[i].style.opacity = i === idx ? '1' : '0';
      lines[i].style.visibility = i === idx ? 'visible' : 'hidden';
    }
  };

  // Create scroll runway (additive; no HTML edits)
  const ensureSpacer = () => {
    let spacer = document.querySelector('#essence-scroll-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'essence-scroll-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      section.insertAdjacentElement('afterend', spacer);
    }
    return spacer;
  };

  const spacer = ensureSpacer();

  // Backdrop to prevent next section from bleeding in while pinned (no CSS dependency)
  const ensureBackdrop = () => {
    let bd = document.querySelector('#essence-pin-backdrop');
    if (!bd) {
      bd = document.createElement('div');
      bd.id = 'essence-pin-backdrop';
      bd.setAttribute('aria-hidden', 'true');
      bd.style.position = 'fixed';
      bd.style.inset = '0';
      bd.style.pointerEvents = 'none';
      bd.style.opacity = '1';
      bd.style.display = 'none';
      bd.style.zIndex = '2';
      document.body.appendChild(bd);
    }
    return bd;
  };

  const backdrop = ensureBackdrop();

  const restore = {
    wrapStyle: wrap.getAttribute('style') || '',
  };

  const setRunwayHeight = () => {
    // Slow, readable pace: ~4.6 viewports of runway.
    const h = Math.round(window.innerHeight * 4.6);
    spacer.style.height = `${h}px`;
    spacer.style.width = '1px';
  };

  const setPinned = (on) => {
    if (on) {
      backdrop.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
      backdrop.style.display = 'block';

      wrap.style.position = 'fixed';
      wrap.style.left = '50%';
      wrap.style.top = '50%';
      wrap.style.transform = 'translate(-50%, -50%)';

      // Stable stage for layered lines (prevents collapse/disappear)
      wrap.style.width = '100vw';
      wrap.style.maxWidth = 'none';
      wrap.style.margin = '0';
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.justifyContent = 'center';
      wrap.style.zIndex = '3';
      wrap.style.visibility = 'visible';
      wrap.style.opacity = '1';

      document.body.classList.add('essence-pinned');
      active = true;

      // Ensure layered visibility is controlled by JS (single line at a time)
      setOnly(0);
    } else {
      backdrop.style.display = 'none';

      if (restore.wrapStyle) wrap.setAttribute('style', restore.wrapStyle);
      else wrap.removeAttribute('style');

      // Restore default visibility so normal flow never “loses” the lines
      for (const el of lines) {
        el.style.opacity = '';
        el.style.visibility = '';
      }

      document.body.classList.remove('essence-pinned');
      active = false;
    }
  };

  const getRanges = () => {
    const rect = section.getBoundingClientRect();
    const pageY = window.scrollY || window.pageYOffset || 0;
    const top = rect.top + pageY;

    const start = top + Math.round(window.innerHeight * 0.15);
    const length =
      spacer.getBoundingClientRect().height || Math.round(window.innerHeight * 4.6);
    const end = start + length;

    return { start, end, length, top };
  };

  const resetIfAbove = (y, top) => {
    if (y < top - 60) {
      setPinned(false);
      for (const el of lines) {
        el.style.setProperty('--ink', 0);
        el.style.setProperty('--sheen', 0);
        el.style.transform = '';
        el.style.opacity = '';
        el.style.visibility = '';
      }
      backdrop.style.display = 'none';
      snapped = false;
      return true;
    }
    return false;
  };

  const bump = (p, a, b) => {
    const t = clamp((p - a) / (b - a), 0, 1);
    return 1 + (0.08 * (1 - Math.abs(t - 0.5) * 2));
  };

  const isRTL = () => {
    const html = document.documentElement;
    return (
      html.classList.contains('lang-rtl') ||
      html.getAttribute('dir') === 'rtl' ||
      document.body.classList.contains('lang-rtl')
    );
  };

  const setSheen = (el, t) => {
    const tt = clamp(t, 0, 1);

    // NOTE: CSS sheen sweep moves right→left when --sheen increases.
    // Flip for LTR so it reads left→right; keep RTL mirrored.
    const dirT = isRTL() ? tt : (1 - tt);

    el.style.setProperty('--sheen', dirT);
  };

  const update = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    syncEssenceText();

    const { start, end, length, top } = getRanges();

    if (resetIfAbove(y, top)) return;

    // After completion: release and REMOVE the highlight (do not “stay”).
    if (y >= end) {
      if (active) setPinned(false);
      backdrop.style.display = 'none';

      // Magnetic snap: after Essence completes, align Home — Music (the image owner) to the top edge.
      if (!snapped) {
        const target =
          document.querySelector('#home-sound-figure') ||
          document.querySelector('#essence-scroll-spacer + section + section');

        if (target) {
          const r = target.getBoundingClientRect();
          const pageY = window.scrollY || window.pageYOffset || 0;
          const topTarget = Math.round(r.top + pageY);
          snapped = true;
          window.scrollTo({ top: topTarget, behavior: 'smooth' });
        }
      }

      setSheen(lines[0], 0);
      setSheen(lines[1], 0);
      setSheen(lines[2], 0);

      lines[0].style.transform = 'scale(1)';
      lines[1].style.transform = 'scale(1)';
      lines[2].style.transform = 'scale(1)';
      setOnly(2);
      return;
    }

    // Before start: unpinned, no highlight.
    if (y < start) {
      if (active) setPinned(false);

      lines[0].style.setProperty('--ink', 0);
      lines[1].style.setProperty('--ink', 0);
      lines[2].style.setProperty('--ink', 0);

      setSheen(lines[0], 0);
      setSheen(lines[1], 0);
      setSheen(lines[2], 0);

      lines[0].style.transform = '';
      lines[1].style.transform = '';
      lines[2].style.transform = '';

      // Keep the first line staged but hidden before activation
      setOnly(0);
      lines[0].style.opacity = '0';
      lines[0].style.visibility = 'hidden';

      snapped = false;
      return;
    }

    // Inside pinned narrative
    if (!active) setPinned(true);

    const progress = clamp((y - start) / length, 0, 1);

    // One centered line at a time
    if (progress < 0.55) setOnly(0);
    else if (progress < 0.90) setOnly(1);
    else setOnly(2);

    // Timeline
    // 0.00 → 0.40 : line 1 light pass
    // 0.40 → 0.55 : line 1 bump
    // 0.55 → 0.80 : line 2 light pass
    // 0.80 → 0.90 : line 2 bump
    // 0.90 → 1.00 : line 3 light pass + bump

    const l1 = clamp(progress / 0.40, 0, 1);
    const l2 = clamp((progress - 0.55) / 0.25, 0, 1);
    const l3 = clamp((progress - 0.90) / 0.10, 0, 1);

    lines[0].style.setProperty('--ink', l1);
    setSheen(lines[0], l1);

    lines[1].style.setProperty('--ink', l2);
    setSheen(lines[1], l2);

    lines[2].style.setProperty('--ink', l3);
    setSheen(lines[2], l3);

    lines[0].style.transform = `scale(${bump(progress, 0.40, 0.55)})`;
    lines[1].style.transform = `scale(${bump(progress, 0.80, 0.90)})`;
    lines[2].style.transform = `scale(${bump(progress, 0.98, 1.00)})`;
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
    syncEssenceText();
    setRunwayHeight();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener(
      'resize',
      () => {
        setRunwayHeight();
        update();
      },
      { passive: true }
    );
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();