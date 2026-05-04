/* =============================================================================
   NEUROARTAN · HOME STAGE · DEVELOPER OPERATIONS TABS
   -----------------------------------------------------------------------------
   Purpose: Tab module boundary for the Developer Operations Panel. Active tab
   state remains coordinated by the parent panel controller until tab routing is
   promoted into a sovereign event bus.
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
export function getDeveloperOperationsTabs() {
  return Array.from(document.querySelectorAll('[data-home-stage-developer-operations-tab]'));
}

export function getDeveloperOperationsActiveTab() {
  return getDeveloperOperationsTabs().find((tab) => tab.getAttribute('aria-pressed') === 'true')?.dataset?.homeStageDeveloperOperationsTab || 'tasks';
}

/* =============================================================================
   02) END OF FILE
============================================================================= */