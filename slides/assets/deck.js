/* ============================================================
   AI Office Automation — minimal deck engine
   No dependencies. Keyboard, touch, hash routing, timer,
   speaker notes and an overview grid.
   ============================================================ */

(function () {
  'use strict';

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var progress = document.getElementById('progress');
  var slideNo = document.getElementById('slideNo');
  var notesEl = document.getElementById('notes');
  var overviewEl = document.getElementById('overview');
  var overviewGrid = document.getElementById('overviewGrid');
  var timerEl = document.getElementById('timer');
  var timerVal = document.getElementById('timerVal');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var btnNotes = document.getElementById('btnNotes');
  var btnTimer = document.getElementById('btnTimer');
  var btnFull = document.getElementById('btnFull');

  var current = 0;
  var notesOn = false;

  /* ---------- Navigation ---------- */

  function clamp(i) {
    return Math.max(0, Math.min(slides.length - 1, i));
  }

  function render() {
    slides.forEach(function (s, i) {
      s.classList.toggle('is-active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });

    progress.style.width = ((current + 1) / slides.length) * 100 + '%';
    slideNo.textContent = String(current + 1).padStart(2, '0') + ' / ' +
      String(slides.length).padStart(2, '0');

    btnPrev.disabled = current === 0;
    btnNext.disabled = current === slides.length - 1;

    renderNotes();
    highlightOverview();

    // Reset scroll for long slides
    slides[current].scrollTop = 0;

    if (history.replaceState) {
      history.replaceState(null, '', '#' + (current + 1));
    }
  }

  function go(i) {
    var next = clamp(i);
    if (next === current) return;
    current = next;
    render();
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  /* ---------- Speaker notes ---------- */

  function renderNotes() {
    var raw = slides[current].getAttribute('data-notes');
    if (!raw) {
      notesEl.innerHTML = '<h4>Speaker notes</h4><p class="muted">' +
        '— គ្មានកំណត់ចំណាំសម្រាប់ស្លាយនេះទេ —</p>';
      return;
    }
    var items = raw.split('|').map(function (t) {
      return '<li>' + t.trim() + '</li>';
    }).join('');
    notesEl.innerHTML = '<h4>Speaker notes · ស្លាយ ' + (current + 1) +
      '</h4><ul>' + items + '</ul>';
  }

  function toggleNotes() {
    notesOn = !notesOn;
    notesEl.classList.toggle('is-visible', notesOn);
    btnNotes.classList.toggle('is-on', notesOn);
  }

  /* ---------- Overview grid ---------- */

  function buildOverview() {
    overviewGrid.innerHTML = '';
    slides.forEach(function (s, i) {
      var title = s.getAttribute('data-title') || ('Slide ' + (i + 1));
      var card = document.createElement('button');
      card.className = 'ov-card';
      card.innerHTML = '<div class="n">' + String(i + 1).padStart(2, '0') +
        '</div><div class="t"></div>';
      card.querySelector('.t').textContent = title;
      card.addEventListener('click', function () {
        go(i);
        toggleOverview(false);
      });
      overviewGrid.appendChild(card);
    });
  }

  function highlightOverview() {
    var cards = overviewGrid.querySelectorAll('.ov-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('is-current', i === current);
    }
  }

  function toggleOverview(force) {
    var show = typeof force === 'boolean'
      ? force
      : !overviewEl.classList.contains('is-visible');
    overviewEl.classList.toggle('is-visible', show);
  }

  /* ---------- Session timer (60 minute workshop) ---------- */

  var TARGET_SECONDS = 60 * 60;
  var elapsed = 0;
  var ticking = false;
  var handle = null;

  function fmt(sec) {
    var m = Math.floor(Math.abs(sec) / 60);
    var s = Math.abs(sec) % 60;
    return (sec < 0 ? '-' : '') + String(m).padStart(2, '0') + ':' +
      String(s).padStart(2, '0');
  }

  function tick() {
    elapsed += 1;
    timerVal.textContent = fmt(elapsed) + ' / 60:00';
    timerEl.classList.toggle('is-over', elapsed > TARGET_SECONDS);
  }

  function toggleTimer() {
    var visible = timerEl.classList.toggle('is-visible');
    btnTimer.classList.toggle('is-on', visible);
    if (visible && !ticking) {
      ticking = true;
      handle = setInterval(tick, 1000);
    } else if (!visible && ticking) {
      ticking = false;
      clearInterval(handle);
    }
  }

  function resetTimer() {
    elapsed = 0;
    timerVal.textContent = fmt(0) + ' / 60:00';
    timerEl.classList.remove('is-over');
  }

  /* ---------- Fullscreen ---------- */

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || function () {}).call(
        document.documentElement
      );
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /* ---------- Events ---------- */

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
      case 'Enter':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); go(0); break;
      case 'End':
        e.preventDefault(); go(slides.length - 1); break;
      case 'n': case 'N':
        toggleNotes(); break;
      case 'o': case 'O':
        toggleOverview(); break;
      case 't': case 'T':
        toggleTimer(); break;
      case 'r': case 'R':
        resetTimer(); break;
      case 'f': case 'F':
        toggleFullscreen(); break;
      case 'Escape':
        toggleOverview(false); break;
      default:
        break;
    }
  });

  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  btnNotes.addEventListener('click', toggleNotes);
  btnTimer.addEventListener('click', toggleTimer);
  btnFull.addEventListener('click', toggleFullscreen);
  document.getElementById('timerReset').addEventListener('click', resetTimer);

  // Deep links: react to the hash changing after load (edited URL,
  // browser back/forward, or a link shared as .../index.html#12).
  window.addEventListener('hashchange', function () {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    if (!isNaN(n)) go(n - 1);
  });

  // Touch swipe
  var touchX = null;
  document.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 55) { dx < 0 ? next() : prev(); }
    touchX = null;
  }, { passive: true });

  /* ---------- Boot ---------- */

  buildOverview();

  var fromHash = parseInt((location.hash || '').replace('#', ''), 10);
  if (!isNaN(fromHash)) current = clamp(fromHash - 1);

  resetTimer();
  render();
})();
