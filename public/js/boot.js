/* Tiny same-origin boot script (CSP-safe, no inline JS): enables scroll reveal + click analytics events. */
(function () {
  var d = document.documentElement;
  d.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  addEventListener('DOMContentLoaded', function () {
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) {
        e.classList.add('in');
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add('in');
              io.unobserve(en.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      els.forEach(function (e) {
        io.observe(e);
      });
    }
  });
  addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('[data-track]');
    if (a && typeof window.plausible === 'function') window.plausible(a.getAttribute('data-track'));
  });
})();
