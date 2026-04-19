/* =============================================================================
   01) MODULE IMPORTS
   02) MODULE STATE
   03) CONSTANTS
   04) ASSET HELPERS
   05) FORMAT HELPERS
   06) PROFILE STATE DERIVATION
   07) RUNTIME STORE
   08) PROFILE ACTION DISPATCH
   09) EVENT BINDING
   10) INITIALIZATION
   ============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
   ============================================================================= */

import {
  buildPublicProfileDisplay,
  buildPublicProfilePath,
  loadProfileIdentityPolicy,
  normalizeString,
  normalizeUsername
} from '../system/account-profile-identity.js';

/* =============================================================================
   02) MODULE STATE
   ============================================================================= */

const RUNTIME = (window.__NEUROARTAN_PROFILE_RUNTIME__ ||= {
  initialized: false,
  actionBound: false,
  stateBound: false,
  state: null,
  subscribers: new Set()
});

/* =============================================================================
   03) CONSTANTS
   ============================================================================= */

const PROFILE_COMPLETION_FIELDS = ['username', 'first_name', 'last_name', 'display_name', 'date_of_birth'];

/* =============================================================================
   04) ASSET HELPERS
   ============================================================================= */

function assetPath(path) {
  if (window.NeuroartanFragmentAuthorities?.assetPath) {
    return window.NeuroartanFragmentAuthorities.assetPath(path);
  }

  const normalized = normalizeString(path);
  if (!normalized) return '';
  return normalized.startsWith('/') ? normalized.slice(1) : normalized;
}

/* =============================================================================
   05) FORMAT HELPERS
   ============================================================================= */

function formatProviderLabel(providerId) {
  switch (normalizeString(providerId)) {
    case 'google':
    case 'google.com':
      return 'Google';
    case 'apple':
    case 'apple.com':
      return 'Apple';
    case 'password':
    case 'email':
      return 'Email';
    case 'phone':
    case 'phone.com':
      return 'Phone';
    default:
      return 'Account';
  }
}

function getPrimaryProvider(user, profile = null) {
  const explicit = normalizeString(profile?.auth_provider_primary || profile?.auth_provider || '');
  if (explicit) return explicit;

  const providerData = Array.isArray(user?.providerData) ? user.providerData : [];
  const firstProvider = normalizeString(providerData[0]?.providerId || '');
  return firstProvider || 'account';
}

