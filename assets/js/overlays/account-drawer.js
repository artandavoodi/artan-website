/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) DOM HELPERS
   03) DRAWER QUERIES
   04) STATE FLAGS
   05) CLOSE CONTROL QUERIES
   06) OPEN STATE APPLICATION
   07) CLOSE STATE APPLICATION
   08) ESCAPE KEY BINDING
   09) CLOSE CONTROL BINDING
   10) OPEN REQUEST BINDING
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
     04) STATE FLAGS
  ============================================================================= */
  let isOpen = false;
  let isBound = false;

  /* =============================================================================
     05) CLOSE CONTROL QUERIES
  ============================================================================= */
  function getCloseControls() {
    const drawer = getDrawer();
    return drawer ? qa('[data-account-drawer-close="true"]', drawer) : [];
  }

  /* =============================================================================
     06) OPEN STATE APPLICATION
  ============================================================================= */
  function openDrawer() {
    const drawer = getDrawer();
    if (!drawer) return;

    document.body.classList.add('account-drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
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

    document.body.classList.remove('account-drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    isOpen = false;

    document.dispatchEvent(new CustomEvent('account-drawer:closed', {
      detail: {
        source: 'account-drawer'
      }
    }));
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

    document.addEventListener('account-drawer:open-request', () => {
      openDrawer();
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
    isBound = true;

    bindEscapeKey();
    bindCloseControls();
    bindOpenRequests();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccountDrawer, { once: true });
  } else {
    initAccountDrawer();
  }

  document.addEventListener('account-drawer:mounted', initAccountDrawer);
})();