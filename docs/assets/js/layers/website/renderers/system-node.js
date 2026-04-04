/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MOUNT CONSTANTS
   03) MOUNT RESOLUTION
   04) FRAGMENT MOUNT SIGNAL
   05) IMMEDIATE INITIALIZATION
   06) FRAGMENT-MOUNT LIFECYCLE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */

(() => {
  /* =============================================================================
     02) MOUNT CONSTANTS
  ============================================================================= */
  const MOUNT_ID = 'system-node-mount';

  /* =============================================================================
     03) MOUNT RESOLUTION
  ============================================================================= */
  const getMount = () => document.getElementById(MOUNT_ID);

  /* =============================================================================
     04) FRAGMENT MOUNT SIGNAL
  ============================================================================= */
  const markMounted = () => {
    const host = getMount();
    if (!(host instanceof HTMLElement)) return false;
    if (host.dataset.systemNodeBound === 'true') return true;
    if (!host.querySelector('.system-node')) return false;

    host.dataset.systemNodeBound = 'true';
    return true;
  };

  /* =============================================================================
     05) IMMEDIATE INITIALIZATION
  ============================================================================= */
  markMounted();

  /* =============================================================================
     06) FRAGMENT-MOUNT LIFECYCLE
  ============================================================================= */
  document.addEventListener('fragment:mounted', (event) => {
    const name = event?.detail?.name;
    if (name !== 'system-node') return;
    markMounted();
  });
})();