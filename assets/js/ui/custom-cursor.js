/* =================== Sovereign Custom Cursor =================== */

(function () {
  'use strict';

  const CURSOR_SELECTOR = '.custom-cursor';
  const INTERACTIVE_SELECTOR = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    "[role='button']",
    '.enter-button',
    '.logo-container',
    '.country-option',
    '#country-overlay-close',
    '#country-selector',
    '#language-toggle',
    '#language-dropdown'
  ].join(', ');

  let rafId = null;
  let isBound = false;
  let customCursor = null;

  const state = {
    pointerX: window.innerWidth * 0.5,
    pointerY: window.innerHeight * 0.5,
    renderX: window.innerWidth * 0.5,
    renderY: window.innerHeight * 0.5,
    pointerActive: false,
    isInteractive: false,
    isHidden: false,
    initialized: false
  };

  function ensureCursorNode() {
    let node = document.querySelector(CURSOR_SELECTOR);

    if (!node) {
      node = document.createElement('div');
      node.className = 'custom-cursor';
      document.body.appendChild(node);
    }

    return node;
  }

  function applyVisualState() {
    if (!customCursor) return;

    if (state.isHidden) {
      customCursor.style.opacity = '0';
      customCursor.style.transform = 'translate3d(-50%, -50%, 0) scale(0.8)';
      return;
    }

    customCursor.style.opacity = state.isInteractive ? '0.35' : '1';
    customCursor.style.transform = state.isInteractive
      ? 'translate3d(-50%, -50%, 0) scale(0.4)'
      : 'translate3d(-50%, -50%, 0) scale(1)';
  }

  function renderCursor() {
    if (!customCursor) return;

    const follow = state.pointerActive ? 0.18 : 0.12;

    state.renderX += (state.pointerX - state.renderX) * follow;
    state.renderY += (state.pointerY - state.renderY) * follow;

    customCursor.style.left = `${state.renderX}px`;
    customCursor.style.top = `${state.renderY}px`;

    applyVisualState();
    rafId = window.requestAnimationFrame(renderCursor);
  }

  function startLoop() {
    if (rafId) return;
    rafId = window.requestAnimationFrame(renderCursor);
  }

  function stopLoop() {
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  function syncToPointer(x, y, snap = false) {
    state.pointerX = x;
    state.pointerY = y;

    if (!state.initialized || snap) {
      state.renderX = x;
      state.renderY = y;
      state.initialized = true;
    }
  }

  function resolvePointerTarget(target) {
    if (!(target instanceof Element)) return null;
    return target.closest(INTERACTIVE_SELECTOR);
  }

  function handlePointerMove(event) {
    syncToPointer(event.clientX, event.clientY);
    state.pointerActive = true;
    state.isHidden = false;
  }

  function handlePointerEnter(event) {
    syncToPointer(event.clientX, event.clientY, true);
    state.pointerActive = true;
    state.isHidden = false;
  }

  function handlePointerLeave() {
    state.pointerActive = false;
    state.isInteractive = false;
    state.isHidden = true;
    applyVisualState();
  }

  function handlePointerOver(event) {
    state.isInteractive = Boolean(resolvePointerTarget(event.target));
    applyVisualState();
  }

  function handlePointerOut(event) {
    const nextTarget = event.relatedTarget;
    state.isInteractive = Boolean(resolvePointerTarget(nextTarget));
    applyVisualState();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      state.isHidden = true;
      applyVisualState();
      return;
    }

    state.isHidden = false;
    applyVisualState();
  }

  function handleWindowBlur() {
    state.isHidden = true;
    applyVisualState();
  }

  function handleWindowFocus() {
    state.isHidden = false;
    applyVisualState();
  }

  function handleScroll() {
    state.isHidden = false;
    applyVisualState();
  }

  function handleLayoutMutation() {
    customCursor = ensureCursorNode();
    startLoop();
    applyVisualState();
  }

  function bindEvents() {
    if (isBound) return;
    isBound = true;

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('focus', handleWindowFocus, { passive: true });
    window.addEventListener('blur', handleWindowBlur, { passive: true });

    document.documentElement.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    document.documentElement.addEventListener('mouseenter', handleWindowFocus, { passive: true });

    window.addEventListener('languagechange', handleLayoutMutation);
    window.addEventListener('neuroartan:language-applied', handleLayoutMutation);
    window.addEventListener('artan:language-applied', handleLayoutMutation);
    window.addEventListener('neuroartan:languageChanged', handleLayoutMutation);
    window.addEventListener('neuroartan:dirChanged', handleLayoutMutation);

    const mutationObserver = new MutationObserver(() => {
      handleLayoutMutation();
    });

    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir', 'lang', 'class'],
      childList: false,
      subtree: false
    });

    mutationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['dir', 'lang', 'class'],
      childList: false,
      subtree: false
    });
  }

  function initCustomCursor() {
    customCursor = ensureCursorNode();
    if (!customCursor) return;

    customCursor.style.display = '';
    customCursor.style.opacity = '1';
    customCursor.style.willChange = 'left, top, transform, opacity';

    bindEvents();
    startLoop();
    applyVisualState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomCursor, { once: true });
  } else {
    initCustomCursor();
  }

  window.addEventListener('beforeunload', stopLoop, { once: true });
})();