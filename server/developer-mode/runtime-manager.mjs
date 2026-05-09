/* =============================================================================
   00) FILE INDEX
   01) IMPORTS
   02) RUNTIME STATE
   03) RUNTIME HELPERS
   04) RUNTIME MANAGER
   05) RUNTIME INSPECTION
   06) END OF FILE
============================================================================= */

/* =============================================================================
   01) IMPORTS
============================================================================= */
import crypto from 'node:crypto';

import {
  registerRuntime,
  updateRuntime,
  getRuntime,
  getRuntimeMetrics,
  listRuntimes
} from './runtime-store.mjs';

/* =============================================================================
   02) RUNTIME STATE
============================================================================= */
const runtimeState = new Map();

/* =============================================================================
   03) RUNTIME HELPERS
============================================================================= */
function createRuntimeIdentifier(config = {}) {
  return String(
    config.runtime?.runtimeId
    || crypto.randomUUID()
  ).trim();
}

function buildRuntimeSnapshot(runtimeId, config = {}) {
  const runtime = getRuntime(runtimeId);

  return {
    runtimeId,
    runtime,
    metrics:getRuntimeMetrics(),
    configuration:{
      runtime:config.runtime || {},
      sandbox:config.sandbox || {},
      memory:config.memory || {},
      execution:config.execution || {},
      repositoryIntelligence:config.repositoryIntelligence || {}
    },
    generatedAt:new Date().toISOString()
  };
}

/* =============================================================================
   04) RUNTIME MANAGER
============================================================================= */
export function createRuntimeManager({ config = {} } = {}) {
  const runtimeId = createRuntimeIdentifier(config);

  const runtimeRecord = registerRuntime(runtimeId, {
    label:config.runtime?.runtimeLabel || 'ICOS Runtime',
    status:'booting',
    providerCount:1,
    workspaceCount:0,
    sandboxIsolation:Boolean(config.sandbox?.enabled)
  });

  const runtimeManager = {
    id:runtimeId,
    createdAt:new Date().toISOString(),
    config,

    getRuntimeId() {
      return runtimeId;
    },

    getRuntimeRecord() {
      return getRuntime(runtimeId);
    },

    getSnapshot() {
      return buildRuntimeSnapshot(runtimeId, config);
    },

    listRuntimeTopology() {
      return listRuntimes();
    },

    boot() {
      updateRuntime(runtimeId, {
        status:'running'
      });

      runtimeState.set(runtimeId, {
        booted:true,
        bootedAt:new Date().toISOString(),
        status:'running'
      });

      return this.getSnapshot();
    },

    suspend() {
      updateRuntime(runtimeId, {
        status:'suspended'
      });

      runtimeState.set(runtimeId, {
        ...(runtimeState.get(runtimeId) || {}),
        status:'suspended',
        suspendedAt:new Date().toISOString()
      });

      return this.getSnapshot();
    },

    resume() {
      updateRuntime(runtimeId, {
        status:'running'
      });

      runtimeState.set(runtimeId, {
        ...(runtimeState.get(runtimeId) || {}),
        status:'running',
        resumedAt:new Date().toISOString()
      });

      return this.getSnapshot();
    },

    shutdown() {
      updateRuntime(runtimeId, {
        status:'shutdown'
      });

      runtimeState.set(runtimeId, {
        ...(runtimeState.get(runtimeId) || {}),
        status:'shutdown',
        shutdownAt:new Date().toISOString()
      });

      return this.getSnapshot();
    }
  };

  runtimeManager.boot();

  return Object.freeze(runtimeManager);
}

/* =============================================================================
   05) RUNTIME INSPECTION
============================================================================= */
export function inspectRuntime(runtimeId) {
  return {
    runtime:getRuntime(runtimeId),
    state:runtimeState.get(runtimeId) || null,
    metrics:getRuntimeMetrics(),
    topology:listRuntimes(),
    inspectedAt:new Date().toISOString()
  };
}

/* =============================================================================
   06) END OF FILE
============================================================================= */