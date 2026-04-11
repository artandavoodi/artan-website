/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) SELECTOR MAP
   04) CORE MOTION RESOLUTION
   05) SECTION RECOVERY
   06) LIFECYCLE EVENT BINDING
   07) BOOTSTRAP
   08) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/sections/promotions.js */

(() => {
  'use strict';

  /* =============================================================================
     02) MODULE REGISTRATION
  ============================================================================= */
  const MODULE_PATH = '/website/docs/assets/js/layers/website/sections/promotions.js';
  let recoveryBound = false;
  let bootBound = false;

  /* =============================================================================
     03) SELECTOR MAP
  ============================================================================= */
  const SECTION_SELECTORS = [
    '#home-featured-chapter',
    '.home-featured-chapter',
    '#featured-products',
    '#featured-notes',
    '.promotions',
    '.home-promotions',
    '[data-section="promotions"]',
    '[data-promotions-section]'
  ].join(',');

  const MOTION_TARGET_SELECTORS = [
    '[data-motion]',
    '.motion-init',
    '.promotion-card',
    '.promotions-card',
    '.promotions-item',
    '.promotions-header',
    '.promotions-grid',
    '.promotions-cta',
    '.featured-header',
    '.featured-grid',
    '.notes-list',
    '.notes-item'
  ].join(',');

  /* =============================================================================
     04) CORE MOTION RESOLUTION
  ============================================================================= */
  const getCoreMotionApi = () => window.NeuroMotion || null;

  const getSectionRoots = (root = document) => {
    const scope = root instanceof Element || root instanceof Document ? root : document;
    const roots = [];

    if (scope instanceof Element && scope.matches(SECTION_SELECTORS)) {
      roots.push(scope);
    }

    if (scope.querySelectorAll) {
      roots.push(...scope.querySelectorAll(SECTION_SELECTORS));
    }

    return Array.from(new Set(roots));
  };

  /* =============================================================================
     05) SECTION RECOVERY
  ============================================================================= */
  const scanPromotions = (root = document) => {
    const motionApi = getCoreMotionApi();
    const sections = getSectionRoots(root);

    sections.forEach((section) => {
      if (section instanceof HTMLElement) {
        section.hidden = false;
        section.style.removeProperty('display');
        section.style.removeProperty('visibility');
        section.style.removeProperty('opacity');
      }

      const targets = section.querySelectorAll(MOTION_TARGET_SELECTORS);
      targets.forEach((node) => {
        if (node instanceof HTMLElement) {
          node.dataset.motion = node.dataset.motion || 'promotions';
        }
      });

      if (motionApi && typeof motionApi.scan === 'function') {
        motionApi.scan(section);
      } else {
        targets.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.classList.add('motion-visible');
          }
        });
      }
    });

    if (sections.length) {
      document.dispatchEvent(
        new CustomEvent('neuroartan:promotions-ready', {
          detail: {
            modulePath: MODULE_PATH,
            sections: sections.length
          }
        })
      );
    }
  };

  /* =============================================================================
     06) LIFECYCLE EVENT BINDING
  ============================================================================= */
  const bindRecoveryEvents = () => {
    if (recoveryBound) return;
    recoveryBound = true;

    const recover = (event) => {
      const detailRoot = event?.detail?.root;
      const root = detailRoot instanceof Element ? detailRoot : document;
      scanPromotions(root);
    };

    document.addEventListener('fragment:mounted', recover);
    document.addEventListener('neuroartan:language-applied', recover);
    window.addEventListener('resize', recover, { passive: true });
  };

  /* =============================================================================
     07) BOOTSTRAP
  ============================================================================= */
  const boot = () => {
    if (bootBound) {
      scanPromotions(document);
      return;
    }

    bootBound = true;
    bindRecoveryEvents();
    scanPromotions(document);
  };

  document.addEventListener('fragment:mounted', boot);
  document.addEventListener('neuroartan:runtime-ready', boot);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* =============================================================================
   08) END OF FILE
============================================================================= */