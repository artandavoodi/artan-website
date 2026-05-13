/* =============================================================================
   PROVIDER ORCHESTRATOR
============================================================================= */

import {
  getRuntimeProviderState
} from './runtime-provider-state.js';

import {
  requestGeminiCompletion,
  streamGeminiCompletion
} from './providers/gemini-provider.js';

import {
  requestOpenAICompletion
} from './providers/openai-provider.js';

import {
  requestLocalCompletion
} from './providers/local-provider.js';

export async function requestRuntimeCompletion(payload = {}) {
  const runtime = getRuntimeProviderState();

  switch (runtime.activeProvider) {
    case 'gemini':
      return requestGeminiCompletion(payload);

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
      return streamGeminiCompletion(payload);

    case 'openai':
      return requestOpenAICompletion(payload);

    case 'local':
      return requestLocalCompletion(payload);

    default:
      throw new Error('Unknown runtime provider.');
  }
}
