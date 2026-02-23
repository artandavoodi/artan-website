// =================== Publications Renderer (Sovereign) ===================
// Loads markdown from `content_sync` and renders it into single.html.
// Works on custom domains and GitHub Pages project paths.
// Expected query: single.html?p=Essays/ENGINE.md

(function () {
  'use strict';

  function getQueryParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name);
    } catch {
      return null;
    }
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

  async function loadMarkdown(p) {
    // Determine correct base path dynamically (supports custom domains + project pages)
    // Example:
    // - https://artan.live/single.html -> base = https://artan.live
    // - https://user.github.io/repo/single.html -> base = https://user.github.io/repo
    const base = window.location.origin + window.location.pathname.split('/single.html')[0];

    const cleanPath = String(p || '').replace(/^\/+/, '');
    const url = `${base}/content_sync/${cleanPath}?v=${Date.now()}`;

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
      setErrorState('Missing publication path. Provide ?p=Essays/your-file.md');
      return;
    }

    setLoadingState(titleFromPath(p));

    try {
      const { md } = await loadMarkdown(p);
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }
})();