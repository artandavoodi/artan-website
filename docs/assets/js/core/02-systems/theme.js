/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) STORAGE KEYS / CONSTANTS
   04) SYSTEM PREFERENCE HELPERS
   05) STORAGE HELPERS
   06) THEME NORMALIZATION HELPERS
   07) THEME METADATA HELPERS
   08) THEME TOKEN HELPERS
   09) DOM BINDING HELPERS
   10) THEME APPLICATION ENGINE
   11) DOCUMENT THEME DELEGATION
   12) EVENT REBINDING
   13) INITIALIZATION
   14) PUBLIC API EXPORTS
   15) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/02-systems/theme.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const SYSTEM_ID = 'core-theme';
const MODULE_PATH = '/website/docs/assets/js/core/02-systems/theme.js';
const FLAG_READY = 'coreThemeReady';
const FLAG_EVENTS_BOUND = 'coreThemeEventsBound';
const FLAG_SYSTEM_PREFERENCE_BOUND = 'coreThemeSystemPreferenceBound';

function getRuntime() {
  return (window.__NEURO_MAIN_RUNTIME__ ||= {});
}

function getRuntimeFlag(key) {
  return !!getRuntime()[key];
}

function setRuntimeFlag(key, value) {
  getRuntime()[key] = value;
}

function getSystemState(key, fallback = null) {
  const runtime = getRuntime();
  const systemState = (runtime.systemState ||= {});
  return key in systemState ? systemState[key] : fallback;
}

function setSystemState(key, value) {
  const runtime = getRuntime();
  const systemState = (runtime.systemState ||= {});
  systemState[key] = value;
  return value;
}

function emitRuntimeEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

function setAriaPressed(node, pressed) {
  if (!(node instanceof HTMLElement)) return;
  node.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}

/* =============================================================================
   03) STORAGE KEYS / CONSTANTS
============================================================================= */
const STORAGE_KEY = 'neuroartan-theme-state';
const LEGACY_STORAGE_KEY = 'neuroartan-theme';

const THEME_SYSTEM = 'system';
const THEME_CUSTOM = 'custom';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

const EFFECTIVE_DARK = 'dark';
const EFFECTIVE_LIGHT = 'light';

const CONTRAST_LOW = 'low';
const CONTRAST_STANDARD = 'standard';
const CONTRAST_HIGH = 'high';

const DEFAULT_THEME_STATE = Object.freeze({
  theme: THEME_SYSTEM,
  effective: EFFECTIVE_DARK,
  contrast: CONTRAST_STANDARD,
  palette: 'neuroartan',
  tokens: {
    accent: '',
    accentHover: '',
    background: '',
    text: '',
    surface: '',
    border: ''
  }
});

const THEME_SEQUENCE = [THEME_SYSTEM, THEME_CUSTOM, THEME_DARK, THEME_LIGHT];
const THEME_VALUES = new Set(THEME_SEQUENCE);
const EFFECTIVE_VALUES = new Set([EFFECTIVE_DARK, EFFECTIVE_LIGHT]);
const CONTRAST_VALUES = new Set([CONTRAST_LOW, CONTRAST_STANDARD, CONTRAST_HIGH]);

const TOGGLE_SELECTORS = [
  '#theme-toggle',
  '.theme-toggle',
  '[data-theme-option]',
  '[data-theme-mode]',
  '[data-theme-contrast-option]',
  '[data-theme-palette-option]',
  '[data-theme-token]'
].join(',');

const TOKEN_STYLE_MAP = Object.freeze({
  accent: '--theme-accent-color',
  accentHover: '--theme-accent-hover-color',
  background: '--theme-custom-bg-color',
  text: '--theme-custom-text-color',
  surface: '--theme-custom-surface-color',
  border: '--theme-custom-border-color'
});

/* =============================================================================
   04) SYSTEM PREFERENCE HELPERS
============================================================================= */
function getSystemPreferenceQuery() {
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia('(prefers-color-scheme: light)');
}

