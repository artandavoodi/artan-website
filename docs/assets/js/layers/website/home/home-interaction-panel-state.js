import { getActiveModelRoutingContext } from '../system/active-model.js';

const HOME_INTERACTION_PANEL_STATE = {
  isBound: false,
  mode: 'idle',
  route: '',
};

function getHomeInteractionPanelStateNodes() {
  return {
    root: document.querySelector('#home-interaction-panel'),
    modeLabel: document.querySelector('[data-home-interaction-mode-label]'),
    hint: document.querySelector('[data-home-interaction-hint]'),
    voiceLabel: document.querySelector('[data-home-interaction-voice-label]'),
    submit: document.querySelector('#home-interaction-panel-submit'),
    submitLabel: document.querySelector('[data-home-interaction-submit-label]'),
    voiceButton: document.querySelector('#stage-microphone-button'),
  };
}

function normalizeHomeInteractionMode(value) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : 'idle';
}

function normalizeHomeInteractionRoute(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getHomeInteractionResponseLabel() {
  switch (HOME_INTERACTION_PANEL_STATE.route) {
    case 'translation':
      return 'Translating';
    case 'web':
    case 'site-knowledge':
    case 'platform-search':
      return 'Finding';
    default:
      return 'Responding';
  }
}

function getHomeInteractionStateCopy() {
  const routingContext = getActiveModelRoutingContext(HOME_INTERACTION_PANEL_STATE.route || 'knowledge');

  switch (HOME_INTERACTION_PANEL_STATE.mode) {
    case 'listening':
      return {
        modeLabel: 'Listening',
        hint: 'Listening live. Speak naturally or stop when you are ready to submit.',
        voiceLabel: 'Stop listening',
        submitLabel: 'Listening…',
        submitDisabled: true,
      };
    case 'thinking':
      return {
        modeLabel: 'Thinking',
        hint: 'Routing the request through the active model and deciding the right response path.',
        voiceLabel: 'Voice',
        submitLabel: 'Thinking…',
        submitDisabled: true,
      };
    case 'responding':
      return {
        modeLabel: getHomeInteractionResponseLabel(),
        hint: routingContext.responsePrelude || 'Responding through the active model and current route.',
        voiceLabel: 'Voice',
        submitLabel: 'Ask Again',
        submitDisabled: false,
      };
    default:
      return {
        modeLabel: 'Ready',
        hint: 'Text, voice, or documents for the active model.',
        voiceLabel: 'Voice',
        submitLabel: 'Ask Active Model',
        submitDisabled: false,
      };
  }
}

function syncHomeInteractionPanelState() {
  const nodes = getHomeInteractionPanelStateNodes();
  if (!nodes.root) {
    return;
  }

  const copy = getHomeInteractionStateCopy();
  nodes.root.setAttribute('data-home-interaction-mode', HOME_INTERACTION_PANEL_STATE.mode);

  if (nodes.modeLabel) {
    nodes.modeLabel.textContent = copy.modeLabel;
  }

  if (nodes.hint) {
    nodes.hint.textContent = copy.hint;
  }

  if (nodes.voiceLabel) {
    nodes.voiceLabel.textContent = copy.voiceLabel;
  }

  if (nodes.voiceButton) {
    nodes.voiceButton.setAttribute('aria-label', copy.voiceLabel);
  }

  if (nodes.submitLabel) {
    nodes.submitLabel.textContent = copy.submitLabel;
  }

  if (nodes.submit instanceof HTMLButtonElement) {
    nodes.submit.disabled = copy.submitDisabled;
  }
}

function bindHomeInteractionPanelState() {
  document.addEventListener('neuroartan:home-stage-voice-mode', (event) => {
    HOME_INTERACTION_PANEL_STATE.mode = normalizeHomeInteractionMode(event?.detail?.mode);
    syncHomeInteractionPanelState();
  });

  document.addEventListener('neuroartan:home-stage-query-routing', (event) => {
    HOME_INTERACTION_PANEL_STATE.route = normalizeHomeInteractionRoute(event?.detail?.route);
    syncHomeInteractionPanelState();
  });

  document.addEventListener('neuroartan:home-stage-routing-resolved', (event) => {
    HOME_INTERACTION_PANEL_STATE.route = normalizeHomeInteractionRoute(event?.detail?.route);
    syncHomeInteractionPanelState();
  });

  document.addEventListener('neuroartan:home-stage-reset-requested', () => {
    HOME_INTERACTION_PANEL_STATE.mode = 'idle';
    HOME_INTERACTION_PANEL_STATE.route = '';
    syncHomeInteractionPanelState();
  });
}

function bootHomeInteractionPanelState() {
  const { root } = getHomeInteractionPanelStateNodes();
  if (!root) {
    return;
  }

  syncHomeInteractionPanelState();

  if (HOME_INTERACTION_PANEL_STATE.isBound) {
    return;
  }

  HOME_INTERACTION_PANEL_STATE.isBound = true;
  bindHomeInteractionPanelState();
}

document.addEventListener('fragment:mounted', (event) => {
  if (event?.detail?.name !== 'home-interaction-panel') return;
  bootHomeInteractionPanelState();
});

document.addEventListener('neuroartan:runtime-ready', () => {
  bootHomeInteractionPanelState();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeInteractionPanelState, { once: true });
} else {
  bootHomeInteractionPanelState();
}
