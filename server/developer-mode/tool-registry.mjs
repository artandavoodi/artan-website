/* =============================================================================
   00) FILE INDEX
   01) IMPORTS
   02) TOOL STATE
   03) TOOL HELPERS
   04) TOOL REGISTRATION
   05) TOOL EXECUTION
   06) TOOL INSPECTION
   07) DEFAULT TOOLSET
   08) END OF FILE
============================================================================= */

/* =============================================================================
   01) IMPORTS
============================================================================= */
import crypto from 'node:crypto';

/* =============================================================================
   02) TOOL STATE
============================================================================= */
const toolRegistry = new Map();
const toolExecutionHistory = [];

/* =============================================================================
   03) TOOL HELPERS
============================================================================= */
function normalizeToolIdentifier(toolId) {
  return String(toolId || crypto.randomUUID()).trim();
}

function buildToolRecord(toolId, definition = {}) {
  return {
    id:normalizeToolIdentifier(toolId),
    label:String(definition.label || '').trim(),
    category:String(definition.category || 'generic').trim(),
    description:String(definition.description || '').trim(),
    runtimeCritical:Boolean(definition.runtimeCritical),
    enabled:definition.enabled !== false,
    executionMode:String(definition.executionMode || 'manual').trim(),
    sandboxRequired:definition.sandboxRequired !== false,
    permissions:Array.isArray(definition.permissions)
      ? definition.permissions
      : [],
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
}

/* =============================================================================
   04) TOOL REGISTRATION
============================================================================= */
export function registerTool(toolId, definition = {}) {
  const tool = buildToolRecord(toolId, definition);

  toolRegistry.set(tool.id, tool);

  return tool;
}

export function updateTool(toolId, patch = {}) {
  const tool = toolRegistry.get(toolId);

  if (!tool) {
    return null;
  }

  Object.assign(tool, {
    ...patch,
    updatedAt:new Date().toISOString()
  });

  toolRegistry.set(tool.id, tool);

  return tool;
}

export function getTool(toolId) {
  return toolRegistry.get(toolId) || null;
}

export function listTools() {
  return Array.from(toolRegistry.values());
}

/* =============================================================================
   05) TOOL EXECUTION
============================================================================= */
export async function executeTool(toolId, payload = {}) {
  const tool = getTool(toolId);

  if (!tool) {
    return {
      ok:false,
      status:'tool_not_found'
    };
  }

  if (!tool.enabled) {
    return {
      ok:false,
      status:'tool_disabled'
    };
  }

  const executionRecord = {
    executionId:crypto.randomUUID(),
    toolId:tool.id,
    toolLabel:tool.label,
    executionMode:tool.executionMode,
    sandboxRequired:tool.sandboxRequired,
    payload,
    executedAt:new Date().toISOString(),
    status:'simulated'
  };

  toolExecutionHistory.push(executionRecord);

  return {
    ok:true,
    status:'tool_execution_simulated',
    execution:executionRecord
  };
}

/* =============================================================================
   06) TOOL INSPECTION
============================================================================= */
export function inspectToolRegistry() {
  return {
    generatedAt:new Date().toISOString(),
    toolCount:toolRegistry.size,
    executionHistoryCount:toolExecutionHistory.length,
    tools:listTools(),
    executionHistory:toolExecutionHistory.slice(-25)
  };
}

/* =============================================================================
   07) DEFAULT TOOLSET
============================================================================= */
registerTool('filesystem-scanner', {
  label:'Filesystem Scanner',
  category:'filesystem',
  description:'Repository-aware filesystem scanning tool.',
  runtimeCritical:true,
  executionMode:'read-only',
  sandboxRequired:true,
  permissions:['filesystem:read']
});

registerTool('repository-intelligence', {
  label:'Repository Intelligence Engine',
  category:'repository-intelligence',
  description:'Repository intelligence and runtime topology analysis.',
  runtimeCritical:true,
  executionMode:'analysis',
  sandboxRequired:true,
  permissions:['filesystem:read', 'repository:intelligence']
});

registerTool('runtime-inspector', {
  label:'Runtime Inspector',
  category:'runtime',
  description:'Runtime topology and orchestration inspection.',
  runtimeCritical:true,
  executionMode:'inspection',
  sandboxRequired:false,
  permissions:['runtime:inspect']
});

registerTool('patch-engine', {
  label:'Patch Engine',
  category:'execution',
  description:'Governed patch generation and execution engine.',
  runtimeCritical:true,
  executionMode:'restricted',
  sandboxRequired:true,
  permissions:['filesystem:write', 'patch:generate']
});

/* =============================================================================
   08) END OF FILE
============================================================================= */