function getSystemEffectiveTheme() {
  const mediaQuery = getSystemPreferenceQuery();
  return mediaQuery?.matches ? EFFECTIVE_LIGHT : EFFECTIVE_DARK;
}

/* =============================================================================
   05) STORAGE HELPERS
============================================================================= */
function cloneDefaultThemeState() {
  return JSON.parse(JSON.stringify(DEFAULT_THEME_STATE));
}

function readStoredObject(key) {
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

function readStoredText(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (_) {
    return null;
  }
}

function removeStoredKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (_) {}
}

function writeStoredState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    removeStoredKey(LEGACY_STORAGE_KEY);
  } catch (_) {}
}

function getStoredThemeState() {
  const storedState = readStoredObject(STORAGE_KEY);
  if (storedState && typeof storedState === 'object') {
    return normalizeThemeState(storedState);
  }

  const legacyTheme = readStoredText(LEGACY_STORAGE_KEY);
  if (legacyTheme) {
    return normalizeThemeState({ theme: legacyTheme });
  }

  return null;
}

/* =============================================================================
   06) THEME NORMALIZATION HELPERS
============================================================================= */
function normalizeThemeValue(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'color') return THEME_CUSTOM;
  if (THEME_VALUES.has(normalized)) return normalized;

  return THEME_SYSTEM;
}

function normalizeEffectiveValue(value, fallback = getSystemEffectiveTheme()) {
  const normalized = String(value || '').trim().toLowerCase();
  return EFFECTIVE_VALUES.has(normalized) ? normalized : fallback;
}

function normalizeContrastValue(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return CONTRAST_VALUES.has(normalized) ? normalized : CONTRAST_STANDARD;
}

function normalizeHexValue(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(normalized)) return normalized;
  return '';
}

function normalizeTokenState(tokens = {}) {
  const defaults = cloneDefaultThemeState().tokens;
  const normalizedTokens = { ...defaults };

  Object.keys(TOKEN_STYLE_MAP).forEach((key) => {
    normalizedTokens[key] = normalizeHexValue(tokens[key]);
  });

  return normalizedTokens;
}

function resolveEffectiveTheme(theme, explicitEffective = null) {
  const normalizedTheme = normalizeThemeValue(theme);

  if (normalizedTheme === THEME_LIGHT) return EFFECTIVE_LIGHT;
  if (normalizedTheme === THEME_DARK) return EFFECTIVE_DARK;
  if (normalizedTheme === THEME_CUSTOM && explicitEffective) return normalizeEffectiveValue(explicitEffective);

  return getSystemEffectiveTheme();
}

function normalizeThemeState(input = {}) {
  const base = cloneDefaultThemeState();
  const theme = normalizeThemeValue(input.theme ?? input.mode ?? base.theme);
  const effective = resolveEffectiveTheme(theme, input.effective ?? input.effectiveTheme ?? input.resolvedTheme);

  return {
    theme,
    effective,
    contrast: normalizeContrastValue(input.contrast ?? base.contrast),
    palette: String(input.palette || base.palette).trim().toLowerCase() || base.palette,
    tokens: normalizeTokenState(input.tokens)
  };
}

function getPreferredThemeState() {
  return normalizeThemeState(getStoredThemeState() || cloneDefaultThemeState());
}

/* =============================================================================
   07) THEME METADATA HELPERS
============================================================================= */
function getThemeSurfaceLabel(theme) {
  switch (normalizeThemeValue(theme)) {
    case THEME_SYSTEM:
      return 'System';
    case THEME_CUSTOM:
      return 'Custom';
    case THEME_LIGHT:
      return 'Light';
    case THEME_DARK:
      return 'Dark';
    default:
      return 'System';
  }
}

