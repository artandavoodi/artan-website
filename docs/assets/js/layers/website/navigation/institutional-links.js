/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) SELECTORS
   03) MODULE STATE
   04) SHARED AUTHORITIES
   04A) REVEAL HELPERS
   05) INSTITUTIONAL LINKS SCAN
   06) INSTITUTIONAL LINKS REVEAL
   07) EVENT BINDING
   08) BOOTSTRAP
   09) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/navigation/institutional-links.js */

(() => {
  'use strict';

  /* =============================================================================
     02) SELECTORS
  ============================================================================= */
  const ROOT_SELECTOR = '.institutional-links';
  const MOTION_TARGET_SELECTOR = [
    '.institutional-links-column',
    '.institutional-links-social-row',
    '.institutional-links-separator-row'
  ].join(',');

  /* =============================================================================
     03) MODULE STATE
  ============================================================================= */
  let bootBound = false;

  /* =============================================================================
     04) SHARED AUTHORITIES
  ============================================================================= */
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

  function getCoreMotionApi() {
    return window.NeuroMotion || null;
  }

  /* =============================================================================
     04A) REVEAL HELPERS
  ============================================================================= */
  function initRevealGroup(root = document, config = {}) {
    const {
      sectionSelector,
      itemSelector,
      initializedKey,
      threshold = 0.18,
      rootMargin = '0px 0px -10% 0px'
    } = config;

    if (!sectionSelector || !itemSelector || !initializedKey) return;

    const scope = root instanceof Element || root instanceof Document ? root : document;
    const section = scope.matches?.(sectionSelector)
      ? scope
      : scope.querySelector?.(sectionSelector);

    if (!section || section.dataset[initializedKey] === 'true') return;

    const items = section.querySelectorAll(itemSelector);
    if (!items.length) return;

    items.forEach((item) => item.classList.add('motion-init'));

    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('motion-visible'));
      section.dataset[initializedKey] = 'true';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > threshold) {
            entry.target.classList.add('motion-visible');
          } else {
            entry.target.classList.remove('motion-visible');
          }
        });
      },
      {
        threshold: [0, threshold, 0.32, 0.5],
        rootMargin
      }
    );

    items.forEach((item) => observer.observe(item));
    section.dataset[initializedKey] = 'true';
  }

  /* =============================================================================
     05) INSTITUTIONAL LINKS SCAN
  ============================================================================= */
  function scanInstitutionalLinks(scope = document) {
    const roots = [];

    if (scope instanceof Element && scope.matches(ROOT_SELECTOR)) {
      roots.push(scope);
    }

    if (scope.querySelectorAll) {
      roots.push(...scope.querySelectorAll(ROOT_SELECTOR));
    }

    if (!roots.length) return;

    const motionApi = getCoreMotionApi();

    roots.forEach((root) => {
      root.querySelectorAll(MOTION_TARGET_SELECTOR).forEach((node) => {
        if (node instanceof HTMLElement) {
          node.dataset.motion = node.dataset.motion || 'institutional-links';
        }
      });

      if (motionApi && typeof motionApi.scan === 'function') {
        motionApi.scan(root);
      }
    });
  }

  /* =============================================================================
     06) INSTITUTIONAL LINKS REVEAL
  ============================================================================= */
  function initInstitutionalLinksReveal(scope = document) {
    initRevealGroup(scope, {
      sectionSelector: ROOT_SELECTOR,
      itemSelector: MOTION_TARGET_SELECTOR,
      initializedKey: 'motionInitialized'
    });
  }

  /* =============================================================================
     07) EVENT BINDING
  ============================================================================= */
  function bindInstitutionalLinksEvents() {
    if (document.documentElement.dataset.institutionalLinksEventsBound === 'true') return;
    document.documentElement.dataset.institutionalLinksEventsBound = 'true';

    document.addEventListener('fragment:mounted', (event) => {
      const name = event?.detail?.name || '';
      const detailRoot = event?.detail?.root;
      const root = detailRoot instanceof Element ? detailRoot : document;

      if (name === 'institutional-links' || root.matches?.(ROOT_SELECTOR) || root.querySelector?.(ROOT_SELECTOR)) {
        scanInstitutionalLinks(root);
        initInstitutionalLinksReveal(root);
      }
    });

    window.addEventListener('neuroartan:motion-ready', () => {
      scanInstitutionalLinks(document);
      initInstitutionalLinksReveal(document);
    });

    document.addEventListener('neuroartan:runtime-ready', () => {
      scanInstitutionalLinks(document);
      initInstitutionalLinksReveal(document);
    });
  }

  /* =============================================================================
     08) BOOTSTRAP
     - Legacy and new runtime layers may mount fragments before or after this file boots.
     - This module binds once and rescans when institutional links arrive.
  ============================================================================= */
  function boot() {
    if (bootBound) return;

    bootBound = true;
    bindInstitutionalLinksEvents();
    scanInstitutionalLinks(document);
    initInstitutionalLinksReveal(document);
  }

  window.__artanRunWhenReady(boot);
})();

/* =============================================================================
   09) END OF FILE
============================================================================= */