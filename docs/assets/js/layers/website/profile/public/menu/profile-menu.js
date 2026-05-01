/* =============================================================================
   01) MODULE IMPORTS
   02) PUBLIC PROFILE MENU HELPERS
   03) PUBLIC PROFILE MENU RENDER
   04) PUBLIC PROFILE MENU INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from '../../private/shell/profile-runtime.js';

/* =============================================================================
   02) PUBLIC PROFILE MENU HELPERS
   ============================================================================= */

function getProfileMenuRoots() {
  return Array.from(document.querySelectorAll('[data-profile-menu][data-profile-surface="public"]'));
}

function setText(root, selector, value) {
  const node = root.querySelector(selector);
  if (!node) return;
  node.textContent = value || '';
}

/* =============================================================================
   03) PUBLIC PROFILE MENU RENDER
   ============================================================================= */

function renderPublicProfileMenu(state = getProfileRuntimeState()) {
  getProfileMenuRoots().forEach((root) => {
    root.dataset.profileStateKey = state.stateKey;
    setText(root, '[data-profile-menu-state-line]', state.menuStateLine);
    setText(root, '[data-profile-menu-copy-label]', state.publicRouteUrl ? 'Copy Link' : 'Route Pending');
  });
}

/* =============================================================================
   04) PUBLIC PROFILE MENU INIT
   ============================================================================= */

function initPublicProfileMenu() {
  subscribeProfileRuntime(renderPublicProfileMenu);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-public-menu') return;
    renderPublicProfileMenu();
  });

  renderPublicProfileMenu();
}

initPublicProfileMenu();
