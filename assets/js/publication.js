// =================== Publications Renderer (Sovereign) ===================
// Deterministic locale-first loading:
//   1) content_sync/<lang>/<p>
//   2) content_sync/en/<p>
//   3) content_sync/<p> (legacy)
// Where <p> is like: Essays/ENGINE.md

(function () {
  'use strict';

  function getQueryParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name);
    } catch {
      return null;
    }
  }

  function normalizeLang(raw) {
    const s = String(raw || '').trim();
    if (!s) return 'en';
    const base = s.split('-')[0].toLowerCase(); // de-DE -> de
    if (base === 'fa' || base === 'per' || base === 'fas') return 'fa';
    return base;
  }

  function getActiveLang() {
    // Primary: html lang (country-language.js should set this)
    const htmlLang = document.documentElement && document.documentElement.getAttribute('lang');
    if (htmlLang) return normalizeLang(htmlLang);

    // Secondary: browser
    return normalizeLang((navigator.languages && navigator.languages[0]) || navigator.language);
  }

  function setLoadingState(titleText) {
    const t = document.getElementById('post-title');
    const c = document.getElementById('post-content');
    if (t) t.textContent = titleText || 'Loading…';
    if (c) c.innerHTML = '<p>Loading…</p>';
  }

  function setErrorState(message) {
    const t = document.getElementById('post-title');
    const c = document.getElementById('post-content');
    if (t) t.textContent = 'Publication';
    if (c) c.innerHTML = `<p>${message}</p>`;
  }

  function stripMdExtension(display) {
    return String(display || '').replace(/\.md$/i, '');
  }

  function titleFromPath(p) {
    try {
      const parts = String(p || '').split('/');
      const file = parts[parts.length - 1] || '';
      return stripMdExtension(decodeURIComponent(file));
    } catch {
      return 'Publication';
    }
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  async function loadMarkdownWithLocale(p) {
    const lang = getActiveLang();
    const candidates = [
      `content_sync/${lang}/${p}`,
      `content_sync/en/${p}`,
      `content_sync/${p}` // legacy
    ];

    let lastErr = null;
    for (const url of candidates) {
      try {
        const md = await fetchText(url);
        return { md, urlUsed: url };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('Could not load publication');
  }

  function renderMarkdown(md) {
    if (!window.marked) throw new Error('marked not loaded');
    return window.marked.parse(md);
  }

  async function boot() {
    const p = getQueryParam('p');
    if (!p) {
      setErrorState('Missing publication path. Provide ?p=Essays/your-file.md (published under 11_Publish).');
      return;
    }

    setLoadingState(titleFromPath(p));

    try {
      const { md } = await loadMarkdownWithLocale(p);
      const html = renderMarkdown(md);

      const titleEl = document.getElementById('post-title');
      const contentEl = document.getElementById('post-content');

      const cleanTitle = titleFromPath(p);
      if (titleEl) titleEl.textContent = cleanTitle; // removes “.md”
      if (contentEl) contentEl.innerHTML = html;

      document.title = `${cleanTitle} • Artan`;
    } catch (e) {
      setErrorState('Failed to load publication.');
      console.warn('[publication] load failed', e);
    }
  }

  // Let country-language.js set <html lang="..."> before we decide the folder.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }
})();