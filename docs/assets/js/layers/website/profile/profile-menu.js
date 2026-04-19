/* =============================================================================
   01) MODULE IMPORTS
   02) PROFILE MENU HELPERS
   03) PROFILE MENU RENDER
   04) PROFILE MENU INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from './profile-runtime.js';

/* =============================================================================
   02) PROFILE MENU HELPERS
   ============================================================================= */

function getProfileMenuRoots() {
  return Array.from(document.querySelectorAll('[data-profile-menu]'));
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

function renderPrivateMenu(root, state) {
  root.dataset.profileViewerState = state.viewerState;
  root.dataset.profileStateKey = state.stateKey;

  setText(root, '[data-profile-menu-state-line]', state.menuStateLine);
  setText(root, '[data-profile-menu-account-label]', state.accountButtonLabel);
  setText(root, '[data-profile-menu-public-label]', state.publicActionLabel);

  const publicAction = root.querySelector('[data-profile-action="view-public"]');
  setControlDisabled(publicAction, !state.publicViewAvailable);
}

function renderPublicMenu(root, state) {
  root.dataset.profileViewerState = 'public';
  root.dataset.profileStateKey = state.stateKey;

  setText(root, '[data-profile-menu-state-line]', state.menuStateLine);
  setText(root, '[data-profile-menu-copy-label]', state.primaryActionLabel);

  const copyAction = root.querySelector('[data-profile-action="copy-link"]');
  setControlDisabled(copyAction, !state.publicRouteUrl);
}

/* =============================================================================
   03) PROFILE MENU RENDER
   ============================================================================= */

function renderProfileMenu(state = getProfileRuntimeState()) {
  getProfileMenuRoots().forEach((root) => {
    const surface = root.getAttribute('data-profile-surface');

    if (surface === 'public') {
      renderPublicMenu(root, state);
      return;
    }

    renderPrivateMenu(root, state);
  });
}

/* =============================================================================
   04) PROFILE MENU INIT
   ============================================================================= */

function initProfileMenu() {
  subscribeProfileRuntime(renderProfileMenu);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-menu' && event?.detail?.name !== 'profile-public-menu') return;
    renderProfileMenu();
  });

  renderProfileMenu();
}

initProfileMenu();
