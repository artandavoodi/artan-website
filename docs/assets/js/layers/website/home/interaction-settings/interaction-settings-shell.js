/* =========================================================
   00. FILE INDEX
   01. INTERACTION SETTINGS SHELL STATE
   02. DOM HELPERS
   03. SECTION NAVIGATION
   04. SETTING CONTROLS
   05. PANEL LIFECYCLE
   06. SHELL DELEGATION
   07. GLOBAL TRIGGERS
   08. BOOT
   ========================================================= */

/* =========================================================
   01. INTERACTION SETTINGS SHELL STATE
   ========================================================= */
const HOME_INTERACTION_SETTINGS_SHELL_STATE = {
  isShellBound: false,
  isGlobalBound: false,
  shellRoot: null,
  activeSection: 'overview',
};

/* =========================================================
   02. DOM HELPERS
   ========================================================= */
function getHomeInteractionSettingsShellNodes() {
  const root = document.getElementById('home-interaction-settings-panel');

  return {
    root,
    navItems: Array.from(root?.querySelectorAll?.('[data-home-interaction-settings-tab]') ?? []),
    sectionMounts: Array.from(root?.querySelectorAll?.('[data-home-interaction-settings-section-mount]') ?? []),
    settingControls: Array.from(root?.querySelectorAll?.('[data-home-interaction-setting]') ?? []),
  };
}

function normalizeHomeInteractionSettingsSection(section) {
  const normalized = typeof section === 'string' ? section.trim() : '';
  return normalized || 'overview';
}

/* =========================================================
   03. SECTION NAVIGATION
   ========================================================= */
function setHomeInteractionSettingsSection(section) {
  const nodes = getHomeInteractionSettingsShellNodes();
  const activeSection = normalizeHomeInteractionSettingsSection(section);

  HOME_INTERACTION_SETTINGS_SHELL_STATE.activeSection = activeSection;

  if (nodes.root) {
    nodes.root.dataset.homeInteractionSettingsActiveSection = activeSection;
  }

  nodes.navItems.forEach((item) => {
    const isActive = item.dataset.homeInteractionSettingsTab === activeSection;
    item.setAttribute('aria-selected', String(isActive));
  });

  nodes.sectionMounts.forEach((mount) => {
    const mountSection = mount.dataset.homeInteractionSettingsSectionMount;
    mount.hidden = mountSection !== activeSection;
  });
}

/* =========================================================
   04. SETTING CONTROLS
   ========================================================= */
function syncHomeInteractionSettingsControl(control) {
  if (!control) return;

  const isToggle = control.classList.contains('home-interaction-settings-panel__toggle-row');

  if (isToggle) {
    const nextPressed = control.getAttribute('aria-pressed') !== 'true';
    control.setAttribute('aria-pressed', String(nextPressed));
    control.dataset.homeInteractionSettingValue = nextPressed ? 'enabled' : 'disabled';
    return;
  }

  const settingName = control.dataset.homeInteractionSetting;
  const group = control.closest('[role="group"]');

  if (!settingName || !group) return;

  group.querySelectorAll(`[data-home-interaction-setting="${settingName}"]`).forEach((item) => {
    item.setAttribute('aria-pressed', String(item === control));
  });
}

/* =========================================================
   05. PANEL LIFECYCLE
   ========================================================= */
function openHomeInteractionSettingsPanel(section = HOME_INTERACTION_SETTINGS_SHELL_STATE.activeSection) {
  const nodes = getHomeInteractionSettingsShellNodes();

  if (!nodes.root) return;

  nodes.root.hidden = false;
  nodes.root.dataset.homeInteractionSettingsState = 'open';
  setHomeInteractionSettingsSection(section);
}

function closeHomeInteractionSettingsPanel() {
  const nodes = getHomeInteractionSettingsShellNodes();

  if (!nodes.root) return;

  nodes.root.dataset.homeInteractionSettingsState = 'closed';
  nodes.root.hidden = true;
}

function bindHomeInteractionSettingsShell() {
  const nodes = getHomeInteractionSettingsShellNodes();

  if (!nodes.root) return false;

  if (
    HOME_INTERACTION_SETTINGS_SHELL_STATE.isShellBound &&
    HOME_INTERACTION_SETTINGS_SHELL_STATE.shellRoot === nodes.root
  ) {
    return false;
  }

  nodes.root.addEventListener('click', handleHomeInteractionSettingsShellClick, true);

  HOME_INTERACTION_SETTINGS_SHELL_STATE.shellRoot = nodes.root;
  HOME_INTERACTION_SETTINGS_SHELL_STATE.isShellBound = true;
  return true;
}

/* =========================================================
   06. SHELL DELEGATION
   ========================================================= */
function handleHomeInteractionSettingsShellClick(event) {
  const closeTrigger = event.target?.closest?.('[data-home-interaction-settings-close="true"]');

  if (closeTrigger) {
    event.preventDefault();
    event.stopPropagation();
    closeHomeInteractionSettingsPanel();
    return;
  }

  const navItem = event.target?.closest?.('[data-home-interaction-settings-tab]');

  if (navItem) {
    event.preventDefault();
    setHomeInteractionSettingsSection(navItem.dataset.homeInteractionSettingsTab);
    return;
  }

  const control = event.target?.closest?.('[data-home-interaction-setting]');

  if (control) {
    event.preventDefault();
    syncHomeInteractionSettingsControl(control);
  }
}

/* =========================================================
   07. GLOBAL TRIGGERS
   ========================================================= */
function bindHomeInteractionSettingsGlobalTriggers() {
  if (HOME_INTERACTION_SETTINGS_SHELL_STATE.isGlobalBound) return;

  document.addEventListener('neuroartan:home-interaction-settings-open-requested', (event) => {
    const section = event instanceof CustomEvent ? event.detail?.section : undefined;
    openHomeInteractionSettingsPanel(section);
  });

  document.addEventListener('neuroartan:home-interaction-settings-panel-open-requested', (event) => {
    const section = event instanceof CustomEvent ? event.detail?.section : undefined;
    openHomeInteractionSettingsPanel(section);
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target?.closest?.(
      '[data-home-interaction-settings-open], [data-home-interaction-settings-trigger], [data-home-topbar-action="interaction-settings"], [data-home-action="interaction-settings"]'
    );

    if (!trigger) return;

    event.preventDefault();
    openHomeInteractionSettingsPanel(trigger.dataset.homeInteractionSettingsSection);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeHomeInteractionSettingsPanel();
    }
  });

  HOME_INTERACTION_SETTINGS_SHELL_STATE.isGlobalBound = true;
}

/* =========================================================
   08. BOOT
   ========================================================= */
function bootHomeInteractionSettingsShell() {
  bindHomeInteractionSettingsGlobalTriggers();

  const didBind = bindHomeInteractionSettingsShell();

  if (!didBind && !getHomeInteractionSettingsShellNodes().root) return;

  setHomeInteractionSettingsSection(HOME_INTERACTION_SETTINGS_SHELL_STATE.activeSection);
}

window.addEventListener('fragment:mounted', (event) => {
  const fragmentKey = event instanceof CustomEvent ? event.detail?.key : '';

  if (fragmentKey !== 'home-interaction-settings-panel') return;

  bootHomeInteractionSettingsShell();
});
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeInteractionSettingsShell, { once: true });
} else {
  bootHomeInteractionSettingsShell();
}