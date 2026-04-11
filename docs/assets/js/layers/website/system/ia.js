/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) CANONICAL IA SOURCE
   03) IA FETCH AND REGISTRATION
   04) INITIALIZATION
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  'use strict';
  /* =============================================================================
     02) CANONICAL IA SOURCE
     
  ============================================================================= */
  const WEBSITE_BASE_PATH = (() => {
    const pathname = window.location.pathname || '';

    if (pathname.includes('/website/docs/')) return '/website/docs';
    if (pathname.endsWith('/website/docs')) return '/website/docs';
    if (pathname.includes('/docs/')) return '/docs';
    if (pathname.endsWith('/docs')) return '/docs';

    return '';
  })();

  function assetPath(path) {
    const normalized = String(path || '').trim();
    if (!normalized) return '';
    return `${WEBSITE_BASE_PATH}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  }

  const IA_URL = assetPath('/assets/data/system/ia.json');

  /* =============================================================================
     03) IA FETCH AND REGISTRATION
  ============================================================================= */
  async function loadIA() {
    try {
      const res = await fetch(IA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ia = await res.json();

      window.ARTAN_IA = ia;
      window.NEUROARTAN_IA = ia;
      window.dispatchEvent(new CustomEvent('neuroartan:ia:ready', { detail: ia }));
    } catch (e) {
      window.ARTAN_IA = null;
      window.NEUROARTAN_IA = null;
      window.dispatchEvent(new CustomEvent('neuroartan:ia:error', { detail: String(e) }));
    }
  }

  /* =============================================================================
     04) INITIALIZATION
  ============================================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIA, { once: true });
  } else {
    loadIA();
  }
})();