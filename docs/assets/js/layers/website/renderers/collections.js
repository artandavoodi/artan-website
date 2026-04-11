/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) SELECTOR MAP
   03) SECTION RESOLUTION
   04) CORE MOTION RESOLUTION
   05) COLLECTION RECOVERY
   06) LIFECYCLE EVENT BINDING
   07) READINESS HELPERS
   08) BOOTSTRAP
   09) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  'use strict';

  const MODULE_PATH = '/website/docs/assets/js/layers/website/renderers/collections.js';
  let recoveryBound = false;

  window.__artanRunWhenReady = window.__artanRunWhenReady || ((bootFn) => {
    if (typeof bootFn !== 'function') return;

    const run = () => {
      try { bootFn(); } catch (_) {}
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  });

  /* =============================================================================
     02) SELECTOR MAP
  ============================================================================= */
  const SECTION_SELECTORS = [
    '#featured-products',
    '#featured-notes',
    '#featured-collections',
    '[data-featured-products]',
    '[data-featured-notes]',
    '.featured-products',
    '.featured-notes',
    '.featured-collections'
  ];

  const HEADER_SELECTORS = [
    '.featured-header',
    '.section-header',
    'header'
  ];

  const CARD_SELECTORS = [
    '.featured-card',
    '[data-featured-card]',
    '.collection-card',
    '.note-card',
    '.product-card'
  ];

  /* =============================================================================
     03) SECTION RESOLUTION
  ============================================================================= */
  const collectSections = (root = document) => {
    const out = [];
    for (const selector of SECTION_SELECTORS) {
      root.querySelectorAll(selector).forEach((node) => out.push(node));
    }
    return Array.from(new Set(out)).filter((node) => node instanceof Element);
  };

  const collectHeaders = (section) => {
    if (!(section instanceof Element)) return [];
    const out = [];
    for (const selector of HEADER_SELECTORS) {
      section.querySelectorAll(selector).forEach((node) => out.push(node));
    }
    return Array.from(new Set(out));
  };

  const collectCards = (section) => {
    if (!(section instanceof Element)) return [];
    const out = [];
    for (const selector of CARD_SELECTORS) {
      section.querySelectorAll(selector).forEach((node) => out.push(node));
    }
    return Array.from(new Set(out));
  };

  /* =============================================================================
     04) CORE MOTION RESOLUTION
  ============================================================================= */
  const getMotionApi = () => {
    return window.NeuroartanMotion || window.ARTAN_MOTION || null;
  };

  /* =============================================================================
     05) COLLECTION RECOVERY
  ============================================================================= */
  const recoverCollections = (root = document) => {
    const sections = collectSections(root);
    if (!sections.length) return;

    const motion = getMotionApi();

    sections.forEach((section) => {
      section.removeAttribute('hidden');
      section.setAttribute('data-collections-bound', 'true');
      section.style.removeProperty('display');
      section.style.removeProperty('opacity');
      section.style.removeProperty('visibility');

      const headers = collectHeaders(section);
      const cards = collectCards(section);

      headers.forEach((node) => {
        node.classList.add('motion-init');
        node.classList.add('motion-visible');
        node.dataset.motion = node.dataset.motion || 'lift';
        node.style.removeProperty('display');
        node.style.removeProperty('opacity');
        node.style.removeProperty('visibility');
      });

      cards.forEach((node, index) => {
        node.classList.add('motion-init');
        node.classList.add('motion-visible');
        node.dataset.motion = node.dataset.motion || 'lift';
        node.style.transitionDelay = `${Math.min(index * 120, 720)}ms`;
        node.style.removeProperty('display');
        node.style.removeProperty('opacity');
        node.style.removeProperty('visibility');
      });

      if (motion && typeof motion.initMotionPrimitive === 'function') {
        motion.initMotionPrimitive(section);
      }
    });

    document.dispatchEvent(new CustomEvent('neuroartan:collections-ready', {
      detail: {
        modulePath: MODULE_PATH,
        sectionCount: sections.length
      }
    }));
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
      recoverCollections(root);
    };

    document.addEventListener('fragment:mounted', recover);
    window.addEventListener('neuroartan:language-applied', recover);
    window.addEventListener('resize', recover, { passive: true });
  };

  /* =============================================================================
     07) READINESS HELPERS
  ============================================================================= */

  /* =============================================================================
     08) BOOTSTRAP
  ============================================================================= */
  const boot = () => {
    bindRecoveryEvents();
    recoverCollections(document);
  };

  window.__artanRunWhenReady(boot);
})();

/* =============================================================================
   09) END OF FILE
============================================================================= */