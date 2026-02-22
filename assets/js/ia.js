// =================== IA Loader (Information Architecture Backbone) ===================
// Loads assets/data/ia.json and exposes it globally as window.ARTAN_IA
// Emits: 'artan:ia:ready' and 'artan:ia:error'

(() => {
  const IA_URL = 'assets/data/ia.json';

  async function loadIA() {
    try {
      const res = await fetch(IA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ia = await res.json();

      window.ARTAN_IA = ia;
      window.dispatchEvent(new CustomEvent('artan:ia:ready', { detail: ia }));
    } catch (e) {
      window.ARTAN_IA = null;
      window.dispatchEvent(new CustomEvent('artan:ia:error', { detail: String(e) }));
    }
  }

  document.addEventListener('DOMContentLoaded', loadIA);
})();