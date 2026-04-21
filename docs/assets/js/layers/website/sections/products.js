/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) PATH HELPERS
   03) CONSTANTS
   04) STATE
   05) HELPERS
   06) REGISTRY LOADERS
   07) SECTION RESOLUTION
   08) INDEX SHELL RENDERER
   09) INDEX LOADERS
   10) PAGE REGISTRATION
   11) BOOTSTRAP
   12) INITIALIZATION
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

  const normalizePath = (path) => {
    const value = String(path || '').trim();
    if (!value) return '/';
    return value.endsWith('/') ? value.slice(0, -1) || '/' : value;
  };

  /* =============================================================================
     03) CONSTANTS
  ============================================================================= */
  const SECTION_ID = 'products';

  const SEARCH_ROUTE_INDEX_URL = assetPath('/assets/data/search/route-index.json');
  const SEARCH_CONTENT_INDEX_URL = assetPath('/assets/data/search/content-index.json');
  const SEARCH_ENTITY_INDEX_URL = assetPath('/assets/data/search/entity-index.json');
  const PRODUCTS_REGISTRY_URL = assetPath('/assets/data/sections/products.json');

  const INDEX_SHELL_SELECTORS = [
    '#products-index-shell-mount',
    '[data-products-index-shell-slot]',
    '[data-products-index-slot]',
    '[data-products-content-slot]',
    '.products-index-shell-slot',
    '.products-index-slot',
    '.products-content-slot'
  ];

  /* =============================================================================
     04) STATE
  ============================================================================= */
  const state = {
    registry: null,
    activeSection: null,
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
    return document.querySelector('.products-page') || document.body;
  }

  function getFirstMatch(selectors, scope = document) {
    for (const selector of selectors) {
      const node = scope.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
    }
    return response.json();
  }

  function isOverviewSection() {
    return state.activeSection?.id === 'overview';
  }

  function mountHtml(target, html, mountKey) {
    if (!target) return;
    target.innerHTML = html;
    target.setAttribute(`data-${mountKey}-mounted`, 'true');
  }

  function clearMount(target, mountKey) {
    if (!target) return;
    target.innerHTML = '';
    target.setAttribute(`data-${mountKey}-mounted`, 'false');
  }

  /* =============================================================================
     06) REGISTRY LOADERS
  ============================================================================= */
  async function loadProductsRegistry() {
    state.registry = await fetchJson(PRODUCTS_REGISTRY_URL);
  }

  /* =============================================================================
     07) SECTION RESOLUTION
  ============================================================================= */
  function resolveActiveSection() {
    const registry = state.registry;
    if (!registry || !Array.isArray(registry.sections) || registry.sections.length === 0) {
      state.activeSection = null;
      return;
    }

    const currentPath = normalizePath(window.location.pathname || '/');
    const matchedSection = registry.sections.find((section) => normalizePath(section.route) === currentPath);
    const defaultSection = registry.sections.find((section) => section.id === registry.defaultSection);

    state.activeSection = matchedSection || defaultSection || registry.sections[0];
  }


  /* =============================================================================
     08) INDEX SHELL RENDERER
  ============================================================================= */
  function renderIndexShell() {
    const root = getSectionRoot();
    const target = getFirstMatch(INDEX_SHELL_SELECTORS, root);
    const registry = state.registry;
    const activeSection = state.activeSection;

    if (!target || !registry || !activeSection) return;

    if (isOverviewSection()) {
      clearMount(target, 'products-index-shell');
      return;
    }

    const cards = registry.sections.map((section) => {
      const isDisabled = section.status === 'planned';
      const content = `
        <div class="book-card__content">
          <h3 class="book-card__title">${escapeHtml(section.title || section.label)}</h3>
          <p class="book-card__meta">${escapeHtml(section.description || '')}</p>
        </div>
      `;

      if (isDisabled) {
        return `
          <article class="book-card" role="listitem" aria-disabled="true">
            ${content}
          </article>
        `;
      }

      return `
        <article class="book-card" role="listitem">
          <a class="book-card__link" href="${escapeHtml(section.route)}">
            ${content}
          </a>
        </article>
      `;
    }).join('');

    mountHtml(target, `
      <section class="products-index-shell" aria-label="Products section shell">
        <div class="products-index-shell__inner">
          <header class="products-index-shell__header" data-motion="lift">
            <p class="products-index-shell__eyebrow">${escapeHtml(registry.label || 'Products')}</p>
            <div class="products-index-shell__title-row">
              <h2 class="products-index-shell__title">${escapeHtml(activeSection.title || activeSection.label || registry.title || 'Products')}</h2>
            </div>
            <p class="products-index-shell__description">${escapeHtml(activeSection.description || registry.description || '')}</p>
          </header>

          <div class="products-index-shell__list notes-list" role="list" aria-label="Products index" data-motion="lift">
            ${cards}
          </div>
        </div>
      </section>
    `, 'products-index-shell');
  }

  /* =============================================================================
     09) INDEX LOADERS
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
     10) PAGE REGISTRATION
  ============================================================================= */
  function registerPageState() {
    const root = getSectionRoot();
    if (!root) return;

    root.setAttribute('data-section-id', SECTION_ID);
    root.setAttribute('data-products-active-section', state.activeSection?.id || '');
    root.setAttribute('data-route-index-loaded', String(Boolean(state.routeIndex)));
    root.setAttribute('data-content-index-loaded', String(Boolean(state.contentIndex)));
    root.setAttribute('data-entity-index-loaded', String(Boolean(state.entityIndex)));
    root.setAttribute('data-products-index-shell-mounted', String(Boolean(getFirstMatch(INDEX_SHELL_SELECTORS, root)?.getAttribute('data-products-index-shell-mounted') === 'true')));
  }

  /* =============================================================================
     11) BOOTSTRAP
  ============================================================================= */
  async function boot() {
    try {
      await Promise.all([
        loadProductsRegistry(),
        loadSearchIndexes()
      ]);

      resolveActiveSection();
      renderIndexShell();
      registerPageState();

      state.isReady = true;
      emit('neuroartan:section:ready', {
        section: SECTION_ID,
        activeSection: state.activeSection?.id || null
      });
    } catch (error) {
      console.error('[products] bootstrap failed', error);
      emit('neuroartan:section:error', {
        section: SECTION_ID,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /* =============================================================================
     12) INITIALIZATION
  ============================================================================= */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();