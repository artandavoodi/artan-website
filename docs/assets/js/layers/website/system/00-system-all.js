/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) TRANSITIONAL SYSTEM AUTHORITIES
   03) RESERVED SOVEREIGN BACKEND SLOT
   04) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/system/00-system-all.js */

/* =============================================================================
   02) TRANSITIONAL SYSTEM AUTHORITIES
============================================================================= */
/*
 * Transitional note:
 * Firebase-owned imports below remain live only for continuity with the current
 * proof surface. New backend ownership must graduate into sovereign backend
 * modules rather than being added into Firebase-named files.
 */
import './firebase-config.js';
/*
 * Reserved migration rule:
 * The future Supabase-first backend import must enter through its own sovereign
 * module file and must not be implemented by expanding firebase-config.js.
 */
import './account-completion.js';
import './profile-save.js';
import './public-model-registry.js';
import './active-model.js';
import './profile-router.js';
import './profile-state.js';
import './auth.js';
import './awareness-app.js';
import './ia.js';


/* =============================================================================
   03) RESERVED SOVEREIGN BACKEND SLOT
============================================================================= */
/*
 * Reserved for the dedicated Supabase-first backend module import once the
 * sovereign backend system file has been created.
 */
import './supabase-config.js';

/* =============================================================================
   04) END OF FILE
============================================================================= */
