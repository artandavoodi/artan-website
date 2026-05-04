/* =============================================================================
   NEUROARTAN · HOME STAGE · DEVELOPER OPERATIONS SEARCH
   -----------------------------------------------------------------------------
   Purpose: Search controller boundary for the Developer Operations Panel. The
   primary render loop remains owned by the panel controller until search is fully
   promoted into an independent event module.
============================================================================= */

/* =============================================================================
   00) FILE INDEX
   -----------------------------------------------------------------------------
   01) MODULE BOUNDARY
   02) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE BOUNDARY
============================================================================= */
export function getDeveloperOperationsSearchInput() {
  return document.querySelector('[data-home-stage-developer-operations-search-input]');
}

/* =============================================================================
   02) END OF FILE
============================================================================= */