/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE STATE
   03) CONTINUITY STATUS
   04) FIREBASE CONFIGURATION
   05) FIREBASE SDK ASSETS
   06) FIREBASE AVAILABILITY HELPERS
   07) SCRIPT LOAD HELPERS
   08) FIREBASE READINESS EVENTS
   09) FIREBASE INITIALIZATION
   10) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/firebase-config.js */

/*
 * Transitional rule:
 * This file remains a Firebase-owned continuity layer only. New backend-native
 * architecture must not be added here. Supabase-first backend ownership now
 * lives in sovereign backend modules, while this file remains tolerated only
 * until the migration plan is fully executed.
 */

(() => {
  'use strict';

  /* =============================================================================
     02) MODULE STATE
  ============================================================================= */
  let readyWatchBound = false;
  let initialized = false;
  let sdkLoadPromise = null;
  let bootPromise = null;

  /* =============================================================================
     03) CONTINUITY STATUS
  ============================================================================= */
  function getFirebaseContinuityState() {
    return {
      provider: 'firebase',
      migrationStatus: 'transitional_continuity_only',
      canonicalBackend: 'supabase',
      runtimeLoaded: hasRequiredFirebaseRuntime()
    };
  }

  /* =============================================================================
     04) FIREBASE CONFIGURATION
  ============================================================================= */
  const firebaseConfig = {
    apiKey: 'AIzaSyAogPapUYgtIa2YRO26qRoFy2uWJwBjoM4',
    authDomain: 'neuroartan-core.firebaseapp.com',
    projectId: 'neuroartan-core',
    storageBucket: 'neuroartan-core.firebasestorage.app',
    messagingSenderId: '323015575722',
    appId: '1:323015575722:web:8bc8b9d7cf61a1830ea8d3',
    measurementId: 'G-V1XX390SR4'
  };

  /* =============================================================================
     05) FIREBASE SDK ASSETS
  ============================================================================= */
  const FIREBASE_SDK_VERSION = '9.23.0';
  const FIREBASE_SDK_SOURCES = [
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore-compat.js`
  ];

  /* =============================================================================
     06) FIREBASE AVAILABILITY HELPERS
  ============================================================================= */
  function hasFirebaseRuntime() {
    return !!(window.firebase && Array.isArray(window.firebase.apps));
  }

  function hasFirebaseAuthRuntime() {
    return !!(hasFirebaseRuntime() && typeof window.firebase.auth === 'function');
  }

  function hasFirebaseFirestoreRuntime() {
    return !!(hasFirebaseRuntime() && typeof window.firebase.firestore === 'function');
  }

  function hasRequiredFirebaseRuntime() {
    return hasFirebaseAuthRuntime() && hasFirebaseFirestoreRuntime();
  }

  /* =============================================================================
     07) SCRIPT LOAD HELPERS
  ============================================================================= */
  function findExistingScript(src) {
    const resolved = new URL(src, window.location.origin).href;

    return Array.from(document.querySelectorAll('script[src]')).find((script) => {
      const currentSrc = script.getAttribute('src') || '';

      try {
        return new URL(currentSrc, window.location.origin).href === resolved;
      } catch (_) {
        return currentSrc === src;
      }
    }) || null;
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existing = findExistingScript(src);
      const onLoad = () => resolve();
      const onError = () => reject(new Error(`Failed to load Firebase SDK: ${src}`));

      if (existing) {
        if (existing.dataset.scriptLoaded === 'true') {
          resolve();
          return;
        }

        existing.addEventListener('load', () => {
          existing.dataset.scriptLoaded = 'true';
          onLoad();
        }, { once: true });
        existing.addEventListener('error', onError, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.addEventListener('load', () => {
        script.dataset.scriptLoaded = 'true';
        onLoad();
      }, { once: true });
      script.addEventListener('error', onError, { once: true });
      document.head.appendChild(script);
    });
  }

  async function ensureFirebaseSdk() {
    if (hasRequiredFirebaseRuntime()) return true;

    if (!sdkLoadPromise) {
      sdkLoadPromise = (async () => {
        for (const src of FIREBASE_SDK_SOURCES) {
          await loadScriptOnce(src);
        }
      })().catch((error) => {
        sdkLoadPromise = null;
        throw error;
      });
    }

    await sdkLoadPromise;
    return hasRequiredFirebaseRuntime();
  }

  /* =============================================================================
     08) FIREBASE READINESS EVENTS
  ============================================================================= */
  function dispatchFirebaseReady() {
    document.dispatchEvent(new CustomEvent('neuroartan:firebase-ready', {
      detail: {
        appName: '[DEFAULT]',
        hasAuth: hasFirebaseAuthRuntime(),
        hasFirestore: hasFirebaseFirestoreRuntime(),
        continuityState: getFirebaseContinuityState()
      }
    }));
  }

  function bindFirebaseReadyWatch() {
    if (readyWatchBound) return;
    readyWatchBound = true;

    window.addEventListener('load', () => {
      void boot();
    }, { once: true });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      void boot();
    });
  }

  /* =============================================================================
     09) FIREBASE INITIALIZATION
  ============================================================================= */
  async function boot() {
    if (initialized) return;
    if (typeof window === 'undefined') return;

    bindFirebaseReadyWatch();

    if (bootPromise) {
      await bootPromise;
      return;
    }

    bootPromise = (async () => {
      const sdkReady = await ensureFirebaseSdk();
      if (!sdkReady || !hasFirebaseRuntime()) return;

      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }

      initialized = true;
      window.neuroartanFirebaseContinuityState = getFirebaseContinuityState();
      dispatchFirebaseReady();
    })()
      .catch((error) => {
        console.error('Firebase bootstrap failed:', error);
      })
      .finally(() => {
        bootPromise = null;
      });

    await bootPromise;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void boot();
    }, { once: true });
  } else {
    void boot();
  }
})();

/* =============================================================================
   10) END OF FILE
============================================================================= */
