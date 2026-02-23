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
    // Always load from site root to avoid relative path issues on GitHub Pages
    // Add cache-busting query to avoid stale 404 caching

    const cleanPath = String(p || '').replace(/^\/+/, '');
    const url = `/${`content_sync/${cleanPath}`}?v=${Date.now()}`;

    const md = await fetchText(url);
    return { md, urlUsed: url };
  }

  function renderMarkdown(md) {
    if (!window.marked) throw new Error('marked not loaded');

    // Strip YAML frontmatter (between first two --- lines)
    let cleaned = md;
    if (cleaned.startsWith('---')) {
      const parts = cleaned.split('\n');
      let endIndex = -1;
      for (let i = 1; i < parts.length; i++) {
        if (parts[i].trim() === '---') {
          endIndex = i;
          break;
        }
      }
      if (endIndex !== -1) {
        cleaned = parts.slice(endIndex + 1).join('\n');
      }
    }

    return window.marked.parse(cleaned);
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