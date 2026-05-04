/* =============================================================================
   NEUROARTAN · HOME STAGE · DEVELOPER OPERATIONS RESULTS
   -----------------------------------------------------------------------------
   Purpose: Results renderer boundary for the Developer Operations Panel. The
   parent panel controller currently owns active render timing while this module
   owns result-node creation helpers for future route extraction.
============================================================================= */

/* =============================================================================
   00) FILE INDEX
   -----------------------------------------------------------------------------
   01) RESULT NODE FACTORY
   02) EMPTY STATE FACTORY
   03) PUBLIC API
   04) END OF FILE
============================================================================= */

/* =============================================================================
   01) RESULT NODE FACTORY
============================================================================= */
export function createDeveloperOperationsResultNode(item) {
  const node = document.createElement('article');
  node.className = 'home-stage-developer-operations-panel__result';

  const title = document.createElement('h3');
  title.className = 'home-stage-developer-operations-panel__result-title';
  title.textContent = item.title || 'Developer operation';

  const meta = document.createElement('p');
  meta.className = 'home-stage-developer-operations-panel__result-meta';
  meta.textContent = item.meta || item.type || 'Developer Mode';

  const summary = document.createElement('p');
  summary.className = 'home-stage-developer-operations-panel__result-summary';
  summary.textContent = item.summary || 'No summary available.';

  node.append(title, meta, summary);
  return node;
}

/* =============================================================================
   02) EMPTY STATE FACTORY
============================================================================= */
export function createDeveloperOperationsEmptyState(message = 'No matching developer operations found.') {
  const node = document.createElement('p');
  node.className = 'home-stage-developer-operations-panel__empty';
  node.textContent = message;
  return node;
}

/* =============================================================================
   03) PUBLIC API
============================================================================= */
export function renderDeveloperOperationsResultNodes(target, items) {
  if (!target) return;

  target.replaceChildren();

  if (!Array.isArray(items) || !items.length) {
    target.append(createDeveloperOperationsEmptyState());
    return;
  }

  items.forEach((item) => {
    target.append(createDeveloperOperationsResultNode(item));
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
