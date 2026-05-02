/* =============================================================================
   00) FILE INDEX
   01) MODEL CREATE WORKSPACE MOUNT
   02) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODEL CREATE WORKSPACE MOUNT
============================================================================= */
export function mountHomePlatformDestination(root) {
  const route = root?.querySelector('[data-model-create-route]');
  if (route instanceof HTMLAnchorElement) {
    route.setAttribute('aria-label', 'Open canonical model creation control panel');
  }
}

/* =============================================================================
   02) END OF FILE
============================================================================= */
