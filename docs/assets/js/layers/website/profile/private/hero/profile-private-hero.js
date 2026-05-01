/* =============================================================================
   01) MODULE IDENTITY
   02) IMPORTS
   03) DOM HELPERS
   04) HERO STATE RENDERING
   05) HERO ACTIONS
   06) HERO STICKY STATE
   07) INITIALIZATION
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
const MODULE_ID = 'profile-private-hero';

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getProfileRuntimeState,
  subscribeProfileRuntime
} from '../shell/profile-runtime.js';
import {
  getProfileNavigationState,
  subscribeProfileNavigation
} from '../navigation/profile-navigation.js';

/* =============================================================================
   03) DOM HELPERS
============================================================================= */
function getHeroRoot() {
  return document.querySelector('[data-profile-private-hero]');
}

function setText(root, selector, value) {
  const node = root?.querySelector(selector);
  if (!node) return;
  node.textContent = value || '';
}

function setImage(root, selector, src, alt = '') {
  const image = root?.querySelector(selector);
  if (!(image instanceof HTMLImageElement)) return;

  if (src) {
    image.hidden = false;
    image.src = src;
    image.alt = alt;
    return;
  }

  image.hidden = true;
  image.removeAttribute('src');
  image.alt = '';
}

function mapHeroTabToNavigation(tab) {
  switch (String(tab || '').trim()) {
    case 'posts':
      return { section: 'posts' };
    case 'thoughts':
      return { section: 'thoughts' };
    case 'models':
      return { section: 'models' };
    case 'organizations':
      return { section: 'organizations' };
    case 'edit-profile':
      return { section: 'settings', settingsPane: 'identity' };
    default:
      return { section: 'overview' };
  }
}

function mapNavigationToHeroTab(navigationState = getProfileNavigationState()) {
  switch (navigationState.section) {
    case 'thoughts':
      return 'thoughts';
    case 'models':
      return 'models';
    case 'organizations':
      return 'organizations';
    case 'settings':
      return 'edit-profile';
    case 'posts':
      return 'posts';
    case 'overview':
    case 'dashboard':
    default:
      return '';
  }
}

function getHeroStickyTop(root) {
  if (!(root instanceof HTMLElement)) return 0;

  const value = Number.parseFloat(getComputedStyle(root).top || '0');
  return Number.isFinite(value) ? value : 0;
}

function getInitials(profile = {}) {
  const displayName = String(profile.display_name || profile.displayName || '').trim();
  const firstName = String(profile.first_name || profile.firstName || '').trim();
  const lastName = String(profile.last_name || profile.lastName || '').trim();
  const email = String(profile.email || '').trim();
  const source = displayName || `${firstName} ${lastName}`.trim() || email || 'Neuroartan';

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/* =============================================================================
   04) HERO STATE RENDERING
============================================================================= */
function renderProfilePrivateHero(state = getProfileRuntimeState()) {
  const root = getHeroRoot();
  if (!root) return;

  const profile = state.profile || {};
  const username = String(profile.username || '').trim();
  const displayName = String(profile.display_name || profile.displayName || '').trim();
  const profileComplete = profile.profile_complete === true || state.profileComplete === true;

  setText(root, '[data-profile-avatar-initials]', getInitials(profile));
  setImage(root, '[data-profile-avatar-image]', state.avatarUrl || '', `${displayName || 'Profile'} avatar`);
  const initials = root.querySelector('[data-profile-avatar-initials]');
  if (initials instanceof HTMLElement) {
    initials.hidden = state.avatarHasImage === true;
  }

  const cover = root.querySelector('[data-profile-cover]');
  if (cover instanceof HTMLElement) {
    if (state.coverUrl) {
      cover.style.backgroundImage = `linear-gradient(180deg, color-mix(in srgb, var(--bg-color) 16%, transparent), color-mix(in srgb, var(--bg-color) 46%, transparent)), url("${state.coverUrl}")`;
      cover.dataset.profileCoverImage = 'true';
    } else {
      cover.style.removeProperty('background-image');
      cover.dataset.profileCoverImage = 'false';
    }
  }
  setText(root, '[data-profile-display-name]', displayName || (profileComplete ? 'Private profile' : 'Profile not completed'));
  setText(root, '[data-profile-username]', username ? `@${username}` : '@username pending');
  setText(
    root,
    '[data-profile-hero-description]',
    profileComplete
      ? 'Your private profile foundation is active. Public identity, organizations, models, and workspace layers can be activated from controlled modules.'
      : 'Complete your private identity layer before activating public profile, organizations, models, or workspace access.'
  );

  renderProfilePrivateHeroTabs(getProfileNavigationState());
}

function renderProfilePrivateHeroTabs(navigationState = getProfileNavigationState()) {
  const root = getHeroRoot();
  if (!root) return;

  const activeTab = mapNavigationToHeroTab(navigationState);
  root.querySelectorAll('[data-profile-tab]').forEach((tab) => {
    const key = tab.getAttribute('data-profile-tab') || '';
    const active = key === activeTab;
    tab.setAttribute('aria-current', active ? 'page' : 'false');
    tab.dataset.profileTabActive = active ? 'true' : 'false';
  });
}

/* =============================================================================
   05) HERO ACTIONS
============================================================================= */
function bindProfilePrivateHeroActions() {
  const root = getHeroRoot();
  if (!root || root.dataset.profilePrivateHeroBound === 'true') return;

  root.dataset.profilePrivateHeroBound = 'true';
  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-profile-action]');
    const tab = event.target.closest('[data-profile-tab]');

    if (tab) {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent('profile:navigate-request', {
        detail: mapHeroTabToNavigation(tab.getAttribute('data-profile-tab'))
      }));
      return;
    }

    if (!trigger) return;

    document.dispatchEvent(new CustomEvent('profile:action-request', {
      detail: {
        source: MODULE_ID,
        action: trigger.dataset.profileAction || ''
      }
    }));
  });
}

/* =============================================================================
   06) HERO STICKY STATE
============================================================================= */
function syncProfileHeroStickyState() {
  const root = getHeroRoot();
  if (!(root instanceof HTMLElement)) return;

  const stickyTop = getHeroStickyTop(root);
  const rect = root.getBoundingClientRect();
  const isStuck = rect.top <= stickyTop + 0.5;

  root.dataset.profileHeroStuck = isStuck ? 'true' : 'false';
}

function bindProfileHeroStickyState() {
  const root = getHeroRoot();
  if (!root || root.dataset.profileHeroStickyBound === 'true') return;

  root.dataset.profileHeroStickyBound = 'true';

  let ticking = false;

  const requestSync = () => {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      ticking = false;
      syncProfileHeroStickyState();
    });
  };

  window.addEventListener('scroll', requestSync, { passive:true });
  window.addEventListener('resize', requestSync, { passive:true });
  syncProfileHeroStickyState();
}

/* =============================================================================
   07) INITIALIZATION
============================================================================= */
function initProfilePrivateHero() {
  bindProfilePrivateHeroActions();
  bindProfileHeroStickyState();
  renderProfilePrivateHero();
  subscribeProfileRuntime(renderProfilePrivateHero);
  subscribeProfileNavigation(renderProfilePrivateHeroTabs);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-hero') return;
    bindProfilePrivateHeroActions();
    bindProfileHeroStickyState();
    renderProfilePrivateHero();
    syncProfileHeroStickyState();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfilePrivateHero, { once:true });
} else {
  initProfilePrivateHero();
}
