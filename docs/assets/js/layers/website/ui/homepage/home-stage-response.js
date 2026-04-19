/* =========================================================
   00. FILE INDEX
   01. MODULE STATE
   02. RESPONSE CONSTANTS
   03. RESPONSE PAYLOAD HELPERS
   04. RESPONSE EMISSION HELPERS
   05. EVENT BINDING
   06. MODULE BOOT
   ========================================================= */

/* =========================================================
   01. MODULE STATE
   ========================================================= */

const HOME_STAGE_RESPONSE_STATE = {
  isBound: false,
  cycleCount: 0,
};

/* =========================================================
   02. RESPONSE CONSTANTS
   ========================================================= */

const HOME_STAGE_RESPONSE_LIBRARY = [
  {
    transcript: 'What is Neuroartan?',
    response: 'Neuroartan is building a governed cognitive system for structured reflection, continuity, and voice-first intelligence.',
  },
  {
    transcript: 'How does this work?',
    response: 'The homepage will become your first interaction surface: you speak, write, reflect, and the system responds through a guided cognitive interface.',
  },
  {
    transcript: 'What can I do here?',
    response: 'You will be able to explore thought capture, profile continuity, and a more human interaction with intelligence through a modular product surface.',
  },
];

/* =========================================================
   03. RESPONSE PAYLOAD HELPERS
   ========================================================= */

function getHomeStageResponsePayload() {
  const payload = HOME_STAGE_RESPONSE_LIBRARY[
    HOME_STAGE_RESPONSE_STATE.cycleCount % HOME_STAGE_RESPONSE_LIBRARY.length
  ];

  HOME_STAGE_RESPONSE_STATE.cycleCount += 1;
  return payload;
}

/* =========================================================
   04. RESPONSE EMISSION HELPERS
   ========================================================= */

function emitHomeStageTranscript(transcript) {
  document.dispatchEvent(
    new CustomEvent('neuroartan:home-stage-voice-transcript', {
      detail: {
        transcript,
      },
    })
  );
}

function emitHomeStageResponse(response) {
  document.dispatchEvent(
    new CustomEvent('neuroartan:home-stage-voice-response', {
      detail: {
        response,
      },
    })
  );
}

function emitHomeStagePlaceholderResponse() {
  const payload = getHomeStageResponsePayload();
  emitHomeStageTranscript(payload.transcript);
  emitHomeStageResponse(payload.response);
}

function clearHomeStagePlaceholderResponse() {
  emitHomeStageTranscript('');
  emitHomeStageResponse('');
}

/* =========================================================
   05. EVENT BINDING
   ========================================================= */

function bindHomeStageResponseEvents() {
  document.addEventListener('neuroartan:home-stage-voice-activated', () => {
    clearHomeStagePlaceholderResponse();
  });

  document.addEventListener('neuroartan:home-stage-voice-deactivated', () => {
    clearHomeStagePlaceholderResponse();
  });

  document.addEventListener('neuroartan:home-stage-voice-mode', (event) => {
    const mode = event?.detail?.mode;

    if (mode === 'responding') {
      emitHomeStagePlaceholderResponse();
    }

    if (mode === 'idle') {
      clearHomeStagePlaceholderResponse();
    }
  });
}

/* =========================================================
   06. MODULE BOOT
   ========================================================= */

function bootHomeStageResponse() {
  if (HOME_STAGE_RESPONSE_STATE.isBound) {
    return;
  }

  HOME_STAGE_RESPONSE_STATE.isBound = true;
  bindHomeStageResponseEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeStageResponse, { once: true });
} else {
  bootHomeStageResponse();
}