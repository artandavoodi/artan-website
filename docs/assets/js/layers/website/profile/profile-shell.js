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
  const root = document.querySelector('[data-profile-shell][data-profile-surface="private"]');
  if (!root) return;

  root.dataset.profileViewerState = state.viewerState;
  root.dataset.profileStateKey = state.stateKey;
  root.dataset.profileCompletionState = state.completion.complete ? 'complete' : 'incomplete';
}

/* =============================================================================
   03) PROFILE SHELL INIT
   ============================================================================= */

function initProfileShell() {
  subscribeProfileRuntime(renderProfileShell);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-shell') return;
    renderProfileShell();
  });

  renderProfileShell();
}

initProfileShell();
