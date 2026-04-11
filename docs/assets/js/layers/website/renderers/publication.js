// SECTION: PUBLICATION RENDERER
// PURPOSE: Load markdown from PTW-approved content_sync and render it into single.html.
// SCOPE: Support custom domains and GitHub Pages project paths.
// INPUT: Expected query format is single.html?p=<content_sync-relative-markdown-path>.

(function () {
  'use strict';

  // SECTION: QUERY AND STATE HELPERS
  function getQueryParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name);
    } catch {
      return null;
    }
  }

  function resolveInitialPublicationTitle() {
    const p = getQueryParam('p');
    if (!p) return 'Neuroartan';
    return composeDocumentTitle(titleFromPath(p));
  }

  function composeDocumentTitle(titleText) {
    const raw = String(titleText || '').trim();
    if (!raw) return 'Neuroartan';

    const normalized = raw.replace(/\s*[•|\-–—]\s*Neuroartan$/i, '').trim();
    if (!normalized) return 'Neuroartan';
    if (/^Neuroartan$/i.test(normalized)) return 'Neuroartan';

    return `${normalized} • Neuroartan`;
  }

  function setLoadingState(titleText) {
    const t = document.getElementById('post-title');
    const c = document.getElementById('post-content');
    const resolvedTitle = String(titleText || 'Loading…').trim();
    if (t) t.textContent = resolvedTitle;
    document.title = composeDocumentTitle(resolvedTitle);
    if (c) c.innerHTML = '<p>Loading…</p>';
  }

  function setErrorState(message, fallbackTitle = '') {
    const t = document.getElementById('post-title');
    const c = document.getElementById('post-content');
    const resolvedTitle = String(fallbackTitle || titleFromPath(getQueryParam('p')) || 'Neuroartan').trim();
    if (t) t.textContent = resolvedTitle;
    document.title = composeDocumentTitle(resolvedTitle);
    if (c) c.innerHTML = `<p>${message}</p>`;
  }

  // SECTION: TITLE AND FRONTMATTER HELPERS
  function stripMdExtension(display) {
    return String(display || '').replace(/\.md$/i, '');
  }

  function titleFromPath(p) {
    try {
      const parts = String(p || '').split('/');
      const file = parts[parts.length - 1] || '';
      const decoded = stripMdExtension(decodeURIComponent(file))
        .replace(/^\d+\s*[-–—]\s*/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return decoded || 'Neuroartan';
    } catch {
      return 'Neuroartan';
    }
  }

  function extractFrontmatter(md) {
    const source = String(md || '');
    if (!source.startsWith('---')) return {};

    const parts = source.split('\n');
    let endIndex = -1;
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }
    if (endIndex === -1) return {};

    const frontmatterLines = parts.slice(1, endIndex);
    const data = {};

    for (const line of frontmatterLines) {
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!match) continue;
      const key = match[1].trim().toLowerCase();
      let value = match[2].trim();
      value = value.replace(/^['\"]|['\"]$/g, '');
      data[key] = value;
    }

    return data;
  }

  function resolvePublicationTitle(md, fallbackPath = '') {
    const frontmatter = extractFrontmatter(md);
    const candidateTitles = [
      frontmatter.title,
      frontmatter.seo_title,
      frontmatter.meta_title,
      frontmatter.page_title,
      frontmatter.name
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    if (candidateTitles.length > 0) {
      return candidateTitles[0];
    }

    const source = String(md || '');
    const withoutFrontmatter = source.startsWith('---')
      ? source.replace(/^---[\s\S]*?\n---\s*/, '')
      : source;

    const headingMatch = withoutFrontmatter.match(/^#\s+(.+)$/m);
    if (headingMatch && String(headingMatch[1] || '').trim()) {
      return String(headingMatch[1]).trim();
    }

    return titleFromPath(fallbackPath);
  }

  // SECTION: DOCUMENT META UPDATERS
  function updateDocumentMetadata(meta) {
    const title = String(meta.title || titleFromPath(getQueryParam('p')) || 'Neuroartan').trim();
    const description = String(
      meta.description ||
      meta.summary ||
      meta.subtitle ||
      'Publication page for Neuroartan institutional writing, essays, notes, and research.'
    ).trim();
    const canonicalUrl = window.location.href;

    document.title = composeDocumentTitle(title);

    const descriptionTag = document.querySelector('meta[name="description"]');
    if (descriptionTag) descriptionTag.setAttribute('content', description);

    const canonicalTag = document.getElementById('canonical-link');
    if (canonicalTag) canonicalTag.setAttribute('href', canonicalUrl);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', composeDocumentTitle(title));

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', composeDocumentTitle(title));

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);

    const schemaTag = document.getElementById('publication-schema');
    if (schemaTag) {
      schemaTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        mainEntityOfPage: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Neuroartan',
          url: 'https://neuroartan.com'
        }
      }, null, 2);
    }
  }

  // SECTION: FETCH AND LOAD HELPERS
  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  }

  async function loadMarkdown(p) {
    // Determine correct base path dynamically (supports custom domains + project pages)
    // Example:
    // - https://neuroartan.com/single.html -> base = https://neuroartan.com
    // - https://user.github.io/repo/single.html -> base = https://user.github.io/repo
    const base = window.location.origin + window.location.pathname.split('/single.html')[0];

    const cleanPath = String(p || '').replace(/^\/+/, '');
    const url = `${base}/content_sync/${cleanPath}?v=${Date.now()}`;

    const md = await fetchText(url);
    return { md, urlUsed: url };
  }

  // SECTION: MARKDOWN RENDERING
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

  // SECTION: BOOTSTRAP
  async function boot() {
    const p = getQueryParam('p');
    if (!p) {
      setErrorState('Missing publication path. Provide ?p=Essays/your-file.md');
      return;
    }

    setLoadingState(titleFromPath(p));

    try {
      const { md } = await loadMarkdown(p);
      const frontmatter = extractFrontmatter(md);

      const titleEl = document.getElementById('post-title');
      const contentEl = document.getElementById('post-content');

      const cleanTitle = String(resolvePublicationTitle(md, p)).trim();
      if (titleEl) titleEl.textContent = cleanTitle;
      if (contentEl) contentEl.innerHTML = renderMarkdown(md);

      updateDocumentMetadata({
        title: cleanTitle,
        description: frontmatter.description || frontmatter.summary || frontmatter.subtitle || ''
      });
    } catch (e) {
      setErrorState('Failed to load publication.', titleFromPath(p));
      console.warn('[publication] load failed', e);
    }
  }

  // SECTION: EARLY DOCUMENT TITLE
  document.title = resolveInitialPublicationTitle();

  // SECTION: INITIALIZATION
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }
})();