/* =============================================================================
   01) MODULE IMPORTS
   02) PROFILE HEADER HELPERS
   03) PROFILE HEADER RENDER
   04) PROFILE HEADER INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import { getProfileRuntimeState, subscribeProfileRuntime } from './profile-runtime.js';

/* =============================================================================
   02) PROFILE HEADER HELPERS
   ============================================================================= */

function getProfileHeaderRoot() {
  return document.querySelector('[data-profile-header][data-profile-surface="private"]');
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

function applyBadgeTone(badge, tone) {
  if (!(badge instanceof HTMLElement)) return;

  badge.classList.remove('ui-badge--success', 'ui-badge--warning', 'ui-badge--danger', 'ui-badge--info');

  if (tone) {
    badge.classList.add(`ui-badge--${tone}`);
  }
}

function formatUsernameCopy(state) {
  if (!state.username.normalized) {
    return 'Username not yet reserved';
  }

  if (state.username.status === 'reserved') {
    return `@${state.username.normalized} is reserved`;
  }

  return capitalizeWords(state.username.status || 'pending');
}

function formatVisibilityCopy(state) {
  if (state.publicViewAvailable) {
    return 'Public route is renderable on the company domain';
  }

  if (state.username.normalized) {
    return 'Username is held privately until public visibility is enabled';
  }

  return 'Public route not yet enabled';
}

function capitalizeWords(value) {
  return String(value || '')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/* =============================================================================
   03) PROFILE HEADER RENDER
   ============================================================================= */

function renderProfileHeader(state = getProfileRuntimeState()) {
  const root = getProfileHeaderRoot();
  if (!root) return;

  root.dataset.profileViewerState = state.viewerState;
  root.dataset.profileStateKey = state.stateKey;

  const badge = root.querySelector('[data-profile-header-state-badge]');
  if (badge) {
    badge.textContent = state.stateBadgeLabel;
    applyBadgeTone(
      badge,
      state.viewerState !== 'authenticated'
        ? ''
        : state.completion.complete
          ? 'success'
          : 'warning'
    );
  }

  setText(root, '[data-profile-header-state-line]', state.stateLine);
  setText(root, '[data-profile-display-name]', state.displayName);
  setText(root, '[data-profile-username]', state.username.normalized ? `@${state.username.normalized}` : '@username');
  setText(root, '[data-profile-route-display]', state.publicRouteDisplay);
  setText(root, '[data-profile-summary]', state.summary);
  setText(root, '[data-profile-completion-percent]', `${state.completion.percent}%`);
  setText(
    root,
    '[data-profile-completion-copy]',
    state.completion.complete
      ? 'Profile surface ready'
      : `Missing ${state.completion.missingFields.length} required field${state.completion.missingFields.length === 1 ? '' : 's'}`
  );
  setText(root, '[data-profile-username-state]', capitalizeWords(state.username.status || 'missing'));
  setText(root, '[data-profile-username-copy]', formatUsernameCopy(state));
  setText(root, '[data-profile-visibility-state]', capitalizeWords(state.visibility.profileVisibility || 'private'));
  setText(root, '[data-profile-visibility-copy]', formatVisibilityCopy(state));

  const image = root.querySelector('[data-profile-avatar-image]');
  const placeholder = root.querySelector('[data-profile-avatar-placeholder]');

  if (image instanceof HTMLImageElement) {
    if (state.avatarHasImage && state.avatarUrl) {
      image.hidden = false;
      image.src = state.avatarUrl;
      image.alt = `${state.displayName} avatar`;
    } else {
      image.hidden = true;
      image.removeAttribute('src');
      image.alt = '';
    }
  }

  if (placeholder instanceof HTMLElement) {
    placeholder.textContent = state.avatarInitials;
    placeholder.hidden = state.avatarHasImage;
  }

  const avatarAction = root.querySelector('[data-profile-action="change-avatar"]');
  setControlDisabled(avatarAction, state.viewerState !== 'authenticated');

  const primaryAction = root.querySelector('[data-profile-primary-action]');
  if (primaryAction instanceof HTMLElement) {
    primaryAction.setAttribute('data-profile-action', state.primaryAction);
    setControlDisabled(primaryAction, false);
  }

  setText(root, '[data-profile-primary-action-label]', state.primaryActionLabel);

  const secondaryAction = root.querySelector('[data-profile-secondary-action]');
  if (secondaryAction instanceof HTMLElement) {
    secondaryAction.hidden = state.viewerState !== 'authenticated';
    secondaryAction.setAttribute('data-profile-action', state.secondaryAction);
  }

  setText(root, '[data-profile-secondary-action-label]', state.secondaryActionLabel);

  const publicAction = root.querySelector('[data-profile-public-action]');
  setText(root, '[data-profile-public-action-label]', state.publicActionLabel);
  setControlDisabled(publicAction, !state.publicViewAvailable);
}

/* =============================================================================
   04) PROFILE HEADER INIT
   ============================================================================= */

function initProfileHeader() {
  subscribeProfileRuntime(renderProfileHeader);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-header') return;
    renderProfileHeader();
  });

  renderProfileHeader();
}

initProfileHeader();
