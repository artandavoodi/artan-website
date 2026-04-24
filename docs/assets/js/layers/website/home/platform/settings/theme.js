/* =============================================================================
   00) FILE INDEX
   01) MODULE IMPORTS
   02) MODULE CONSTANTS
   03) THEME HELPERS
   04) MODE OPTION BINDING
   05) TOGGLE CONSUMER BINDING
   06) PANEL STATE SYNC
   07) DESTINATION MOUNT
   08) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IMPORTS
============================================================================= */

/* =============================================================================
   02) MODULE CONSTANTS
============================================================================= */
const DESTINATION_SELECTOR = '[data-home-platform-destination-root]';
const MODE_OPTION_SELECTOR = '[data-home-platform-theme-mode-option]';
const CONTRAST_OPTION_SELECTOR = '[data-home-platform-theme-contrast-option]';
const PALETTE_OPTION_SELECTOR = '[data-home-platform-theme-palette-option]';
const TOKEN_INPUT_SELECTOR = '[data-theme-token]';
const TOGGLE_SELECTOR = '[data-na-toggle][data-toggle-scope="homepage-theme"]';

const THEME_SYSTEM = 'system';
const THEME_CUSTOM = 'custom';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

const CONTRAST_LOW = 'low';
const CONTRAST_STANDARD = 'standard';
const CONTRAST_HIGH = 'high';

const VALID_THEMES = new Set([THEME_SYSTEM, THEME_CUSTOM, THEME_DARK, THEME_LIGHT]);
const VALID_CONTRASTS = new Set([CONTRAST_LOW, CONTRAST_STANDARD, CONTRAST_HIGH]);

/* =============================================================================
   03) THEME HELPERS
============================================================================= */
function normalizeTheme(theme) {
  const normalized = String(theme || '').trim().toLowerCase();

  if (normalized === 'color') return THEME_CUSTOM;
  if (VALID_THEMES.has(normalized)) return normalized;

  return THEME_SYSTEM;
}

function normalizeContrast(contrast) {
  const normalized = String(contrast || '').trim().toLowerCase();
  return VALID_CONTRASTS.has(normalized) ? normalized : CONTRAST_STANDARD;
}

function getCurrentThemeState() {
  const themeApi = window.NeuroartanTheme;

  if (themeApi && typeof themeApi.getCurrentThemeState === 'function') {
    return themeApi.getCurrentThemeState();
  }

  return {
    theme: THEME_SYSTEM,
    effective: THEME_DARK,
    contrast: CONTRAST_STANDARD,
    palette: 'neuroartan',
    tokens: {}
  };
}

function getCurrentTheme() {
  return normalizeTheme(getCurrentThemeState().theme);
}

function getThemeDetail(theme = getCurrentThemeState()) {
  const state = typeof theme === 'string'
    ? { ...getCurrentThemeState(), theme: normalizeTheme(theme) }
    : { ...getCurrentThemeState(), ...theme };

  const normalizedTheme = normalizeTheme(state.theme);
  const themeApi = window.NeuroartanTheme;

  if (themeApi && typeof themeApi.getThemeStateDetail === 'function') {
    return themeApi.getThemeStateDetail({
      ...state,
      theme: normalizedTheme,
      contrast: normalizeContrast(state.contrast)
    });
  }

  return {
    theme: normalizedTheme,
    themeLabel: normalizedTheme === THEME_SYSTEM
      ? 'System'
      : normalizedTheme === THEME_CUSTOM
        ? 'Custom'
        : normalizedTheme === THEME_DARK
          ? 'Dark'
          : 'Light',
    themeSummary: normalizedTheme === THEME_SYSTEM
      ? 'System follows the device appearance preference and keeps the global interface synchronized.'
      : normalizedTheme === THEME_CUSTOM
        ? 'Custom applies founder-controlled palette, contrast, and hex-token settings through the global token layer.'
        : normalizedTheme === THEME_DARK
          ? 'Dark applies the institutional dark surface with optional contrast refinement.'
          : 'Light applies the institutional light surface with optional contrast refinement.',
    effectiveTheme: state.effective || THEME_DARK,
    contrast: normalizeContrast(state.contrast),
    palette: state.palette || 'neuroartan',
    tokens: state.tokens || {},
    cinematicAllowed: normalizedTheme === THEME_CUSTOM,
    monoSolidRequired: normalizedTheme === THEME_DARK || normalizedTheme === THEME_LIGHT
  };
}

function createThemeIntentDetail(theme, source = 'home-platform-settings-theme') {
  const themeDetail = getThemeDetail(theme);

  return {
    theme: themeDetail.theme,
    themeLabel: themeDetail.themeLabel,
    themeSummary: themeDetail.themeSummary,
    effectiveTheme: themeDetail.effectiveTheme,
    contrast: themeDetail.contrast,
    palette: themeDetail.palette,
    tokens: themeDetail.tokens,
    cinematicAllowed: themeDetail.cinematicAllowed,
    monoSolidRequired: themeDetail.monoSolidRequired,
    source
  };
}

