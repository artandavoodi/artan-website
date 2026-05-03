/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) IMPORTS
   03) CONSTANTS
   04) SHELL REGISTRATION
   05) RENDERING
   06) REVIEW ARTIFACT RENDERING
   07) ACTION METADATA RENDERING
   08) BACKEND ACTIONS
   09) EVENT BINDING
   10) DEVELOPER CONSOLE MOUNT
   11) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/layers/website/home/developer-mode/developer-mode-shell.js */

/* =============================================================================
   02) IMPORTS
============================================================================= */
import {
  loadHomeDeveloperJson,
  requestHomeDeveloperAction
} from './developer-mode-api.js';
import {
  getActiveHomeDeveloperProvider,
  getActiveHomeDeveloperRepository,
  getHomeDeveloperModeState,
  setHomeDeveloperModeState
} from './developer-mode-state.js';
import {
  renderHomeDeveloperRouteButtons,
  setHomeDeveloperActivePanel
} from './developer-mode-navigation.js';

/* =============================================================================
   03) CONSTANTS
============================================================================= */
const HOMEPAGE_DEVELOPER_MODE_REGISTRY_PATH = '/assets/data/website/development-cockpit/homepage-developer-mode-registry.json';
const PROVIDER_REGISTRY_PATH = '/assets/data/website/development-cockpit/provider-registry.json';
const PROJECT_REGISTRY_PATH = '/assets/data/website/development-cockpit/developer-project-registry.json';

/* =============================================================================
   04) SHELL REGISTRATION
============================================================================= */
function markDeveloperShellRegistered(root) {
  root.dataset.homeDeveloperModeMounted = 'true';
}

/* =============================================================================
   05) RENDERING
============================================================================= */
function writeOutput(root, key, value) {
  const node = root.querySelector(`[data-home-developer-output="${key}"]`);
  if (node) node.textContent = String(value || '');
}

function readForm(form) {
  return Object.fromEntries(Array.from(new FormData(form).entries()).map(([key, value]) => {
    return [key, String(value || '').trim()];
  }));
}

function renderContext(root) {
  const state = getHomeDeveloperModeState();
  const developerState = state.developerState || {};
  const github = developerState.github || {};
  const activeAgent = developerState.activeAgent || {};
  const defaultProvider = developerState.developerPreferences?.defaultProvider || '';

  const values = {
    activeProject:developerState.activeWorkspace || developerState.activeProjectId || 'Not selected',
    github:github.connected ? (github.viewer?.login || 'Connected') : 'Authorization required',
    activeRepository:developerState.activeRepository || 'Not selected',
    activeBranch:developerState.activeBranch || 'Not selected',
    activeAgent:activeAgent.providerId ? `${activeAgent.providerId} / ${activeAgent.agentRole}` : 'Not active',
    provider:defaultProvider || activeAgent.providerId || 'Not configured',
    runtime:state.providerStatuses.length ? 'Provider status loaded' : 'Backend status pending',
    approval:'Required before mutation',
    fileTarget:'Not selected',
    security:'No frontend secrets; mutation gated'
  };

  Object.entries(values).forEach(([key, value]) => {
    const node = root.querySelector(`[data-home-developer-context="${key}"]`);
    if (node) node.textContent = value;
  });
}


