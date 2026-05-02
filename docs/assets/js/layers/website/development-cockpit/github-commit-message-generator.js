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
/* /website/docs/assets/js/layers/website/development-cockpit/github-commit-message-generator.js */

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
export function initGithubCommitMessageGenerator(context) {
  const root = getCockpitModuleRoot(context, 'github-commit-message-generator');
  const form = root?.querySelector('[data-commit-message-form]');
  if (!root || !form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values = readCockpitForm(form);
    const output = [
      `[${values.layer}] ${values.change}`,
      '',
      values.verification
    ].join('\n');
    writeCockpitOutput(root, '[data-commit-message-output]', output);
  });
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
