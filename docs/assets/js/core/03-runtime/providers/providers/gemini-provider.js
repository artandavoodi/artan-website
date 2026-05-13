/* =============================================================================
   GEMINI PROVIDER
============================================================================= */

import {
  getRuntimeProviderState
} from '../runtime-provider-state.js';

import {
  buildRuntimeSystemIdentity
} from '../../system-prompt/runtime-system-identity.js';

export async function requestGeminiCompletion(payload = {}) {
  const runtime = getRuntimeProviderState();

  const apiKey =
    runtime.apiKey ||
    localStorage.getItem('neuroartan-provider-gemini-key') ||
    '';

  if (!apiKey) {
    throw new Error('Missing Gemini API key.');
  }

  const endpoint =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    runtime.activeModel +
    ':generateContent?key=' +
    apiKey;

  const response = await fetch(
    endpoint,
    {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        generationConfig:{
          temperature:0.82,
          topP:0.92,
          topK:40,
          maxOutputTokens:2048
        },

        systemInstruction:{
          parts:[
            {
              text:buildRuntimeSystemIdentity()
            }
          ]
        },

        contents:[
          {
            role:'user',

            parts:[
              {
                text:String(payload.prompt || '')
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const failure = await response.text();

    throw new Error(
      'Gemini runtime error: ' + failure
    );
  }

  const data = await response.json();

  console.log(
    '[ICOS:GEMINI:RAW]',
    data
  );

  const responseText =
    data?.candidates?.[0]?.content?.parts?.map(
      (part) => part?.text || ''
    ).join('\n') ||

    data?.candidates?.[0]?.output ||
    '';

  console.log(
    '[ICOS:GEMINI:TEXT]',
    responseText
  );

  return String(
    responseText || ''
  ).trim();
}


export async function streamGeminiCompletion(payload = {}) {
  return requestGeminiCompletion(payload);
}
