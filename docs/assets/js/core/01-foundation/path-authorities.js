/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) WEBSITE BASE PATH AUTHORITY
   04) PATH NORMALIZATION HELPERS
   05) PUBLIC API EXPORTS
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/path-authorities.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-path-authorities';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/path-authorities.js';

/* =============================================================================
   03) WEBSITE BASE PATH AUTHORITY
============================================================================= */
function getWebsiteBasePath() {
  const pathname = window.location.pathname || '';

  if (pathname.includes('/website/docs/')) return '/website/docs';
  if (pathname.endsWith('/website/docs')) return '/website/docs';
  if (pathname.includes('/docs/')) return '/docs';
  if (pathname.endsWith('/docs')) return '/docs';

  return '';
}

/* =============================================================================
   04) PATH NORMALIZATION HELPERS
============================================================================= */
function normalizePath(path) {
  const normalized = String(path || '').trim();
  if (!normalized) return '';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}

function assetPath(path) {
  const normalized = normalizePath(path);
  if (!normalized) return '';
  return `${getWebsiteBasePath()}${normalized}`;
}

function toAbsoluteUrl(path) {
  const resolved = assetPath(path);
  if (!resolved) return '';
  return new URL(resolved, window.location.origin).href;
}

/* =============================================================================
   05) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanPathAuthorities = Object.freeze({
  MODULE_ID,
  MODULE_PATH,
  getWebsiteBasePath,
  normalizePath,
  assetPath,
  toAbsoluteUrl
});

/* =============================================================================
   06) END OF FILE
============================================================================= */