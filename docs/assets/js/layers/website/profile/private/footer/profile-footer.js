/* =============================================================================
   01) MODULE IDENTITY
   02) PROFILE FOOTER ROOTS
   03) PROFILE FOOTER ACTION ROUTING
   04) PROFILE FOOTER INIT
   ============================================================================= */

/* =============================================================================
   01) MODULE IDENTITY
   ============================================================================= */

const MODULE_ID = 'profile-private-footer';

/* =============================================================================
   02) PROFILE FOOTER ROOTS
   ============================================================================= */

function getProfileFooterRoots() {
  return Array.from(document.querySelectorAll('.profile-footer'));
}

/* =============================================================================
   03) PROFILE FOOTER ACTION ROUTING
   ============================================================================= */

function bindProfileFooter(root) {
  if (!root || root.dataset.profileFooterBound === 'true') return;

  root.dataset.profileFooterBound = 'true';

  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-profile-footer-action]');
    if (!trigger) return;

    document.dispatchEvent(new CustomEvent('profile:footer-action-request', {
      detail: {
        source: MODULE_ID,
        action: trigger.dataset.profileFooterAction || '',
        trigger
      }
    }));
  });
}

/* =============================================================================
   04) PROFILE FOOTER INIT
   ============================================================================= */

function initProfileFooter() {
  getProfileFooterRoots().forEach(bindProfileFooter);

  document.addEventListener('fragment:mounted', (event) => {
    if (event?.detail?.name !== 'profile-private-footer') return;
    getProfileFooterRoots().forEach(bindProfileFooter);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfileFooter, { once:true });
} else {
  initProfileFooter();
}
