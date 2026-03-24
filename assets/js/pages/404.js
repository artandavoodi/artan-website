/* =================== 404 Page Runtime =================== */

(function () {
  'use strict';

  function bind404Actions() {
    const homeLinks = Array.from(document.querySelectorAll('[data-404-home-link]'));
    const backButtons = Array.from(document.querySelectorAll('[data-404-back-button]'));

    homeLinks.forEach((link) => {
      if (link.__neuroartanBound) return;
      link.__neuroartanBound = true;

      link.addEventListener('click', () => {
        document.body.classList.add('page-404-leaving');
      });
    });

    backButtons.forEach((button) => {
      if (button.__neuroartanBound) return;
      button.__neuroartanBound = true;

      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (window.history.length > 1) {
          document.body.classList.add('page-404-leaving');
          window.history.back();
          return;
        }

        document.body.classList.add('page-404-leaving');
        window.location.href = '/';
      });
    });
  }

  function init404Page() {
    document.body.classList.add('page-404-ready');
    bind404Actions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init404Page, { once: true });
  } else {
    init404Page();
  }
})();
