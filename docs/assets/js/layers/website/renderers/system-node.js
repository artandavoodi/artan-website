/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MOUNT CONSTANTS
   03) MOUNT RESOLUTION
   04) MOUNT SIGNAL
   05) INITIALIZATION
   06) FRAGMENT-MOUNT LIFECYCLE
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/renderers/system-node.js */

(() => {
  'use strict';

  /* =============================================================================
     02) MOUNT CONSTANTS
  ============================================================================= */
  const MOUNT_ID = 'system-node-mount';

  /* =============================================================================
     03) MOUNT RESOLUTION
  ============================================================================= */
  const getMount = () => document.getElementById(MOUNT_ID);

  /* =============================================================================
     04) MOUNT SIGNAL
  ============================================================================= */
  const markMounted = () => {
    const host = getMount();
    if (!(host instanceof HTMLElement)) return false;

    const root = host.querySelector('.system-node');
    if (!(root instanceof HTMLElement)) {
      delete host.dataset.systemNodeBound;
      delete host.dataset.systemNodeRootKey;
      return false;
    }

    const rootKey = root.id || `${root.tagName.toLowerCase()}:system-node`;
    const alreadyBound = host.dataset.systemNodeBound === 'true';
    const previousRootKey = host.dataset.systemNodeRootKey || '';

    if (alreadyBound && previousRootKey === rootKey) {
      return true;
    }

    host.dataset.systemNodeBound = 'true';
    host.dataset.systemNodeRootKey = rootKey;

    document.dispatchEvent(new CustomEvent('system-node:mounted', {
      detail: {
        name: 'system-node',
        root,
        mount: host
      }
    }));

    return true;
  };

  /* =============================================================================
     05) INITIALIZATION
  ============================================================================= */
  const init = () => {
    markMounted();
  };

  window.__artanRunWhenReady = window.__artanRunWhenReady || ((bootFn) => {
    if (typeof bootFn !== 'function') return;

    const run = () => {
      try { bootFn(); } catch (_) {}
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  });

  window.__artanRunWhenReady(init);

  /* =============================================================================
     06) FRAGMENT-MOUNT LIFECYCLE
  ============================================================================= */
  document.addEventListener('fragment:mounted', (event) => {
    const name = event?.detail?.name;
    if (name !== 'system-node') return;
    markMounted();
  });

  /* =============================================================================
     07) END OF FILE
  ============================================================================= */
})();