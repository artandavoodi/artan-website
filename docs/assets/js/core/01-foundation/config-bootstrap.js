/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) CONFIG ROOT INITIALIZATION
   03) SUPABASE CONFIG REGISTRATION
   04) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/*
 * Sovereign configuration bootstrap for shared website runtime configuration.
 * This file owns the canonical window-level config root used by backend and
 * future provider integrations. It must remain vendor-neutral at the root.
 */

/* =============================================================================
   02) CONFIG ROOT INITIALIZATION
============================================================================= */
const existingConfig = window.NEUROARTAN_CONFIG || {};

window.NEUROARTAN_CONFIG = {
  ...existingConfig,
  supabase: {
    ...(existingConfig.supabase || {}),
    url: 'https://dwlgvujubkpycrvhngku.supabase.co',
    anonKey: 'sb_publishable_DXA7PoeQgaYGx6Y7ovnwTg_5razlmG8'
  }
};

/* =============================================================================
   03) SUPABASE CONFIG REGISTRATION
============================================================================= */
window.dispatchEvent(
  new CustomEvent('neuroartan:config-ready', {
    detail: {
      hasSupabaseConfig: Boolean(
        window.NEUROARTAN_CONFIG?.supabase?.url &&
        window.NEUROARTAN_CONFIG?.supabase?.anonKey
      )
    }
  })
);

/* =============================================================================
   04) END OF FILE
============================================================================= */