function getThemeSummary(theme) {
  switch (normalizeThemeValue(theme)) {
    case THEME_SYSTEM:
      return 'System follows the device appearance preference and keeps the global interface synchronized.';
    case THEME_CUSTOM:
      return 'Custom applies founder-controlled palette, contrast, and hex-token settings through the global token layer.';
    case THEME_LIGHT:
      return 'Light applies the institutional light surface with optional contrast refinement.';
    case THEME_DARK:
      return 'Dark applies the institutional dark surface with optional contrast refinement.';
    default:
      return 'System follows the device appearance preference and keeps the global interface synchronized.';
  }
}

function getThemeStateDetail(state = getCurrentThemeState()) {
  const normalizedState = normalizeThemeState(state);

  return {
    theme: normalizedState.theme,
    themeLabel: getThemeSurfaceLabel(normalizedState.theme),
    themeSummary: getThemeSummary(normalizedState.theme),
    effectiveTheme: normalizedState.effective,
    contrast: normalizedState.contrast,
    palette: normalizedState.palette,
    tokens: { ...normalizedState.tokens },
    cinematicAllowed: normalizedState.theme === THEME_CUSTOM,
    monoSolidRequired: normalizedState.theme === THEME_LIGHT || normalizedState.theme === THEME_DARK
  };
}

/* =============================================================================
   08) THEME TOKEN HELPERS
============================================================================= */
function applyCustomTokenStyles(html, state) {
  Object.entries(TOKEN_STYLE_MAP).forEach(([key, property]) => {
    const value = normalizeHexValue(state.tokens?.[key]);

    if (value) {
      html.style.setProperty(property, value);
      return;
    }

    html.style.removeProperty(property);
  });
}

function applyThemeMetadata(html, state) {
  html.setAttribute('data-theme', state.theme);
  html.setAttribute('data-theme-effective', state.effective);
  html.setAttribute('data-theme-contrast', state.contrast);
  html.setAttribute('data-theme-palette', state.palette);

  html.style.colorScheme = state.effective;
}

/* =============================================================================
   09) DOM BINDING HELPERS
============================================================================= */
export function getThemeToggles(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(TOGGLE_SELECTORS));
}

function syncToggleNode(node) {
  if (!(node instanceof HTMLElement)) return;

  const state = getCurrentThemeState();
  const explicitTheme = node.getAttribute('data-theme-option') || node.getAttribute('data-theme-mode');
  const explicitContrast = node.getAttribute('data-theme-contrast-option');
  const explicitPalette = node.getAttribute('data-theme-palette-option');

  if (explicitTheme) {
    const normalizedExplicitTheme = normalizeThemeValue(explicitTheme);
    const isActive = normalizedExplicitTheme === state.theme;
    setAriaPressed(node, isActive);
    node.setAttribute('aria-label', `Switch to ${getThemeSurfaceLabel(normalizedExplicitTheme)} mode`);
    node.toggleAttribute('data-active', isActive);
    return;
  }

  if (explicitContrast) {
    const normalizedContrast = normalizeContrastValue(explicitContrast);
    const isActive = normalizedContrast === state.contrast;
    setAriaPressed(node, isActive);
    node.setAttribute('aria-label', `Set ${normalizedContrast} contrast`);
    node.toggleAttribute('data-active', isActive);
    return;
  }

  if (explicitPalette) {
    const normalizedPalette = String(explicitPalette).trim().toLowerCase();
    const isActive = normalizedPalette === state.palette;
    setAriaPressed(node, isActive);
    node.setAttribute('aria-label', `Set ${normalizedPalette} palette`);
    node.toggleAttribute('data-active', isActive);
    return;
  }

  const isLightEffective = state.effective === THEME_LIGHT;
  setAriaPressed(node, isLightEffective);
  node.setAttribute('aria-label', 'Cycle appearance mode');
}

