/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) IMPORTS
   03) INITIALIZATION
   04) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/development-cockpit/file-target-selector.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  fillCockpitSelect,
  findCockpitEntry,
  getCockpitModuleRoot,
  readCockpitForm,
  writeCockpitOutput
} from './development-cockpit-shell.js';

/* =============================================================================
   03) INITIALIZATION
============================================================================= */
export function initFileTargetSelector(context) {
  const root = getCockpitModuleRoot(context, 'file-target-selector');
  const form = root?.querySelector('[data-file-target-form]');
  if (!root || !form) return;

  const repositories = Array.isArray(context.registries.repositoryScopes?.repositories)
    ? context.registries.repositoryScopes.repositories
    : [];

  fillCockpitSelect(root.querySelector('[data-file-target-repository-select]'), repositories);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    const repository = findCockpitEntry(repositories, values.repository);
    const rootPath = repository?.publicRoot || repository?.root || '';
    const output = [
      `Repository: ${repository?.label || values.repository}`,
      `Root: ${rootPath}`,
      `Target: ${values.target}`,
      `Reason: ${values.reason}`
    ].join('\n');
    writeCockpitOutput(root, '[data-file-target-output]', output);
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
