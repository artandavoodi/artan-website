/* =============================================================================
   01) MODULE IMPORTS
   02) DASHBOARD HELPERS
   03) DASHBOARD RENDER
   04) DASHBOARD INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from './profile-runtime.js';

/* =============================================================================
   02) DASHBOARD HELPERS
   ============================================================================= */

function getDashboardRoots() {
  return Array.from(document.querySelectorAll('[data-profile-dashboard-panel]'));
}

function setText(root, selector, value) {
  const node = root.querySelector(selector);
  if (!node) return;
  node.textContent = value;
}

function setProgress(root, selector, value) {
  const node = root.querySelector(selector);
  if (!(node instanceof HTMLElement)) return;
  node.style.setProperty('--profile-dashboard-progress', `${Math.max(0, Math.min(100, value))}%`);
}

function computeRouteProgress(state) {
  if (state.publicViewAvailable) return 100;
  if (state.username.normalized) return 68;
  return state.viewerState === 'authenticated' ? 24 : 8;
}

function computeVisibilityProgress(state) {
  if (state.visibility.publicEnabled && state.visibility.discoverable) return 100;
  if (state.visibility.publicEnabled) return 72;
  return state.viewerState === 'authenticated' ? 32 : 10;
}

function computeContinuityProgress(state) {
  if (state.completion.complete && state.publicViewAvailable) return 92;
  if (state.completion.complete) return 78;
  return Math.max(18, state.completion.percent);
}

/* =============================================================================
   03) DASHBOARD RENDER
   ============================================================================= */

function renderDashboard(state = getProfileRuntimeState()) {
  getDashboardRoots().forEach((root) => {
    const completion = state.completion?.percent || 0;
    const route = computeRouteProgress(state);
    const visibility = computeVisibilityProgress(state);
    const continuity = computeContinuityProgress(state);

    setText(
      root,
      '[data-profile-dashboard-copy]',
      state.viewerState === 'authenticated'
        ? 'This dashboard tracks how mature the private profile environment is across completion, route readiness, visibility, and future continuity systems.'
        : 'Authenticate to activate the real private profile dashboard for continuity, route, and identity state.'
    );

    setText(root, '[data-profile-dashboard-value="completion"]', `${completion}%`);
    setText(root, '[data-profile-dashboard-value="route"]', `${route}%`);
    setText(root, '[data-profile-dashboard-value="visibility"]', `${visibility}%`);
    setText(root, '[data-profile-dashboard-value="continuity"]', `${continuity}%`);

    setProgress(root, '[data-profile-dashboard-bar="completion"]', completion);
    setProgress(root, '[data-profile-dashboard-bar="route"]', route);
    setProgress(root, '[data-profile-dashboard-bar="visibility"]', visibility);
    setProgress(root, '[data-profile-dashboard-bar="continuity"]', continuity);

    ['identity', 'memory', 'strategy', 'voice'].forEach((key) => {
      setProgress(root, `[data-profile-dashboard-thought-bar="${key}"]`, 0);
    });

    setText(
      root,
      '[data-profile-dashboard-thought-note]',
      state.viewerState === 'authenticated'
        ? 'No canonical thought categories are connected yet. This graph will activate when the writing/reflection system reaches the website profile surface.'
        : 'Thought analytics remain unavailable until the authenticated thought system is connected.'
    );
  });
}

/* =============================================================================
   04) DASHBOARD INIT
   ============================================================================= */

function initProfileDashboard() {
  subscribeProfileRuntime(renderDashboard);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-dashboard-panel') return;
    renderDashboard();
  });

  renderDashboard();
}

initProfileDashboard();