function requestThemeChange(detail) {
  document.dispatchEvent(new CustomEvent('neuroartan:home-theme-settings-intent', {
    detail: {
      ...detail,
      source: detail.source || 'home-platform-settings-theme'
    }
  }));
}

// Helper to get the main theme surface root for state sync
function getThemeSurfaceRoot(root) {
  if (!(root instanceof HTMLElement)) return null;

  if (root.classList.contains('home-platform-theme')) return root;

  const surface = root.querySelector('.home-platform-theme');
  return surface instanceof HTMLElement ? surface : null;
}

/* =============================================================================
   04) MODE OPTION BINDING
============================================================================= */
function bindModeOptions(root) {
  const modeOptions = Array.from(root.querySelectorAll(MODE_OPTION_SELECTOR));
  const contrastOptions = Array.from(root.querySelectorAll(CONTRAST_OPTION_SELECTOR));
  const paletteOptions = Array.from(root.querySelectorAll(PALETTE_OPTION_SELECTOR));
  const tokenInputs = Array.from(root.querySelectorAll(TOKEN_INPUT_SELECTOR));

  modeOptions.forEach((option) => {
    if (!(option instanceof HTMLElement)) return;
    if (option.dataset.homePlatformThemeModeBound === 'true') return;

    option.dataset.homePlatformThemeModeBound = 'true';

    option.addEventListener('click', (event) => {
      event.preventDefault();

      const requestedTheme = normalizeTheme(option.getAttribute('data-theme-option'));
      syncDestinationState(root, { ...getCurrentThemeState(), theme: requestedTheme });
      requestThemeChange(createThemeIntentDetail(requestedTheme));
    });
  });

  contrastOptions.forEach((option) => {
    if (!(option instanceof HTMLElement)) return;
    if (option.dataset.homePlatformThemeContrastBound === 'true') return;

    option.dataset.homePlatformThemeContrastBound = 'true';

    option.addEventListener('click', (event) => {
      event.preventDefault();

      const requestedContrast = normalizeContrast(option.getAttribute('data-theme-contrast-option'));
      syncDestinationState(root, { ...getCurrentThemeState(), contrast: requestedContrast });

      requestThemeChange({
        theme: getCurrentTheme(),
        contrast: requestedContrast
      });
    });
  });

  paletteOptions.forEach((option) => {
    if (!(option instanceof HTMLElement)) return;
    if (option.dataset.homePlatformThemePaletteBound === 'true') return;

    option.dataset.homePlatformThemePaletteBound = 'true';

    option.addEventListener('click', (event) => {
      event.preventDefault();

      const requestedPalette = String(option.getAttribute('data-theme-palette-option') || 'neuroartan').trim().toLowerCase();
      syncDestinationState(root, { ...getCurrentThemeState(), theme: THEME_CUSTOM, palette: requestedPalette });

      requestThemeChange({
        theme: THEME_CUSTOM,
        palette: requestedPalette
      });
    });
  });

  tokenInputs.forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    if (input.dataset.homePlatformThemeTokenBound === 'true') return;

    input.dataset.homePlatformThemeTokenBound = 'true';

    input.addEventListener('input', () => {
      const token = input.getAttribute('data-theme-token');
      if (!token) return;

      syncDestinationState(root, {
        ...getCurrentThemeState(),
        theme: THEME_CUSTOM,
        tokens: {
          ...getCurrentThemeState().tokens,
          [token]: input.value
        }
      });
      requestThemeChange({
        theme: THEME_CUSTOM,
        tokens: {
          [token]: input.value
        }
      });
    });
  });
}

/* =============================================================================
   05) TOGGLE CONSUMER BINDING
============================================================================= */
function syncToggleAvailability(root, theme) {
  const customThemeActive = getThemeDetail(theme).cinematicAllowed;
  const toggles = Array.from(root.querySelectorAll(TOGGLE_SELECTOR));
  const rows = Array.from(root.querySelectorAll('[data-home-platform-theme-toggle-row]'));

  toggles.forEach((toggle) => {
    if (!(toggle instanceof HTMLElement)) return;

    toggle.setAttribute('aria-disabled', customThemeActive ? 'false' : 'true');
    toggle.disabled = !customThemeActive;
    toggle.dataset.toggleAvailability = customThemeActive ? 'active' : 'locked';
  });

  rows.forEach((row) => {
    if (!(row instanceof HTMLElement)) return;
    row.dataset.toggleAvailability = customThemeActive ? 'active' : 'locked';
  });
}

