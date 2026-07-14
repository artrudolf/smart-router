/* Smart Cashier site scripts. No dependencies. */
(function () {
  'use strict';

  /* ── central configuration ───────────────────────────── */
  var SC = {
    DEMO_URL: 'https://artrudolf.github.io/smart-router/demo/',
    FORM_ENDPOINT: 'https://formsubmit.co/ajax/9e1ca1f15a7783c7356372d979551f91',
    CALENDAR_URL: '',            /* set a booking URL to show "Book a technical discovery call" after success */
    ANALYTICS_PROVIDER: 'none'   /* 'none' keeps events in memory only; wire a provider inside scTrack() */
  };
  window.SC_CONFIG = SC;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── analytics event layer (no tracking installed) ───── */
  var eventLog = [];
  function scTrack(name, props) {
    var ev = { event: name, props: props || {}, ts: new Date().toISOString() };
    eventLog.push(ev);
    /* Integration point: forward ev to Plausible, PostHog, GA4, etc.
       Do not enable tracking before updating the Cookie Policy and consent flow. */
  }
  window.scTrack = scTrack;
  window.scEvents = eventLog;

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-track]');
    if (t) scTrack(t.getAttribute('data-track'), { page: location.pathname });
  });

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
    scTrack(id.replace('modal-', '') + '_form_open', { page: location.pathname });
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
    set('Consent', 'given');
  }

  function validate(form) {
    var ok = true;
    form.querySelectorAll('.form-field[data-required]').forEach(function (ff) {
      var input = ff.querySelector('input, textarea, select');
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
      var key = form.getAttribute('data-sc-form');

      var hp = form.querySelector('[name="_honey"]');
      if (hp && hp.value) return;

      if (!validate(form)) {
        status.className = 'form-status err';
        status.textContent = 'Please complete the required fields and consent checkbox.';
        return;
      }

      fillMeta(form);

      submitting = true;
      btn.disabled = true;
      var originalLabel = btn.textContent;
      btn.textContent = 'Sending…';
      status.className = 'form-status';
      status.textContent = '';

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      fetch(SC.FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function () {
        scTrack(key + '_form_submit', { page: location.pathname });
        status.className = 'form-status ok';
        status.innerHTML = form.getAttribute('data-success');
        if (SC.CALENDAR_URL) {
          status.innerHTML += '<br><a class="btn btn-outline btn-sm" style="margin-top:12px" target="_blank" rel="noopener" href="'
            + SC.CALENDAR_URL + '">Book a technical discovery call</a>';
        }
        form.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]), textarea').forEach(function (i) { i.value = ''; });
        form.querySelectorAll('select').forEach(function (s) { s.selectedIndex = 0; });
        var cb = form.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
        btn.textContent = originalLabel;
        btn.disabled = false;
        submitting = false;
      })
      .catch(function () {
        status.className = 'form-status err';
        status.textContent = 'The request could not be sent. Please check your connection and try again.';
        btn.textContent = originalLabel;
        btn.disabled = false;
        submitting = false;
      });
    });
  });

  /* ── opportunity calculator ──────────────────────────── */
  function money(n) {
    var sign = n < 0 ? '-' : '';
    return sign + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
  }

  document.querySelectorAll('[data-calc]').forEach(function (calc) {
    var IN = {};
    ['attempts', 'rate', 'uplift', 'hold', 'bonus', 'paycost', 'fraud'].forEach(function (k) {
      IN[k] = calc.querySelector('[data-in="' + k + '"]');
    });

    function out(name, val) {
      var el = calc.querySelector('[data-out="' + name + '"]');
      if (el) el.textContent = val;
    }
    function pct(el) { return parseFloat(el.value) / 100; }

    var tracked = false;

    function recalc() {
      var A = parseFloat(IN.attempts.value);
      var R = pct(IN.rate), U = pct(IN.uplift);
      var hold = pct(IN.hold), bonus = pct(IN.bonus), pay = pct(IN.paycost), fraud = pct(IN.fraud);
      if ([A, R, U, hold, bonus, pay, fraud].some(isNaN) || A < 0) return;
      R = Math.min(Math.max(R, 0), 1);
      if (R + U > 1) U = 1 - R;

      var current = A * R;
      var additional = A * U;
      var ggr = additional * hold;
      var bonusCost = additional * bonus;
      var payCost = additional * pay;
      var fraudCost = additional * fraud;
      var contribution = ggr - bonusCost - payCost - fraudCost;

      out('current', money(current));
      out('newrate', ((R + U) * 100).toFixed(1).replace(/\.0$/, '') + '%');
      out('additional', money(additional));
      out('ggr', money(ggr));
      out('bonuscost', money(bonusCost));
      out('paycost', money(payCost));
      out('fraudcost', money(fraudCost));
      out('contribution', money(contribution));
    }

    Object.keys(IN).forEach(function (k) {
      IN[k].addEventListener('input', function () {
        if (!tracked) { scTrack('calculator_interaction', { page: location.pathname }); tracked = true; }
        recalc();
      });
    });
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
    var routes = { a: rv.querySelector('#route-a'), b: rv.querySelector('#route-b'), c: rv.querySelector('#route-c') };
    var health = { a: rv.querySelector('#health-a'), b: rv.querySelector('#health-b'), c: rv.querySelector('#health-c') };
    var badges = { a: rv.querySelector('#badge-a'), b: rv.querySelector('#badge-b'), c: rv.querySelector('#badge-c') };
    var dot = rv.querySelector('#rv-dot');
    var approved = rv.querySelector('#rv-approved');
    var signals = rv.querySelectorAll('.rv-signal');

    var FINAL_CAPTION = 'Approved. Selected for <strong>recent approval performance, provider health, and operator rules</strong>.';

    function setHealth(key, state, label) {
      health[key].setAttribute('class', 'rv-health ' + state);
      badges[key].textContent = label;
      badges[key].setAttribute('fill', state === 'ok' ? '#62d9a6' : state === 'warn' ? '#d9a441' : '#d97066');
    }

    function resetStates() {
      Object.keys(routes).forEach(function (k) { routes[k].setAttribute('class', 'rv-route'); });
      setHealth('a', 'ok', '91.4%');
      setHealth('b', 'ok', '84.2%');
      setHealth('c', 'ok', '88.6%');
      approved.setAttribute('opacity', '0');
      signals.forEach(function (s) { s.classList.remove('lit'); });
    }

    function finalState() {
      resetStates();
      setHealth('c', 'warn', 'degraded');
      routes.a.setAttribute('class', 'rv-route active');
      routes.c.setAttribute('class', 'rv-route degraded');
      approved.setAttribute('opacity', '1');
      caption.innerHTML = FINAL_CAPTION;
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
        caption.innerHTML = 'Deposit attempt received: $150, card, Spain.';
        var enter = rv.querySelector('#route-in');
        setTimeout(function () {
          moveDot(enter, 700, function () {
            caption.innerHTML = 'Reading the context: market, method, BIN, approval rate for the last 60 minutes.';
            var i = 0;
            var lightNext = setInterval(function () {
              if (i < signals.length) { signals[i].classList.add('lit'); i++; }
              else clearInterval(lightNext);
            }, 170);
          });
        }, 500);
        setTimeout(function () {
          setHealth('c', 'warn', 'degraded');
          routes.c.setAttribute('class', 'rv-route degraded');
          caption.innerHTML = 'Provider C is degrading and drops out of the ranking.';
        }, 2500);
        setTimeout(function () {
          routes.a.setAttribute('class', 'rv-route active');
          caption.innerHTML = 'Provider A has the strongest recent approval rate. Routing there.';
          moveDot(routes.a, 900, function () {
            approved.setAttribute('opacity', '1');
            caption.innerHTML = FINAL_CAPTION;
          });
        }, 3700);
        setTimeout(loop, 7800);
      };
      loop();
    }
  }
})();
