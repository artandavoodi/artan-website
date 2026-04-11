/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) PATH HELPERS
   03) CONSTANTS
   04) STATE
   05) HELPERS
   06) INDEX LOADERS
   07) PAGE REGISTRATION
   08) BOOTSTRAP
   09) INITIALIZATION
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  'use strict';

  /* =============================================================================
     02) PATH HELPERS
  ============================================================================= */
  const WEBSITE_BASE_PATH = (() => {
    const pathname = window.location.pathname || '';

    if (pathname.includes('/website/docs/')) return '/website/docs';
    if (pathname.endsWith('/website/docs')) return '/website/docs';
    if (pathname.includes('/docs/')) return '/docs';
    if (pathname.endsWith('/docs')) return '/docs';

    return '';
  })();

  const assetPath = (path) => {
    const normalized = String(path || '').trim();
    if (!normalized) return '';
    return `${WEBSITE_BASE_PATH}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  };

  /* =============================================================================
     03) CONSTANTS
  ============================================================================= */
  const SECTION_ID = 'knowledge_research';
  const SEARCH_ROUTE_INDEX_URL = assetPath('/assets/data/search/route-index.json');
  const SEARCH_CONTENT_INDEX_URL = assetPath('/assets/data/search/content-index.json');
  const SEARCH_ENTITY_INDEX_URL = assetPath('/assets/data/search/entity-index.json');

  /* =============================================================================
     04) STATE
  ============================================================================= */
  const state = {
    routeIndex: null,
    contentIndex: null,
    entityIndex: null,
    isReady: false
  };

  /* =============================================================================
     05) HELPERS
  ============================================================================= */
  function emit(name, detail = {}) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function getSectionRoot() {
    return document.querySelector('[data-page="knowledge-research"]');
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load ${url} (${response.status})`);
    }
    return response.json();
  }

  /* =============================================================================
     06) INDEX LOADERS
  ============================================================================= */
  async function loadSearchIndexes() {
    const [routeIndex, contentIndex, entityIndex] = await Promise.all([
      fetchJson(SEARCH_ROUTE_INDEX_URL),
      fetchJson(SEARCH_CONTENT_INDEX_URL),
      fetchJson(SEARCH_ENTITY_INDEX_URL)
    ]);

    state.routeIndex = routeIndex;
    state.contentIndex = contentIndex;
    state.entityIndex = entityIndex;
  }

  /* =============================================================================
     07) PAGE REGISTRATION
  ============================================================================= */
  function registerPageState() {
    const root = getSectionRoot();
    if (!root) return;

    root.setAttribute('data-section-ready', 'true');
    root.setAttribute('data-section-id', SECTION_ID);
    root.setAttribute('data-route-index-loaded', String(Boolean(state.routeIndex)));
    root.setAttribute('data-content-index-loaded', String(Boolean(state.contentIndex)));
    root.setAttribute('data-entity-index-loaded', String(Boolean(state.entityIndex)));
  }

  /* =============================================================================
     08) BOOTSTRAP
  ============================================================================= */
  async function boot() {
    try {
      await loadSearchIndexes();
      registerPageState();
      state.isReady = true;

      emit('neuroartan:knowledge-research:ready', {
        sectionId: SECTION_ID,
        routeCount: Array.isArray(state.routeIndex?.routes) ? state.routeIndex.routes.length : 0,
        contentCount: Array.isArray(state.contentIndex?.entries) ? state.contentIndex.entries.length : 0,
        entityCount: Array.isArray(state.entityIndex?.entities) ? state.entityIndex.entities.length : 0
      });
    } catch (error) {
      console.error('[Knowledge & Research] Initialization failed.', error);
      emit('neuroartan:knowledge-research:error', {
        sectionId: SECTION_ID,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /* =============================================================================
     09) INITIALIZATION
  ============================================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();