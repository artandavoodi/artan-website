/* =============================================================================
   NEUROARTAN · HOME STAGE · DEVELOPER OPERATIONS INDEX
   -----------------------------------------------------------------------------
   Purpose: Builds the Developer Operations searchable index from active Developer
   Mode registry, repository, review, and runtime state.
============================================================================= */

/* =============================================================================
   00) FILE INDEX
   -----------------------------------------------------------------------------
   01) IMPORTS
   02) INDEX BUILDERS
   03) INDEX FILTERS
   04) PUBLIC API
   05) END OF FILE
============================================================================= */

/* =============================================================================
   01) IMPORTS
============================================================================= */
import { getHomeDeveloperModeState } from '../../../developer-mode/developer-mode-state.js';

/* =============================================================================
   02) INDEX BUILDERS
============================================================================= */
export function buildDeveloperOperationsIndex() {
  const state = getHomeDeveloperModeState();
  const registry = state.registry || {};
  const developerState = state.developerState || {};
  const repositories = Array.isArray(state.repositories) ? state.repositories : [];
  const reviewArtifacts = Array.isArray(state.reviewArtifacts) ? state.reviewArtifacts : [];
  const commandModes = Array.isArray(registry.commandModes) ? registry.commandModes : [];

  const tasks = commandModes.map((mode) => ({
    type:'task',
    tab:'tasks',
    title:mode.label || mode.id || 'Developer action',
    meta:[mode.id, mode.runtimeInterface].filter(Boolean).join(' · '),
    summary:mode.description || 'Developer action metadata.',
    search:[mode.id, mode.label, mode.runtimeInterface, mode.description].join(' ')
  }));

  const reviews = reviewArtifacts.map((artifact) => ({
    type:'review',
    tab:'code-review',
    title:artifact.command || artifact.query || artifact.id || 'Review artifact',
    meta:[artifact.status, artifact.repository || developerState.activeRepository, artifact.provider].filter(Boolean).join(' · '),
    summary:artifact.summary || artifact.approvalState || 'Review artifact pending.',
    search:[artifact.id, artifact.command, artifact.query, artifact.status, artifact.repository, artifact.provider, artifact.summary].join(' ')
  }));

  const repositoryArchive = repositories.map((repository) => ({
    type:'archive',
    tab:'archive',
    title:repository.full_name || repository.name || 'Repository',
    meta:[repository.default_branch || developerState.activeBranch || 'branch pending', repository.visibility || 'visibility pending'].filter(Boolean).join(' · '),
    summary:repository.description || 'Repository indexed for Developer Mode.',
    search:[repository.name, repository.full_name, repository.default_branch, repository.visibility, repository.description].join(' ')
  }));

  return [...tasks, ...reviews, ...repositoryArchive];
}

/* =============================================================================
   03) INDEX FILTERS
============================================================================= */
function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeSearchText(value) {
  return normalizeText(value).toLowerCase();
}

export function filterDeveloperOperationsIndex(index, options = {}) {
  const activeTab = options.activeTab || 'tasks';
  const query = normalizeSearchText(options.query || '');

  return index.filter((item) => {
    const tabMatches = item.tab === activeTab;
    const queryMatches = !query || normalizeSearchText(item.search).includes(query);
    return tabMatches && queryMatches;
  });
}

/* =============================================================================
   04) PUBLIC API
============================================================================= */
export function getFilteredDeveloperOperationsIndex(options = {}) {
  return filterDeveloperOperationsIndex(buildDeveloperOperationsIndex(), options);
}

/* =============================================================================
   05) END OF FILE
============================================================================= */