/* =============================================================================
   06) PANEL STATE SYNC
============================================================================= */
function syncDestinationState(root, state = getCurrentThemeState()) {
  const themeDetail = getThemeDetail(state);
  const normalizedTheme = themeDetail.theme;
  const modeOptions = Array.from(root.querySelectorAll(MODE_OPTION_SELECTOR));
  const contrastOptions = Array.from(root.querySelectorAll(CONTRAST_OPTION_SELECTOR));
  const paletteOptions = Array.from(root.querySelectorAll(PALETTE_OPTION_SELECTOR));
  const tokenInputs = Array.from(root.querySelectorAll(TOKEN_INPUT_SELECTOR));
  const summaryNode = root.querySelector('.home-platform-theme__summary');
  const effectsContextNode = root.querySelector('#home-platform-theme-effects-title')?.parentElement?.querySelector('.home-platform-theme__section-context');
  const surfaceRoot = getThemeSurfaceRoot(root);
  const stateRoots = [root, surfaceRoot].filter((node, index, nodes) => node instanceof HTMLElement && nodes.indexOf(node) === index);

  stateRoots.forEach((stateRoot) => {
    stateRoot.dataset.activeTheme = normalizedTheme;
    stateRoot.dataset.activeThemeEffective = themeDetail.effectiveTheme;
    stateRoot.dataset.activeThemeContrast = themeDetail.contrast;
    stateRoot.dataset.activeThemePalette = themeDetail.palette;
    stateRoot.dataset.activeThemeLabel = themeDetail.themeLabel;
    stateRoot.dataset.cinematicAllowed = themeDetail.cinematicAllowed ? 'true' : 'false';
    stateRoot.dataset.monoSolidRequired = themeDetail.monoSolidRequired ? 'true' : 'false';
  });

  if (summaryNode) {
    summaryNode.textContent = themeDetail.themeSummary;
  }

  if (effectsContextNode) {
    effectsContextNode.textContent = themeDetail.cinematicAllowed
      ? 'These controls are active for Custom and can shape the cinematic homepage environment through the global token engine.'
      : 'These controls are locked in System, Light, and Dark when the active resolved layer requires a controlled institutional surface.';
  }

  modeOptions.forEach((option) => {
    if (!(option instanceof HTMLElement)) return;

    const optionTheme = normalizeTheme(option.getAttribute('data-theme-option'));
    const optionDetail = getThemeDetail(optionTheme);

    option.setAttribute('aria-pressed', optionTheme === normalizedTheme ? 'true' : 'false');
    option.dataset.activeThemeOption = optionTheme;
    option.dataset.activeThemeLabel = optionDetail.themeLabel;
  });

  contrastOptions.forEach((option) => {
    if (!(option instanceof HTMLElement)) return;

    const optionContrast = normalizeContrast(option.getAttribute('data-theme-contrast-option'));
    option.setAttribute('aria-pressed', optionContrast === themeDetail.contrast ? 'true' : 'false');
    option.dataset.activeThemeContrast = optionContrast;
  });

  paletteOptions.forEach((option) => {
    if (!(option instanceof HTMLElement)) return;

    const optionPalette = String(option.getAttribute('data-theme-palette-option') || '').trim().toLowerCase();
    option.setAttribute('aria-pressed', optionPalette === themeDetail.palette ? 'true' : 'false');
    option.dataset.activeThemePalette = optionPalette;
  });

  tokenInputs.forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;

    const token = input.getAttribute('data-theme-token');
    if (!token) return;

    const value = themeDetail.tokens?.[token];
    if (value && input.value !== value) input.value = value;
  });

  syncToggleAvailability(root, normalizedTheme);
}

function bindThemeSync(root) {
  if (!(root instanceof HTMLElement)) return;
  if (root.dataset.homePlatformThemeSyncBound === 'true') return;

  root.dataset.homePlatformThemeSyncBound = 'true';

  document.addEventListener('neuroartan:theme-changed', (event) => {
    syncDestinationState(root, event?.detail || getCurrentThemeState());
  });

  document.addEventListener('neuroartan:toggle-changed', (event) => {
    const toggle = event?.detail?.element;
    if (!(toggle instanceof HTMLElement)) return;
    if (toggle.getAttribute('data-toggle-scope') !== 'homepage-theme') return;

    const key = toggle.getAttribute('data-toggle-key') || '';
    if (!key) return;

    const themeDetail = getThemeDetail();

    root.dispatchEvent(new CustomEvent('neuroartan:homepage-theme-control-changed', {
      bubbles: true,
      detail: {
        key,
        checked: Boolean(event?.detail?.checked),
        theme: themeDetail.theme,
        themeLabel: themeDetail.themeLabel,
        themeSummary: themeDetail.themeSummary,
        effectiveTheme: themeDetail.effectiveTheme,
        contrast: themeDetail.contrast,
        palette: themeDetail.palette,
        cinematicAllowed: themeDetail.cinematicAllowed,
        monoSolidRequired: themeDetail.monoSolidRequired,
        source: 'home-platform-settings-theme'
      }
    }));
  });
}

/* =============================================================================
   07) DESTINATION MOUNT
============================================================================= */
export function mountHomePlatformDestination(root) {
  if (!(root instanceof HTMLElement)) return;

  const destinationRoot = root.matches(DESTINATION_SELECTOR)
    ? root
    : root.querySelector(DESTINATION_SELECTOR);

  if (!(destinationRoot instanceof HTMLElement)) return;

  bindModeOptions(destinationRoot);
  bindThemeSync(destinationRoot);
  syncDestinationState(destinationRoot, getCurrentThemeState());
}

/* =============================================================================
   08) END OF FILE
============================================================================= */
