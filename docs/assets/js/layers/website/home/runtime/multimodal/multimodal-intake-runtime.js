/* =============================================================================
   MULTIMODAL INTAKE RUNTIME
============================================================================= */

import {
  getHomeMultimodalState,
  setHomeMultimodalState
} from './multimodal-state-runtime.js';

import {
  parseHomeMultimodalFile
} from './multimodal-parser-runtime.js';

import {
  routeHomeMultimodalContext
} from './multimodal-routing-runtime.js';

async function ingestHomeMultimodalFiles(files = []) {
  if (!files.length) {
    return;
  }

  setHomeMultimodalState({
    ingesting: true
  });

  const parsed = [];

  for (const file of files) {
    parsed.push(
      await parseHomeMultimodalFile(file)
    );
  }

  setHomeMultimodalState({
    files: parsed,
    ingesting: false,
    parsing: false,
    contextualizing: true
  });

  await routeHomeMultimodalContext(parsed);

  setHomeMultimodalState({
    contextualizing: false
  });

  window.dispatchEvent(
    new CustomEvent('home-multimodal-ingestion-complete', {
      detail: {
        files: parsed,
        state: getHomeMultimodalState()
      }
    })
  );
}

window.addEventListener('home-multimodal-ingest', async (event) => {
  const files = Array.from(event.detail?.files || []);

  await ingestHomeMultimodalFiles(files);
});