function bindToggleNode(node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.dataset.themeToggleBound === 'true') {
    syncToggleNode(node);
    return;
  }

  if (node.tagName === 'BUTTON' && !node.getAttribute('type')) {
    node.setAttribute('type', 'button');
  }

  if (node instanceof HTMLInputElement && node.hasAttribute('data-theme-token')) {
    const tokenKey = node.getAttribute('data-theme-token');
    const state = getCurrentThemeState();
    if (tokenKey && tokenKey in TOKEN_STYLE_MAP && state.tokens[tokenKey]) {
      node.value = state.tokens[tokenKey];
    }
  }

  node.dataset.themeToggleBound = 'true';
  syncToggleNode(node);
}

function syncAllThemeNodes(root = document) {
  getThemeToggles(root).forEach(bindToggleNode);
  getThemeToggles(document).forEach(syncToggleNode);
}

/* =============================================================================
   10) THEME APPLICATION ENGINE
============================================================================= */
export function getCurrentThemeState() {
  return normalizeThemeState(getSystemState('themeState', getPreferredThemeState()));
}

export function getCurrentTheme() {
  return getCurrentThemeState().theme;
}

export function applyThemeState(nextState = {}) {
  const state = normalizeThemeState({
    ...getCurrentThemeState(),
    ...nextState,
    tokens: {
      ...getCurrentThemeState().tokens,
      ...(nextState.tokens || {})
    }
  });

  const html = document.documentElement;

  applyThemeMetadata(html, state);
  applyCustomTokenStyles(html, state);

  setSystemState('themeState', state);
  setSystemState('theme', state.theme);
  setSystemState('themeEffective', state.effective);
  writeStoredState(state);

  emitRuntimeEvent('neuroartan:theme-changed', {
    source: SYSTEM_ID,
    modulePath: MODULE_PATH,
    ...getThemeStateDetail(state)
  });

  syncAllThemeNodes(document);

  return state;
}

export function applyTheme(theme, options = {}) {
  const normalizedTheme = normalizeThemeValue(theme);
  return applyThemeState({
    ...options,
    theme: normalizedTheme,
    effective: resolveEffectiveTheme(normalizedTheme, options.effective)
  }).theme;
}

export function setThemeContrast(contrast) {
  return applyThemeState({ contrast: normalizeContrastValue(contrast) });
}

export function setThemePalette(palette) {
  return applyThemeState({ palette: String(palette || 'neuroartan').trim().toLowerCase() || 'neuroartan' });
}

export function setThemeToken(token, value) {
  if (!(token in TOKEN_STYLE_MAP)) return getCurrentThemeState();

  return applyThemeState({
    theme: THEME_CUSTOM,
    tokens: {
      [token]: normalizeHexValue(value)
    }
  });
}

export function toggleTheme() {
  const current = getCurrentTheme();
  const currentIndex = THEME_SEQUENCE.indexOf(current);
  const next = THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length] || THEME_SYSTEM;
  return applyTheme(next);
}

export function initThemeSystem(root = document) {
  applyThemeState(getCurrentThemeState());
  syncAllThemeNodes(root);

  if (!getRuntimeFlag(FLAG_READY)) {
    setRuntimeFlag(FLAG_READY, true);
    emitRuntimeEvent('neuroartan:theme-ready', {
      source: SYSTEM_ID,
      modulePath: MODULE_PATH,
      ...getThemeStateDetail(getCurrentThemeState())
    });
  }
}

