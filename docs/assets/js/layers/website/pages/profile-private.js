/* =============================================================================
   01) PRIVATE PROFILE PAGE AUTHORITY
   02) PRIVATE PROFILE INIT
   ============================================================================= */

/* =============================================================================
   01) PRIVATE PROFILE PAGE AUTHORITY
   ============================================================================= */

function initPrivateProfilePage() {
  const root = document.querySelector('body[data-profile-page="private"]');
  if (!root) return;

  root.dataset.profilePageMode = 'private';
  root.dataset.profileSurface = 'private';
  document.documentElement.dataset.profileSurface = 'private';
}

/* =============================================================================
   02) PRIVATE PROFILE INIT
   ============================================================================= */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrivateProfilePage, { once: true });
} else {
  initPrivateProfilePage();
}
