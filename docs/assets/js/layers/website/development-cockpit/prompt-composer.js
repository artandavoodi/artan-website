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
/* /website/docs/assets/js/layers/website/development-cockpit/prompt-composer.js */

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
export function initPromptComposer(context) {
  const root = getCockpitModuleRoot(context, 'prompt-composer');
  const form = root?.querySelector('[data-prompt-composer-form]');
  if (!root || !form) return;

  const templates = Array.isArray(context.registries.promptTemplates?.templates)
    ? context.registries.promptTemplates.templates
    : [];

  fillCockpitSelect(root.querySelector('[data-prompt-template-select]'), templates);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    const template = findCockpitEntry(templates, values.template);
    const output = fillCockpitTemplate(template?.template || '', {
      scope: values.scope,
      objective: values.objective,
      verification: values.verification
    });
    writeCockpitOutput(root, '[data-prompt-composer-output]', output || 'No prompt template is selected.');
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
