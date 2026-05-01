/* =========================================================
   00. FILE INDEX
   01. MODULE STATE
   02. MODE HELPERS
   03. EVENT BINDING
   04. MODULE BOOT
   ========================================================= */

/* =========================================================
   01. MODULE STATE
   ========================================================= */

const HOME_STAGE_RUNTIME_STATE = {
  isBound: false,
  mode: 'idle',
};

/* =========================================================
   02. MODE HELPERS
   ========================================================= */

function normalizeHomeStageRuntimeMode(mode) {
  if (typeof mode !== 'string') {
    return 'idle';
  }

  const normalizedMode = mode.trim().toLowerCase();
  return normalizedMode || 'idle';
}

function setHomeStageRuntimeMode(mode) {
  HOME_STAGE_RUNTIME_STATE.mode = normalizeHomeStageRuntimeMode(mode);
}

/* =========================================================
   03. EVENT BINDING
   ========================================================= */

function bindHomeStageRuntimeEvents() {
  document.addEventListener('neuroartan:home-stage-voice-mode', (event) => {
    setHomeStageRuntimeMode(event?.detail?.mode);
  });
}

/* =========================================================
   04. MODULE BOOT
   ========================================================= */

function bootHomeStageRuntime() {
  if (HOME_STAGE_RUNTIME_STATE.isBound) {
    return;
  }

  HOME_STAGE_RUNTIME_STATE.isBound = true;
  bindHomeStageRuntimeEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHomeStageRuntime, { once: true });
} else {
  bootHomeStageRuntime();
}
