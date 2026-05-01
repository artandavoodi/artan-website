/* =========================================================
   00. FILE INDEX
   01. MODULE IDENTITY
   02. ENTER GATE BOOTSTRAP
   03. END OF FILE
   ========================================================= */

/* =========================================================
   01. MODULE IDENTITY
   ========================================================= */

const ENTERED_CLASS = 'site-entered';

/* =========================================================
   02. ENTER GATE BOOTSTRAP
   ========================================================= */

window.__artanRunAfterEnter = window.__artanRunAfterEnter || ((bootFn) => {
  if (typeof bootFn !== 'function') return;

  const run = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(bootFn);
    });
  };

  if (document.body && document.body.classList.contains(ENTERED_CLASS)) {
    run();
    return;
  }

  window.addEventListener('neuroartan:entered', run, { once: true });
});

/* =========================================================
   03. END OF FILE
   ========================================================= */
