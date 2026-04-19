/* =============================================================================
   00) FILE INDEX
   01) MODULE IMPORTS
   02) MODULE STATE
   03) FIREBASE HELPERS
   04) STATE HELPERS
   05) STATE STORE
   06) ROUTE RESOLUTION
   07) INITIALIZATION
   08) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
============================================================================= */
import {
  loadProfileIdentityPolicy,
  normalizeString,
  resolvePublicProfileByUsername
} from './account-profile-identity.js';
import {
  getPublicRouteState,
  subscribePublicRoute
} from './profile-router.js';

/* =============================================================================
   02) MODULE STATE
============================================================================= */
const RUNTIME = (window.__NEUROARTAN_PROFILE_STATE__ ||= {
  initialized: false,
  requestId: 0,
  state: null,
  subscribers: new Set()
});

/* =============================================================================
   03) FIREBASE HELPERS
============================================================================= */
function hasFirestore() {
  return !!(window.firebase && typeof window.firebase.firestore === 'function');
}

function getFirestore() {
  if (!hasFirestore()) return null;

  try {
    return window.firebase.firestore();
  } catch (_) {
    return null;
  }
}

async function waitForFirebaseReady(timeoutMs = 15000) {
  if (hasFirestore()) return true;

  return new Promise((resolve) => {
    let settled = false;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('neuroartan:firebase-ready', handleReady);
      resolve(value);
    };

    const handleReady = () => {
      finish(hasFirestore());
    };

    const timeoutId = window.setTimeout(() => {
      finish(false);
    }, timeoutMs);

    document.addEventListener('neuroartan:firebase-ready', handleReady);
  });
}

/* =============================================================================
   04) STATE HELPERS
============================================================================= */
function buildBaseState(route = getPublicRouteState()) {
  return {
    route,
    loading: false,
    outcome: route.outcome || 'not_candidate',
    username: route.routeCandidate || '',
    normalizedUsername: route.normalizedUsername || '',
    publicRoutePath: route.publicRoutePath || '',
    publicRouteUrl: route.publicRouteUrl || '',
    publicRouteDisplay: route.publicRouteDisplay || '',
    publicProfile: null,
    reason: route.reason || '',
    error: ''
  };
}

function buildErrorState(route, reason, errorMessage = '') {
  return {
    ...buildBaseState(route),
    outcome: 'error',
    reason,
    error: normalizeString(errorMessage)
  };
}

/* =============================================================================
   05) STATE STORE
============================================================================= */
function notifySubscribers() {
  RUNTIME.subscribers.forEach((subscriber) => {
    try {
      subscriber(getPublicProfileState());
    } catch (error) {
      console.error('[profile-state] Subscriber update failed.', error);
    }
  });
}

function setState(nextState) {
  RUNTIME.state = nextState;

  document.dispatchEvent(new CustomEvent('profile:public-state-changed', {
    detail: getPublicProfileState()
  }));

  notifySubscribers();
}

export function getPublicProfileState() {
  return RUNTIME.state || buildBaseState();
}

export function subscribePublicProfileState(subscriber) {
  if (typeof subscriber !== 'function') {
    return () => {};
  }

  RUNTIME.subscribers.add(subscriber);
  subscriber(getPublicProfileState());

  return () => {
    RUNTIME.subscribers.delete(subscriber);
  };
}

/* =============================================================================
   06) ROUTE RESOLUTION
============================================================================= */
async function resolveStateForRoute(route) {
  const requestId = ++RUNTIME.requestId;
  const baseState = buildBaseState(route);

  if (!route.handleAsPublicRoute) {
    setState(baseState);
    return;
  }

  if (route.outcome !== 'candidate') {
    setState(baseState);
    return;
  }

  setState({
    ...baseState,
    loading: true,
    outcome: 'loading'
  });

  const policy = await loadProfileIdentityPolicy();
  const firebaseReady = await waitForFirebaseReady();

  if (requestId !== RUNTIME.requestId) return;

  if (!firebaseReady) {
    setState(buildErrorState(route, 'PROFILE_STORE_UNAVAILABLE'));
    return;
  }

  const firestore = getFirestore();
  if (!firestore) {
    setState(buildErrorState(route, 'PROFILE_STORE_UNAVAILABLE'));
    return;
  }

  try {
    const resolution = await resolvePublicProfileByUsername({
      firestore,
      username: route.normalizedUsername || route.routeCandidate,
      policy
    });

    if (requestId !== RUNTIME.requestId) return;

    setState({
      ...baseState,
      ...resolution,
      loading: false,
      route
    });
  } catch (error) {
    if (requestId !== RUNTIME.requestId) return;

    setState(buildErrorState(
      route,
      normalizeString(error?.code || 'PUBLIC_PROFILE_RESOLUTION_FAILED'),
      error?.message || ''
    ));
  }
}

/* =============================================================================
   07) INITIALIZATION
============================================================================= */
function initProfileState() {
  if (RUNTIME.initialized) return;
  RUNTIME.initialized = true;

  setState(buildBaseState(getPublicRouteState()));

  subscribePublicRoute((route) => {
    void resolveStateForRoute(route);
  });
}

initProfileState();

/* =============================================================================
   08) END OF FILE
============================================================================= */
