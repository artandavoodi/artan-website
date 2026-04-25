/* =============================================================================
   01) MODULE IMPORTS
   02) PROFILE SHELL RENDER
   03) PROFILE SHELL INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from './profile-runtime.js';

/* =============================================================================
   02) PROFILE SHELL RENDER
   ============================================================================= */

function renderProfileShell(state = getProfileRuntimeState()) {
  const roots = Array.from(document.querySelectorAll('[data-profile-shell]'));

  roots.forEach((root) => {
    root.dataset.profileViewerState = state.viewerState;
    root.dataset.profileStateKey = state.stateKey;
    root.dataset.profileSurfaceState = state.surface;

    if (state.surface === 'private') {
      root.dataset.profileCompletionState = state.completion.complete ? 'complete' : 'incomplete';
      return;
    }

    root.dataset.profileRouteOutcome = state.routeOutcome || 'idle';
  });
}

/* =============================================================================
   03) PROFILE SHELL INIT
   ============================================================================= */

function initProfileShell() {
  subscribeProfileRuntime(renderProfileShell);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-shell' && event?.detail?.name !== 'profile-public-shell') return;
    renderProfileShell();
  });

  renderProfileShell();
}

initProfileShell();
