/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) IMPORTS
   03) LOCAL CONTINUITY STORE
   04) RENDERING
   05) INITIALIZATION
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/development-cockpit/daily-execution-log.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getCockpitModuleRoot,
  normalizeCockpitString,
  readCockpitForm
} from './development-cockpit-shell.js';

/* =============================================================================
   03) LOCAL CONTINUITY STORE
============================================================================= */
const LOCAL_LOG_KEY = 'neuroartan.developmentCockpit.dailyLog';

function readEntries() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_LOG_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function writeEntries(entries) {
  window.localStorage.setItem(LOCAL_LOG_KEY, JSON.stringify(entries.slice(0, 20)));
}

/* =============================================================================
   04) RENDERING
============================================================================= */
function renderEntries(root, entries) {
  const mount = root?.querySelector('[data-daily-log-entries]');
  if (!mount) return;

  mount.innerHTML = '';
  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'daily-execution-log__entry';
    empty.textContent = 'No local continuity entries yet. This is browser-local only, not canonical storage.';
    mount.append(empty);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement('article');
    item.className = 'daily-execution-log__entry';
    const time = document.createElement('time');
    time.dateTime = normalizeCockpitString(entry.createdAt);
    time.textContent = normalizeCockpitString(entry.createdAt);
    const text = document.createElement('p');
    text.textContent = normalizeCockpitString(entry.text);
    item.append(time, text);
    mount.append(item);
  });
}

/* =============================================================================
   05) INITIALIZATION
============================================================================= */
export function initDailyExecutionLog(context) {
  const root = getCockpitModuleRoot(context, 'daily-execution-log');
  const form = root?.querySelector('[data-daily-log-form]');
  if (!root || !form) return;

  renderEntries(root, readEntries());

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    if (!values.entry) return;

    const entries = [{
      text: values.entry,
      createdAt: new Date().toISOString()
    }, ...readEntries()];
    writeEntries(entries);
    form.reset();
    renderEntries(root, entries);
  });
}

/* =============================================================================
   06) END OF FILE
============================================================================= */
