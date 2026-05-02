/* =============================================================================
   00) FILE INDEX
   01) MODULE STATE
   02) VALUE HELPERS
   03) STATE API
   04) DOM HELPERS
   05) PANEL MOUNT
============================================================================= */

/* =============================================================================
   01) MODULE STATE
============================================================================= */
const STORAGE_KEY = 'neuroartan.modelCreation.draft.v1';

const RUNTIME = (window.__NEUROARTAN_MODEL_CREATION__ ||= {
  state: null,
  subscribers: new Set()
});

/* =============================================================================
   02) VALUE HELPERS
============================================================================= */
export function normalizeModelCreationString(value = '') {
  return String(value || '').trim();
}

function nowIso() {
  return new Date().toISOString();
}

function createDefaultState() {
  const timestamp = nowIso();
  return {
    model_id: '',
    owner_profile_id: '',
    model_name: '',
    model_purpose: '',
    model_visibility: 'private',
    interaction_state: 'private',
    model_type: 'cloud_hosted',
    provider_mode: 'manual',
    provider_id: 'manual_transfer',
    training_stage: 'draft',
    voice_samples: [],
    style_samples: [],
    memory_sources: [],
    attachments: [],
    evaluation_tests: [],
    deployment_status: 'draft',
    deployment_environment: 'draft',
    deployment_endpoint: '',
    activation_state: 'inactive',
    release_version: '0.1.0',
    version_notes: '',
    safety_state: 'draft',
    public_readiness: 'draft',
    safety_notes: '',
    persistence_mode: 'development_local_fallback',
    created_at: timestamp,
    updated_at: timestamp
  };
}

function readLocalState() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function writeLocalState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_error) {
    /* Development fallback persistence is best-effort only. */
  }
}

function notify() {
  const snapshot = getModelCreationState();
  RUNTIME.subscribers.forEach((subscriber) => {
    try {
      subscriber(snapshot);
    } catch (error) {
      console.error('[model-creation-state] Subscriber failed.', error);
    }
  });
}

/* =============================================================================
   03) STATE API
============================================================================= */
export function getModelCreationState() {
  if (!RUNTIME.state) {
    RUNTIME.state = {
      ...createDefaultState(),
      ...(readLocalState() || {})
    };
  }
  return RUNTIME.state;
}

export function setModelCreationState(patch = {}) {
  RUNTIME.state = {
    ...getModelCreationState(),
    ...patch,
    updated_at: nowIso()
  };
  writeLocalState(RUNTIME.state);
  notify();
  return RUNTIME.state;
}

export function updateModelCreationField(name, value) {
  const key = normalizeModelCreationString(name);
  if (!key) return getModelCreationState();
  return setModelCreationState({ [key]: value });
}

export function addModelCreationRecord(collection, record = {}) {
  const key = normalizeModelCreationString(collection);
  const current = getModelCreationState();
  const records = Array.isArray(current[key]) ? current[key] : [];
  return setModelCreationState({
    [key]: [
      ...records,
      {
        id: `${key}-${Date.now()}`,
        ...record,
        created_at: nowIso()
      }
    ]
  });
}

export function subscribeModelCreationState(subscriber) {
  if (typeof subscriber !== 'function') return () => {};
  RUNTIME.subscribers.add(subscriber);
  subscriber(getModelCreationState());
  return () => RUNTIME.subscribers.delete(subscriber);
}

/* =============================================================================
   04) DOM HELPERS
============================================================================= */
export function setText(root, selector, value) {
  const node = root?.querySelector(selector);
  if (!node) return;
  node.textContent = normalizeModelCreationString(value);
}

export function populateSelect(select, options = [], valueKey = 'value') {
  if (!(select instanceof HTMLSelectElement)) return;
  select.innerHTML = '';
  options.forEach((entry) => {
    const option = document.createElement('option');
    option.value = normalizeModelCreationString(entry[valueKey] || entry.id || entry.value);
    option.textContent = normalizeModelCreationString(entry.label || entry.id || entry.value);
    select.append(option);
  });
}

export function readFormScope(root, selector) {
  const scope = root?.querySelector(selector);
  if (!(scope instanceof HTMLElement)) return {};
  const formData = new FormData();
  scope.querySelectorAll('input, select, textarea').forEach((field) => {
    if (!field.name) return;
    if (field instanceof HTMLInputElement && field.type === 'file') {
      formData.set(field.name, field.files?.[0]?.name || '');
      return;
    }
    formData.set(field.name, field.value || '');
  });
  return Object.fromEntries(Array.from(formData.entries()));
}

export function renderRecords(root, selector, records = [], emptyLabel = 'No records yet.') {
  const list = root?.querySelector(selector);
  if (!(list instanceof HTMLElement)) return;
  list.innerHTML = '';
  if (!records.length) {
    const empty = document.createElement('p');
    empty.className = 'model-creation-card__copy';
    empty.textContent = emptyLabel;
    list.append(empty);
    return;
  }
  records.forEach((record) => {
    const item = document.createElement('article');
    item.className = 'model-creation-card';
    const title = document.createElement('strong');
    title.className = 'model-creation-card__value';
    title.textContent = record.title || record.label || record.name || record.status || 'Draft record';
    const copy = document.createElement('p');
    copy.className = 'model-creation-card__copy';
    copy.textContent = record.copy || record.description || record.note || record.transcript || record.ref || 'Draft state saved locally.';
    item.append(title, copy);
    list.append(item);
  });
}

/* =============================================================================
   05) PANEL MOUNT
============================================================================= */
export function mountModelCreationPanel(root) {
  root?.querySelectorAll('[data-model-field]').forEach((field) => {
    if (field.dataset.modelCreationFieldBound === 'true') return;
    field.dataset.modelCreationFieldBound = 'true';
    field.addEventListener('input', () => updateModelCreationField(field.name, field.value));
    field.addEventListener('change', () => updateModelCreationField(field.name, field.value));
  });

  subscribeModelCreationState((state) => {
    root?.querySelectorAll('[data-model-field]').forEach((field) => {
      if (!field.name || document.activeElement === field) return;
      const value = state[field.name];
      if (typeof value !== 'undefined') {
        field.value = value;
      }
    });
  });
}
