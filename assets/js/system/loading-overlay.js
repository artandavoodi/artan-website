/* =============================================================================
   LOADING OVERLAY — GLOBAL SYSTEM CONTROLLER
   - Translation-first implementation
   - Modular API for future page / fragment loading states
============================================================================= */

(() => {
  const overlay = document.getElementById('global-loading-overlay');
  if (!overlay) return;

  let activeReasons = new Set();
  let showTimer = null;
  let visible = false;

  const setVisible = (state) => {
    visible = state;
    overlay.classList.toggle('is-active', state);
    overlay.setAttribute('aria-hidden', state ? 'false' : 'true');
  };

  const updateVisibility = () => {
    const shouldShow = activeReasons.size > 0;

    if (shouldShow) {
      if (visible) return;
      if (showTimer) return;

      showTimer = window.setTimeout(() => {
        showTimer = null;
        if (activeReasons.size > 0) {
          setVisible(true);
        }
      }, 90);
      return;
    }

    if (showTimer) {
      window.clearTimeout(showTimer);
      showTimer = null;
    }

    if (visible) {
      setVisible(false);
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
    updateVisibility();
  };

  document.addEventListener('translation:start', () => {
    start('translation');
  });

  document.addEventListener('translation:complete', () => {
    stop('translation');
  });

  document.addEventListener('translation:error', () => {
    stop('translation');
  });

  window.ARTAN_LOADING_OVERLAY = Object.freeze({
    start,
    stop,
    clear,
    isActive: () => activeReasons.size > 0
  });
})();