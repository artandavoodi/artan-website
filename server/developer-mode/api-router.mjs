/* =============================================================================
   00) FILE INDEX
   01) IMPORTS
   02) SESSION HELPERS
   03) GITHUB ROUTES
   04) DEVELOPER MODE ROUTES
   05) RUNTIME INTELLIGENCE ROUTES
   06) ROUTER
   07) END OF FILE
============================================================================= */

/* =============================================================================
   01) IMPORTS
============================================================================= */
import { developerModeConfig } from './config.mjs';
import {
  buildCookie,
  parseCookies,
  readJsonBody,
  redirect,
  sendJson,
  sendText
} from './http-utils.mjs';
import {
  attachGitHubSession,
  activateAgent,
  cacheGitHubRepositories,
  clearGitHubSession,
  configureProvider,
  consumeOAuthState,
  createAgentSession,
  createOAuthState,
  createProject,
  createReviewArtifact,
  ensureSession,
  getDeveloperState,
  listAgentSessions,
  listProjects,
  listReviewArtifacts,
  getRuntimeMetrics,
  listRuntimes,
  updateDeveloperState
} from './runtime-store.mjs';
import {
  buildGitHubAuthorizeUrl,
  exchangeGitHubCode,
  fetchGitHubRepositories,
  fetchGitHubViewer,
  hasGitHubOAuthConfig
} from './github-service.mjs';
import { scanRepository } from './repository-scan-service.mjs';
import {
  assertNoFrontendSecrets as rejectProviderFrontendSecrets,
  buildProviderConfiguration,
  getProviderRuntimeCapabilities,
  getProviderRuntimeRegistry,
  getProviderStatuses,
  listOpenAICompatibleModels,
  runOpenAICompatibleChat
} from './provider-service.mjs';
/* =============================================================================
   05) RUNTIME INTELLIGENCE ROUTES
============================================================================= */
function handleRuntimeRegistry(request, response) {
  const { session, headers } = getRuntimeSession(request, response);

  sendJson(response, 200, {
    ok:true,
    status:'runtime_registry_loaded',
    runtimes:listRuntimes(),
    metrics:getRuntimeMetrics(),
    providers:getProviderRuntimeRegistry(),
    developerState:getDeveloperState(session.id)
  }, headers);
}

function handleRuntimeCapabilities(request, response, url) {
  const { session, headers } = getRuntimeSession(request, response);
  const providerId = url.searchParams.get('provider') || 'openai-compatible';

  sendJson(response, 200, {
    ok:true,
    status:'runtime_capabilities_loaded',
    runtime:getProviderRuntimeCapabilities(providerId),
    developerState:getDeveloperState(session.id)
  }, headers);
}

function handleRuntimeHealth(request, response) {
  const { session, headers } = getRuntimeSession(request, response);

  sendJson(response, 200, {
    ok:true,
    status:'runtime_health_nominal',
    runtime:{
      apiRouter:true,
      providerRegistry:true,
      runtimeStore:true,
      repositoryScanner:true,
      githubBridge:true,
      orchestrationLayer:false,
      memoryEngine:false,
      autonomousExecution:false,
      sandboxIsolation:false,
      repositoryGraph:false
    },
    metrics:getRuntimeMetrics(),
    developerState:getDeveloperState(session.id)
  }, headers);
}

/* =============================================================================
   02) SESSION HELPERS
============================================================================= */
function getRuntimeSession(request, response) {
  const cookies = parseCookies(request);
  const session = ensureSession(cookies.na_dev_session);
  const headers = cookies.na_dev_session === session.id
    ? {}
    : { 'set-cookie':buildCookie('na_dev_session', session.id) };

  return { session, headers };
}

function sendLockedMutation(response, label) {
  sendJson(response, 423, {
    ok:false,
    status:'locked_approval_runtime_required',
    reason:'Repository mutation requires patch artifact review, approval attribution, and server-side GitHub credentials.',
    label
  });
}

/* =============================================================================
   03) GITHUB ROUTES
============================================================================= */
async function handleGitHubLogin(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  if (!hasGitHubOAuthConfig()) {
    sendJson(response, 503, {
      ok:false,
      status:'github_oauth_not_configured',
      reason:'Set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET in .env, then restart the Developer Mode server.'
    }, headers);
    return;
  }

  const state = createOAuthState(session.id);
  redirect(response, buildGitHubAuthorizeUrl({ state }), {
    ...headers,
    'set-cookie':[
      headers['set-cookie'],
      buildCookie('na_dev_oauth_state', state, { maxAge:600 })
    ].filter(Boolean)
  });
}

