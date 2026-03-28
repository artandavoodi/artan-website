/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) ROOT CONSTANTS
   03) STATE FLAGS
   04) QUERY HELPERS
   04A) EVENT DETAIL HELPERS
   05) MOUNT HELPERS
   06) RENDER HELPERS
   07) STATE METADATA APPLICATION
   08) OPEN STATE APPLICATION
   09) CLOSE STATE APPLICATION
   10) COOKIE STORAGE HELPERS
   11) CONSENT ACTIONS
   12) EVENT BINDING
   13) OPEN REQUEST BINDING
   13A) OVERLAY COORDINATION
   14) INITIALIZATION
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
(() => {
  const MODULE_ID = 'cookie-consent';

  /* =============================================================================
     02) ROOT CONSTANTS
  ============================================================================= */
  const OPEN_CLASS = 'cookie-consent-open';
  const CLOSING_CLASS = 'cookie-consent-closing';
  const STORAGE_KEY = 'neuroartan.cookieConsent';
  const CLOSE_DELAY_MS = 360;

  /* =============================================================================
     03) STATE FLAGS
  ============================================================================= */
  let closeTimer = null;

  /* =============================================================================
     04) QUERY HELPERS
  ============================================================================= */
  const q = (selector, scope = document) => scope.querySelector(selector);
  const qa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /* =============================================================================
     04A) EVENT DETAIL HELPERS
  ============================================================================= */
  function getEventDetail(event) {
    return event && event.detail && typeof event.detail === 'object'
      ? event.detail
      : {};
  }

  function getMount() {
    return document.getElementById('cookie-consent-mount');
  }

  function getOverlay() {
    return q('[data-cookie-consent="root"]');
  }

  function getPanel() {
    return q('[data-cookie-consent="panel"]');
  }

  function getBackdrop() {
    return q('[data-cookie-consent="backdrop"]');
  }

  function getCloseControls() {
    const overlay = getOverlay();
    return overlay ? qa('[data-cookie-consent-close="true"]', overlay) : [];
  }

  function getAcceptControls() {
    const overlay = getOverlay();
    return overlay ? qa('[data-cookie-consent-accept="true"]', overlay) : [];
  }

  function getRejectControls() {
    const overlay = getOverlay();
    return overlay ? qa('[data-cookie-consent-reject="true"]', overlay) : [];
  }

  function getSettingsControls() {
    const overlay = getOverlay();
    return overlay ? qa('[data-cookie-consent-settings="true"]', overlay) : [];
  }

  function getSaveControls() {
    const overlay = getOverlay();
    return overlay ? qa('[data-cookie-consent-save="true"]', overlay) : [];
  }

  function getCheckboxes() {
    const overlay = getOverlay();
    return overlay ? qa('[data-cookie-consent-category]', overlay) : [];
  }

  /* =============================================================================
     05) MOUNT HELPERS
  ============================================================================= */
  function ensureMountAttributes() {
    const mount = getMount();
    if (!mount) return;

    if (!mount.dataset.consentState) mount.dataset.consentState = 'pending';
    if (!mount.dataset.consentSurface) mount.dataset.consentSurface = 'banner';
    if (!mount.dataset.consentSettings) mount.dataset.consentSettings = 'available';
  }

  /* =============================================================================
     06) RENDER HELPERS
  ============================================================================= */
  function renderConsentShell() {
    const mount = getMount();
    if (!mount || mount.dataset.cookieConsentRendered === 'true') return;

    mount.innerHTML = `
      <div class="cookie-consent" data-cookie-consent="root" aria-hidden="true">
        <button class="cookie-consent-backdrop" data-cookie-consent="backdrop" data-cookie-consent-close="true" aria-label="Close cookie settings"></button>
        <aside class="cookie-consent-panel" data-cookie-consent="panel" role="dialog" aria-modal="true" aria-labelledby="cookie-consent-title">
          <div class="cookie-consent-header">
            <p class="cookie-consent-eyebrow">Privacy Controls</p>
            <h2 id="cookie-consent-title" class="cookie-consent-title">Cookie settings</h2>
            <p class="cookie-consent-copy">Review and manage cookie preferences with clear, consent-aware control.</p>
            <button class="cookie-consent-close" type="button" data-cookie-consent-close="true" aria-label="Close cookie settings">
              <span class="cookie-consent-close-line cookie-consent-close-line--first"></span>
              <span class="cookie-consent-close-line cookie-consent-close-line--second"></span>
            </button>
          </div>

          <div class="cookie-consent-body">
            <div class="cookie-consent-banner" data-cookie-consent-surface="banner">
              <p class="cookie-consent-note">Neuroartan uses cookies for essential functionality and, when permitted, for analytics and experience refinement.</p>
              <div class="cookie-consent-actions">
                <button type="button" class="cookie-consent-action cookie-consent-action--primary" data-cookie-consent-accept="true">Accept all</button>
                <button type="button" class="cookie-consent-action cookie-consent-action--secondary" data-cookie-consent-reject="true">Reject non-essential</button>
                <button type="button" class="cookie-consent-action cookie-consent-action--tertiary" data-cookie-consent-settings="true">Review settings</button>
              </div>
            </div>

            <div class="cookie-consent-settings" data-cookie-consent-surface="settings" hidden>
              <label class="cookie-consent-row">
                <span class="cookie-consent-row-copy">
                  <strong>Essential</strong>
                  <span>Required for core website operation.</span>
                </span>
                <input type="checkbox" data-cookie-consent-category="essential" checked disabled>
              </label>

              <label class="cookie-consent-row">
                <span class="cookie-consent-row-copy">
                  <strong>Analytics</strong>
                  <span>Helps improve performance and understand usage patterns.</span>
                </span>
                <input type="checkbox" data-cookie-consent-category="analytics">
              </label>

              <label class="cookie-consent-row">
                <span class="cookie-consent-row-copy">
                  <strong>Experience</strong>
                  <span>Supports preference memory and refined interaction behavior.</span>
                </span>
                <input type="checkbox" data-cookie-consent-category="experience">
              </label>

              <div class="cookie-consent-actions">
                <button type="button" class="cookie-consent-action cookie-consent-action--primary" data-cookie-consent-save="true">Save settings</button>
                <button type="button" class="cookie-consent-action cookie-consent-action--secondary" data-cookie-consent-accept="true">Accept all</button>
                <button type="button" class="cookie-consent-action cookie-consent-action--tertiary" data-cookie-consent-reject="true">Reject non-essential</button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    mount.dataset.cookieConsentRendered = 'true';
  }

  /* =============================================================================
     07) STATE METADATA APPLICATION
  ============================================================================= */
  function applySurface(surface = 'banner') {
    const mount = getMount();
    const overlay = getOverlay();
    if (!mount || !overlay) return;

    const normalizedSurface = surface === 'settings' ? 'settings' : 'banner';
    mount.dataset.consentSurface = normalizedSurface;

    qa('[data-cookie-consent-surface]', overlay).forEach((node) => {
      node.hidden = node.dataset.cookieConsentSurface !== normalizedSurface;
    });
  }

  function applyState(state = 'pending') {
    const mount = getMount();
    if (!mount) return;
    mount.dataset.consentState = state;
  }

  /* =============================================================================
     08) OPEN STATE APPLICATION
  ============================================================================= */
  function clearCloseTimer() {
    if (!closeTimer) return;
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  function openConsent(surface = 'banner') {
    const overlay = getOverlay();
    if (!overlay) return;

    clearCloseTimer();
    applySurface(surface);

    document.body.classList.remove(CLOSING_CLASS);
    document.body.classList.add(OPEN_CLASS);
    overlay.setAttribute('aria-hidden', 'false');

    document.dispatchEvent(new CustomEvent('cookie-consent:opened', {
      detail: { surface }
    }));
  }

  /* =============================================================================
     09) CLOSE STATE APPLICATION
  ============================================================================= */
  function closeConsent() {
    const overlay = getOverlay();
    if (!overlay) return;

    clearCloseTimer();
    document.body.classList.remove(OPEN_CLASS);
    document.body.classList.add(CLOSING_CLASS);
    overlay.setAttribute('aria-hidden', 'true');

    closeTimer = window.setTimeout(() => {
      document.body.classList.remove(CLOSING_CLASS);
      document.dispatchEvent(new CustomEvent('cookie-consent:closed'));
    }, CLOSE_DELAY_MS);
  }

  /* =============================================================================
     10) COOKIE STORAGE HELPERS
  ============================================================================= */
  function readStoredConsent() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeStoredConsent(payload) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      return;
    }
  }

  function getSettingsPayload() {
    const payload = {
      essential: true,
      analytics: false,
      experience: false
    };

    getCheckboxes().forEach((checkbox) => {
      const key = checkbox.dataset.cookieConsentCategory;
      if (!key || key === 'essential') return;
      payload[key] = Boolean(checkbox.checked);
    });

    return payload;
  }

  function applyStoredConsentToInputs() {
    const stored = readStoredConsent();
    if (!stored || !stored.preferences) return;

    getCheckboxes().forEach((checkbox) => {
      const key = checkbox.dataset.cookieConsentCategory;
      if (!key || key === 'essential') return;
      checkbox.checked = Boolean(stored.preferences[key]);
    });
  }

  /* =============================================================================
     11) CONSENT ACTIONS
  ============================================================================= */
  function acceptAll() {
    const payload = {
      state: 'accepted',
      preferences: {
        essential: true,
        analytics: true,
        experience: true
      },
      updatedAt: new Date().toISOString()
    };

    writeStoredConsent(payload);
    applyState('accepted');
    applyStoredConsentToInputs();
    closeConsent();
  }

  function rejectNonEssential() {
    const payload = {
      state: 'rejected',
      preferences: {
        essential: true,
        analytics: false,
        experience: false
      },
      updatedAt: new Date().toISOString()
    };

    writeStoredConsent(payload);
    applyState('rejected');
    applyStoredConsentToInputs();
    closeConsent();
  }

  function saveSettings() {
    const payload = {
      state: 'customized',
      preferences: getSettingsPayload(),
      updatedAt: new Date().toISOString()
    };

    writeStoredConsent(payload);
    applyState('customized');
    closeConsent();
  }

  /* =============================================================================
     12) EVENT BINDING
  ============================================================================= */
  function bindControls() {
    getCloseControls().forEach((control) => {
      if (control.dataset.cookieConsentCloseBound === 'true') return;
      control.dataset.cookieConsentCloseBound = 'true';
      control.addEventListener('click', () => closeConsent());
    });

    getAcceptControls().forEach((control) => {
      if (control.dataset.cookieConsentAcceptBound === 'true') return;
      control.dataset.cookieConsentAcceptBound = 'true';
      control.addEventListener('click', () => acceptAll());
    });

    getRejectControls().forEach((control) => {
      if (control.dataset.cookieConsentRejectBound === 'true') return;
      control.dataset.cookieConsentRejectBound = 'true';
      control.addEventListener('click', () => rejectNonEssential());
    });

    getSettingsControls().forEach((control) => {
      if (control.dataset.cookieConsentSettingsBound === 'true') return;
      control.dataset.cookieConsentSettingsBound = 'true';
      control.addEventListener('click', () => openConsent('settings'));
    });

    getSaveControls().forEach((control) => {
      if (control.dataset.cookieConsentSaveBound === 'true') return;
      control.dataset.cookieConsentSaveBound = 'true';
      control.addEventListener('click', () => saveSettings());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (!document.body.classList.contains(OPEN_CLASS)) return;
      closeConsent();
    });
  }

  /* =============================================================================
     13) OPEN REQUEST BINDING
  ============================================================================= */
  function bindOpenRequests() {
    if (document.documentElement.dataset.cookieConsentRequestBound === 'true') return;
    document.documentElement.dataset.cookieConsentRequestBound = 'true';

    document.addEventListener('cookie-consent:open-request', (event) => {
      const detail = getEventDetail(event);
      openConsent(detail.surface === 'settings' ? 'settings' : 'banner');
    });
  }

  /* =============================================================================
     13A) OVERLAY COORDINATION
  ============================================================================= */
  function bindOverlayCoordination() {
    if (document.documentElement.dataset.cookieConsentOverlayCoordinationBound === 'true') return;
    document.documentElement.dataset.cookieConsentOverlayCoordinationBound = 'true';

    document.addEventListener('cookie-consent:open-request', () => {
      document.dispatchEvent(new CustomEvent('account-drawer:close-request', {
        detail: {
          source: MODULE_ID,
          reason: 'cookie-consent-open'
        }
      }));
    });

    document.addEventListener('cookie-consent:opened', () => {
      document.dispatchEvent(new CustomEvent('account-drawer:close-request', {
        detail: {
          source: MODULE_ID,
          reason: 'cookie-consent-opened'
        }
      }));
    });
  }

  /* =============================================================================
     14) INITIALIZATION
  ============================================================================= */
  function initCookieConsent() {
    const mount = getMount();
    if (!mount) return;

    ensureMountAttributes();
    renderConsentShell();
    applyStoredConsentToInputs();
    bindControls();
    bindOpenRequests();
    bindOverlayCoordination();

    const stored = readStoredConsent();
    if (!stored) {
      window.requestAnimationFrame(() => {
        openConsent('banner');
      });
      return;
    }

    applyState(stored.state || 'pending');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent, { once: true });
  } else {
    initCookieConsent();
  }
})();