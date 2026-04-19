/* =============================================================================
   01) MODULE IMPORTS
   02) PROFILE FOOTER HELPERS
   03) PROFILE FOOTER RENDER
   04) PROFILE FOOTER INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from './profile-runtime.js';

/* =============================================================================
   02) PROFILE FOOTER HELPERS
   ============================================================================= */

function getProfileFooterRoot() {
  return document.querySelector('[data-profile-footer][data-profile-surface="private"]');
}

function setText(root, selector, value) {
  const node = root.querySelector(selector);
  if (!node) return;
  node.textContent = value;
}

/* =============================================================================
   03) PROFILE FOOTER RENDER
   ============================================================================= */

function renderProfileFooter(state = getProfileRuntimeState()) {
  const root = getProfileFooterRoot();
  if (!root) return;

  root.dataset.profileViewerState = state.viewerState;
  root.dataset.profileStateKey = state.stateKey;

  setText(
    root,
    '[data-profile-footer-environment]',
    state.viewerState === 'authenticated'
      ? 'Authenticated owner environment'
      : 'Private continuity environment'
  );

  setText(
    root,
    '[data-profile-footer-route]',
    state.username.normalized
      ? `${state.publicViewAvailable ? 'Public route ready' : 'Reserved route'} · ${state.publicRouteDisplay}`
      : 'Owner route · /profile.html'
  );
}

/* =============================================================================
   04) PROFILE FOOTER INIT
   ============================================================================= */

function initProfileFooter() {
  subscribeProfileRuntime(renderProfileFooter);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-footer') return;
    renderProfileFooter();
  });

  renderProfileFooter();
}

initProfileFooter();
