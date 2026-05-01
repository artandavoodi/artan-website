/* =============================================================================
   01) MODULE IMPORTS
   02) PUBLIC PROFILE FOOTER HELPERS
   03) PUBLIC PROFILE FOOTER RENDER
   04) PUBLIC PROFILE FOOTER INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from '../../private/shell/profile-runtime.js';

/* =============================================================================
   02) PUBLIC PROFILE FOOTER HELPERS
   ============================================================================= */

function getProfileFooterRoots() {
  return Array.from(document.querySelectorAll('[data-profile-footer][data-profile-surface="public"]'));
}

function setText(root, selector, value) {
  const node = root.querySelector(selector);
  if (!node) return;
  node.textContent = value || '';
}

/* =============================================================================
   03) PUBLIC PROFILE FOOTER RENDER
   ============================================================================= */

function renderPublicFooter(state = getProfileRuntimeState()) {
  getProfileFooterRoots().forEach((root) => {
    root.dataset.profileStateKey = state.stateKey;
    setText(root, '[data-profile-footer-environment]', state.stateBadgeLabel || 'Company-domain identity surface');
    setText(root, '[data-profile-footer-route]', state.publicRouteDisplay || 'Public continuity route');
  });
}

/* =============================================================================
   04) PUBLIC PROFILE FOOTER INIT
   ============================================================================= */

function initPublicProfileFooter() {
  subscribeProfileRuntime(renderPublicFooter);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-public-footer') return;
    renderPublicFooter();
  });

  renderPublicFooter();
}

initPublicProfileFooter();
