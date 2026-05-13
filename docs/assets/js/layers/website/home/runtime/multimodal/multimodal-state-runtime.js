/* =============================================================================
   MULTIMODAL STATE RUNTIME
============================================================================= */

const HOME_MULTIMODAL_STATE = {
  files: [],
  ingesting: false,
  parsing: false,
  contextualizing: false
};

export function getHomeMultimodalState() {
  return HOME_MULTIMODAL_STATE;
}

export function setHomeMultimodalState(next = {}) {
  Object.assign(HOME_MULTIMODAL_STATE, next);

  window.dispatchEvent(
    new CustomEvent('home-multimodal-state-updated', {
      detail: HOME_MULTIMODAL_STATE
    })
  );
}
