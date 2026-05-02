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
/* /website/docs/assets/js/layers/website/development-cockpit/terminal-scan-generator.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  fillCockpitSelect,
  fillCockpitTemplate,
  findCockpitEntry,
  getCockpitModuleRoot,
  readCockpitForm,
  writeCockpitOutput
} from './development-cockpit-shell.js';

/* =============================================================================
   03) INITIALIZATION
============================================================================= */
export function initTerminalScanGenerator(context) {
  const root = getCockpitModuleRoot(context, 'terminal-scan-generator');
  const form = root?.querySelector('[data-terminal-scan-form]');
  if (!root || !form) return;

  const templates = Array.isArray(context.registries.scanTemplates?.templates)
    ? context.registries.scanTemplates.templates
    : [];
  const repositories = Array.isArray(context.registries.repositoryScopes?.repositories)
    ? context.registries.repositoryScopes.repositories
    : [];

  fillCockpitSelect(root.querySelector('[data-scan-template-select]'), templates);
  fillCockpitSelect(root.querySelector('[data-repository-scope-select]'), repositories);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    const template = findCockpitEntry(templates, values.template);
    const repository = findCockpitEntry(repositories, values.repository);
    const path = values.path || repository?.publicRoot || repository?.root || '.';
    const command = fillCockpitTemplate(template?.command || '', {
      query: values.query,
      path,
      depth: values.depth || '5'
    });
    writeCockpitOutput(root, '[data-terminal-scan-output]', command || 'No scan template is selected.');
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
