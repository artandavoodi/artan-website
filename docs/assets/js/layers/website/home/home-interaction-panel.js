import {
  getActiveModelRoutingContext,
  getActiveModelState,
  subscribeActiveModelState,
} from '../system/active-model.js';

const HOME_INTERACTION_PANEL_STATE = {
  isBound: false,
  files: [],
};

function getHomeInteractionPanelNodes() {
  return {
    root: document.querySelector('#home-interaction-panel'),
    form: document.querySelector('#home-interaction-panel-form'),
    input: document.querySelector('#home-interaction-panel-input'),
    fileInput: document.querySelector('#home-interaction-panel-file-input'),
    files: document.querySelector('[data-home-interaction-files]'),
    activeModel: document.querySelector('[data-home-interaction-active-model]'),
    activeRoute: document.querySelector('[data-home-interaction-active-route]'),
  };
}

function escapeHomeInteractionHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeHomeInteractionQuery(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function dispatchHomeInteractionEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

function syncHomeInteractionComposerHeight() {
  const { input } = getHomeInteractionPanelNodes();
  if (!(input instanceof HTMLTextAreaElement)) {
    return;
  }

  input.style.height = 'auto';
  input.style.height = `${Math.max(input.scrollHeight, 136)}px`;
}

function renderHomeInteractionFiles() {
  const nodes = getHomeInteractionPanelNodes();
  if (!nodes.files) {
    return;
  }

  nodes.files.innerHTML = HOME_INTERACTION_PANEL_STATE.files.length
    ? HOME_INTERACTION_PANEL_STATE.files
        .map((file) => `<span class="home-interaction-panel__file-chip">${escapeHomeInteractionHtml(file.name)}</span>`)
        .join('')
    : '';
}

function renderHomeInteractionActiveModel() {
  const nodes = getHomeInteractionPanelNodes();
  const activeModelState = getActiveModelState();
  const routingContext = getActiveModelRoutingContext();
  const activeModel = activeModelState.activeModel;
  const modelLabel = activeModel?.display_name || activeModel?.search_title || 'Neuroartan';
  const routeLabel = routingContext.engineLabel || activeModel?.engine?.preferred_route || 'Site knowledge';

  if (nodes.activeModel) {
    nodes.activeModel.textContent = modelLabel;
  }

  if (nodes.activeRoute) {
    nodes.activeRoute.textContent = routeLabel;
  }

  if (nodes.input instanceof HTMLTextAreaElement) {
    nodes.input.placeholder = `Ask ${modelLabel}, search the platform, or start a structured reflection.`;
  }
}

function submitHomeInteractionQuery() {
  const nodes = getHomeInteractionPanelNodes();
  const query = normalizeHomeInteractionQuery(nodes.input?.value || '');

  if (!query) {
    nodes.input?.focus();
    return;
  }

  dispatchHomeInteractionEvent('neuroartan:home-stage-voice-transcript', {
    transcript: query,
  });
  dispatchHomeInteractionEvent('neuroartan:home-stage-voice-query-submitted', {
    query,
    source: 'text',
    mode: 'search_or_knowledge',
    stagedFiles: HOME_INTERACTION_PANEL_STATE.files.map((file) => file.name),
  });

  if (nodes.input instanceof HTMLTextAreaElement) {
    nodes.input.value = '';
  }

  if (nodes.fileInput instanceof HTMLInputElement) {
    nodes.fileInput.value = '';
  }

  HOME_INTERACTION_PANEL_STATE.files = [];
  renderHomeInteractionFiles();
  syncHomeInteractionComposerHeight();
}

function openHomeInteractionSearch() {
  dispatchHomeInteractionEvent('home:platform-shell-close-request', {
    source: 'home-interaction-panel',
  });
  dispatchHomeInteractionEvent('neuroartan:home-search-shell-open-requested', {
    source: 'home-interaction-panel',
  });
}

function clearHomeInteractionSurface() {
  const nodes = getHomeInteractionPanelNodes();

  if (nodes.input instanceof HTMLTextAreaElement) {
    nodes.input.value = '';
    nodes.input.focus();
  }

  if (nodes.fileInput instanceof HTMLInputElement) {
    nodes.fileInput.value = '';
  }

  HOME_INTERACTION_PANEL_STATE.files = [];
  renderHomeInteractionFiles();
  syncHomeInteractionComposerHeight();

  dispatchHomeInteractionEvent('neuroartan:home-stage-reset-requested', {
    source: 'home-interaction-panel',
  });
}

function bindHomeInteractionPanel() {
  subscribeActiveModelState(() => {
    renderHomeInteractionActiveModel();
  });

  document.addEventListener('click', (event) => {
    const root = document.querySelector('#home-interaction-panel');
    if (!root) {
      return;
    }

    const target = event.target.closest(
      '[data-home-interaction-open-search], [data-home-interaction-attach], [data-home-interaction-clear]'
    );
    if (!target || !root.contains(target)) {
      return;
    }

    if (target.matches('[data-home-interaction-open-search]')) {
      event.preventDefault();
      openHomeInteractionSearch();
      return;
    }

    if (target.matches('[data-home-interaction-attach]')) {
      event.preventDefault();
      getHomeInteractionPanelNodes().fileInput?.click();
      return;
    }

    if (target.matches('[data-home-interaction-clear]')) {
      event.preventDefault();
      clearHomeInteractionSurface();
    }
  });

  document.addEventListener('change', (event) => {
    const fileInput = event.target.closest('#home-interaction-panel-file-input');
    if (!(fileInput instanceof HTMLInputElement)) {
      return;
    }

    HOME_INTERACTION_PANEL_STATE.files = Array.from(fileInput.files || []);
    renderHomeInteractionFiles();
  });

  document.addEventListener('input', (event) => {
    const input = event.target.closest('#home-interaction-panel-input');
    if (!(input instanceof HTMLTextAreaElement)) {
      return;
    }

    syncHomeInteractionComposerHeight();
  });

  document.addEventListener('keydown', (event) => {
    const input = event.target.closest('#home-interaction-panel-input');
    if (!(input instanceof HTMLTextAreaElement)) {
      return;
    }

    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    submitHomeInteractionQuery();
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('#home-interaction-panel-form');
    if (!form) {
      return;
    }

    event.preventDefault();
    submitHomeInteractionQuery();
  });
}

function bootHomeInteractionPanel() {
  const nodes = getHomeInteractionPanelNodes();
  if (!nodes.root) {
    return;
  }

  renderHomeInteractionActiveModel();
  renderHomeInteractionFiles();
  syncHomeInteractionComposerHeight();

  if (HOME_INTERACTION_PANEL_STATE.isBound) {
    return;
  }

  HOME_INTERACTION_PANEL_STATE.isBound = true;
  bindHomeInteractionPanel();
}

document.addEventListener('fragment:mounted', (event) => {
  if (event?.detail?.name !== 'home-interaction-panel') return;
  bootHomeInteractionPanel();
});

document.addEventListener('neuroartan:runtime-ready', () => {
  bootHomeInteractionPanel();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeInteractionPanel, { once: true });
} else {
  bootHomeInteractionPanel();
}
