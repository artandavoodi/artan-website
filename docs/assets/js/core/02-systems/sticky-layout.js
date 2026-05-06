// Neuroartan Sticky Layout System (Disabled)
// This module previously forced global layout normalization and caused drift
// with the existing layout orchestration system.
//
// Root-cause fix approach: do NOT override layout at this layer.
// The actual layout owners are:
// - global-layout-injection.js
// - stage/home shell controllers
//
// This file is intentionally left as a no-op to avoid interfering
// with the canonical layout system.

(function () {
  // no-op
})();
