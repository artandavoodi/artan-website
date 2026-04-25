/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) FOOTER RESOLUTION
   04) FOOTER REVEAL CONTROLLER
   05) EVENT BINDING
   06) BOOTSTRAP
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/navigation/footer.js */

(() => {
  'use strict';

  /* =============================================================================
     02) MODULE REGISTRATION
  ============================================================================= */
  const MODULE_PATH = '/website/docs/assets/js/layers/website/navigation/footer.js';
  let observer = null;
  let bootBound = false;

  /* =============================================================================
     03) FOOTER RESOLUTION
  ============================================================================= */
  const getFooterNode = () => {
    return document.querySelector('.site-footer');
  };

  const hasFooterDom = () => {
    return !!getFooterNode();
  };

  /* =============================================================================
     04) FOOTER REVEAL CONTROLLER
  ============================================================================= */
  const setFooterVisibleState = (footer, visible) => {
    if (!(footer instanceof Element)) return;
    footer.classList.toggle('footer-visible', !!visible);
  };

  const initFooterReveal = () => {
    const footer = getFooterNode();
    if (!footer) return false;

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if (!('IntersectionObserver' in window)) {
      setFooterVisibleState(footer, true);

      document.dispatchEvent(
        new CustomEvent('neuroartan:footer-reveal-ready', {
          detail: {
            modulePath: MODULE_PATH
          }
        })
      );

      return true;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setFooterVisibleState(footer, entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(footer);

    const rect = footer.getBoundingClientRect();
    setFooterVisibleState(footer, rect.top < window.innerHeight && rect.bottom > 0);

    document.dispatchEvent(
      new CustomEvent('neuroartan:footer-reveal-ready', {
        detail: {
          modulePath: MODULE_PATH
        }
      })
    );

    return true;
  };

  /* =============================================================================
     05) EVENT BINDING
  ============================================================================= */
  const bindFooterEvents = () => {
    if (document.documentElement.dataset.footerRevealEventsBound === 'true') return;
    document.documentElement.dataset.footerRevealEventsBound = 'true';

    document.addEventListener('footer-mounted', () => {
      initFooterReveal();
    });

    document.addEventListener('neuroartan:footer-mounted', () => {
      initFooterReveal();
    });

    document.addEventListener('fragment:mounted', (event) => {
      const name = event?.detail?.name || '';
      if (!['footer', 'home-footer', 'profile-private-footer', 'profile-public-footer'].includes(name)) return;
      initFooterReveal();
    });
  };

  /* =============================================================================
     06) BOOTSTRAP
     - Legacy main.js owns footer injection.
     - This module must bind once and re-run when footer arrives.
  ============================================================================= */
  const boot = () => {
    if (bootBound) return;

    bootBound = true;
    bindFooterEvents();

    if (hasFooterDom()) {
      initFooterReveal();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* =============================================================================
   07) END OF FILE
============================================================================= */