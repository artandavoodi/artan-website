/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) STATE
   03) SHEET QUERY HELPERS
   04) STATE VISIBILITY HELPERS
   05) OPEN / CLOSE HELPERS
   05A) INNER ROUTE REQUEST HELPERS
   06) OPEN REQUEST BINDING
   07) CLOSE REQUEST BINDING
   08) GLOBAL CLICK BINDING
   09) ROUTE REQUEST BINDING
   09A) INNER ROUTE CONTROLS
   10) ESCAPE BINDING
   11) EVENT REBINDING
   12) BOOTSTRAP
   13) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  'use strict';

  /* =============================================================================
     02) STATE
  ============================================================================= */
  let closeTimer = null;
  let bootBound = false;
  let mountEventsBound = false;

  /* =============================================================================
     03) SHEET QUERY HELPERS
  ============================================================================= */
  function getSheet() {
    return document.getElementById('account-provider-google-sheet');
  }

  function getMount() {
    return document.querySelector('[data-include="account-provider-google-sheet"]');
  }

  /* =============================================================================
     04) STATE VISIBILITY HELPERS
  ============================================================================= */
  function normalizeStateVisibility() {
    const sheet = getSheet();
    if (!sheet) return;

    const isOpen = sheet.classList.contains('is-open');
    sheet.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  }

  /* =============================================================================
     05) OPEN / CLOSE HELPERS
  ============================================================================= */
  function openSheet() {
    const sheet = getSheet();
    if (!sheet) return;

    window.clearTimeout(closeTimer);
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('account-provider-google-sheet-open');
  }

  function closeSheet() {
    const sheet = getSheet();
    if (!sheet) return;

    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('account-provider-google-sheet-open');
  }

  /* =============================================================================
     05A) INNER ROUTE REQUEST HELPERS
  ============================================================================= */
  function requestInnerView(action) {
    if (!action) return;

    document.dispatchEvent(new CustomEvent('account-layer:view-request', {
      detail: {
        source: 'account-provider-google-sheet',
        action
      }
    }));
  }

  /* =============================================================================
     06) OPEN REQUEST BINDING
  ============================================================================= */
  function bindOpenRequests() {
    if (document.documentElement.dataset.accountProviderGoogleSheetOpenBound === 'true') return;
    document.documentElement.dataset.accountProviderGoogleSheetOpenBound = 'true';

    document.addEventListener('account-provider-google-sheet:open-request', () => {
      openSheet();
    });
  }

  /* =============================================================================
     07) CLOSE REQUEST BINDING
  ============================================================================= */
  function bindCloseRequests() {
    if (document.documentElement.dataset.accountProviderGoogleSheetCloseBound === 'true') return;
    document.documentElement.dataset.accountProviderGoogleSheetCloseBound = 'true';

    document.addEventListener('account-provider-google-sheet:close-request', () => {
      closeSheet();
    });
  }

  /* =============================================================================
     08) GLOBAL CLICK BINDING
  ============================================================================= */
  function bindGlobalClicks() {
    if (document.documentElement.dataset.accountProviderGoogleSheetGlobalClickBound === 'true') return;
    document.documentElement.dataset.accountProviderGoogleSheetGlobalClickBound = 'true';

    document.addEventListener('click', (event) => {
      const sheet = getSheet();
      if (!sheet || !sheet.classList.contains('is-open')) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (sheet.contains(target)) return;
      if (target.closest('[data-account-provider-google-open]')) return;
      if (target.closest('[data-account-sign-in-open]')) return;
      if (target.closest('[data-account-route]')) return;

      closeSheet();
    });
  }

  /* =============================================================================
     09) ROUTE REQUEST BINDING
  ============================================================================= */
  function bindRouteRequests() {
    if (document.documentElement.dataset.accountProviderGoogleSheetRouteBound === 'true') return;
    document.documentElement.dataset.accountProviderGoogleSheetRouteBound = 'true';

    const handleGoogleRoute = (event) => {
      const route = event?.detail?.route || event?.detail?.action || '';
      if (route !== 'provider-google') return;
      openSheet();
    };

    document.addEventListener('account-drawer:route', handleGoogleRoute);
    document.addEventListener('account-layer:route-request', handleGoogleRoute);
    document.addEventListener('account-layer:view-request', handleGoogleRoute);
  }

  /* =============================================================================
     09A) INNER ROUTE CONTROLS
  ============================================================================= */
  function bindInnerRouteControls() {
    if (document.documentElement.dataset.accountProviderGoogleSheetInnerRouteBound === 'true') return;
    document.documentElement.dataset.accountProviderGoogleSheetInnerRouteBound = 'true';

    document.addEventListener('click', (event) => {
      const sheet = getSheet();
      if (!sheet || !sheet.classList.contains('is-open')) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const signInControl = target.closest('[data-account-sign-in-open], [data-account-route="sign-in"]');
      const entryControl = target.closest('[data-account-route="entry"]');
      const signUpControl = target.closest('[data-account-route="sign-up"]');
      const emailControl = target.closest('[data-account-route="email-auth"]');
      const phoneControl = target.closest('[data-account-route="phone-auth"]');

      if (signInControl) {
        event.preventDefault();
        event.stopPropagation();
        requestInnerView('sign-in');
        return;
      }

      if (signUpControl) {
        event.preventDefault();
        event.stopPropagation();
        requestInnerView('sign-up');
        return;
      }

      if (emailControl) {
        event.preventDefault();
        event.stopPropagation();
        requestInnerView('email-auth');
        return;
      }

      if (phoneControl) {
        event.preventDefault();
        event.stopPropagation();
        requestInnerView('phone-auth');
        return;
      }

      if (entryControl) {
        event.preventDefault();
        event.stopPropagation();
        requestInnerView('entry');
      }
    });
  }

  /* =============================================================================
     10) ESCAPE BINDING
  ============================================================================= */
  function bindEscape() {
    if (document.documentElement.dataset.accountProviderGoogleSheetEscapeBound === 'true') return;
    document.documentElement.dataset.accountProviderGoogleSheetEscapeBound = 'true';

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const sheet = getSheet();
      if (!sheet || !sheet.classList.contains('is-open')) return;
      closeSheet();
    });
  }

  /* =============================================================================
     11) EVENT REBINDING
  ============================================================================= */
  function bindMountEvents() {
    if (mountEventsBound) return;
    mountEventsBound = true;

    document.addEventListener('fragment:mounted', (event) => {
      const name = event?.detail?.name || '';
      if (name !== 'account-provider-google-sheet') return;

      document.documentElement.dataset.accountProviderGoogleSheetInitialized = 'false';
      init();
    });
  }

  /* =============================================================================
     12) BOOTSTRAP
  ============================================================================= */
  function init() {
    if (document.documentElement.dataset.accountProviderGoogleSheetInitialized === 'true' && getSheet()) return;
    document.documentElement.dataset.accountProviderGoogleSheetInitialized = 'true';

    normalizeStateVisibility();

    const sheet = getSheet();
    if (sheet) {
      if (!sheet.hasAttribute('aria-hidden')) {
        sheet.setAttribute('aria-hidden', 'true');
      }
      sheet.dataset.moduleId = 'account-provider-google-sheet';
      sheet.dataset.modulePath = '/website/docs/assets/js/layers/website/overlays/account/account-provider-google-sheet.js';
    }

    bindOpenRequests();
    bindCloseRequests();
    bindGlobalClicks();
    bindRouteRequests();
    bindInnerRouteControls();
    bindEscape();
  }

  function boot() {
    if (bootBound) return;

    bootBound = true;
    bindMountEvents();
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  /* =============================================================================
     13) END OF FILE
  ============================================================================= */
})();