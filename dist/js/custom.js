(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    const toggle = header.querySelector('[data-nav-toggle]');
    const nav = header.querySelector('[data-primary-nav]');
    if (!toggle || !nav) return;

    const desktopQuery = window.matchMedia('(min-width: 992px)');

    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      if (!desktopQuery.matches) {
        nav.hidden = true;
      }
      document.body.classList.remove('vh-nav-is-open');
      toggle.focus();
    }

    function openNav() {
      nav.hidden = false;
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('vh-nav-is-open');
      const focusable = nav.querySelector('a, button, [tabindex="0"]');
      if (focusable instanceof HTMLElement) {
        focusable.focus();
      }
    }

    function syncNavWithViewport() {
      if (desktopQuery.matches) {
        nav.hidden = false;
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('vh-nav-is-open');
      } else if (!nav.classList.contains('is-open')) {
        nav.hidden = true;
      }
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
      }
    });

    nav.addEventListener('click', function (event) {
      if (desktopQuery.matches) return;
      const target = event.target;
      if (target instanceof Element && target.closest('a')) {
        closeNav();
      }
    });

    desktopQuery.addEventListener('change', syncNavWithViewport);
    syncNavWithViewport();
  });
})();
