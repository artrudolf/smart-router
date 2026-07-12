/* Smart Cashier site scripts. No dependencies. */
(function () {
  'use strict';

  var DEMO_URL = 'https://artrudolf.github.io/smart-router/demo/';
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/prodmic@gmail.com';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── mobile menu ─────────────────────────────────────── */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target.closest('button')) {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── section reveals ─────────────────────────────────── */
  if (!REDUCED && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ── modals ──────────────────────────────────────────── */
  var lastTrigger = null;

  function openModal(id, trigger) {
    var bd = document.getElementById(id);
    if (!bd) return;
    lastTrigger = trigger || document.activeElement;
    bd.classList.add('open');
    document.body.style.overflow = 'hidden';
    var first = bd.querySelector('input, button, textarea, select');
    if (first) first.focus();
    bd.addEventListener('keydown', trapFocus);
  }

  function closeModal(bd) {
    bd.classList.remove('open');
    document.body.style.overflow = '';
    bd.removeEventListener('keydown', trapFocus);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    lastTrigger = null;
  }

  function trapFocus(e) {
    if (e.key === 'Escape') { closeModal(e.currentTarget); return; }
    if (e.key !== 'Tab') return;
    var f = e.currentTarget.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-modal]');
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute('data-open-modal'), opener);
      return;
    }
    var closer = e.target.closest('[data-close-modal]');
    if (closer) { closeModal(closer.closest('.modal-backdrop')); return; }
    if (e.target.classList && e.target.classList.contains('modal-backdrop')) closeModal(e.target);
  });

  /* ── shared form metadata ────────────────────────────── */
  function utm(name) {
    try { return new URLSearchParams(window.location.search).get(name) || ''; }
    catch (e) { return ''; }
  }

  function fillMeta(form) {
    var set = function (n, v) {
      var el = form.querySelector('[name="' + n + '"]');
      if (el) el.value = v;
    };
    set('Submission timestamp', new Date().toISOString());
    set('Source page', document.title);
    set('Page URL', window.location.href);
    set('UTM source', utm('utm_source'));
    set('UTM medium', utm('utm_medium'));
    set('UTM campaign', utm('utm_campaign'));
    set('UTM content', utm('utm_content'));
    set('UTM term', utm('utm_term'));
    set('Browser locale', navigator.language || '');
    try { set('Browser timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (e) {}
    set('Referrer', document.referrer || '');
    var regionEl = form.querySelector('[name="Region inferred from browser locale"]');
    if (regionEl) {
      var loc = navigator.language || '';
      var region = loc.indexOf('-') > -1 ? loc.split('-')[1].toUpperCase() : '';
      regionEl.value = region ? region + ' (inferred from browser locale, not a verified location)' : 'not available';
    }
  }

  function validate(form) {
    var ok = true;
    form.querySelectorAll('.form-field[data-required]').forEach(function (ff) {
      var input = ff.querySelector('input, textarea');
      var valid = input.value.trim() !== '';
      if (valid && input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      ff.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    var consentWrap = form.querySelector('.consent');
    if (consentWrap) {
      var cb = consentWrap.querySelector('input[type="checkbox"]');
      consentWrap.classList.toggle('invalid', !cb.checked);
      if (!cb.checked) ok = false;
    }
    return ok;
  }

  /* ── form submission (FormSubmit AJAX) ───────────────── */
  document.querySelectorAll('form[data-sc-form]').forEach(function (form) {
    var submitting = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;

      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type="submit"]');
      var isDemo = form.getAttribute('data-sc-form') === 'demo';

      /* honeypot */
      var hp = form.querySelector('[name="_honey"]');
      if (hp && hp.value) return;

      if (!validate(form)) {
        status.className = 'form-status err';
        status.textContent = 'Please complete the required fields and consent checkbox.';
        return;
      }

      fillMeta(form);

      /* popup-blocker strategy: open a tab synchronously inside the click,
         navigate it on success, close it on failure. */
      var demoTab = null;
      if (isDemo) { try { demoTab = window.open('', '_blank'); } catch (err) { demoTab = null; } }
      if (demoTab) {
        try {
          demoTab.document.write('<title>Opening the Smart Cashier demo</title><body style="background:#0b100e;color:#97a29a;font-family:monospace;padding:40px">Opening the Smart Cashier demo…</body>');
        } catch (err) {}
      }

      submitting = true;
      btn.disabled = true;
      var originalLabel = btn.textContent;
      btn.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function () {
        status.className = 'form-status ok';
        status.innerHTML = form.getAttribute('data-success');
        form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea').forEach(function (i) { i.value = ''; });
        var cb = form.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
        if (isDemo) {
          if (demoTab) { demoTab.location.href = DEMO_URL; }
          else {
            status.innerHTML += ' Your browser blocked the new tab: <a href="' + DEMO_URL + '" target="_blank" rel="noopener">open the demo here</a>.';
          }
        }
        btn.textContent = originalLabel;
        btn.disabled = false;
        submitting = false;
      })
      .catch(function () {
        if (demoTab) { try { demoTab.close(); } catch (err) {} }
        status.className = 'form-status err';
        status.textContent = 'The request could not be sent. Please check your connection and try again.';
        btn.textContent = originalLabel;
        btn.disabled = false;
        submitting = false;
      });
    });
  });

  /* ── calculator ──────────────────────────────────────── */
  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  document.querySelectorAll('[data-calc]').forEach(function (calc) {
    var attempts = calc.querySelector('[data-in="attempts"]');
    var rate = calc.querySelector('[data-in="rate"]');
    var uplift = calc.querySelector('[data-in="uplift"]');

    function out(name, val) {
      var el = calc.querySelector('[data-out="' + name + '"]');
      if (el) el.textContent = val;
    }

    function recalc() {
      var A = parseFloat(attempts.value);
      var R = parseFloat(rate.value) / 100;
      var U = parseFloat(uplift.value) / 100;
      if (isNaN(A) || isNaN(R) || isNaN(U) || A < 0) return;
      R = Math.min(Math.max(R, 0), 1);
      if (R + U > 1) U = 1 - R;

      var current = A * R;
      var next = A * (R + U);
      var additional = A * U;
      var fee = next * 0.005;
      var multiple = fee > 0 ? additional / fee : 0;
      var breakeven = (0.005 * R) / 0.995 * 100;

      out('current', money(current));
      out('newrate', ((R + U) * 100).toFixed(1).replace(/\.0$/, '') + '%');
      out('next', money(next));
      out('additional', money(additional));
      out('fee', money(fee));
      out('multiple', multiple > 0 ? '\u2248 ' + multiple.toFixed(1) + 'x' : '\u2014');
      out('breakeven', '\u2248 ' + breakeven.toFixed(2) + ' pp');
    }

    [attempts, rate, uplift].forEach(function (i) { i.addEventListener('input', recalc); });
    recalc();
  });

  /* ── cookie notice ───────────────────────────────────── */
  var notice = document.querySelector('.cookie-notice');
  if (notice) {
    var seen = null;
    try { seen = localStorage.getItem('sc-cookie-notice'); } catch (e) {}
    if (!seen) notice.classList.add('show');
    notice.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem('sc-cookie-notice', 'dismissed'); } catch (e) {}
      notice.classList.remove('show');
    });
  }

  /* ── routing animation (hero) ────────────────────────── */
  var rv = document.getElementById('routing-visual');
  if (rv) {
    var caption = document.getElementById('rv-caption');
    var routes = {
      a: rv.querySelector('#route-a'),
      b: rv.querySelector('#route-b'),
      c: rv.querySelector('#route-c')
    };
    var health = {
      a: rv.querySelector('#health-a'),
      b: rv.querySelector('#health-b'),
      c: rv.querySelector('#health-c')
    };
    var badges = {
      a: rv.querySelector('#badge-a'),
      b: rv.querySelector('#badge-b'),
      c: rv.querySelector('#badge-c')
    };
    var dot = rv.querySelector('#rv-dot');
    var approved = rv.querySelector('#rv-approved');
    var signals = rv.querySelectorAll('.rv-signal');

    function setHealth(key, state, label) {
      health[key].setAttribute('class', 'rv-health ' + state);
      badges[key].textContent = label;
      badges[key].setAttribute('fill', state === 'ok' ? '#62d9a6' : state === 'warn' ? '#d9a441' : '#d97066');
    }

    function resetStates() {
      Object.keys(routes).forEach(function (k) { routes[k].setAttribute('class', 'rv-route'); });
      setHealth('a', 'ok', '97.1%');
      setHealth('b', 'ok', '93.4%');
      setHealth('c', 'ok', '91.8%');
      approved.setAttribute('opacity', '0');
      signals.forEach(function (s) { s.classList.remove('lit'); });
    }

    function finalState() {
      resetStates();
      setHealth('b', 'warn', 'degraded');
      routes.a.setAttribute('class', 'rv-route active');
      routes.b.setAttribute('class', 'rv-route degraded');
      approved.setAttribute('opacity', '1');
      caption.innerHTML = 'Route selected for <strong>recent approval performance and availability</strong>.';
    }

    if (REDUCED) {
      finalState();
    } else {
      var moveDot = function (path, dur, cb) {
        var len = path.getTotalLength();
        var t0 = null;
        dot.classList.add('moving');
        function frame(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var pt = path.getPointAtLength(len * p);
          dot.setAttribute('cx', pt.x);
          dot.setAttribute('cy', pt.y);
          if (p < 1) requestAnimationFrame(frame);
          else { dot.classList.remove('moving'); cb && cb(); }
        }
        requestAnimationFrame(frame);
      };

      var loop = function () {
        resetStates();
        caption.innerHTML = 'Deposit attempt received.';
        var enter = rv.querySelector('#route-in');
        setTimeout(function () {
          moveDot(enter, 700, function () {
            caption.innerHTML = 'Evaluating eligible routes: country, method, issuer, recent performance.';
            var i = 0;
            var lightNext = setInterval(function () {
              if (i < signals.length) { signals[i].classList.add('lit'); i++; }
              else clearInterval(lightNext);
            }, 180);
          });
        }, 500);
        setTimeout(function () {
          setHealth('b', 'warn', 'degraded');
          routes.b.setAttribute('class', 'rv-route degraded');
          caption.innerHTML = 'Provider B is degrading: error rate above threshold.';
        }, 2400);
        setTimeout(function () {
          routes.a.setAttribute('class', 'rv-route active');
          caption.innerHTML = 'Routing to Provider A.';
          moveDot(routes.a, 900, function () {
            approved.setAttribute('opacity', '1');
            caption.innerHTML = 'Approved. Selected for <strong>recent approval performance and availability</strong>.';
          });
        }, 3600);
        setTimeout(loop, 7600);
      };
      loop();
    }
  }
})();
