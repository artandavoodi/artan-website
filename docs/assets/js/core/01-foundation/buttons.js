/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) BUTTON SELECTORS
   04) BUTTON NORMALIZATION
   05) PUBLIC API EXPORTS
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/buttons.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-buttons';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/buttons.js';

/* =============================================================================
   03) BUTTON SELECTORS
============================================================================= */
const BUTTON_SELECTORS = [
  '.menu-link',
  '.institutional-menu-link',
  '.institutional-link',
  '.footer-link',
  '.account-drawer-action',
  '.account-sign-in-drawer-action',
  '.account-sign-up-drawer-action',
  '.account-email-auth-drawer-action',
  '.account-phone-auth-drawer-action',
  '.cookie-consent-action'
].join(',');

/* =============================================================================
   04) BUTTON NORMALIZATION
============================================================================= */
function getNormalizedButtons(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(BUTTON_SELECTORS));
}

function isNormalizedButton(node) {
  return node instanceof Element && node.matches(BUTTON_SELECTORS);
}

function normalizeButtonPrimitive() {
  return;
}

function initButtonPrimitive() {
  return;
}

function bindButtonPrimitiveEvents() {
  return;
}

/* =============================================================================
   05) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanButtons = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  BUTTON_SELECTORS,
  getNormalizedButtons,
  isNormalizedButton,
  normalizeButtonPrimitive,
  initButtonPrimitive,
  bindButtonPrimitiveEvents
});

/* =============================================================================
   06) END OF FILE
============================================================================= */