function formatDate(value) {
  const normalized = normalizeString(value);
  if (!normalized) return 'Not provided';

  const date = new Date(`${normalized}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Not provided';

  try {
    return new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (_) {
    return normalized;
  }
}

function capitalizeWords(value) {
  return normalizeString(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatFieldLabel(value) {
  switch (value) {
    case 'first_name':
      return 'First name';
    case 'last_name':
      return 'Last name';
    case 'display_name':
      return 'Display name';
    case 'date_of_birth':
      return 'Date of birth';
    case 'username':
      return 'Username';
    default:
      return capitalizeWords(value);
  }
}

function buildInitials(displayName, email = '') {
  const base = normalizeString(displayName || email || '');
  if (!base) return 'N';

  const words = base.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
  }

  return base.slice(0, 2).toUpperCase();
}

function buildCompletionState(profile = null) {
  if (!profile) {
    return {
      complete: false,
      percent: 0,
      status: 'missing_profile',
      missingFields: PROFILE_COMPLETION_FIELDS.slice()
    };
  }

  const canonicalMissing = Array.isArray(profile.missing_required_fields)
    ? profile.missing_required_fields.map((field) => normalizeString(field)).filter(Boolean)
    : null;

  const missingFields = canonicalMissing && canonicalMissing.length
    ? canonicalMissing
    : PROFILE_COMPLETION_FIELDS.filter((field) => {
        switch (field) {
          case 'username':
            return !normalizeString(profile.username || profile.username_normalized || profile.username_lower);
          case 'date_of_birth':
            return !normalizeString(profile.date_of_birth || profile.birth_date);
          default:
            return !normalizeString(profile[field]);
        }
      });

  const explicitPercent = Number.isFinite(profile?.profile_completion_percent)
    ? Number(profile.profile_completion_percent)
    : Math.round(((PROFILE_COMPLETION_FIELDS.length - missingFields.length) / PROFILE_COMPLETION_FIELDS.length) * 100);

  const explicitStatus = normalizeString(profile?.profile_completion_status);
  const complete = profile?.profile_complete === true
    || explicitStatus === 'complete'
    || missingFields.length === 0;

  return {
    complete,
    percent: Math.max(0, Math.min(100, explicitPercent)),
    status: explicitStatus || (complete ? 'complete' : 'incomplete'),
    missingFields
  };
}

function buildVisibilityState(profile = null, hasUsername = false) {
  const publicEnabled = profile?.public_profile_enabled === true;
  const discoverable = profile?.public_profile_discoverable === true;
  const explicitVisibility = normalizeString(profile?.profile_visibility_status || '');
  const explicitRouteStatus = normalizeString(profile?.public_route_status || '');
  const routeStatus = explicitRouteStatus || (hasUsername ? (publicEnabled ? 'ready' : 'disabled') : 'pending');

  return {
    profileVisibility: explicitVisibility || (publicEnabled ? 'controlled_public' : 'private'),
    publicEnabled,
    discoverable,
    routeStatus
  };
}

function buildUsernameState(profile = null) {
  const raw = normalizeString(profile?.username_raw || profile?.username || '');
  const normalized = normalizeUsername(profile?.username_normalized || profile?.username_lower || raw);
  const status = normalizeString(profile?.username_status || '') || (normalized ? 'reserved' : 'missing');
  const routeReady = profile?.username_route_ready === true || Boolean(normalized);

  return {
    raw: raw || normalized,
    normalized,
    status,
    routeReady
  };
}

function buildPrivateProfileState(user = null, profile = null) {
  const viewerState = user ? 'authenticated' : 'guest';
  const completion = buildCompletionState(profile);
  const username = buildUsernameState(profile);
  const visibility = buildVisibilityState(profile, Boolean(username.normalized));
  const displayName = normalizeString(profile?.display_name || user?.displayName || '');
  const email = normalizeString(profile?.auth_email || profile?.email || user?.email || '');
  const providerId = getPrimaryProvider(user, profile);
  const publicRoutePath = normalizeString(profile?.public_profile_path || profile?.public_route_path || buildPublicProfilePath(username.normalized));
  const publicRouteDisplay = buildPublicProfileDisplay(username.normalized);
  const publicViewAvailable = visibility.publicEnabled === true && visibility.routeStatus === 'ready' && Boolean(username.normalized);
  const avatarUrl = normalizeString(profile?.avatar_url || profile?.photo_url || user?.photoURL || '');
  const avatarHasImage = Boolean(avatarUrl);
  const stateKey = !user
    ? 'guest'
    : !profile
      ? 'initializing'
      : completion.complete
        ? 'ready'
        : 'completion_required';

  const stateLine = !user
    ? 'Authenticate to enter your private continuity environment.'
    : !profile
      ? 'Your canonical profile record is still initializing.'
      : completion.complete
        ? 'Your private profile surface is active across the current website boundary.'
        : 'Core identity completion is still required before the profile surface is fully mature.';

  const summary = !user
    ? 'Continue with your Neuroartan account to activate a private owner environment for identity, route readiness, and continuity state.'
    : completion.complete
      ? 'This surface anchors your display identity, account state, route readiness, and the future continuity modules that will extend across Neuroartan layers.'
      : 'Complete the remaining identity fields and username governance steps to stabilize your private profile surface.';

  return {
    surface: 'private',
    viewerState,
    stateKey,
    profile,
    user,
    completion,
    username,
    visibility,
    displayName: displayName || (user ? 'Neuroartan User' : 'Private Profile'),
    firstName: normalizeString(profile?.first_name || ''),
    lastName: normalizeString(profile?.last_name || ''),
    birthDate: normalizeString(profile?.birth_date || profile?.date_of_birth || ''),
    formattedBirthDate: formatDate(profile?.birth_date || profile?.date_of_birth || ''),
    gender: normalizeString(profile?.gender || ''),
    email,
    emailVerified: user?.emailVerified === true || profile?.auth_email_verified === true,
    providerId,
    providerLabel: formatProviderLabel(providerId),
    authContextLine: user ? `${formatProviderLabel(providerId)} account connected` : 'Authentication required',
    publicRoutePath,
    publicRouteDisplay,
    publicViewAvailable,
    profileRecordState: profile ? 'Canonical record active' : 'Canonical record pending',
    avatarUrl: avatarHasImage ? avatarUrl : '',
    avatarHasImage,
    avatarState: normalizeString(profile?.avatar_state || '') || (avatarHasImage ? 'active' : 'empty'),
    avatarInitials: buildInitials(displayName || normalizeString(profile?.first_name || ''), email),
    stateBadgeLabel: !user
      ? 'Guest'
      : completion.complete
        ? 'Private Surface Ready'
        : 'Completion Required',
    stateLine,
    summary,
    menuStateLine: !user
      ? 'Owner environment awaiting account access'
      : completion.complete
        ? 'Authenticated continuity surface'
        : 'Authenticated profile completion',
    accountButtonLabel: user ? 'Account' : 'Continue',
    primaryActionLabel: !user
      ? 'Continue with Account'
      : completion.complete
        ? 'Edit Profile'
        : 'Complete Profile',
    primaryAction: !user ? 'account' : 'edit-profile',
    secondaryActionLabel: completion.complete ? 'Edit Username' : 'Edit Identity',
    secondaryAction: 'edit-username',
    publicActionLabel: publicViewAvailable
      ? 'View Public'
      : username.normalized
        ? 'Public Route Pending'
        : 'Public Route',
    missingFieldLabels: completion.missingFields.map(formatFieldLabel)
  };
}

/* =============================================================================
   06) PROFILE STATE DERIVATION
   ============================================================================= */

function getDefaultState() {
  return buildPrivateProfileState(null, null);
}

/* =============================================================================
   07) RUNTIME STORE
   ============================================================================= */

function notifySubscribers() {
  RUNTIME.subscribers.forEach((subscriber) => {
    try {
      subscriber(RUNTIME.state);
    } catch (error) {
      console.error('[profile-runtime] Subscriber update failed.', error);
    }
  });
}

function setRuntimeState(nextState) {
  RUNTIME.state = nextState;
  notifySubscribers();
}

export function getProfileRuntimeState() {
  return RUNTIME.state || getDefaultState();
}

export function subscribeProfileRuntime(subscriber) {
  if (typeof subscriber !== 'function') {
    return () => {};
  }

  RUNTIME.subscribers.add(subscriber);
  subscriber(getProfileRuntimeState());

  return () => {
    RUNTIME.subscribers.delete(subscriber);
  };
}

/* =============================================================================
   08) PROFILE ACTION DISPATCH
   ============================================================================= */

function openAccountDrawer() {
  const state = getProfileRuntimeState();

  document.dispatchEvent(new CustomEvent('account-drawer:open-request', {
    detail: {
      source: 'profile-runtime',
      state: state.viewerState === 'authenticated' ? 'user' : 'guest',
      surface: state.viewerState === 'authenticated' ? 'profile' : 'entry'
    }
  }));
}

function openProfileSetup(intent) {
  const state = getProfileRuntimeState();
  const profile = state.profile || {};

  document.dispatchEvent(new CustomEvent('account:profile-setup-open-request', {
    detail: {
      source: 'profile-runtime',
      route: 'profile-setup',
      action: 'profile-setup',
      intent,
      email: state.email,
      first_name: state.firstName,
      last_name: state.lastName,
      display_name: state.displayName,
      username: profile.username_raw || state.username.raw || state.username.normalized,
      date_of_birth: state.birthDate,
      gender: state.gender,
      provider: state.providerId,
      method: state.providerId
    }
  }));

  document.dispatchEvent(new CustomEvent('account-drawer:open-request', {
    detail: {
      source: 'profile-runtime',
      state: 'user',
      surface: 'profile-setup'
    }
  }));
}

export function requestProfileAction(action, detail = {}) {
  const state = getProfileRuntimeState();
  const normalizedAction = normalizeString(action);

  document.dispatchEvent(new CustomEvent('profile:action-request', {
    detail: {
      source: 'profile-runtime',
      action: normalizedAction,
      state
    }
  }));

  switch (normalizedAction) {
    case 'account':
      openAccountDrawer();
      return;
    case 'edit-profile':
    case 'edit-username':
    case 'change-avatar':
    case 'manage-visibility':
      openProfileSetup(normalizedAction);
      return;
    case 'view-public':
      if (state.publicViewAvailable && state.publicRoutePath) {
        window.location.href = state.publicRoutePath;
      }
      return;
    case 'sign-out':
      document.dispatchEvent(new CustomEvent('account:sign-out-request', {
        detail: {
          source: 'profile-runtime'
        }
      }));
      return;
    case 'settings':
      return;
    default:
      return;
  }
}

/* =============================================================================
   09) EVENT BINDING
   ============================================================================= */

function bindActionDelegation() {
  if (RUNTIME.actionBound) return;
  RUNTIME.actionBound = true;

  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element
      ? event.target.closest('[data-profile-action]')
      : null;

    if (!trigger) return;
    if (trigger instanceof HTMLButtonElement && trigger.disabled) return;
    if (trigger.getAttribute('aria-disabled') === 'true') return;

    event.preventDefault();
    requestProfileAction(trigger.getAttribute('data-profile-action') || '', {
      target: trigger
    });
  });
}

function bindProfileStateEvents() {
  if (RUNTIME.stateBound) return;
  RUNTIME.stateBound = true;

  document.addEventListener('account:profile-state-changed', (event) => {
    const detail = event instanceof CustomEvent ? event.detail || {} : {};
    setRuntimeState(buildPrivateProfileState(detail.user || null, detail.profile || null));
  });

  document.addEventListener('account:profile-signed-out', () => {
    setRuntimeState(getDefaultState());
  });
}

/* =============================================================================
   10) INITIALIZATION
   ============================================================================= */

function initProfileRuntime() {
  if (RUNTIME.initialized) return;
  RUNTIME.initialized = true;

  setRuntimeState(getDefaultState());
  bindActionDelegation();
  bindProfileStateEvents();
  void loadProfileIdentityPolicy().then(() => {
    setRuntimeState(buildPrivateProfileState(RUNTIME.state?.user || null, RUNTIME.state?.profile || null));
  });

  window.NeuroartanProfileRuntime = Object.freeze({
    getState: getProfileRuntimeState,
    subscribe: subscribeProfileRuntime,
    requestAction: requestProfileAction,
    assetPath
  });
}

initProfileRuntime();
