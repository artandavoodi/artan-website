/* =============================================================================
   00) FILE INDEX
   01) MODULE IDENTITY
   02) MODULE REGISTRATION
   03) MOTION PRIMITIVE REGISTRATION
   04) MOTION TARGET SELECTORS
   05) MOTION HELPERS
   06) REVEAL GROUP INITIALIZATION
   07) SCAN HELPERS
   08) EVENT REBINDING
   08A) REBIND SCHEDULER
   09) PUBLIC API EXPORTS
   10) INITIALIZATION
   11) END OF FILE
============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
============================================================================= */
/* /website/docs/assets/js/core/01-foundation/motion.js */

/* =============================================================================
   02) MODULE REGISTRATION
============================================================================= */
const MODULE_ID = 'core-motion';
const MODULE_PATH = '/website/docs/assets/js/core/01-foundation/motion.js';
const FLAG_READY = 'coreMotionReady';
const FLAG_EVENTS_BOUND = 'coreMotionEventsBound';

function getRuntime() {
  return (window.__NEURO_MAIN_RUNTIME__ ||= {});
}

function getRuntimeFlag(key) {
  return !!getRuntime()[key];
}

function setRuntimeFlag(key, value) {
  getRuntime()[key] = value;
}

function emitRuntimeEvent(name, detail = {}) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/* =============================================================================
   03) MOTION PRIMITIVE REGISTRATION
============================================================================= */
const MOTION_TARGET_SELECTORS = [
  '[data-motion]',
  '.motion-init',
  '.motion-visible'
].join(',');

/* =============================================================================
   04) MOTION TARGET SELECTORS
============================================================================= */
export function getMotionTargets(root = document) {
  if (!root?.querySelectorAll) return [];
  return Array.from(root.querySelectorAll(MOTION_TARGET_SELECTORS));
}

/* =============================================================================
   05) MOTION HELPERS
============================================================================= */
export function normalizeMotionTarget(node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.dataset.motionPrimitiveBound === 'true') return;

  if (node.dataset.motion && !node.classList.contains('motion-init') && !node.classList.contains('motion-visible')) {
    node.classList.add('motion-init');
  }

  node.dataset.motionPrimitiveBound = 'true';
}

export function observeMotionItems(items = [], options = {}) {
  const {
    threshold = 0.18,
    rootMargin = '0px 0px -10% 0px'
  } = options;

  if (!items.length) return null;

  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('motion-visible'));
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > threshold) {
          entry.target.classList.add('motion-visible');
        } else {
          entry.target.classList.remove('motion-visible');
        }
      });
    },
    {
      threshold: [0, threshold, 0.32, 0.5],
      rootMargin
    }
  );

  items.forEach((item) => observer.observe(item));
  return observer;
}

/* =============================================================================
   06) REVEAL GROUP INITIALIZATION
============================================================================= */
export function initMotionPrimitive(root = document, config = {}) {
  const {
    sectionSelector,
    itemSelector,
    initializedKey,
    threshold = 0.18,
    rootMargin = '0px 0px -10% 0px'
  } = config;

  if (sectionSelector && itemSelector && initializedKey) {
    const scope = root instanceof Element || root instanceof Document ? root : document;
    const section = scope.matches?.(sectionSelector)
      ? scope
      : scope.querySelector?.(sectionSelector);

    if (!section || section.dataset[initializedKey] === 'true') return;

    const items = Array.from(section.querySelectorAll(itemSelector));
    if (!items.length) return;

    items.forEach((item) => {
      item.classList.add('motion-init');
      normalizeMotionTarget(item);
    });

    observeMotionItems(items, { threshold, rootMargin });
    section.dataset[initializedKey] = 'true';
  } else {
    const targets = root instanceof Element && root.matches?.(MOTION_TARGET_SELECTORS)
      ? [root]
      : getMotionTargets(root);

    targets.forEach(normalizeMotionTarget);
    observeMotionItems(targets, { threshold, rootMargin });
  }

  if (!getRuntimeFlag(FLAG_READY)) {
    setRuntimeFlag(FLAG_READY, true);
    emitRuntimeEvent('neuroartan:motion-primitive-ready', {
      source: MODULE_ID,
      modulePath: MODULE_PATH
    });
  }
}

/* =============================================================================
   07) SCAN HELPERS
============================================================================= */
export function scanMotion(root = document) {
  initMotionPrimitive(root);
}

/* =============================================================================
   08) EVENT REBINDING
============================================================================= */
export function bindMotionPrimitiveEvents() {
  if (getRuntimeFlag(FLAG_EVENTS_BOUND)) return;
  setRuntimeFlag(FLAG_EVENTS_BOUND, true);

  document.addEventListener('fragment:mounted', (event) => {
    const detailRoot = event?.detail?.root;
    const root = detailRoot instanceof Element ? detailRoot : document;
    scheduleMotionScan(root);
  });

  window.addEventListener('load', () => {
    scheduleMotionScan(document);
  }, { once: true });
}

/* =============================================================================
   08A) REBIND SCHEDULER
============================================================================= */
let motionScanScheduled = false;

function scheduleMotionScan(root = document) {
  if (motionScanScheduled) return;
  motionScanScheduled = true;

  window.requestAnimationFrame(() => {
    motionScanScheduled = false;
    scanMotion(root);
  });
}

/* =============================================================================
   09) PUBLIC API EXPORTS
============================================================================= */
window.NeuroMotion = Object.freeze({
  getMotionTargets,
  normalizeMotionTarget,
  observeMotionItems,
  initMotionPrimitive,
  bindMotionPrimitiveEvents,
  scan: scanMotion
});

/* =============================================================================
   10) INITIALIZATION
============================================================================= */
function bootMotionPrimitive() {
  bindMotionPrimitiveEvents();
  scheduleMotionScan(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bootMotionPrimitive();
  }, { once: true });
} else {
  bootMotionPrimitive();
}

/* =============================================================================
   11) END OF FILE
============================================================================= */