/* =============================================================================
   NEUROARTAN · HOME STAGE · DEVELOPER OPERATIONS SUMMARY
   -----------------------------------------------------------------------------
   Purpose: Summary renderer boundary for Developer Operations Panel state.
============================================================================= */

/* =============================================================================
   00) FILE INDEX
   -----------------------------------------------------------------------------
   01) SUMMARY TARGETS
   02) SUMMARY RENDERER
   03) END OF FILE
============================================================================= */

/* =============================================================================
   01) SUMMARY TARGETS
============================================================================= */
function getDeveloperOperationsSummaryTargets(panel) {
  return {
    project:panel?.querySelector('[data-home-stage-developer-summary="project"]'),
    repository:panel?.querySelector('[data-home-stage-developer-summary="repository"]'),
    branch:panel?.querySelector('[data-home-stage-developer-summary="branch"]'),
    environment:panel?.querySelector('[data-home-stage-developer-summary="environment"]')
  };
}

/* =============================================================================
   02) SUMMARY RENDERER
============================================================================= */
export function renderDeveloperOperationsSummaryTargets(panel, state = {}) {
  const targets = getDeveloperOperationsSummaryTargets(panel);
  const developerState = state.developerState || {};

  if (targets.project) targets.project.textContent = `Project: ${developerState.activeProject || 'not selected'}`;
  if (targets.repository) targets.repository.textContent = `Repository: ${developerState.activeRepository || 'not selected'}`;
  if (targets.branch) targets.branch.textContent = `Branch: ${developerState.activeBranch || 'not selected'}`;
  if (targets.environment) targets.environment.textContent = `Environment: ${developerState.activeEnvironment || 'not selected'}`;
}

/* =============================================================================
   03) END OF FILE
============================================================================= */