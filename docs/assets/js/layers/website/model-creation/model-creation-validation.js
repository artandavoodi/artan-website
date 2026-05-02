/* =============================================================================
   00) FILE INDEX
   01) VALIDATION API
   02) SAFETY PANEL MOUNT
============================================================================= */

import {
  normalizeModelCreationString,
  populateSelect
} from './model-creation-state.js';

/* =============================================================================
   01) VALIDATION API
============================================================================= */
export function validateModelCreationState(state = {}) {
  const errors = [];

  if (!normalizeModelCreationString(state.model_name)) {
    errors.push('Model name is required.');
  }

  if (!normalizeModelCreationString(state.model_type)) {
    errors.push('Model type is required.');
  }

  if (!normalizeModelCreationString(state.provider_mode)) {
    errors.push('Provider mode is required.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/* =============================================================================
   02) SAFETY PANEL MOUNT
============================================================================= */
export function mountModelCreationPanel(root, context = {}) {
  const safety = context.registries?.safety || {};
  populateSelect(root?.querySelector('[data-safety-state-select]'), safety.safety_states || [], 'id');
  populateSelect(root?.querySelector('[data-public-readiness-select]'), safety.safety_states || [], 'id');
}
