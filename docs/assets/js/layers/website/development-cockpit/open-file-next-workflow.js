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
/* /website/docs/assets/js/layers/website/development-cockpit/open-file-next-workflow.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  getCockpitModuleRoot,
  readCockpitForm,
  writeCockpitOutput
} from './development-cockpit-shell.js';

/* =============================================================================
   03) INITIALIZATION
============================================================================= */
export function initOpenFileNextWorkflow(context) {
  const root = getCockpitModuleRoot(context, 'open-file-next-workflow');
  const form = root?.querySelector('[data-open-file-next-form]');
  if (!root || !form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    const output = [
      'NEXT FILE TO OPEN:',
      values.file,
      '',
      'NEXT ACTION:',
      values.action
    ].join('\n');
    writeCockpitOutput(root, '[data-open-file-next-output]', output);
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
