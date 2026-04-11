/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) SELECTOR MAP
   03) SECTION RESOLUTION
   04) CORE MOTION RESOLUTION
   05) SECTION RECOVERY
   06) LIFECYCLE EVENT BINDING
   07) BOOTSTRAP
   08) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  'use strict';

  const MODULE_PATH = '/website/docs/assets/js/layers/website/sections/updates.js';
  let recoveryBound = false;

  /* =============================================================================
     02) SELECTOR MAP
  ============================================================================= */
  const SECTION_SELECTORS = [
    '#home-updates-chapter',
    '.home-updates-chapter',
    '#updates',
    '#updates-section',
    '[data-updates-section]',
    '.updates-section'
  ];

  const HEADER_SELECTORS = [
    '.updates-header',
    '.featured-header',
    '.home-title',
    'header'
  ];

  const CARD_SELECTORS = [
    '.update-card',
    '.updates-card',
    '.featured-card',
    '.home-text',
    '[data-update-card]'
  ];

  /* =============================================================================
     03) SECTION RESOLUTION
  ============================================================================= */
  const resolveSection = (root = document) => {
    for (const selector of SECTION_SELECTORS) {
      const node = root.querySelector(selector);
      if (node) return node;
    }
    return null;
  };

  const collectCards = (section) => {
    if (!(section instanceof Element)) return [];
    const out = [];
    for (const selector of CARD_SELECTORS) {
      section.querySelectorAll(selector).forEach((node) => out.push(node));
    }
    return Array.from(new Set(out));
  };

  const collectHeaders = (section) => {
    if (!(section instanceof Element)) return [];
    const out = [];
    for (const selector of HEADER_SELECTORS) {
      section.querySelectorAll(selector).forEach((node) => out.push(node));
    }
    return Array.from(new Set(out));
  };

  /* =============================================================================
     04) CORE MOTION RESOLUTION
  ============================================================================= */
  const getMotionApi = () => {
    return window.NeuroMotion || window.NeuroartanMotion || window.ARTAN_MOTION || null;
  };

  /* =============================================================================
     05) SECTION RECOVERY
  ============================================================================= */
  const scanUpdates = (root = document) => {
    const section = resolveSection(root) || resolveSection(document);
    if (!(section instanceof Element)) return;

    section.removeAttribute('hidden');
    section.setAttribute('data-updates-bound', 'true');
    section.style.removeProperty('display');
    section.style.removeProperty('opacity');
    section.style.removeProperty('visibility');

    const headers = collectHeaders(section);
    const cards = collectCards(section);
    const motion = getMotionApi();

    headers.forEach((node) => {
      node.classList.add('motion-init');
      node.classList.add('motion-visible');
      node.style.removeProperty('display');
      node.style.removeProperty('opacity');
      node.style.removeProperty('visibility');
    });

    cards.forEach((node) => {
      node.classList.add('motion-init');
      node.classList.add('motion-visible');
      node.style.removeProperty('display');
      node.style.removeProperty('opacity');
      node.style.removeProperty('visibility');
    });

    if (motion && typeof motion.scan === 'function') {
      motion.scan(section);
    } else if (motion && typeof motion.initMotionPrimitive === 'function') {
      motion.initMotionPrimitive(section);
    }

    document.dispatchEvent(new CustomEvent('neuroartan:updates-ready', {
      detail: {
        modulePath: MODULE_PATH,
        sectionId: section.id || null,
        headerCount: headers.length,
        cardCount: cards.length
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
      scanUpdates(root);
    };

    document.addEventListener('fragment:mounted', recover);
    window.addEventListener('neuroartan:language-applied', recover);
    window.addEventListener('resize', recover, { passive: true });
  };

  /* =============================================================================
     07) BOOTSTRAP
  ============================================================================= */
  const boot = () => {
    bindRecoveryEvents();
    scanUpdates(document);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* =============================================================================
   08) END OF FILE
============================================================================= */