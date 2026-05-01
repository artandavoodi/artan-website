/* =============================================================================
   01) MODULE IMPORTS
   02) PUBLIC PROFILE SHELL RENDER
   03) PUBLIC PROFILE SHELL INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from '../../private/shell/profile-runtime.js';

/* =============================================================================
   02) PUBLIC PROFILE SHELL RENDER
   ============================================================================= */

function renderPublicProfileShell(state = getProfileRuntimeState()) {
  document.querySelectorAll('[data-profile-shell][data-profile-surface="public"]').forEach((root) => {
    root.dataset.profileViewerState = 'public';
    root.dataset.profileStateKey = state.stateKey;
    root.dataset.profileSurfaceState = 'public';
    root.dataset.profileRouteOutcome = state.routeOutcome || 'idle';
  });
}

/* =============================================================================
   03) PUBLIC PROFILE SHELL INIT
   ============================================================================= */

function initPublicProfileShell() {
  subscribeProfileRuntime(renderPublicProfileShell);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-public-shell') return;
    renderPublicProfileShell();
  });

  renderPublicProfileShell();
}

initPublicProfileShell();