/* =============================================================================
   11) DOCUMENT THEME DELEGATION
============================================================================= */
function bindDocumentThemeDelegation() {
  const runtime = getRuntime();
  if (runtime.coreThemeDelegationBound === true) return;

  document.addEventListener('click', (event) => {
    const node = event.target instanceof Element
      ? event.target.closest(TOGGLE_SELECTORS)
      : null;

    if (!(node instanceof HTMLElement)) return;
    if (!document.contains(node)) return;

    const explicitTheme = node.getAttribute('data-theme-option') || node.getAttribute('data-theme-mode');
    const explicitContrast = node.getAttribute('data-theme-contrast-option');
    const explicitPalette = node.getAttribute('data-theme-palette-option');

    if (explicitTheme) {
      event.preventDefault();
      applyTheme(explicitTheme);
      return;
    }

    if (explicitContrast) {
      event.preventDefault();
      setThemeContrast(explicitContrast);
      return;
    }

    if (explicitPalette) {
      event.preventDefault();
      setThemePalette(explicitPalette);
      return;
    }

    if (node.matches('#theme-toggle, .theme-toggle')) {
      event.preventDefault();
      toggleTheme();
    }
  });

  document.addEventListener('input', (event) => {
    const node = event.target;
    if (!(node instanceof HTMLInputElement)) return;
    if (!node.hasAttribute('data-theme-token')) return;

    const token = node.getAttribute('data-theme-token');
    setThemeToken(token, node.value);
  });

  runtime.coreThemeDelegationBound = true;
}

/* =============================================================================
   12) EVENT REBINDING
============================================================================= */
function bindThemeEvents() {
  if (getRuntimeFlag(FLAG_EVENTS_BOUND)) return;
  setRuntimeFlag(FLAG_EVENTS_BOUND, true);

  document.addEventListener('fragment:mounted', (event) => {
    const detailRoot = event?.detail?.root;
    const root = detailRoot instanceof Element ? detailRoot : document;
    initThemeSystem(root);
  });

  document.addEventListener('neuroartan:menu-mounted', () => {
    initThemeSystem(document);
  });

  document.addEventListener('neuroartan:footer-mounted', () => {
    initThemeSystem(document);
  });

  document.addEventListener('neuroartan:theme-change-requested', (event) => {
    const detail = event?.detail || {};
    const requestedTheme = normalizeThemeValue(detail.theme || detail.mode);

    applyThemeState({
      theme: requestedTheme,
      contrast: detail.contrast,
      palette: detail.palette,
      tokens: detail.tokens || {}
    });
  });

  document.addEventListener('neuroartan:home-theme-settings-intent', (event) => {
    const detail = event?.detail || {};
    const requestedTheme = normalizeThemeValue(detail.theme || detail.mode);

    applyThemeState({
      theme: requestedTheme,
      contrast: detail.contrast,
      palette: detail.palette,
      tokens: detail.tokens || {}
    });
  });
}

function bindThemePreferenceListener() {
  if (getRuntimeFlag(FLAG_SYSTEM_PREFERENCE_BOUND)) return;
  setRuntimeFlag(FLAG_SYSTEM_PREFERENCE_BOUND, true);

  const mediaQuery = getSystemPreferenceQuery();
  if (!mediaQuery) return;

  const handleChange = () => {
    const state = getCurrentThemeState();
    if (state.theme !== THEME_SYSTEM && state.theme !== THEME_CUSTOM) return;

    applyThemeState({
      effective: getSystemEffectiveTheme()
    });
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleChange);
    return;
  }

  if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleChange);
  }
}

/* =============================================================================
   13) INITIALIZATION
============================================================================= */
function bootThemeSystem() {
  bindThemeEvents();
  bindDocumentThemeDelegation();
  bindThemePreferenceListener();
  initThemeSystem(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootThemeSystem();
  }, { once: true });
} else {
  bootThemeSystem();
}

/* =============================================================================
   14) PUBLIC API EXPORTS
============================================================================= */
window.NeuroartanTheme = Object.freeze({
  getCurrentTheme,
  getCurrentThemeState,
  applyTheme,
  applyThemeState,
  toggleTheme,
  setThemeContrast,
  setThemePalette,
  setThemeToken,
  initThemeSystem,
  bindDocumentThemeDelegation,
  getThemeSurfaceLabel,
  getThemeSummary,
  getThemeStateDetail
});

/* =============================================================================
   15) END OF FILE
============================================================================= */