async function handleGitHubCallback(request, response, url) {
  const cookies = parseCookies(request);
  const state = url.searchParams.get('state') || '';
  const code = url.searchParams.get('code') || '';
  const stateEntry = consumeOAuthState(state);

  if (!state || !code || !stateEntry || cookies.na_dev_oauth_state !== state) {
    sendText(response, 400, 'GitHub authorization state could not be validated.');
    return;
  }

  try {
    const tokenPayload = await exchangeGitHubCode(code);
    const viewer = await fetchGitHubViewer(tokenPayload.access_token);
    const session = attachGitHubSession(stateEntry.sessionId, {
      accessToken:tokenPayload.access_token,
      scope:tokenPayload.scope || developerModeConfig.github.scope,
      tokenType:tokenPayload.token_type || 'bearer',
      viewer:{
        id:viewer.id,
        login:viewer.login,
        avatarUrl:viewer.avatar_url || '',
        htmlUrl:viewer.html_url || ''
      },
      connectedAt:new Date().toISOString()
    });

    redirect(response, '/pages/development-cockpit/index.html#project-repository-sidebar', {
      'set-cookie':[
        buildCookie('na_dev_session', session.id),
        buildCookie('na_dev_oauth_state', '', { maxAge:0 })
      ]
    });
  } catch (error) {
    sendText(response, 502, `GitHub authorization failed: ${error.message}`);
  }
}

function handleGitHubStatus(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  sendJson(response, 200, {
    ok:true,
    connected:Boolean(session.github?.accessToken),
    viewer:session.github?.viewer || null,
    scope:session.github?.scope || '',
    status:session.github?.accessToken ? 'connected' : 'authorization_required',
    developerState:getDeveloperState(session.id)
  }, headers);
}

async function handleGitHubRepositories(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  if (!session.github?.accessToken) {
    sendJson(response, 401, {
      ok:false,
      status:'github_authorization_required',
      reason:'Connect GitHub through /api/developer-mode/github/login before repository discovery.'
    }, headers);
    return;
  }

  try {
    const repositories = await fetchGitHubRepositories(session.github.accessToken);
    const developerState = cacheGitHubRepositories(session.id, repositories);
    sendJson(response, 200, {
      ok:true,
      status:'repositories_loaded',
      repositories,
      developerState
    }, headers);
  } catch (error) {
    sendJson(response, 502, {
      ok:false,
      status:'github_repository_discovery_failed',
      reason:error.message
    }, headers);
  }
}

function handleGitHubDisconnect(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  clearGitHubSession(session.id);
  sendJson(response, 200, {
    ok:true,
    status:'github_connection_cleared',
    developerState:getDeveloperState(session.id)
  }, headers);
}

/* =============================================================================
   04) DEVELOPER MODE ROUTES
============================================================================= */
function handleProviderStatus(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  sendJson(response, 200, {
    ok:true,
    status:'provider_status_loaded',
    providers:getProviderStatuses(),
    developerState:getDeveloperState(session.id),
    reason:'Provider execution requires server-side credentials or local runtime availability. No provider secrets are exposed to browser JavaScript.'
  }, headers);
}

async function handleOpenAICompatibleModels(request, response) {
  const { headers } = getRuntimeSession(request, response);
  const payload = await listOpenAICompatibleModels();
  sendJson(response, payload.ok ? 200 : 503, payload, headers);
}

