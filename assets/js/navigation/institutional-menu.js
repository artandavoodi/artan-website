/* =================== Institutional Primary Menu =================== */

(function () {
  'use strict';

  function bindInstitutionalSecondaryToggle() {
    const trigger = document.getElementById('institutional-menu-secondary-toggle');
    const overlay = document.getElementById('menu-overlay');
    const legacyButton = document.getElementById('menu-button');

    if (!trigger || trigger.__neuroartanBound) return;
    trigger.__neuroartanBound = true;

    trigger.addEventListener('click', () => {
      if (legacyButton && typeof legacyButton.click === 'function') {
        legacyButton.click();
      }

      const isExpanded = overlay ? overlay.getAttribute('aria-hidden') === 'false' : false;
      trigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    if (overlay) {
      const syncState = () => {
        const isExpanded = overlay.getAttribute('aria-hidden') === 'false';
        trigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      };

      const observer = new MutationObserver(syncState);
      observer.observe(overlay, { attributes: true, attributeFilter: ['aria-hidden'] });
      syncState();
    }
  }

  function bindInstitutionalMenuRibbon() {
    const body = document.body;
    const hero = document.getElementById('home-hero');
    const stage = document.querySelector('.stage-circle');
    const menu = document.getElementById('institutional-menu');

    const essence = document.getElementById('home-essence');

    const getPageTop = (el) => {
      const rect = el.getBoundingClientRect();
      const pageY = window.scrollY || window.pageYOffset || 0;
      return rect.top + pageY;
    };

    const getOuterHeight = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.height || el.offsetHeight || window.innerHeight || 0;
    };

    if (!body || !menu || menu.__neuroartanRibbonBound) return;
    menu.__neuroartanRibbonBound = true;
    body.classList.remove('menu-ribbon-active');

    const applyRibbonState = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;

      let threshold = Number.POSITIVE_INFINITY;

      if (essence) {
        const essenceTop = getPageTop(essence);
        threshold = essenceTop + 48;
      } else if (hero) {
        const heroBottom = getPageTop(hero) + getOuterHeight(hero);
        threshold = heroBottom + 220;
      } else if (stage) {
        const stageBottom = getPageTop(stage) + getOuterHeight(stage);
        threshold = stageBottom + 220;
      }

      if (!Number.isFinite(threshold)) {
        threshold = Number.POSITIVE_INFINITY;
      }

      body.classList.toggle('menu-ribbon-active', scrollY > threshold);
    };

    let ticking = false;
    const requestApply = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        applyRibbonState();
        ticking = false;
      });
    };

    window.addEventListener('scroll', requestApply, { passive: true });
    window.addEventListener('resize', requestApply, { passive: true });
    window.addEventListener('orientationchange', requestApply, { passive: true });

    window.addEventListener('load', requestApply, { passive: true, once: true });
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(requestApply);
    });
    requestApply();
  }

  function initInstitutionalMenu() {
    bindInstitutionalSecondaryToggle();
    bindInstitutionalMenuRibbon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstitutionalMenu, { once: true });
  } else {
    initInstitutionalMenu();
  }
})();