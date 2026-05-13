/* =============================================================================
   PROVIDER ORCHESTRATOR
============================================================================= */

import {
  getRuntimeProviderState
} from './runtime-provider-state.js';

import {
  requestOpenAICompletion
} from './providers/openai-provider.js';

import {
  requestLocalCompletion
} from './providers/local-provider.js';

async function callRuntimeProxy(payload = {}) {
  const response = await fetch('/api/runtime/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: payload.prompt || '' }]
        }
      ]
    })
  });

  const data = await response.json();
  return data?.response || data?.output || data?.text || '';
}

export async function requestRuntimeCompletion(payload = {}) {
  const runtime = getRuntimeProviderState();

  switch (runtime.activeProvider) {
    case 'gemini':
      return callRuntimeProxy(payload);

    case 'openai':
      return requestOpenAICompletion(payload);

    case 'local':
      return requestLocalCompletion(payload);

    default:
      throw new Error('Unknown runtime provider.');
  }
}

export async function streamRuntimeCompletion(payload = {}) {
  const runtime = getRuntimeProviderState();

  switch (runtime.activeProvider) {
    case 'gemini':
      return callRuntimeProxy(payload);

    case 'openai':
      return requestOpenAICompletion(payload);

    case 'local':
      return requestLocalCompletion(payload);

    default:
      throw new Error('Unknown runtime provider.');
  }
}
