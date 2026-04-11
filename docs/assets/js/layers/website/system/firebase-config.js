/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE STATE
   03) FIREBASE CONFIGURATION
   04) FIREBASE AVAILABILITY HELPERS
   05) FIREBASE INITIALIZATION
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/firebase-config.js */

(() => {
  'use strict';

  /* =============================================================================
     02) MODULE STATE
  ============================================================================= */
  let bootBound = false;
  let readyWatchBound = false;
  let initialized = false;

  /* =============================================================================
     03) FIREBASE CONFIGURATION
  ============================================================================= */
  const firebaseConfig = {
    apiKey: 'AIzaSyDyts8mOZou6K1qPLYR2AQugR0RFwyDS8s',
    authDomain: 'artan-c7554.firebaseapp.com',
    projectId: 'artan-c7554',
    storageBucket: 'artan-c7554.firebasestorage.app',
    messagingSenderId: '125487592764',
    appId: '1:125487592764:web:734f02aec52b6bac4c9a39',
    measurementId: 'G-JJWZXLBF8B'
  };

  /* =============================================================================
     04) FIREBASE AVAILABILITY HELPERS
  ============================================================================= */
  function hasFirebaseRuntime() {
    return !!(window.firebase && Array.isArray(window.firebase.apps));
  }

  function dispatchFirebaseReady() {
    document.dispatchEvent(new CustomEvent('neuroartan:firebase-ready', {
      detail: {
        appName: '[DEFAULT]'
      }
    }));
  }

  function bindFirebaseReadyWatch() {
    if (readyWatchBound) return;
    readyWatchBound = true;

    window.addEventListener('load', () => {
      boot();
    }, { once: true });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      boot();
    });
  }

  /* =============================================================================
     05) FIREBASE INITIALIZATION
  ============================================================================= */
  function boot() {
    if (initialized) return;
    if (typeof window === 'undefined') return;

    bindFirebaseReadyWatch();
    if (!hasFirebaseRuntime()) return;

    bootBound = true;

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }

    initialized = true;
    dispatchFirebaseReady();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* =============================================================================
   06) END OF FILE
============================================================================= */