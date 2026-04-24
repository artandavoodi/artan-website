/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) TOGGLE SELECTORS
   03) TOGGLE HELPERS
   04) TOGGLE STATE SYNC
   05) TOGGLE INTERACTION BINDING
   06) TOGGLE INITIALIZATION
   07) PUBLIC API EXPORTS
   08) AUTO-BOOTSTRAP
   09) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/toggle.js */

/* =============================================================================
   02) TOGGLE SELECTORS
============================================================================= */
const TOGGLE_ROOT_SELECTOR = [
  '[data-na-toggle]',
  '.na-toggle',
  '.ui-toggle'
].join(',');

const TOGGLE_TRACK_SELECTOR = [
  '[data-na-toggle-track]',
  '.na-toggle__track',
  '.ui-toggle__track'
].join(',');

const TOGGLE_THUMB_SELECTOR = [
  '[data-na-toggle-thumb]',
  '.na-toggle__thumb',
  '.ui-toggle__thumb'
].join(',');

/* =============================================================================
   03) TOGGLE HELPERS
============================================================================= */
function getNormalizedToggles(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(TOGGLE_ROOT_SELECTOR));
}

function isToggleRoot(node) {
  return node instanceof HTMLElement && node.matches(TOGGLE_ROOT_SELECTOR);
}

function getToggleTrack(toggle) {
  if (!isToggleRoot(toggle)) return null;
  return toggle.querySelector(TOGGLE_TRACK_SELECTOR);
}

function getToggleThumb(toggle) {
  if (!isToggleRoot(toggle)) return null;
  return toggle.querySelector(TOGGLE_THUMB_SELECTOR);
}

function readToggleChecked(toggle) {
  if (!isToggleRoot(toggle)) return false;

  const ariaChecked = toggle.getAttribute('aria-checked');
  if (ariaChecked === 'true') return true;
  if (ariaChecked === 'false') return false;

  const dataEnabled = toggle.getAttribute('data-cookie-consent-enabled');
  if (dataEnabled === 'true') return true;
  if (dataEnabled === 'false') return false;

  const dataChecked = toggle.getAttribute('data-toggle-checked');
  if (dataChecked === 'true') return true;
  if (dataChecked === 'false') return false;

  return false;
}

function isToggleDisabled(toggle) {
  if (!isToggleRoot(toggle)) return true;
  return toggle.hasAttribute('disabled') || toggle.getAttribute('aria-disabled') === 'true';
}

function normalizeToggle(toggle) {
  if (!isToggleRoot(toggle)) return;

  if (!toggle.hasAttribute('role')) {
    toggle.setAttribute('role', 'switch');
  }

  if (!toggle.hasAttribute('type') && toggle.tagName.toLowerCase() === 'button') {
    toggle.setAttribute('type', 'button');
  }

  if (!toggle.dataset.toggleInitialized) {
    toggle.dataset.toggleInitialized = 'true';
  }

  syncToggleState(toggle, readToggleChecked(toggle), { emit: false });
}

/* =============================================================================
   04) TOGGLE STATE SYNC
============================================================================= */
function syncToggleState(toggle, checked, options = {}) {
  if (!isToggleRoot(toggle)) return;

  const nextChecked = Boolean(checked);
  const emit = options.emit !== false;
  const detail = {
    checked: nextChecked,
    key: toggle.getAttribute('data-toggle-key') || '',
    scope: toggle.getAttribute('data-toggle-scope') || '',
    source: options.source || 'core-toggle',
    element: toggle
  };

  toggle.setAttribute('aria-checked', nextChecked ? 'true' : 'false');
  toggle.setAttribute('data-toggle-checked', nextChecked ? 'true' : 'false');
  toggle.dataset.toggleState = nextChecked ? 'on' : 'off';
  toggle.setAttribute('data-cookie-consent-enabled', nextChecked ? 'true' : 'false');

  const track = getToggleTrack(toggle);
  const thumb = getToggleThumb(toggle);

  if (track instanceof HTMLElement) {
    track.setAttribute('data-toggle-state', nextChecked ? 'on' : 'off');
  }

  if (thumb instanceof HTMLElement) {
    thumb.setAttribute('data-toggle-state', nextChecked ? 'on' : 'off');
  }

  if (emit) {
    toggle.dispatchEvent(new CustomEvent('neuroartan:toggle-changed', {
      bubbles: true,
      detail
    }));

    document.dispatchEvent(new CustomEvent('neuroartan:toggle-changed', {
      detail
    }));
  }
}

function toggleToggleState(toggle, options = {}) {
  if (!isToggleRoot(toggle)) return;
  if (isToggleDisabled(toggle)) return;
  syncToggleState(toggle, !readToggleChecked(toggle), options);
}

/* =============================================================================
   05) TOGGLE INTERACTION BINDING
============================================================================= */
function bindToggleInteraction(root = document) {
  if (!root?.addEventListener) return;
  if (root.__neuroToggleBound === true) return;

  root.addEventListener('click', (event) => {
    const toggle = event.target instanceof Element
      ? event.target.closest(TOGGLE_ROOT_SELECTOR)
      : null;

    if (!isToggleRoot(toggle)) return;
    event.preventDefault();
    toggleToggleState(toggle, { source: 'click' });
  });

  root.addEventListener('keydown', (event) => {
    const toggle = event.target instanceof Element
      ? event.target.closest(TOGGLE_ROOT_SELECTOR)
      : null;

    if (!isToggleRoot(toggle)) return;

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      toggleToggleState(toggle, { source: 'keydown' });
    }
  });

  root.__neuroToggleBound = true;
}

/* =============================================================================
   06) TOGGLE INITIALIZATION
============================================================================= */
function initTogglePrimitive(root = document) {
  getNormalizedToggles(root).forEach(normalizeToggle);
  bindToggleInteraction(root);
}

/* =============================================================================
   07) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanToggle = Object.freeze({
  TOGGLE_ROOT_SELECTOR,
  TOGGLE_TRACK_SELECTOR,
  TOGGLE_THUMB_SELECTOR,
  getNormalizedToggles,
  isToggleRoot,
  getToggleTrack,
  getToggleThumb,
  readToggleChecked,
  isToggleDisabled,
  normalizeToggle,
  syncToggleState,
  toggleToggleState,
  bindToggleInteraction,
  initTogglePrimitive
});

/* =============================================================================
   08) AUTO-BOOTSTRAP
============================================================================= */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initTogglePrimitive(document), { once: true });
} else {
  initTogglePrimitive(document);
}

/* =============================================================================
   09) END OF FILE
============================================================================= */