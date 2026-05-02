/* =============================================================================
   01) MODULE IDENTITY
   02) IMPORTS
   03) STATE
   04) POLICY AND STORAGE
   05) RENDERING
   06) ACTIONS
   07) INITIALIZATION
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
const MODULE_ID = 'profile-posts';

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getProfileRuntimeState,
  subscribeProfileRuntime
} from '../shell/profile-runtime.js';
import { normalizeString } from '../../../system/account/identity/account-profile-identity.js';

/* =============================================================================
   03) STATE
============================================================================= */
const STORAGE_PREFIX = 'neuroartan_profile_posts_v1';
const DEFAULT_POLICY = Object.freeze({
  visibility: [
    { key: 'private', label: 'Private draft', summary: 'Owner-only profile post.' },
    { key: 'public', label: 'Public route', summary: 'Post staged for public route readiness.' }
  ],
  limits: {
    titleMaxLength: 120,
    bodyMaxLength: 4000
  }
});

const STORE = (window.__NEUROARTAN_PROFILE_POSTS__ ||= {
  initialized: false,
  policy: null,
  posts: [],
  storageKey: ''
});

/* =============================================================================
   04) POLICY AND STORAGE
============================================================================= */
function assetPath(path) {
  if (window.NeuroartanFragmentAuthorities?.assetPath) {
    return window.NeuroartanFragmentAuthorities.assetPath(path);
  }

  const normalized = normalizeString(path);
  return normalized.startsWith('/') ? normalized.slice(1) : normalized;
}

function buildStorageKey(state = getProfileRuntimeState()) {
  const userId = normalizeString(state?.user?.id || state?.user?.uid || '');
  const username = normalizeString(state?.username?.normalized || state?.profile?.username || '');
  const email = normalizeString(state?.email || state?.profile?.email || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${STORAGE_PREFIX}:${userId || username || email || 'guest'}`;
}

async function loadPolicy() {
  if (STORE.policy) return STORE.policy;

  try {
    const response = await fetch(assetPath('/assets/data/profile/private-posts-policy.json'), {
      credentials: 'same-origin'
    });
    if (!response.ok) throw new Error(`Posts policy request failed (${response.status}).`);
    const payload = await response.json();
    STORE.policy = {
      visibility: Array.isArray(payload?.visibility) && payload.visibility.length
        ? payload.visibility
        : DEFAULT_POLICY.visibility,
      limits: {
        ...DEFAULT_POLICY.limits,
        ...(payload?.limits || {})
      }
    };
  } catch (error) {
    console.error('[profile-posts] Failed to load posts policy.', error);
    STORE.policy = DEFAULT_POLICY;
  }

  return STORE.policy;
}

function readPosts(storageKey) {
  try {
    const raw = window.localStorage?.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .map((post) => ({
            id: normalizeString(post?.id || '') || `post-${Date.now()}`,
            title: normalizeString(post?.title || ''),
            body: normalizeString(post?.body || ''),
            visibility: normalizeString(post?.visibility || 'private'),
            createdAt: normalizeString(post?.createdAt || new Date().toISOString())
          }))
          .filter((post) => post.title || post.body)
      : [];
  } catch (error) {
    console.error('[profile-posts] Failed to read posts.', error);
    return [];
  }
}

function writePosts(storageKey, posts) {
  try {
    window.localStorage?.setItem(storageKey, JSON.stringify(posts));
  } catch (error) {
    console.error('[profile-posts] Failed to persist posts.', error);
  }
}

function syncStoreWithRuntime(state = getProfileRuntimeState()) {
  const storageKey = buildStorageKey(state);
  if (storageKey === STORE.storageKey) return;
  STORE.storageKey = storageKey;
  STORE.posts = readPosts(storageKey);
}

/* =============================================================================
   05) RENDERING
============================================================================= */
function getRoot() {
  return document.querySelector('[data-profile-posts]');
}

function formatDate(value) {
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

function renderVisibilityOptions(root, policy) {
  const select = root.querySelector('[data-profile-post-visibility]');
  if (!(select instanceof HTMLSelectElement)) return;

  select.innerHTML = '';
  policy.visibility.forEach((entry) => {
    const option = document.createElement('option');
    option.value = normalizeString(entry.key || 'private');
    option.textContent = normalizeString(entry.label || entry.key || 'Private');
    select.appendChild(option);
  });
}

function renderPostList(root) {
  const list = root.querySelector('[data-profile-post-list]');
  const empty = root.querySelector('[data-profile-post-empty]');
  const count = root.querySelector('[data-profile-post-count]');
  if (!(list instanceof HTMLElement)) return;

  list.innerHTML = '';

  const posts = STORE.posts.slice().sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  if (count) {
    count.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'}`;
  }

  if (empty instanceof HTMLElement) {
    empty.hidden = posts.length > 0;
  }

  posts.forEach((post) => {
    const item = document.createElement('article');
    item.className = 'profile-posts__item';
    item.innerHTML = `
      <div class="profile-posts__item-header">
        <h4 class="profile-posts__item-title"></h4>
        <span class="ui-badge ui-badge--outline"></span>
      </div>
      <p class="profile-posts__item-body"></p>
      <p class="profile-posts__item-meta"></p>
    `;
    item.querySelector('.profile-posts__item-title').textContent = post.title || 'Untitled post';
    item.querySelector('.ui-badge').textContent = post.visibility === 'public' ? 'Public route' : 'Private draft';
    item.querySelector('.profile-posts__item-body').textContent = post.body || '';
    item.querySelector('.profile-posts__item-meta').textContent = formatDate(post.createdAt);
    list.appendChild(item);
  });
}

