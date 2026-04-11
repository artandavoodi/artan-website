/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE STATE
   03) OVERLAY RESOLUTION
   04) VISIBILITY STATE
   05) TIMER HELPERS
   06) OVERLAY CONTROL
   07) EVENT BINDING
   08) EVENT REBINDING
   09) INITIALIZATION
   10) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
   LOADING OVERLAY — GLOBAL SYSTEM CONTROLLER
   - Translation-first implementation
   - Paint-synchronized dismissal
   - Modular API for future page / fragment loading states
============================================================================= */
/* /website/docs/assets/js/core/03-runtime/loading-overlay.js */

(() => {
  'use strict';

  /* =============================================================================
     02) MODULE STATE
  ============================================================================= */
  let overlay = null;
  let bootBound = false;
  let mountEventsBound = false;
  const activeReasons = new Set();
  let showTimer = null;
  let visible = false;
  let visibleSince = 0;
  let hideTimer = null;

  const SHOW_DELAY_MS = 90;
  const MIN_VISIBLE_MS = 320;
  const FINAL_PAINT_SETTLE_MS = 120;

  /* =============================================================================
     03) OVERLAY RESOLUTION
  ============================================================================= */
  const getOverlayNode = () => {
    return document.getElementById('global-loading-overlay');
  };

  /* =============================================================================
     04) VISIBILITY STATE
  ============================================================================= */
  const setVisible = (state) => {
    if (!overlay) return;

    visible = state;
    visibleSince = state ? Date.now() : 0;
    overlay.classList.toggle('is-active', state);
    overlay.setAttribute('aria-hidden', state ? 'false' : 'true');
  };

  /* =============================================================================
     05) TIMER HELPERS
  ============================================================================= */
  const clearShowTimer = () => {
    if (!showTimer) return;
    window.clearTimeout(showTimer);
    showTimer = null;
  };

  const clearHideTimer = () => {
    if (!hideTimer) return;
    window.clearTimeout(hideTimer);
    hideTimer = null;
  };

  /* =============================================================================
     06) OVERLAY CONTROL
  ============================================================================= */
  const hideAfterSynchronizedPaint = () => {
    const elapsed = visible ? Date.now() - visibleSince : 0;
    const remainingVisibleTime = Math.max(0, MIN_VISIBLE_MS - elapsed);

    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      hideTimer = null;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            if (activeReasons.size === 0 && visible) {
              setVisible(false);
            }
          }, FINAL_PAINT_SETTLE_MS);
        });
      });
    }, remainingVisibleTime);
  };

  const updateVisibility = () => {
    if (!overlay) return;

    const shouldShow = activeReasons.size > 0;

    if (shouldShow) {
      clearHideTimer();

      if (visible) return;
      if (showTimer) return;

      showTimer = window.setTimeout(() => {
        showTimer = null;
        if (activeReasons.size > 0) {
          setVisible(true);
        }
      }, SHOW_DELAY_MS);
      return;
    }

    clearShowTimer();

    if (visible) {
      hideAfterSynchronizedPaint();
    }
  };

  const start = (reason = 'generic') => {
    activeReasons.add(reason);
    updateVisibility();
  };

  const stop = (reason = 'generic') => {
    activeReasons.delete(reason);
    updateVisibility();
  };

  const clear = () => {
    activeReasons.clear();
    clearShowTimer();
    clearHideTimer();

    if (visible) {
      setVisible(false);
    } else {
      updateVisibility();
    }
  };

  /* =============================================================================
     07) EVENT BINDING
  ============================================================================= */
  const bindEvents = () => {
    document.addEventListener('translation:start', () => {
      start('translation');
    });

    document.addEventListener('translation:complete', () => {
      stop('translation');
    });

    document.addEventListener('translation:error', () => {
      stop('translation');
    });
  };

  /* =============================================================================
     08) EVENT REBINDING
  ============================================================================= */
  const bindMountEvents = () => {
    if (mountEventsBound) return;
    mountEventsBound = true;

    document.addEventListener('fragment:mounted', (event) => {
      const name = event?.detail?.name || '';
      if (name !== 'loading-overlay') return;

      overlay = getOverlayNode();
      if (!overlay) return;

      clearShowTimer();
      clearHideTimer();
      visible = overlay.classList.contains('is-active');
      visibleSince = visible ? Date.now() : 0;
      overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });

    window.addEventListener('load', () => {
      overlay = getOverlayNode();
    }, { once: true });
  };

  /* =============================================================================
     09) INITIALIZATION
  ============================================================================= */
  const boot = () => {
    overlay = getOverlayNode();
    if (bootBound) {
      return;
    }

    bootBound = true;
    bindEvents();
    bindMountEvents();

    const api = Object.freeze({
      start,
      stop,
      clear,
      isActive: () => activeReasons.size > 0
    });

    window.ARTAN_LOADING_OVERLAY = api;
    window.NEUROARTAN_LOADING_OVERLAY = api;

    if (!overlay) return;

    visible = overlay.classList.contains('is-active');
    visibleSince = visible ? Date.now() : 0;
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* =============================================================================
   10) END OF FILE
============================================================================= */