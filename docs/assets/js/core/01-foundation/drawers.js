/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) DRAWER SELECTORS
   04) PASSIVE HELPERS
   05) PUBLIC API EXPORTS
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/drawers.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-drawers';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/drawers.js';

/* =============================================================================
   03) DRAWER SELECTORS
============================================================================= */
const DRAWER_ROOT_SELECTORS = [
  '.account-drawer',
  '.account-sign-in-drawer',
  '.account-sign-up-drawer',
  '.account-email-auth-drawer',
  '.account-phone-auth-drawer'
].join(',');

/* =============================================================================
   04) PASSIVE HELPERS
   Core must not alter layer-owned drawer visibility, shell state, or transitions.
============================================================================= */
function getDrawerRoots(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(DRAWER_ROOT_SELECTORS));
}

function initDrawerPrimitive() {
  return;
}

function bindDrawerPrimitiveEvents() {
  return;
}

/* =============================================================================
   05) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanDrawers = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  DRAWER_ROOT_SELECTORS,
  getDrawerRoots,
  initDrawerPrimitive,
  bindDrawerPrimitiveEvents
});

/* =============================================================================
   06) END OF FILE
============================================================================= */
