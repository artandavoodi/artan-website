/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) DOM HELPERS
   03) DRAWER QUERIES
   03A) AUTH / PROFILE QUERIES
   03B) AUTH / PROFILE STATE APPLICATION
   03C) STATE METADATA APPLICATION
   03D) EVENT DETAIL NORMALIZATION
   04) STATE FLAGS
   04A) TIMING CONSTANTS
   04B) STATE GUARDS
   05) CLOSE CONTROL QUERIES
   05A) SUPPORT LINK QUERIES
   06) OPEN STATE APPLICATION
   07) CLOSE STATE APPLICATION
   08) ESCAPE KEY BINDING
   09) CLOSE CONTROL BINDING
   10) OPEN REQUEST BINDING
   10A) AUTH / PROFILE REQUEST BINDING
   10B) GUEST ENTRY REQUEST BINDING
   10C) OPEN REQUEST DETAIL ROUTING
   10D) CONSENT SETTINGS REQUEST BINDING
   10E) CLOSE REQUEST BINDING
   11) INITIALIZATION
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  'use strict';

  /* =============================================================================
     02) DOM HELPERS
  ============================================================================= */
  function q(selector, root = document) {
    return root.querySelector(selector);
  }

  function qa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  /* =============================================================================
     03) DRAWER QUERIES
  ============================================================================= */
  function getDrawer() {
    return q('[data-account-drawer="true"]');
  }

  function getDrawerShell() {
    const drawer = getDrawer();
    return drawer ? q('.account-drawer-shell', drawer) : null;
  }

  /* =============================================================================
     03A) AUTH / PROFILE QUERIES
  ============================================================================= */
  function getAuthState() {
    const drawer = getDrawer();
    return drawer ? q('[data-auth-state]', drawer) : null;
  }

  function getProfileState() {
    const drawer = getDrawer();
    return drawer ? q('[data-profile-state]', drawer) : null;
  }

  /* =============================================================================
     03B) AUTH / PROFILE STATE APPLICATION
  ============================================================================= */
  function showAuthState() {
    const authState = getAuthState();
    const profileState = getProfileState();

    if (authState) {
      authState.hidden = false;
      authState.dataset.authState = 'guest';
      authState.dataset.authSurface = 'entry';
    }

    if (profileState) {
      profileState.hidden = true;
      profileState.dataset.profileState = 'empty';
    }
    applyDrawerStateMetadata('auth');
  }

  function showProfileState() {
    const authState = getAuthState();
    const profileState = getProfileState();

    if (authState) {
      authState.hidden = true;
    }

    if (profileState) {
      profileState.hidden = false;
      profileState.dataset.profileState = 'ready';
    }
    applyDrawerStateMetadata('profile');
  }

  /* =============================================================================
     03C) STATE METADATA APPLICATION
  ============================================================================= */
  function applyDrawerStateMetadata(state) {
    const drawer = getDrawer();
    if (!drawer) return;

    if (state === 'profile') {
      drawer.dataset.accountDrawerView = 'profile';
      return;
    }

    drawer.dataset.accountDrawerView = 'auth';
  }

  /* =============================================================================
     03D) EVENT DETAIL NORMALIZATION
  ============================================================================= */
  function getEventDetail(event) {
    return event && event.detail && typeof event.detail === 'object'
      ? event.detail
      : {};
  }

  function clearCloseTimer() {
    if (!closeTimer) return;
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  /* =============================================================================
     04) STATE FLAGS
  ============================================================================= */
  let isOpen = false;
  let isBound = false;

  /* =============================================================================
     04A) TIMING CONSTANTS
  ============================================================================= */
  const CLOSE_DURATION_MS = 460;
  let closeTimer = null;

  /* =============================================================================
     04B) STATE GUARDS
  ============================================================================= */
  function isDrawerClosing() {
    return document.body.classList.contains('account-drawer-closing');
  }

  /* =============================================================================
     05) CLOSE CONTROL QUERIES
  ============================================================================= */
  function getCloseControls() {
    const drawer = getDrawer();
    return drawer ? qa('[data-account-drawer-close="true"]', drawer) : [];
  }

  /* =============================================================================
     05A) SUPPORT LINK QUERIES
  ============================================================================= */
  function getConsentSettingsLinks() {
    const drawer = getDrawer();
    return drawer ? qa('a[href="#cookie-consent-mount"]', drawer) : [];
  }

  /* =============================================================================
     06) OPEN STATE APPLICATION
  ============================================================================= */
  function openDrawer() {
    const drawer = getDrawer();
    if (!drawer) return;

    if (isOpen && !isDrawerClosing()) return;

    clearCloseTimer();
    drawer.removeAttribute('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.dataset.accountDrawerState = 'open';
    document.body.classList.remove('account-drawer-closing');
    document.body.classList.add('account-drawer-open');
    isOpen = true;

    document.dispatchEvent(new CustomEvent('account-drawer:opened', {
      detail: {
        source: 'account-drawer'
      }
    }));
  }

  /* =============================================================================
     07) CLOSE STATE APPLICATION
  ============================================================================= */
  function closeDrawer() {
    const drawer = getDrawer();
    if (!drawer) return;

    if (!isOpen && !isDrawerClosing()) return;

    clearCloseTimer();
    drawer.dataset.accountDrawerState = 'closing';
    document.body.classList.remove('account-drawer-open');
    document.body.classList.add('account-drawer-closing');
    drawer.setAttribute('aria-hidden', 'true');
    isOpen = false;

    closeTimer = window.setTimeout(() => {
      drawer.dataset.accountDrawerState = 'closed';
      drawer.setAttribute('hidden', 'hidden');
      document.body.classList.remove('account-drawer-closing');
      closeTimer = null;

      document.dispatchEvent(new CustomEvent('account-drawer:closed', {
        detail: {
          source: 'account-drawer'
        }
      }));
    }, CLOSE_DURATION_MS);
  }

  /* =============================================================================
     08) ESCAPE KEY BINDING
  ============================================================================= */
  function bindEscapeKey() {
    if (document.documentElement.dataset.accountDrawerEscapeBound === 'true') return;
    document.documentElement.dataset.accountDrawerEscapeBound = 'true';

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!isOpen) return;
      closeDrawer();
    });
  }

  /* =============================================================================
     09) CLOSE CONTROL BINDING
  ============================================================================= */
  function bindCloseControls() {
    getCloseControls().forEach((control) => {
      if (control.dataset.accountDrawerCloseBound === 'true') return;
      control.dataset.accountDrawerCloseBound = 'true';

      control.addEventListener('click', (event) => {
        event.preventDefault();
        closeDrawer();
      });
    });
  }

  /* =============================================================================
     10) OPEN REQUEST BINDING
  ============================================================================= */
  function bindOpenRequests() {
    if (document.documentElement.dataset.accountDrawerOpenRequestBound === 'true') return;
    document.documentElement.dataset.accountDrawerOpenRequestBound = 'true';

    document.addEventListener('account-drawer:open-request', (event) => {
      routeOpenRequest(event);
    });
  }

  /* =============================================================================
     10A) AUTH / PROFILE REQUEST BINDING
  ============================================================================= */
  function bindAuthProfileRequests() {
    if (document.documentElement.dataset.accountDrawerStateRequestBound === 'true') return;
    document.documentElement.dataset.accountDrawerStateRequestBound = 'true';

    document.addEventListener('account-drawer:show-auth', (event) => {
      const detail = getEventDetail(event);
      showAuthState();

      const authState = getAuthState();
      if (authState && detail.surface) {
        authState.dataset.authSurface = detail.surface;
      }
    });

    document.addEventListener('account-drawer:show-profile', () => {
      showProfileState();
    });
  }

  /* =============================================================================
     10B) GUEST ENTRY REQUEST BINDING
  ============================================================================= */
  function bindGuestEntryRequests() {
    if (document.documentElement.dataset.accountDrawerGuestEntryBound === 'true') return;
    document.documentElement.dataset.accountDrawerGuestEntryBound = 'true';

    document.addEventListener('account-drawer:guest-entry', (event) => {
      const detail = getEventDetail(event);
      showAuthState();

      const authState = getAuthState();
      if (authState && detail.surface) {
        authState.dataset.authSurface = detail.surface;
      }

      openDrawer();
    });
  }

  /* =============================================================================
     10C) OPEN REQUEST DETAIL ROUTING
  ============================================================================= */
  function routeOpenRequest(event) {
    const detail = getEventDetail(event);
    const requestedState = detail.state;
    const requestedSurface = detail.surface;

    if (requestedState === 'profile') {
      showProfileState();
      openDrawer();
      return;
    }

    showAuthState();

    const authState = getAuthState();
    if (authState && requestedSurface) {
      authState.dataset.authSurface = requestedSurface;
    }

    openDrawer();
  }

  /* =============================================================================
     10D) CONSENT SETTINGS REQUEST BINDING
  ============================================================================= */
  function bindConsentSettingsRequests() {
    getConsentSettingsLinks().forEach((link) => {
      if (link.dataset.cookieConsentBound === 'true') return;
      link.dataset.cookieConsentBound = 'true';

      link.addEventListener('click', (event) => {
        event.preventDefault();

        document.dispatchEvent(new CustomEvent('cookie-consent:open-request', {
          detail: {
            source: 'account-drawer',
            surface: 'settings'
          }
        }));
      });
    });
  }

  /* =============================================================================
     10E) CLOSE REQUEST BINDING
  ============================================================================= */
  function bindCloseRequests() {
    if (document.documentElement.dataset.accountDrawerCloseRequestBound === 'true') return;
    document.documentElement.dataset.accountDrawerCloseRequestBound = 'true';

    document.addEventListener('account-drawer:close-request', () => {
      closeDrawer();
    });
  }

  /* =============================================================================
     11) INITIALIZATION
  ============================================================================= */
  function initAccountDrawer() {
    const drawer = getDrawer();
    const shell = getDrawerShell();
    if (!drawer || !shell) return;
    if (isBound) return;

    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('hidden', 'hidden');
    drawer.dataset.accountDrawerState = 'closed';
    showAuthState();
    isBound = true;

    bindEscapeKey();
    bindCloseControls();
    bindOpenRequests();
    bindAuthProfileRequests();
    bindGuestEntryRequests();
    bindConsentSettingsRequests();
    bindCloseRequests();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountDrawer, { once: true });
  } else {
    initAccountDrawer();
  }

  document.addEventListener('account-drawer:mounted', initAccountDrawer);
})();