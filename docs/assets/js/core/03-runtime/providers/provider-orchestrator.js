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
      return fetch('/api/runtime/gemini', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[
            {
              role:'user',
              parts:[{text:payload.prompt || ''}]
            }
          ]
        })
      }).then(r => r.json()).then(data => {
        return (
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.output ||
          data?.text ||
          ''
        );
      });

    case 'openai': // disabled
      return requestOpenAICompletion(payload);

    case 'local': // disabled
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

    case 'openai': // disabled
      return requestOpenAICompletion(payload);

    case 'local': // disabled
      return requestLocalCompletion(payload);

    default:
      throw new Error('Unknown runtime provider.');
  }
}
