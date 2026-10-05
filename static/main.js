/* A.RSM Training Centre — progressive enhancement only. Every link works with JS off. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  // ---- mobile nav
  var toggle = $('.nav-toggle'), nav = $('#primary-nav'), scrim = $('.nav-scrim');
  function setNav(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    if (scrim) scrim.hidden = !open;
    d.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  if (scrim) scrim.addEventListener('click', function () { setNav(false); });

  // ---- dropdowns (click/tap; hover handled in CSS on desktop)
  $$('.drop-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.parentElement, open = !li.classList.contains('open');
      $$('.has-drop.open').forEach(function (x) { if (x !== li) x.classList.remove('open'); });
      li.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
    });
  });
  var areasBtn = $('.tb-areas .tb-btn');
  if (areasBtn) areasBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var w = areasBtn.parentElement, open = !w.classList.contains('open');
    w.classList.toggle('open', open);
    areasBtn.setAttribute('aria-expanded', open);
  });
  d.addEventListener('click', function (e) {
    if (!e.target.closest('.has-drop')) $$('.has-drop.open').forEach(function (x) { x.classList.remove('open'); });
  });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setNav(false); $$('.has-drop.open').forEach(function (x) { x.classList.remove('open'); }); closeLightbox(); }
  });

  // ---- course finder
  $$('.finder').forEach(function (f) {
    var btns = $$('.finder-btn', f), panels = $$('.finder-panel', f);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var i = b.getAttribute('data-finder'), on = b.getAttribute('aria-pressed') === 'true';
        btns.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        panels.forEach(function (p) { p.classList.remove('on'); });
        if (!on) {
          b.setAttribute('aria-pressed', 'true');
          var p = $('[data-finder-panel="' + i + '"]', f); if (p) p.classList.add('on');
        }
      });
    });
  });

  // ---- gallery filter + lightbox
  var fb = $$('.filter-btn');
  fb.forEach(function (b) {
    b.addEventListener('click', function () {
      fb.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var c = b.getAttribute('data-filter');
      $$('.gal-item').forEach(function (g) { g.hidden = !(c === 'All' || g.getAttribute('data-cat') === c); });
    });
  });
  var lb;
  function closeLightbox() { if (lb) { lb.remove(); lb = null; } }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('.gal-item[data-full]');
    if (!a) return;
    e.preventDefault();
    closeLightbox();
    lb = d.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo viewer');
    var img = d.createElement('img'); img.src = a.getAttribute('data-full'); img.alt = (a.querySelector('img') || {}).alt || '';
    var x = d.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
    lb.appendChild(img); lb.appendChild(x);
    lb.addEventListener('click', closeLightbox);
    d.body.appendChild(lb); x.focus();
  });

  // ---- reviews: chunked list + search
  var list = $('#rv-list');
  if (list) {
    var cards = $$('.review-card', list), more = $('#rv-more'), q = $('#rv-search'), count = $('.rv-count');
    var shown = 24, step = 24, term = '';
    function render() {
      var hits = cards.filter(function (c) { return !term || c.textContent.toLowerCase().indexOf(term) > -1; });
      cards.forEach(function (c) { c.hidden = true; });
      hits.forEach(function (c, i) { c.hidden = i >= shown; });
      if (more) more.hidden = hits.length <= shown;
      if (count) count.textContent = term ? hits.length + ' review' + (hits.length === 1 ? '' : 's') + ' mention “' + term + '”' : 'Showing ' + Math.min(shown, hits.length) + ' of ' + cards.length + ' reviews';
    }
    if (more) more.addEventListener('click', function () { shown += step; render(); });
    if (q) q.addEventListener('input', function () { term = q.value.trim().toLowerCase(); shown = step; render(); });
    render();
  }

  // ---- enquiry form -> pre-filled email (no backend needed)
  $$('.enquiry-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { var el = f.elements[n]; return el ? el.value.trim() : ''; };
      if (!v('name') || !v('phone')) {
        var miss = !v('name') ? f.elements.name : f.elements.phone; miss.focus(); miss.style.borderColor = '#E32024'; return;
      }
      var body = 'Name: ' + v('name') + '\nPhone: ' + v('phone') + '\nCourse: ' + v('course') +
        (v('people') ? '\nGroup size: ' + v('people') : '') + (v('date') ? '\nPreferred date: ' + v('date') : '') +
        (v('message') ? '\n\n' + v('message') : '') + '\n\n(Sent from the website enquiry form)';
      location.href = 'mailto:' + f.getAttribute('data-mailto') + '?subject=' + encodeURIComponent('Course booking request: ' + v('course')) + '&body=' + encodeURIComponent(body);
    });
  });

  // ---- ?product= prefill
  var pm = /[?&]product=([^&]+)/.exec(location.search);
  if (pm) {
    var ta = $('#f-msg-book');
    if (ta && !ta.value) ta.value = 'I would like to ask about buying: ' + decodeURIComponent(pm[1]).replace(/-/g, ' ') + '.';
  }

  // ---- ?course= preselect on the contact page
  var m = /[?&]course=([^&]+)/.exec(location.search);
  if (m) {
    var sel = $('#f-course-book');
    if (sel) {
      var slug = decodeURIComponent(m[1]).replace(/-/g, ' ').toLowerCase();
      $$('option', sel).forEach(function (o) {
        var t = o.textContent.toLowerCase();
        if (t.replace(/[^a-z ]/g, '').indexOf(slug.split(' ')[0]) > -1 && !sel.dataset.set) { sel.value = o.textContent; }
      });
    }
  }
})();