/* =============================================================================
   06) REVIEW ARTIFACT RENDERING
============================================================================= */
function normalizeReviewArtifacts(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function formatReviewArtifactLabel(artifact) {
  return artifact?.command || artifact?.query || artifact?.summary || artifact?.id || 'Review artifact';
}

function renderReviewArtifacts(root) {
  const state = getHomeDeveloperModeState();
  const artifacts = normalizeReviewArtifacts(state.reviewArtifacts || state.developerState?.reviewArtifacts);
  const list = root.querySelector('[data-home-developer-review-artifact-list]');

  if (!list) return;

  list.replaceChildren();

  if (!artifacts.length) {
    const empty = document.createElement('p');
    empty.className = 'home-developer-mode-review-artifacts__empty';
    empty.textContent = 'No review artifacts created yet.';
    list.append(empty);
    return;
  }

  artifacts.forEach((artifact) => {
    const item = document.createElement('article');
    const title = document.createElement('strong');
    const meta = document.createElement('span');
    const diagnostics = document.createElement('span');

    item.className = 'home-developer-mode-list__item';
    item.dataset.homeDeveloperReviewArtifact = artifact.id || '';

    title.textContent = formatReviewArtifactLabel(artifact);
    meta.textContent = [
      artifact.status || 'review_artifact_created',
      artifact.repository || 'repository pending',
      artifact.provider || 'provider pending'
    ].filter(Boolean).join(' · ');
    diagnostics.textContent = normalizeReviewArtifacts(artifact.diagnostics).join(' ');

    item.append(title, meta, diagnostics);
    list.append(item);
  });
}

function updateReviewArtifacts(root, response = {}) {
  const artifacts = normalizeReviewArtifacts(response.artifacts || (response.artifact ? [response.artifact] : []));

  if (!artifacts.length) return;

  setHomeDeveloperModeState({
    reviewArtifacts:artifacts,
    developerState:response.developerState || getHomeDeveloperModeState().developerState
  });
  renderReviewArtifacts(root);
  writeOutput(root, 'review', [
    `Review artifacts: ${artifacts.length}`,
    `Latest status: ${response.artifact?.status || response.status || 'review_artifact_created'}`,
    `Mutation: ${response.artifact?.mutationApplied ? 'applied' : 'not applied'}`,
    `Approval: ${response.artifact?.approvalState || 'founder_review_required_before_mutation'}`
  ].join('\n'));
}

/* =============================================================================
   07) ACTION METADATA RENDERING
============================================================================= */
function normalizeDeveloperActionModes(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function getDeveloperActionSurface(mode = {}) {
  const id = mode.id || '';
  const runtimeInterface = mode.runtimeInterface || '';

  if ([
    'generate-patch',
    'review-patch',
    'generate-tests',
    'prepare-commit',
    'prepare-pull-request',
    'document-change'
  ].includes(id) || ['patch-proposal-request', 'test-request', 'commit-pr-request'].includes(runtimeInterface)) {
    return 'review';
  }

  return 'runtime';
}

function renderDeveloperActionMetadata(root) {
  const state = getHomeDeveloperModeState();
  const modes = normalizeDeveloperActionModes(state.registry?.commandModes);

  root.querySelectorAll('[data-home-developer-action-metadata-list]').forEach((list) => {
    const surface = list.dataset.homeDeveloperActionMetadataList || 'runtime';
    const actions = modes.filter((mode) => getDeveloperActionSurface(mode) === surface);

    list.replaceChildren();

    if (!actions.length) {
      const empty = document.createElement('p');
      empty.className = 'home-developer-mode-action-metadata__empty';
      empty.textContent = `${surface === 'review' ? 'Review' : 'Runtime'} actions not loaded.`;
      list.append(empty);
      return;
    }

    actions.forEach((mode) => {
      const item = document.createElement('button');
      const title = document.createElement('strong');
      const meta = document.createElement('span');
      const copy = document.createElement('span');

      item.className = 'home-developer-mode-list__item';
      item.type = 'button';
      item.dataset.homeDeveloperActionMode = mode.id || '';
      item.dataset.homeDeveloperActionRuntimeInterface = mode.runtimeInterface || '';
      item.setAttribute('aria-pressed', String(mode.id === state.activeMode));

      title.textContent = mode.label || mode.id || 'Developer action';
      meta.textContent = [mode.id || '', mode.runtimeInterface || 'runtime pending'].filter(Boolean).join(' · ');
      copy.textContent = mode.description || 'Developer action metadata.';

      item.append(title, meta, copy);
      list.append(item);
    });
  });
}

function renderRepositoryList(root) {
  const state = getHomeDeveloperModeState();
  const list = root.querySelector('[data-home-developer-repository-list]');
  if (!list) return;

  const repositories = Array.isArray(state.developerState?.repositories) ? state.developerState.repositories : [];
  list.replaceChildren();
  repositories.forEach((repository) => {
    const button = document.createElement('button');
    const title = document.createElement('strong');
    const copy = document.createElement('span');
    button.className = 'home-developer-mode-list__item';
    button.type = 'button';
    button.dataset.homeDeveloperRepository = repository.fullName || repository.id;
    button.setAttribute('aria-pressed', String((repository.fullName || repository.id) === state.developerState?.activeRepository));
    title.textContent = repository.label || repository.fullName || repository.id;
    copy.textContent = `${repository.private ? 'Private' : 'Public'} · ${repository.defaultBranch || 'branch pending'}`;
    button.append(title, copy);
    list.append(button);
  });

  if (!repositories.length) {
    writeOutput(root, 'repositories', 'No repositories loaded. Connect GitHub, then discover repositories.');
  }
}

function renderProviderList(root) {
  const state = getHomeDeveloperModeState();
  const list = root.querySelector('[data-home-developer-provider-list]');
  if (!list) return;

  list.replaceChildren();
  state.providers.forEach((provider) => {
    const status = state.providerStatuses.find((entry) => entry.id === provider.id);
    const button = document.createElement('button');
    const title = document.createElement('strong');
    const copy = document.createElement('span');
    button.className = 'home-developer-mode-list__item';
    button.type = 'button';
    button.dataset.homeDeveloperProvider = provider.id;
    button.setAttribute('aria-pressed', String(provider.id === getActiveHomeDeveloperProvider()));
    title.textContent = provider.label;
    copy.textContent = `${provider.mode} · ${status?.credentialStatus || provider.status}`;
    button.append(title, copy);
    list.append(button);
  });
}

function renderProjectForm(root) {
  const state = getHomeDeveloperModeState();
  const select = root.querySelector('[data-home-developer-environment-mode]');
  if (!(select instanceof HTMLSelectElement)) return;

  select.replaceChildren();
  const modes = Array.isArray(state.projects?.environmentModes) ? state.projects.environmentModes : [];
  modes.forEach((mode) => {
    const option = document.createElement('option');
    option.value = mode.id || '';
    option.textContent = mode.label || mode.id || '';
    select.append(option);
  });
}

function renderDeveloperMode(root) {
  const state = getHomeDeveloperModeState();
  renderHomeDeveloperRouteButtons(root.querySelector('[data-home-developer-sidebar-items]'), state.registry?.sidebarItems || []);
  renderRepositoryList(root);
  renderProviderList(root);
  renderProjectForm(root);
  renderContext(root);
  renderReviewArtifacts(root);
  renderDeveloperActionMetadata(root);
  setHomeDeveloperActivePanel(root, state.activePanel);
}

async function refreshDeveloperState(root) {
  const [stateResponse, providerResponse] = await Promise.all([
    requestHomeDeveloperAction('developer-state-read', { source:'homepage-developer-mode' }),
    requestHomeDeveloperAction('provider-connection-status', { source:'homepage-developer-mode' })
  ]);

  setHomeDeveloperModeState({
    developerState:stateResponse.developerState || null,
    providerStatuses:Array.isArray(providerResponse.providers) ? providerResponse.providers : []
  });
  renderDeveloperMode(root);
  writeOutput(root, 'settings', [
    `Developer state: ${stateResponse.status}`,
    `GitHub: ${stateResponse.developerState?.github?.connected ? 'connected' : 'authorization_required'}`,
    `Persistence: ${stateResponse.developerState?.canonicalPersistence || 'server_session_pending_supabase_profile_link'}`
  ].join('\n'));
}

/* =============================================================================
   08) BACKEND ACTIONS
============================================================================= */
async function discoverRepositories(root) {
  const response = await requestHomeDeveloperAction('github-repository-discovery', {
    source:'homepage-developer-mode'
  });
  setHomeDeveloperModeState({
    developerState:response.developerState || getHomeDeveloperModeState().developerState
  });
  renderDeveloperMode(root);
  writeOutput(root, 'repositories', response.ok
    ? `Repositories loaded: ${response.repositories?.length || 0}`
    : `Repository discovery blocked: ${response.reason || response.status}`);
}

async function selectRepository(root, repository) {
  const response = await requestHomeDeveloperAction('developer-state-update', {
    activeRepository:repository
  });
  setHomeDeveloperModeState({
    developerState:response.developerState || getHomeDeveloperModeState().developerState
  });
  renderDeveloperMode(root);
  writeOutput(root, 'repositories', `Active repository: ${response.developerState?.activeRepository || repository}`);
}

async function createProject(root, form) {
  const values = readForm(form);
  const response = await requestHomeDeveloperAction('developer-project-create', {
    project:{
      ...values,
      repository:getActiveHomeDeveloperRepository(),
      provider:getActiveHomeDeveloperProvider()
    }
  });
  setHomeDeveloperModeState({
    developerState:response.developerState || getHomeDeveloperModeState().developerState
  });
  renderDeveloperMode(root);
  writeOutput(root, 'projects', response.ok
    ? `Project created: ${response.project?.projectName || values.projectName}\nRepository: ${response.project?.repository || 'not bound'}`
    : `Project creation blocked: ${response.reason || response.status}`);
}

async function activateProvider(root, providerId) {
  const provider = getHomeDeveloperModeState().providers.find((entry) => entry.id === providerId);
  const configuration = await requestHomeDeveloperAction('provider-configure', {
    provider:{
      id:providerId,
      label:provider?.label || providerId,
      mode:provider?.mode || '',
      runtime:provider?.runtime || '',
      selectedModel:provider?.runtime || providerId
    }
  });
  const activation = await requestHomeDeveloperAction('agent-activate', {
    agent:{
      providerId,
      selectedModel:provider?.runtime || providerId,
      agentRole:'implementation-agent'
    }
  });
  setHomeDeveloperModeState({
    developerState:activation.developerState || configuration.developerState || getHomeDeveloperModeState().developerState
  });
  renderDeveloperMode(root);
  writeOutput(root, 'agents', [
    `Provider: ${provider?.label || providerId}`,
    `Configuration: ${configuration.status}`,
    `Activation: ${activation.status}`,
    `Credential status: ${configuration.provider?.credentialStatus || 'unknown'}`
  ].join('\n'));
}

async function runScan(root) {
  const response = await requestHomeDeveloperAction('repository-scan-request', {
    repository:getActiveHomeDeveloperRepository()
  });
  writeOutput(root, 'runtime', response.ok
    ? `Scan complete.\nRepository: ${response.repositoryId}\nFiles scanned: ${response.fileCount}\nDirectories scanned: ${response.directoryCount}`
    : `Scan blocked: ${response.reason || response.status}`);
}

async function runLockedReviewAction(root, interfaceId) {
  const response = await requestHomeDeveloperAction(interfaceId, {
    repository:getActiveHomeDeveloperRepository(),
    provider:getActiveHomeDeveloperProvider()
  });
  updateReviewArtifacts(root, response);
  writeOutput(root, 'review', [
    `Action: ${interfaceId}`,
    `Status: ${response.status}`,
    `Reason: ${response.reason || 'Approval-gated runtime route.'}`
  ].join('\n'));
}

/* =============================================================================
   09) EVENT BINDING
============================================================================= */
function bindDeveloperModeEvents(root) {
  document.addEventListener('neuroartan:home-stage-developer-command-artifact-created', (event) => {
    updateReviewArtifacts(root, event.detail || {});
  });

  root.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const route = target.closest('[data-home-developer-route-panel]');
    if (route) {
      event.preventDefault();
      setHomeDeveloperModeState({
        activePanel:route.dataset.homeDeveloperRoutePanel || 'repositories',
        activeMode:route.dataset.homeDeveloperRouteMode || getHomeDeveloperModeState().activeMode
      });
      renderDeveloperMode(root);
      return;
    }

    const actionMode = target.closest('[data-home-developer-action-mode]');
    if (actionMode) {
      event.preventDefault();
      setHomeDeveloperModeState({
        activeMode:actionMode.dataset.homeDeveloperActionMode || getHomeDeveloperModeState().activeMode
      });
      renderDeveloperMode(root);
      writeOutput(root, actionMode.closest('[data-home-developer-panel="review"]') ? 'review' : 'runtime', [
        `Selected action: ${actionMode.dataset.homeDeveloperActionMode || 'unknown'}`,
        `Runtime interface: ${actionMode.dataset.homeDeveloperActionRuntimeInterface || 'pending'}`,
        'Submit the actual command through the canonical homepage interactive panel.'
      ].join('\n'));
      return;
    }

    const repository = target.closest('[data-home-developer-repository]');
    if (repository) {
      event.preventDefault();
      void selectRepository(root, repository.dataset.homeDeveloperRepository || '');
      return;
    }

    const provider = target.closest('[data-home-developer-provider]');
    if (provider) {
      event.preventDefault();
      void activateProvider(root, provider.dataset.homeDeveloperProvider || '');
      return;
    }

    if (target.closest('[data-home-developer-github-connect]')) {
      event.preventDefault();
      window.location.href = '/api/developer-mode/github/login';
      return;
    }

    if (target.closest('[data-home-developer-repository-discover]')) {
      event.preventDefault();
      void discoverRepositories(root);
      return;
    }

    if (target.closest('[data-home-developer-github-disconnect]')) {
      event.preventDefault();
      void requestHomeDeveloperAction('github-disconnect', {}).then(() => refreshDeveloperState(root));
      return;
    }

    if (target.closest('[data-home-developer-runtime-scan]')) {
      event.preventDefault();
      void runScan(root);
      return;
    }

    const lockedAction = target.closest('[data-home-developer-locked-action]');
    if (lockedAction) {
      event.preventDefault();
      void runLockedReviewAction(root, lockedAction.dataset.homeDeveloperLockedAction || '');
      return;
    }

    if (target.closest('[data-home-developer-open-control-center]')) {
      event.preventDefault();
      document.dispatchEvent(new CustomEvent('neuroartan:home-interaction-settings-open-requested', {
        detail:{
          source:'homepage-developer-mode',
          section:'developer'
        }
      }));
      return;
    }

    if (target.closest('[data-home-developer-state-refresh]')) {
      event.preventDefault();
      void refreshDeveloperState(root);
    }
  });

  root.addEventListener('submit', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const projectForm = target?.closest('[data-home-developer-project-form]');
    if (projectForm instanceof HTMLFormElement) {
      event.preventDefault();
      void createProject(root, projectForm);
      return;
    }
  });
}

/* =============================================================================
   10) DEVELOPER CONSOLE MOUNT
============================================================================= */
export async function mountHomeDeveloperModeShell(root) {
  if (!root || root.dataset.homeDeveloperModeMounted === 'true') {
    return;
  }

  markDeveloperShellRegistered(root);
  const [registry, providers, projects] = await Promise.all([
    loadHomeDeveloperJson(HOMEPAGE_DEVELOPER_MODE_REGISTRY_PATH),
    loadHomeDeveloperJson(PROVIDER_REGISTRY_PATH),
    loadHomeDeveloperJson(PROJECT_REGISTRY_PATH)
  ]);

  setHomeDeveloperModeState({
    registry,
    providers:Array.isArray(providers.providers) ? providers.providers : [],
    projects
  });

  bindDeveloperModeEvents(root);
  await refreshDeveloperState(root);
}

/* =============================================================================
   11) END OF FILE
============================================================================= */
