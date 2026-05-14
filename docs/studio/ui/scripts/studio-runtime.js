import { dscRuntime } from '/control-center/dsc/runtime/core/runtime-engine.js';

window.addEventListener('DOMContentLoaded', async () => {
  await dscRuntime.load();

  document.body.classList.add('studio-active');

  console.log('[Control Center] FULL TOKEN RUNTIME ACTIVE');
});
