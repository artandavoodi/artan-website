/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE STATE
   03) FIREBASE STATE
   04) PROFILE ROUTES
   05) ROUTE HELPERS
   06) REDIRECT HELPERS
   07) DOM TEXT HELPERS
   08) DOM IMAGE HELPERS
   09) PROFILE SURFACE — SIGNED IN
   10) PROFILE SURFACE — SIGNED OUT
   11) AUTH STATE HANDLERS
   12) AUTH BINDING
   13) SIGN OUT FLOW
   14) GOOGLE SIGN-IN FLOW
   15) EVENT REBINDING
   16) INITIALIZATION
   17) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/auth.js */

(() => {
  'use strict';

/* =============================================================================
   02) MODULE STATE
============================================================================= */
let bootBound = false;
let authBound = false;
let firebaseReadyEventsBound = false;

/* =============================================================================
   03) FIREBASE STATE
============================================================================= */
function getFirebaseAuth() {
  const firebaseReady = typeof window !== 'undefined' && typeof window.firebase !== 'undefined';
  if (!firebaseReady || typeof window.firebase.auth !== 'function') return null;

  try {
    return window.firebase.auth();
  } catch (_) {
    return null;
  }
}

/* =============================================================================
   04) PROFILE ROUTES
============================================================================= */
const PROFILE_ROUTE_MATCHERS = ['/profile.html', '/profile/'];
const PROFILE_ROUTE = '/profile.html';
const INDEX_ROUTE = '/';
const CORE_NEUROARTAN_LOGO = 'assets/icons/core/identity/brand/neuroartan/logo-plain.svg';

/* =============================================================================
   05) ROUTE HELPERS
============================================================================= */
function isProfileRoute(pathname) {
  return PROFILE_ROUTE_MATCHERS.some((route) => pathname.endsWith(route));
}

/* =============================================================================
   06) REDIRECT HELPERS
============================================================================= */
function redirectToIndex() {
  window.location.href = INDEX_ROUTE;
}

function redirectToProfile() {
  window.location.href = PROFILE_ROUTE;
}

/* =============================================================================
   07) DOM TEXT HELPERS
============================================================================= */
function setText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = value;
}

/* =============================================================================
   08) DOM IMAGE HELPERS
============================================================================= */
function setImage(id, src, alt) {
  const element = document.getElementById(id);
  if (!element || element.tagName !== 'IMG') return;
  element.src = src;
  element.alt = alt;
}

/* =============================================================================
   09) PROFILE SURFACE — SIGNED IN
============================================================================= */
function updateProfileSurface(user) {
  if (!user) return;

  const displayName = user.displayName || 'Neuroartan User';
  const email = user.email || 'No email available';
  const photoURL = user.photoURL || CORE_NEUROARTAN_LOGO;

  setText('profile-label', 'Profile');
  setText('profile-name', displayName);
  setText('profile-email', email);
  setText(
    'profile-copy',
    'Your unified Neuroartan identity is active across the current platform surfaces available to your access level.'
  );
  setImage('profile-avatar-image', photoURL, displayName);

  const guestOnly = document.querySelectorAll('[data-auth-state="guest"]');
  const userOnly = document.querySelectorAll('[data-auth-state="user"]');

  guestOnly.forEach((element) => {
    element.hidden = true;
  });

  userOnly.forEach((element) => {
    element.hidden = false;
  });
}

/* =============================================================================
   10) PROFILE SURFACE — SIGNED OUT
============================================================================= */
function updateSignedOutSurface() {
  if (!isProfileRoute(window.location.pathname)) return;

  setText('profile-label', 'Account Access');
  setText('profile-name', 'Sign in to Neuroartan');
  setText('profile-email', 'Use your unified account to continue.');
  setText(
    'profile-copy',
    'This profile surface is being upgraded into the unified Neuroartan account layer for website, Office, ICOS, Investor, and Jobs.'
  );
  setImage('profile-avatar-image', CORE_NEUROARTAN_LOGO, 'Neuroartan');

  const guestOnly = document.querySelectorAll('[data-auth-state="guest"]');
  const userOnly = document.querySelectorAll('[data-auth-state="user"]');

  guestOnly.forEach((element) => {
    element.hidden = false;
  });

  userOnly.forEach((element) => {
    element.hidden = true;
  });
}

/* =============================================================================
   11) AUTH STATE HANDLERS
============================================================================= */
function handleSignedOutState() {
  console.log('No user signed in');
  updateSignedOutSurface();
}

function handleSignedInState(user) {
  console.log('User signed in:', user);
  updateProfileSurface(user);
}

/* =============================================================================
   12) AUTH BINDING
============================================================================= */
function bindAuthState() {
  if (authBound) return;

  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    console.warn('Firebase auth is not available.');
    updateSignedOutSurface();
    return;
  }

  authBound = true;

  authInstance.onAuthStateChanged((user) => {
    if (user) {
      handleSignedInState(user);
      return;
    }

    handleSignedOutState();
  });
}

/* =============================================================================
   13) SIGN OUT FLOW
============================================================================= */
function logout() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) return;

  authInstance
    .signOut()
    .then(() => {
      console.log('User logged out');
      redirectToIndex();
    })
    .catch((error) => {
      console.error('Logout error:', error);
    });
}

/* =============================================================================
   14) GOOGLE SIGN-IN FLOW
============================================================================= */
function loginWithGoogle() {
  const authInstance = getFirebaseAuth();
  if (!authInstance || !window.firebase?.auth?.GoogleAuthProvider) return;

  const provider = new window.firebase.auth.GoogleAuthProvider();

  authInstance
    .signInWithPopup(provider)
    .then((result) => {
      console.log('Google login success:', result.user);
      redirectToProfile();
    })
    .catch((error) => {
      console.error('Login error:', error);
    });
}

/* =============================================================================
   15) EVENT REBINDING
============================================================================= */
function bindFirebaseReadyEvents() {
  if (firebaseReadyEventsBound) return;
  firebaseReadyEventsBound = true;

  document.addEventListener('neuroartan:firebase-ready', () => {
    authBound = false;
    bindAuthState();
  });

  window.addEventListener('load', () => {
    authBound = false;
    bindAuthState();
  }, { once: true });
}

/* =============================================================================
   16) INITIALIZATION
============================================================================= */
function boot() {
  if (bootBound) return;
  bootBound = true;

  bindFirebaseReadyEvents();
  bindAuthState();
  window.logout = logout;
  window.loginWithGoogle = loginWithGoogle;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
})();

/* =============================================================================
   17) END OF FILE
============================================================================= */