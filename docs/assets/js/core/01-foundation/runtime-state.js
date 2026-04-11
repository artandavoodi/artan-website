/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) RUNTIME STATE AUTHORITY
   04) RUNTIME FLAG HELPERS
   05) RUNTIME EVENT HELPERS
   06) PUBLIC API EXPORTS
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/runtime-state.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-runtime-state';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/runtime-state.js';

/* =============================================================================
   03) RUNTIME STATE AUTHORITY
============================================================================= */
function getRuntime() {
  return (window.__NEURO_MAIN_RUNTIME__ ||= {});
}

/* =============================================================================
   04) RUNTIME FLAG HELPERS
============================================================================= */
function getRuntimeFlag(key) {
  return !!getRuntime()[key];
}

function setRuntimeFlag(key, value) {
  getRuntime()[key] = value;
  return getRuntime()[key];
}

/* =============================================================================
   05) RUNTIME EVENT HELPERS
============================================================================= */
function emitRuntimeEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/* =============================================================================
   06) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanRuntimeState = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  getRuntime,
  getRuntimeFlag,
  setRuntimeFlag,
  emitRuntimeEvent
});

/* =============================================================================
   07) END OF FILE
============================================================================= */