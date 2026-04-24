/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) CANONICAL BACKEND AUTHORITIES
   03) TRANSITIONAL CONTINUITY AUTHORITIES
   04) ACCOUNT / PROFILE / MODEL AUTHORITIES
   05) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/00-system-all.js */

/* =============================================================================
   02) CANONICAL BACKEND AUTHORITIES
============================================================================= */
/*
 * Canonical rule:
 * Supabase-first backend ownership must load through sovereign backend modules
 * before downstream account/profile/model authorities bind to runtime state.
 */
import './supabase-config.js';

/* =============================================================================
   03) TRANSITIONAL CONTINUITY AUTHORITIES
============================================================================= */
/*
 * Transitional note:
 * Firebase-owned continuity remains live only for still-unmigrated scopes. It
 * must not outrank canonical backend truth and must not be expanded as the
 * future architecture base.
 */
import './firebase-config.js';

/* =============================================================================
   04) ACCOUNT / PROFILE / MODEL AUTHORITIES
============================================================================= */
/*
 * Load order rule:
 * Identity and auth authorities must bind before downstream profile/model/feed
 * state authorities so runtime ownership follows one canonical chain.
 */
import './account-completion.js';
import './auth.js';
import './profile-save.js';
import './model-store.js';
import './public-model-registry.js';
import './active-model.js';
import './profile-router.js';
import './profile-state.js';
import './awareness-app.js';
import './ia.js';

/* =============================================================================
   05) END OF FILE
============================================================================= */
