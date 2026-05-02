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
/* /website/docs/assets/js/layers/website/development-cockpit/patch-instruction-generator.js */

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
export function initPatchInstructionGenerator(context) {
  const root = getCockpitModuleRoot(context, 'patch-instruction-generator');
  const form = root?.querySelector('[data-patch-instruction-form]');
  if (!root || !form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    const output = [
      `Owner file: ${values.owner}`,
      `Root cause: ${values.rootCause}`,
      `Required correction: ${values.correction}`,
      'Implementation rule: edit the owner source only; do not add local compensation or duplicate ownership.'
    ].join('\n');
    writeCockpitOutput(root, '[data-patch-instruction-output]', output);
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
