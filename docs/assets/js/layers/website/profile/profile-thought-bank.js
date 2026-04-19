/* =============================================================================
   01) MODULE IMPORTS
   02) THOUGHT BANK HELPERS
   03) THOUGHT BANK RENDER
   04) THOUGHT BANK INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from './profile-runtime.js';

/* =============================================================================
   02) THOUGHT BANK HELPERS
   ============================================================================= */

function getThoughtBankRoots() {
  return Array.from(document.querySelectorAll('[data-profile-thought-bank-panel]'));
}

function setText(root, selector, value) {
  const node = root.querySelector(selector);
  if (!node) return;
  node.textContent = value;
}

function setControlDisabled(control, disabled) {
  if (!(control instanceof HTMLElement)) return;
  if (control instanceof HTMLButtonElement) {
    control.disabled = disabled;
  }
  control.setAttribute('aria-disabled', disabled ? 'true' : 'false');
}

/* =============================================================================
   03) THOUGHT BANK RENDER
   ============================================================================= */

function renderThoughtBank(state = getProfileRuntimeState()) {
  getThoughtBankRoots().forEach((root) => {
    const composeButton = root.querySelector('[data-profile-action="compose-thought"]');

    setText(
      root,
      '[data-profile-thought-bank-copy]',
      state.viewerState !== 'authenticated'
        ? 'Authenticate to activate the private and public writing lanes tied to the profile surface.'
        : state.completion.complete
          ? 'Private and public writing lanes are structurally ready here, but canonical thought persistence still depends on the ICOS writing system.'
          : 'Finish the core identity profile so thought publishing can later inherit a stable username and public route.'
    );

    setText(
      root,
      '[data-profile-thought-bank-status]',
      state.viewerState !== 'authenticated'
        ? 'Thought capture remains locked until account access is active.'
        : 'Thought capture is structurally prepared, but publish/save actions remain deferred until the canonical writing system is connected.'
    );

    setText(root, '[data-profile-thought-bank-private-count]', '0 entries');
    setText(root, '[data-profile-thought-bank-public-count]', '0 entries');

    setControlDisabled(composeButton, state.viewerState !== 'authenticated');
  });
}

/* =============================================================================
   04) THOUGHT BANK INIT
   ============================================================================= */

function initProfileThoughtBank() {
  subscribeProfileRuntime(renderThoughtBank);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-thought-bank-panel') return;
    renderThoughtBank();
  });

  renderThoughtBank();
}

initProfileThoughtBank();
