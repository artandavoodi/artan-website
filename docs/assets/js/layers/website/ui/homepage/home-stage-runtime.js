/* =========================================================
   00. FILE INDEX
   01. MODULE STATE
   02. RUNTIME CONSTANTS
   03. MODE HELPERS
   04. TRANSITION HELPERS
   05. EVENT BINDING
   06. MODULE BOOT
   ========================================================= */

/* =========================================================
   01. MODULE STATE
   ========================================================= */

const HOME_STAGE_RUNTIME_STATE = {
  isBound: false,
  mode: 'idle',
  thinkingTimer: null,
  responseTimer: null,
  idleTimer: null,
};

/* =========================================================
   02. RUNTIME CONSTANTS
   ========================================================= */

const HOME_STAGE_RUNTIME_DELAYS = {
  thinking: 900,
  responding: 1400,
  returnToIdle: 2400,
};

/* =========================================================
   03. MODE HELPERS
   ========================================================= */

function normalizeHomeStageRuntimeMode(mode) {
  if (typeof mode !== 'string') {
    return 'idle';
  }

  const normalizedMode = mode.trim().toLowerCase();
  return normalizedMode || 'idle';
}

function emitHomeStageRuntimeMode(mode) {
  const nextMode = normalizeHomeStageRuntimeMode(mode);
  HOME_STAGE_RUNTIME_STATE.mode = nextMode;

  document.dispatchEvent(
    new CustomEvent('neuroartan:home-stage-voice-mode', {
      detail: {
        mode: nextMode,
      },
    })
  );
}

function clearHomeStageRuntimeTimers() {
  if (HOME_STAGE_RUNTIME_STATE.thinkingTimer) {
    window.clearTimeout(HOME_STAGE_RUNTIME_STATE.thinkingTimer);
    HOME_STAGE_RUNTIME_STATE.thinkingTimer = null;
  }

  if (HOME_STAGE_RUNTIME_STATE.responseTimer) {
    window.clearTimeout(HOME_STAGE_RUNTIME_STATE.responseTimer);
    HOME_STAGE_RUNTIME_STATE.responseTimer = null;
  }

  if (HOME_STAGE_RUNTIME_STATE.idleTimer) {
    window.clearTimeout(HOME_STAGE_RUNTIME_STATE.idleTimer);
    HOME_STAGE_RUNTIME_STATE.idleTimer = null;
  }
}

/* =========================================================
   04. TRANSITION HELPERS
   ========================================================= */

function runHomeStageResponseCycle() {
  clearHomeStageRuntimeTimers();
  emitHomeStageRuntimeMode('listening');

  HOME_STAGE_RUNTIME_STATE.thinkingTimer = window.setTimeout(() => {
    emitHomeStageRuntimeMode('thinking');

    HOME_STAGE_RUNTIME_STATE.responseTimer = window.setTimeout(() => {
      emitHomeStageRuntimeMode('responding');

      HOME_STAGE_RUNTIME_STATE.idleTimer = window.setTimeout(() => {
        emitHomeStageRuntimeMode('idle');
        clearHomeStageRuntimeTimers();
      }, HOME_STAGE_RUNTIME_DELAYS.returnToIdle);
    }, HOME_STAGE_RUNTIME_DELAYS.responding);
  }, HOME_STAGE_RUNTIME_DELAYS.thinking);
}

function stopHomeStageResponseCycle() {
  clearHomeStageRuntimeTimers();
  emitHomeStageRuntimeMode('idle');
}

/* =========================================================
   05. EVENT BINDING
   ========================================================= */

function bindHomeStageRuntimeEvents() {
  document.addEventListener('neuroartan:home-stage-voice-activated', () => {
    runHomeStageResponseCycle();
  });

  document.addEventListener('neuroartan:home-stage-voice-deactivated', () => {
    stopHomeStageResponseCycle();
  });
}

/* =========================================================
   06. MODULE BOOT
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
