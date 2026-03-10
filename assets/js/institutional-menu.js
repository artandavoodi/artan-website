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

  function initInstitutionalMenu() {
    bindInstitutionalSecondaryToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstitutionalMenu, { once: true });
  } else {
    initInstitutionalMenu();
  }
})();