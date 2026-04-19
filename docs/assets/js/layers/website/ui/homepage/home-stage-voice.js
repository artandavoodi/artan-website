/* =========================================================
   00. FILE INDEX
   01. MODULE STATE
   02. DOM CONSTANTS
   03. STATE HELPERS
   04. DOM HELPERS
   05. VOICE SURFACE BINDING
   06. EVENT BINDING
   07. MODULE BOOT
   ========================================================= */

/* =========================================================
   01. MODULE STATE
   ========================================================= */

const HOME_STAGE_VOICE_STATE = {
  isBound: false,
  isActive: false,
  mode: 'idle',
  transcript: '',
  response: '',
};

/* =========================================================
   02. DOM CONSTANTS
   ========================================================= */

const HOME_STAGE_VOICE_SELECTORS = {
  stageShell: '#stage-cognitive-core-shell',
  microphoneButton: '#stage-microphone-button',
  interactionShell: '#stage-voice-interaction-shell',
  status: '#stage-voice-status',
  transcript: '#stage-voice-transcript',
  response: '#stage-voice-response',
};

/* =========================================================
   03. STATE HELPERS
   ========================================================= */

function setHomeStageVoiceMode(mode) {
  HOME_STAGE_VOICE_STATE.mode = mode;
  HOME_STAGE_VOICE_STATE.isActive = mode !== 'idle';
}

function setHomeStageTranscript(value) {
  HOME_STAGE_VOICE_STATE.transcript = typeof value === 'string' ? value : '';
}

function setHomeStageResponse(value) {
  HOME_STAGE_VOICE_STATE.response = typeof value === 'string' ? value : '';
}

/* =========================================================
   04. DOM HELPERS
   ========================================================= */

function getHomeStageVoiceNodes() {
  return {
    stageShell: document.querySelector(HOME_STAGE_VOICE_SELECTORS.stageShell),
    microphoneButton: document.querySelector(HOME_STAGE_VOICE_SELECTORS.microphoneButton),
    interactionShell: document.querySelector(HOME_STAGE_VOICE_SELECTORS.interactionShell),
    status: document.querySelector(HOME_STAGE_VOICE_SELECTORS.status),
    transcript: document.querySelector(HOME_STAGE_VOICE_SELECTORS.transcript),
    response: document.querySelector(HOME_STAGE_VOICE_SELECTORS.response),
  };
}

function syncHomeStageVoiceDom() {
  const nodes = getHomeStageVoiceNodes();

  if (!nodes.stageShell || !nodes.microphoneButton) {
    return;
  }

  nodes.stageShell.dataset.voiceMode = HOME_STAGE_VOICE_STATE.mode;
  nodes.stageShell.dataset.voiceActive = HOME_STAGE_VOICE_STATE.isActive ? 'true' : 'false';
  nodes.microphoneButton.dataset.voiceMode = HOME_STAGE_VOICE_STATE.mode;
  nodes.microphoneButton.dataset.voiceActive = HOME_STAGE_VOICE_STATE.isActive ? 'true' : 'false';
  nodes.microphoneButton.setAttribute(
    'aria-pressed',
    HOME_STAGE_VOICE_STATE.isActive ? 'true' : 'false'
  );

  if (nodes.interactionShell) {
    nodes.interactionShell.dataset.voiceMode = HOME_STAGE_VOICE_STATE.mode;
    nodes.interactionShell.dataset.voiceActive = HOME_STAGE_VOICE_STATE.isActive ? 'true' : 'false';
    nodes.interactionShell.hidden = false;
  }

  if (nodes.status) {
    nodes.status.textContent = HOME_STAGE_VOICE_STATE.mode;
  }

  if (nodes.transcript) {
    nodes.transcript.textContent = HOME_STAGE_VOICE_STATE.transcript;
  }

  if (nodes.response) {
    nodes.response.textContent = HOME_STAGE_VOICE_STATE.response;
  }
}

/* =========================================================
   05. VOICE SURFACE BINDING
   ========================================================= */

function activateHomeStageListening() {
  setHomeStageVoiceMode('listening');
  setHomeStageTranscript('');
  setHomeStageResponse('');
  syncHomeStageVoiceDom();
  document.dispatchEvent(
    new CustomEvent('neuroartan:home-stage-voice-activated', {
      detail: {
        mode: HOME_STAGE_VOICE_STATE.mode,
      },
    })
  );
}

function deactivateHomeStageListening() {
  setHomeStageVoiceMode('idle');
  syncHomeStageVoiceDom();
  document.dispatchEvent(
    new CustomEvent('neuroartan:home-stage-voice-deactivated', {
      detail: {
        mode: HOME_STAGE_VOICE_STATE.mode,
      },
    })
  );
}

function toggleHomeStageVoice() {
  if (HOME_STAGE_VOICE_STATE.mode === 'idle') {
    activateHomeStageListening();
    return;
  }

  deactivateHomeStageListening();
}

/* =========================================================
   06. EVENT BINDING
   ========================================================= */

function bindHomeStageVoiceEvents() {
  const nodes = getHomeStageVoiceNodes();

  if (!nodes.microphoneButton) {
    return;
  }

  nodes.microphoneButton.addEventListener('click', toggleHomeStageVoice);

  document.addEventListener('neuroartan:home-stage-voice-transcript', (event) => {
    const nextTranscript = event?.detail?.transcript ?? '';
    setHomeStageTranscript(nextTranscript);
    syncHomeStageVoiceDom();
  });

  document.addEventListener('neuroartan:home-stage-voice-response', (event) => {
    const nextResponse = event?.detail?.response ?? '';
    setHomeStageResponse(nextResponse);
    syncHomeStageVoiceDom();
  });

  document.addEventListener('neuroartan:home-stage-voice-mode', (event) => {
    const nextMode = event?.detail?.mode;

    if (typeof nextMode !== 'string' || !nextMode.trim()) {
      return;
    }

    setHomeStageVoiceMode(nextMode.trim());
    syncHomeStageVoiceDom();
  });
}

/* =========================================================
   07. MODULE BOOT
   ========================================================= */

function bootHomeStageVoice() {
  if (HOME_STAGE_VOICE_STATE.isBound) {
    syncHomeStageVoiceDom();
    return;
  }

  HOME_STAGE_VOICE_STATE.isBound = true;
  syncHomeStageVoiceDom();
  bindHomeStageVoiceEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeStageVoice, { once: true });
} else {
  bootHomeStageVoice();
}