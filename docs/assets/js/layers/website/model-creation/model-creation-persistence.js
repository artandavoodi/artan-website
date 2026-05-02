/* =============================================================================
   00) FILE INDEX
   01) IMPORTS
   02) PERSISTENCE API
============================================================================= */

import { createOwnedModel } from '../system/model/model-store.js';
import {
  getModelCreationState,
  setModelCreationState
} from './model-creation-state.js';

/* =============================================================================
   02) PERSISTENCE API
============================================================================= */
export async function saveModelCreationDraft(state = getModelCreationState()) {
  try {
    const model = await createOwnedModel({
      model_name: state.model_name,
      description: state.model_purpose,
      model_visibility: state.model_visibility,
      interaction_state: state.interaction_state,
      provider: state.provider_id || state.provider_mode,
      route: state.provider_mode,
      routing_class: state.model_type,
      publication_state: state.model_visibility === 'public' ? 'draft_public_review' : 'unpublished'
    });

    setModelCreationState({
      model_id: model.id,
      owner_profile_id: model.profile_id || '',
      persistence_mode: 'supabase_canonical_model_record',
      deployment_status: state.deployment_status || 'draft'
    });

    return {
      canonical: true,
      model,
      message: `Canonical model draft saved: ${model.model_name}.`
    };
  } catch (error) {
    setModelCreationState({
      persistence_mode: 'development_local_fallback',
      persistence_blocker: error?.code || error?.message || 'MODEL_SAVE_BLOCKED'
    });

    return {
      canonical: false,
      error,
      message: `Draft preserved locally. Canonical save blocked: ${error?.code || error?.message || 'MODEL_SAVE_BLOCKED'}.`
    };
  }
}
