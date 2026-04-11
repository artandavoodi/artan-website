/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) OVERLAY ROOT SELECTORS
   04) BODY LOCK HELPERS
   05) PASSIVE OVERLAY HELPERS
   06) PUBLIC API EXPORTS
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/overlays.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-overlays';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/overlays.js';

/* =============================================================================
   03) OVERLAY ROOT SELECTORS
============================================================================= */
const OVERLAY_ROOT_SELECTORS = [
  '.account-drawer',
  '.account-sign-in-drawer',
  '.account-sign-up-drawer',
  '.account-email-auth-drawer',
  '.account-phone-auth-drawer',
  '#country-overlay',
  '[data-cookie-consent="root"]'
].join(',');

const BODY_LOCK_CLASSES = [
  'account-drawer-open',
  'account-drawer-closing',
  'account-sign-in-drawer-open',
  'account-sign-in-drawer-closing',
  'account-sign-up-drawer-open',
  'account-sign-up-drawer-closing',
  'account-email-auth-drawer-open',
  'account-email-auth-drawer-closing',
  'account-phone-auth-drawer-open',
  'account-phone-auth-drawer-closing',
  'country-overlay-open',
  'country-overlay-closing'
];

/* =============================================================================
   04) BODY LOCK HELPERS
============================================================================= */
function bodyHasOverlayLock() {
  return BODY_LOCK_CLASSES.some((className) => document.body.classList.contains(className));
}

function normalizeBodyOverlayLock() {
  document.body.style.overflow = bodyHasOverlayLock() ? 'hidden' : '';
}

/* =============================================================================
   05) PASSIVE OVERLAY HELPERS
   Core must not mutate layer-owned overlay visibility or bind overlay lifecycle.
============================================================================= */
function getOverlayRoots(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(OVERLAY_ROOT_SELECTORS));
}

function isOverlayRoot(node) {
  return node instanceof Element && node.matches(OVERLAY_ROOT_SELECTORS);
}

function setOverlayVisibility() {
  return;
}

function normalizeOverlayRoot() {
  return;
}

function initOverlayPrimitive() {
  return;
}

function bindOverlayPrimitiveEvents() {
  return;
}

/* =============================================================================
   06) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanOverlays = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  OVERLAY_ROOT_SELECTORS,
  BODY_LOCK_CLASSES,
  getOverlayRoots,
  isOverlayRoot,
  setOverlayVisibility,
  normalizeOverlayRoot,
  initOverlayPrimitive,
  bodyHasOverlayLock,
  normalizeBodyOverlayLock,
  bindOverlayPrimitiveEvents
});

/* =============================================================================
   07) END OF FILE
============================================================================= */