async function handleOpenAICompatibleChat(request, response) {
  const { headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const rejected = rejectProviderFrontendSecrets(payload);
  if (rejected) {
    sendJson(response, 400, rejected, headers);
    return;
  }

  const result = await runOpenAICompatibleChat(payload);
  sendJson(response, result.ok ? 200 : 502, result, headers);
}

function handleDeveloperStateRead(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  sendJson(response, 200, {
    ok:true,
    status:'developer_state_loaded',
    developerState:getDeveloperState(session.id)
  }, headers);
}

async function handleDeveloperStateUpdate(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const rejected = rejectProviderFrontendSecrets(payload);
  if (rejected) {
    sendJson(response, 400, rejected, headers);
    return;
  }

  const developerState = updateDeveloperState(session.id, payload.developerState || payload);
  sendJson(response, 200, {
    ok:true,
    status:'developer_state_updated',
    developerState
  }, headers);
}

async function handleProviderConfigure(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const rejected = rejectProviderFrontendSecrets(payload);
  if (rejected) {
    sendJson(response, 400, rejected, headers);
    return;
  }

  const provider = buildProviderConfiguration(payload.provider || payload);
  const developerState = configureProvider(session.id, provider);
  sendJson(response, 200, {
    ok:true,
    status:'provider_configuration_saved',
    provider,
    developerState,
    persistence:'server_session_pending_supabase_profile_link'
  }, headers);
}

async function handleAgentActivate(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const rejected = rejectProviderFrontendSecrets(payload);
  if (rejected) {
    sendJson(response, 400, rejected, headers);
    return;
  }

  const developerState = activateAgent(session.id, payload.agent || payload);
  sendJson(response, 200, {
    ok:true,
    status:'agent_activated',
    activeAgent:developerState.activeAgent,
    developerState,
    runtime:'provider_execution_pending'
  }, headers);
}

async function handleProjectCreate(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const project = createProject(session.id, payload.project || payload);
  sendJson(response, 201, {
    ok:true,
    status:'project_workspace_created',
    project,
    developerState:getDeveloperState(session.id),
    persistence:'server_memory_until_supabase_profile_link'
  }, headers);
}

function handleProjectList(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  sendJson(response, 200, {
    ok:true,
    status:'projects_loaded',
    projects:listProjects(session.id),
    developerState:getDeveloperState(session.id)
  }, headers);
}

async function handleAgentSessionCreate(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const agentSession = createAgentSession(session.id, payload);
  sendJson(response, 201, {
    ok:true,
    status:'agent_session_created',
    session:agentSession,
    developerState:getDeveloperState(session.id),
    runtime:'provider_execution_pending'
  }, headers);
}

function handleAgentSessionList(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  sendJson(response, 200, {
    ok:true,
    status:'agent_sessions_loaded',
    sessions:listAgentSessions(session.id),
    developerState:getDeveloperState(session.id)
  }, headers);
}

async function handleRepositoryScan(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const developerState = getDeveloperState(session.id);
  const scan = await scanRepository({
    repositoryId:payload.repository || payload.repositoryId || payload.repository_id || developerState.activeRepository || 'website'
  });
  sendJson(response, scan.ok ? 200 : 400, {
    ...scan,
    developerState
  }, headers);
}

async function handlePatchProposal(request, response) {
  const { session, headers } = getRuntimeSession(request, response);
  const payload = await readJsonBody(request);
  const artifact = createReviewArtifact(session.id, payload);

  sendJson(response, 202, {
    ok:true,
    status:'review_artifact_created_provider_runtime_pending',
    reason:'Patch proposal request captured as a non-mutating review artifact. Provider runtime execution is still pending.',
    artifact,
    artifacts:listReviewArtifacts(session.id),
    developerState:getDeveloperState(session.id)
  }, headers);
}

/* =============================================================================
   06) ROUTER
============================================================================= */
export async function handleDeveloperModeApi(request, response, url) {

  // ── Runtime proxy — forwards to Groq runtime on port 3030 ──────────────
  if (request.method === 'POST' && url.pathname === '/api/runtime/gemini') {
    try {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString();

      const upstream = await fetch('http://localhost:3030/api/runtime/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const data = await upstream.json();
      response.writeHead(upstream.status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(data));
    } catch (error) {
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Runtime proxy unavailable.', response: 'Runtime proxy unavailable.' }));
    }
    return true;
  }

  if (!url.pathname.startsWith('/api/developer-mode/')) {
    return false;
  }

  try {
    if (request.method === 'GET' && url.pathname === '/api/developer-mode/runtime/registry') {
      handleRuntimeRegistry(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/runtime/capabilities') {
      handleRuntimeCapabilities(request, response, url);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/runtime/health') {
      handleRuntimeHealth(request, response);
      return true;
    }
    if (request.method === 'GET' && url.pathname === '/api/developer-mode/github/login') {
      await handleGitHubLogin(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/github/callback') {
      await handleGitHubCallback(request, response, url);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/github/status') {
      handleGitHubStatus(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/github/repositories') {
      await handleGitHubRepositories(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/github/disconnect') {
      handleGitHubDisconnect(request, response);
      return true;
    }

    if (request.method === 'GET' && (url.pathname === '/api/developer-mode/state' || url.pathname === '/api/developer-mode/profile/state')) {
      handleDeveloperStateRead(request, response);
      return true;
    }

    if (request.method === 'PATCH' && (url.pathname === '/api/developer-mode/state' || url.pathname === '/api/developer-mode/profile/state')) {
      await handleDeveloperStateUpdate(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/providers/status') {
      handleProviderStatus(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/providers/openai-compatible/models') {
      await handleOpenAICompatibleModels(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/providers/openai-compatible/chat') {
      await handleOpenAICompatibleChat(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/providers/configure') {
      await handleProviderConfigure(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/agents/activate') {
      await handleAgentActivate(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/projects') {
      handleProjectList(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/projects') {
      await handleProjectCreate(request, response);
      return true;
    }

    if (request.method === 'GET' && url.pathname === '/api/developer-mode/sessions') {
      handleAgentSessionList(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/sessions') {
      await handleAgentSessionCreate(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/repositories/scan') {
      await handleRepositoryScan(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/patches/propose') {
      await handlePatchProposal(request, response);
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/tests/run') {
      sendLockedMutation(response, 'Test request');
      return true;
    }

    if (request.method === 'POST' && url.pathname === '/api/developer-mode/github/commit-pr') {
      sendLockedMutation(response, 'Commit and pull request');
      return true;
    }

    sendJson(response, 404, {
      ok:false,
      status:'developer_mode_route_not_found',
      route:url.pathname
    });
    return true;
  } catch (error) {
    sendJson(response, 500, {
      ok:false,
      status:'developer_mode_api_error',
      reason:error.message
    });
    return true;
  }
}

/* =============================================================================
   07) END OF FILE
============================================================================= */
