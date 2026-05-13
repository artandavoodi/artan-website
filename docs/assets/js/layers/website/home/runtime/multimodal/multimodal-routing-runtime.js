/* =============================================================================
   MULTIMODAL ROUTING RUNTIME
============================================================================= */

export async function routeHomeMultimodalContext(entries = []) {
  return {
    accepted: true,
    entries,
    timestamp: Date.now()
  };
}
