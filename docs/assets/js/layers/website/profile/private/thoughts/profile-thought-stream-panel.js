/* =============================================================================
   01) MODULE IMPORTS
   02) DOM HELPERS
   03) STREAM RENDERING
   04) INITIALIZATION
============================================================================= */

import {
  subscribeProfileThoughtState
} from './profile-thought-store.js';

function getRoots() {
  return Array.from(document.querySelectorAll('[data-profile-thought-stream]'));
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function formatEntryTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  try {
    return new Intl.DateTimeFormat(document.documentElement.lang || 'en', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch (_) {
    return date.toISOString();
  }
}

function renderEntry(entry, taxonomy) {
  const category = taxonomy.categories.find((item) => item.key === entry.category);
  const article = document.createElement('article');
  article.className = 'profile-thought-stream__entry';
  article.innerHTML = `
    <div class="profile-thought-stream__entry-header">
      <span class="ui-badge ui-badge--outline"></span>
      <time></time>
    </div>
    <p class="profile-thought-stream__entry-text"></p>
  `;
  article.querySelector('.ui-badge').textContent = category?.label || entry.category || 'Thought';
  article.querySelector('time').textContent = formatEntryTimestamp(entry.createdAt);
  article.querySelector('.profile-thought-stream__entry-text').textContent = entry.text;
  return article;
}

function renderLane(root, key, entries, state) {
  const list = root.querySelector(`[data-profile-thought-stream-list="${key}"]`);
  const count = root.querySelector(`[data-profile-thought-stream-count="${key}"]`);
  const empty = root.querySelector(`[data-profile-thought-stream-empty="${key}"]`);
  if (!(list instanceof HTMLElement)) return;

  clearNode(list);
  entries.forEach((entry) => {
    list.appendChild(renderEntry(entry, state.taxonomy));
  });

  if (count) {
    count.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;
  }

  if (empty instanceof HTMLElement) {
    empty.hidden = entries.length > 0;
  }
}

function renderThoughtStream(state) {
  getRoots().forEach((root) => {
    renderLane(root, 'private', state.privateEntries || [], state);
    renderLane(root, 'public', state.publicEntries || [], state);
  });
}

subscribeProfileThoughtState(renderThoughtStream);
