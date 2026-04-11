/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) CLOSE BUTTON SELECTORS
   04) CLOSE BUTTON NORMALIZATION
   05) PUBLIC API EXPORTS
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/close-button.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-close-button';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/close-button.js';

/* =============================================================================
   03) CLOSE BUTTON SELECTORS
============================================================================= */
const CLOSE_BUTTON_SELECTORS = [
  '.account-drawer-close',
  '.account-sign-in-drawer-close',
  '.account-sign-up-drawer-close',
  '.account-email-auth-drawer-close',
  '.account-phone-auth-drawer-close',
  '.country-overlay-close'
].join(',');

/* =============================================================================
   04) CLOSE BUTTON NORMALIZATION
============================================================================= */
function getCloseButtons(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(CLOSE_BUTTON_SELECTORS));
}

function isCloseButtonPrimitive(node) {
  return node instanceof Element && node.matches(CLOSE_BUTTON_SELECTORS);
}

function normalizeCloseButtonPrimitive(node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.dataset.closeButtonPrimitiveBound === 'true') return;

  if (node.tagName === 'BUTTON' && !node.getAttribute('type')) {
    node.setAttribute('type', 'button');
  }

  if (!node.hasAttribute('data-core-close-button')) {
    node.setAttribute('data-core-close-button', 'true');
  }

  node.dataset.closeButtonPrimitiveBound = 'true';
}

function initCloseButtonPrimitive(root = document) {
  const targets = root instanceof Element && isCloseButtonPrimitive(root)
    ? [root]
    : getCloseButtons(root);

  targets.forEach(normalizeCloseButtonPrimitive);
}

/* =============================================================================
   05) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanCloseButtons = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  CLOSE_BUTTON_SELECTORS,
  getCloseButtons,
  isCloseButtonPrimitive,
  normalizeCloseButtonPrimitive,
  initCloseButtonPrimitive
});

/* =============================================================================
   06) END OF FILE
============================================================================= */