async function renderPosts() {
  const root = getRoot();
  if (!root) return;

  const state = getProfileRuntimeState();
  const policy = await loadPolicy();
  syncStoreWithRuntime(state);

  root.dataset.profileViewerState = state.viewerState;
  renderVisibilityOptions(root, policy);
  renderPostList(root);
}

/* =============================================================================
   06) ACTIONS
============================================================================= */
function setStatus(root, message, state = 'idle') {
  const node = root.querySelector('[data-profile-post-status]');
  if (!(node instanceof HTMLElement)) return;
  node.textContent = message || '';
  node.dataset.profilePostStatus = state;
}

function bindPostForm() {
  const root = getRoot();
  if (!root || root.dataset.profilePostsBound === 'true') return;
  root.dataset.profilePostsBound = 'true';

  root.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-profile-post-form]')) return;

    event.preventDefault();
    const state = getProfileRuntimeState();
    if (state.viewerState !== 'authenticated') {
      setStatus(root, 'Sign in to create posts.', 'error');
      return;
    }

    const formData = new FormData(form);
    const title = normalizeString(formData.get('title') || '');
    const body = normalizeString(formData.get('body') || '');
    const visibility = normalizeString(formData.get('visibility') || 'private') || 'private';

    if (!title && !body) {
      setStatus(root, 'Write a title or body before saving the post.', 'error');
      return;
    }

    const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `post-${Date.now()}`;
    STORE.posts = [{
      id,
      title,
      body,
      visibility,
      createdAt: new Date().toISOString()
    }, ...STORE.posts];
    writePosts(STORE.storageKey || buildStorageKey(state), STORE.posts);
    form.reset();
    setStatus(root, visibility === 'public' ? 'Post staged for the public route.' : 'Private post saved.', 'success');
    renderPostList(root);
  });
}

/* =============================================================================
   07) INITIALIZATION
============================================================================= */
function initProfilePosts() {
  if (STORE.initialized) return;
  STORE.initialized = true;

  bindPostForm();
  void renderPosts();
  subscribeProfileRuntime(() => {
    void renderPosts();
  });

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-posts') return;
    bindPostForm();
    void renderPosts();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfilePosts, { once: true });
} else {
  initProfilePosts();
}
