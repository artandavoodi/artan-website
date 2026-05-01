/* =============================================================================
   01) MODULE IMPORTS
   02) SIDEBAR HELPERS
   03) SIDEBAR RENDER
   04) SIDEBAR INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from '../shell/profile-runtime.js';
import { getProfileNavigationState, subscribeProfileNavigation } from '../navigation/profile-navigation.js';

/* =============================================================================
   02) SIDEBAR HELPERS
   ============================================================================= */

function getSidebarRoots() {
  return Array.from(document.querySelectorAll('[data-profile-sidebar]'));
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
   03) SIDEBAR RENDER
   ============================================================================= */

function renderSidebar(state = getProfileRuntimeState(), navigationState = getProfileNavigationState()) {
  getSidebarRoots().forEach((root) => {
    root.dataset.profileViewerState = state.viewerState;
    root.dataset.profileStateKey = state.stateKey;

    setText(
      root,
      '[data-profile-sidebar-summary]',
      state.viewerState === 'authenticated'
        ? 'Owner environment for identity, thoughts, route state, and profile settings.'
        : 'Authenticate to activate the private profile workspace.'
    );

    setText(
      root,
      '[data-profile-sidebar-route-line]',
      state.publicViewAvailable
        ? `Public route live · ${state.publicRouteDisplay}`
        : state.username.normalized
          ? `Public route reserved · ${state.publicRouteDisplay}`
          : 'Public route pending'
    );

    setText(
      root,
      '[data-profile-sidebar-public-label]',
      state.publicViewAvailable ? 'View Public Route' : 'Public Route Pending'
    );

    root.querySelectorAll('[data-profile-nav-section]').forEach((button) => {
      const section = button.getAttribute('data-profile-nav-section') || '';
      const pane = button.getAttribute('data-profile-nav-pane') || '';
      const active = section === navigationState.section
        && (!pane || pane === navigationState.settingsPane);
      button.dataset.profileNavActive = active ? 'true' : 'false';
    });

    const publicButton = root.querySelector('[data-profile-action="view-public"]');
    setControlDisabled(publicButton, !state.publicViewAvailable);
  });
}

/* =============================================================================
   04) SIDEBAR INIT
   ============================================================================= */

function initProfileSidebar() {
  const render = () => renderSidebar();

  subscribeProfileRuntime(render);
  subscribeProfileNavigation(render);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-sidebar') return;
    render();
  });

  render();
}

initProfileSidebar();
