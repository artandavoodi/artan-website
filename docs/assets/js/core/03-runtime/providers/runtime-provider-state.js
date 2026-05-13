/* =============================================================================
   RUNTIME PROVIDER STATE
============================================================================= */

const NEUROARTAN_RUNTIME_PROVIDER_STATE = {
  activeProvider:'gemini',
  activeModel:'gemini-2.5-flash',
  apiKey:'AIzaSyCM8bKrz9CoSf3NJ7UhsxeDuIpJQsrhSos',
  streaming:true,
  multimodal:true,
  memory:true
};

export function getRuntimeProviderState() {
  return NEUROARTAN_RUNTIME_PROVIDER_STATE;
}

export function setRuntimeProviderState(next = {}) {
  Object.assign(
    NEUROARTAN_RUNTIME_PROVIDER_STATE,
    next
  );

  return NEUROARTAN_RUNTIME_PROVIDER_STATE;
}


window.dispatchEvent(
  new CustomEvent('neuroartan:runtime-ready')
);
