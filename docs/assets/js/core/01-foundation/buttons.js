/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) BUTTON SELECTORS
   04) CHECK / RADIO SELECTORS
   05) BUTTON NORMALIZATION
   06) CHECK / RADIO NORMALIZATION
   07) CHECK / RADIO STATE HELPERS
   08) CHECK / RADIO EVENT BINDING
   09) PRIMITIVE INITIALIZATION
   10) PUBLIC API EXPORTS
   11) END OF FILE
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
   04) CHECK / RADIO SELECTORS
============================================================================= */
const CHECKBOX_SELECTORS = [
  '[data-na-checkbox]',
  '.na-checkbox',
  '.ui-check'
].join(',');

const RADIO_SELECTORS = [
  '[data-na-radio]',
  '.na-radio',
  '.ui-radio'
].join(',');

/* =============================================================================
   05) BUTTON NORMALIZATION
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

/* =============================================================================
   06) CHECK / RADIO NORMALIZATION
============================================================================= */
function getNormalizedCheckboxes(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(CHECKBOX_SELECTORS));
}

function isNormalizedCheckbox(node) {
  return node instanceof Element && node.matches(CHECKBOX_SELECTORS);
}

function normalizeCheckboxPrimitive(node) {
  if (!isNormalizedCheckbox(node)) return;

  if (node instanceof HTMLInputElement && node.type !== 'checkbox') {
    node.type = 'checkbox';
  }

  syncCheckboxPrimitive(node);
}

function getNormalizedRadios(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(RADIO_SELECTORS));
}

function isNormalizedRadio(node) {
  return node instanceof Element && node.matches(RADIO_SELECTORS);
}

function normalizeRadioPrimitive(node) {
  if (!isNormalizedRadio(node)) return;

  if (node instanceof HTMLInputElement && node.type !== 'radio') {
    node.type = 'radio';
  }

  syncRadioPrimitive(node);
}

/* =============================================================================
   07) CHECK / RADIO STATE HELPERS
============================================================================= */
function isCheckboxChecked(node) {
  return node instanceof HTMLInputElement && node.checked === true;
}

function setCheckboxChecked(node, checked, options = {}) {
  if (!(node instanceof HTMLInputElement) || node.type !== 'checkbox') return;

  const nextChecked = Boolean(checked);
  const emit = options.emit !== false;
  node.checked = nextChecked;
  node.dataset.checkState = nextChecked ? 'checked' : 'unchecked';

  if (emit) {
    const detail = {
      checked: nextChecked,
      name: node.name || '',
      value: node.value || '',
      source: 'core-buttons'
    };

    node.dispatchEvent(new CustomEvent('neuroartan:checkbox-changed', {
      bubbles: true,
      detail
    }));

    document.dispatchEvent(new CustomEvent('neuroartan:checkbox-changed', {
      detail: {
        element: node,
        ...detail
      }
    }));
  }
}

function syncCheckboxPrimitive(node) {
  if (!(node instanceof HTMLInputElement) || node.type !== 'checkbox') return;
  setCheckboxChecked(node, node.checked, { emit: false });
}

function toggleCheckboxPrimitive(node) {
  if (!(node instanceof HTMLInputElement) || node.type !== 'checkbox') return;
  if (node.disabled || node.getAttribute('aria-disabled') === 'true') return;
  setCheckboxChecked(node, !node.checked);
}

function isRadioChecked(node) {
  return node instanceof HTMLInputElement && node.type === 'radio' && node.checked === true;
}

function setRadioChecked(node, checked, options = {}) {
  if (!(node instanceof HTMLInputElement) || node.type !== 'radio') return;

  const nextChecked = Boolean(checked);
  const emit = options.emit !== false;
  node.checked = nextChecked;
  node.dataset.checkState = nextChecked ? 'checked' : 'unchecked';

  if (emit) {
    const detail = {
      checked: nextChecked,
      name: node.name || '',
      value: node.value || '',
      source: 'core-buttons'
    };

    node.dispatchEvent(new CustomEvent('neuroartan:radio-changed', {
      bubbles: true,
      detail
    }));

    document.dispatchEvent(new CustomEvent('neuroartan:radio-changed', {
      detail: {
        element: node,
        ...detail
      }
    }));
  }
}

function syncRadioPrimitive(node) {
  if (!(node instanceof HTMLInputElement) || node.type !== 'radio') return;
  setRadioChecked(node, node.checked, { emit: false });
}

/* =============================================================================
   08) CHECK / RADIO EVENT BINDING
============================================================================= */
function bindCheckRadioPrimitiveEvents(root = document) {
  if (!root?.addEventListener) return;
  if (root.__neuroCheckRadioPrimitiveBound === true) return;

  root.addEventListener('change', (event) => {
    if (window.NeuroartanToggle && typeof window.NeuroartanToggle.isToggleRoot === 'function') {
      const toggle = event.target instanceof Element
        ? event.target.closest('[data-na-toggle], .na-toggle, .ui-toggle')
        : null;

      if (window.NeuroartanToggle.isToggleRoot(toggle)) {
        return;
      }
    }

    const target = event.target;

    if (target instanceof HTMLInputElement && target.matches(CHECKBOX_SELECTORS)) {
      setCheckboxChecked(target, target.checked);
      return;
    }

    if (target instanceof HTMLInputElement && target.matches(RADIO_SELECTORS)) {
      setRadioChecked(target, target.checked);
    }
  });

  root.__neuroCheckRadioPrimitiveBound = true;
}

/* =============================================================================
   09) PRIMITIVE INITIALIZATION
============================================================================= */
function initButtonPrimitive(root = document) {
  normalizeButtonPrimitive(root);
  getNormalizedCheckboxes(root).forEach(normalizeCheckboxPrimitive);
  getNormalizedRadios(root).forEach(normalizeRadioPrimitive);
  bindCheckRadioPrimitiveEvents(root);
}

function bindButtonPrimitiveEvents(root = document) {
  bindCheckRadioPrimitiveEvents(root);
}

/* =============================================================================
   10) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanButtons = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  BUTTON_SELECTORS,
  CHECKBOX_SELECTORS,
  RADIO_SELECTORS,
  getNormalizedButtons,
  isNormalizedButton,
  normalizeButtonPrimitive,
  getNormalizedCheckboxes,
  isNormalizedCheckbox,
  normalizeCheckboxPrimitive,
  getNormalizedRadios,
  isNormalizedRadio,
  normalizeRadioPrimitive,
  isCheckboxChecked,
  setCheckboxChecked,
  syncCheckboxPrimitive,
  toggleCheckboxPrimitive,
  isRadioChecked,
  setRadioChecked,
  syncRadioPrimitive,
  initButtonPrimitive,
  bindButtonPrimitiveEvents,
  bindCheckRadioPrimitiveEvents
});

initButtonPrimitive(document);

document.addEventListener('fragment:mounted', (event) => {
  const root = event?.detail?.root instanceof Element ? event.detail.root : document;
  initButtonPrimitive(root);
});

/* =============================================================================
   11) END OF FILE
============================================================================= */