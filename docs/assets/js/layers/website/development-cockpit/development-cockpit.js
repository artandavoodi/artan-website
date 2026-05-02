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
/* /website/docs/assets/js/layers/website/development-cockpit/development-cockpit.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import { initDevelopmentCockpitShell } from './development-cockpit-shell.js';
import { initDailyExecutionLog } from './daily-execution-log.js';
import { initFileTargetSelector } from './file-target-selector.js';
import { initGithubCommitMessageGenerator } from './github-commit-message-generator.js';
import { initOpenFileNextWorkflow } from './open-file-next-workflow.js';
import { initPatchInstructionGenerator } from './patch-instruction-generator.js';
import { initPromptComposer } from './prompt-composer.js';
import { initProviderRouter } from './provider-router.js';
import { initTerminalScanGenerator } from './terminal-scan-generator.js';

/* =============================================================================
   03) INITIALIZATION
============================================================================= */
async function initDevelopmentCockpit() {
  try {
    const context = await initDevelopmentCockpitShell();
    if (!context) return;

    initPromptComposer(context);
    initTerminalScanGenerator(context);
    initFileTargetSelector(context);
    initPatchInstructionGenerator(context);
    initGithubCommitMessageGenerator(context);
    initOpenFileNextWorkflow(context);
    initProviderRouter(context);
    initDailyExecutionLog(context);
  } catch (error) {
    console.error('[development-cockpit] Initialization failed.', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDevelopmentCockpit, { once:true });
} else {
  void initDevelopmentCockpit();
}

/* =============================================================================
   04) END OF FILE
============================================================================= */
