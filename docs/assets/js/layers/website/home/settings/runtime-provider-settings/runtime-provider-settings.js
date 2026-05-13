/* =============================================================================
   RUNTIME PROVIDER SETTINGS
============================================================================= */

import {
  getRuntimeProviderState,
  setRuntimeProviderState
} from '../../../../../core/03-runtime/providers/runtime-provider-state.js';

function bootRuntimeProviderSettings() {
  const providerInput = document.querySelector(
    '[data-runtime-provider-input]'
  );

  const apiInput = document.querySelector(
    '[data-runtime-provider-api-key]'
  );

  if (providerInput instanceof HTMLSelectElement) {
    providerInput.value =
      getRuntimeProviderState().activeProvider;

    providerInput.addEventListener('change', () => {
      setRuntimeProviderState({
        activeProvider:providerInput.value
      });
    });
  }

  if (apiInput instanceof HTMLInputElement) {
    apiInput.value =
      localStorage.getItem('neuroartan-provider-gemini-key') || '';

    apiInput.addEventListener('change', () => {
      localStorage.setItem(
        'neuroartan-provider-gemini-key',
        apiInput.value.trim()
      );
    });
  }
}

document.addEventListener(
  'fragment:mounted',
  (event) => {
    const name = event?.detail?.name || '';

    if (name !== 'runtime-provider-settings') {
      return;
    }

    bootRuntimeProviderSettings();
  }
);

document.addEventListener(
  'neuroartan:runtime-ready',
  bootRuntimeProviderSettings
);
