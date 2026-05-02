/* =============================================================================
   01) PROFILE PAGE AUTHORITY
   02) PROFILE PAGE INIT
   ============================================================================= */

/* =============================================================================
   01) PROFILE PAGE AUTHORITY
   ============================================================================= */

function initProfilePage() {
  const root = document.querySelector('body[data-profile-page]');
  if (!root) return;

  root.dataset.profilePageReady = 'true';
  document.documentElement.dataset.activePage = 'profile';
}

/* =============================================================================
   02) PROFILE PAGE INIT
   ============================================================================= */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfilePage, { once: true });
} else {
  initProfilePage();
}
