/* =============================================================================
   01) MODULE IMPORTS
   02) DOM HELPERS
   03) RENDERING
   04) EVENTS
   05) INITIALIZATION
============================================================================= */

import {
  subscribeProfileThoughtState,
  updateProfileThoughtComposer,
  submitProfileThought
} from './profile-thought-store.js';

function getRoots() {
  return Array.from(document.querySelectorAll('[data-profile-thought-composer]'));
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function renderComposer(state) {
  getRoots().forEach((root) => {
    const category = root.querySelector('[data-profile-thought-category]');
    const textarea = root.querySelector('[data-profile-thought-textarea]');
    const submitLabel = root.querySelector('[data-profile-thought-submit-label]');
    const status = root.querySelector('[data-profile-thought-submit-status]');

    if (category instanceof HTMLSelectElement) {
      const activeValue = category.value || state.composerCategory;
      clearNode(category);
      state.taxonomy.categories.forEach((entry) => {
        const option = document.createElement('option');
        option.value = entry.key;
        option.textContent = entry.label;
        category.appendChild(option);
      });
      category.value = activeValue || state.composerCategory;
    }

    if (textarea instanceof HTMLTextAreaElement && textarea.value !== state.composerText) {
      textarea.value = state.composerText;
    }

    root.querySelectorAll('[data-profile-thought-audience-toggle]').forEach((button) => {
      const key = button.getAttribute('data-profile-thought-audience-toggle') || '';
      const active = key === state.composerAudience;
      button.dataset.profileThoughtAudienceActive = active ? 'true' : 'false';
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (submitLabel) {
      submitLabel.textContent = state.composerAudience === 'public' ? 'Stage Public Thought' : 'Save Privately';
    }

    if (status instanceof HTMLElement) {
      status.textContent = state.submitMessage || '';
      status.dataset.profileThoughtSubmitStatus = state.submitStatus || 'idle';
    }
  });
}

function bindComposerEvents() {
  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element
      ? event.target.closest('[data-profile-thought-audience-toggle]')
      : null;
    if (!trigger) return;

    event.preventDefault();
    updateProfileThoughtComposer({
      composerAudience: trigger.getAttribute('data-profile-thought-audience-toggle') || 'private',
      resetStatus: true
    });
  });

  document.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement && target.matches('[data-profile-thought-textarea]')) {
      updateProfileThoughtComposer({
        composerText: target.value,
        resetStatus: true
      });
      return;
    }

    if (target instanceof HTMLSelectElement && target.matches('[data-profile-thought-category]')) {
      updateProfileThoughtComposer({
        composerCategory: target.value,
        resetStatus: true
      });
    }
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-profile-thought-compose-form="true"]')) return;
    event.preventDefault();
    submitProfileThought();
  });
}

function initThoughtComposer() {
  bindComposerEvents();
  subscribeProfileThoughtState(renderComposer);
}

initThoughtComposer();
