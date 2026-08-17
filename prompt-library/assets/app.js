/* ============================================================
   Prompt Library — app logic
   Search, filter, favourites (localStorage), copy to clipboard.
   ============================================================ */

(function () {
  'use strict';

  var CATS = window.PROMPT_CATEGORIES;
  var LEVELS = window.PROMPT_LEVELS;
  var ALL = window.PROMPTS;
  var STORE_KEY = 'aioa.favourites.v1';

  var state = {
    q: '',
    cat: 'all',
    level: 'all',
    favOnly: false
  };

  var els = {
    search: document.getElementById('search'),
    catFilters: document.getElementById('catFilters'),
    levelFilters: document.getElementById('levelFilters'),
    grid: document.getElementById('grid'),
    count: document.getElementById('count'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalEn: document.getElementById('modalEn'),
    modalText: document.getElementById('modalText'),
    modalTip: document.getElementById('modalTip'),
    modalCopy: document.getElementById('modalCopy'),
    modalFav: document.getElementById('modalFav'),
    toast: document.getElementById('toast')
  };

  /* ---------- Favourites ---------- */

  function loadFavs() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  var favs = loadFavs();

  function saveFavs() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(favs));
    } catch (e) {
      /* storage disabled — favourites simply won't persist */
    }
  }

  function isFav(id) { return favs.indexOf(id) !== -1; }

  function toggleFav(id) {
    var i = favs.indexOf(id);
    if (i === -1) { favs.push(id); } else { favs.splice(i, 1); }
    saveFavs();
    return isFav(id);
  }

  /* ---------- Helpers ---------- */

  function catOf(id) {
    for (var i = 0; i < CATS.length; i++) {
      if (CATS[i].id === id) return CATS[i];
    }
    return { km: id, en: id, icon: '•' };
  }

  function levelOf(id) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (LEVELS[i].id === id) return LEVELS[i];
    }
    return { km: id, en: id };
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightPlaceholders(text) {
    return esc(text).replace(/\{\{([^}]+)\}\}/g,
      function (_, inner) { return '<span class="ph">{{' + inner + '}}</span>'; });
  }

  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      els.toast.classList.remove('is-visible');
    }, 1900);
  }

  /* ---------- Copy ---------- */

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for non-secure contexts (file:// in some browsers)
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function copyPrompt(p) {
    copyText(p.body).then(function () {
      toast('✓ ចម្លងរួចរាល់ — បិទភ្ជាប់ចូល AI បានហើយ');
    }).catch(function () {
      toast('មិនអាចចម្លងបានទេ — សូមជ្រើសរើសដោយដៃ');
    });
  }

  /* ---------- Filtering ---------- */

  function matches(p) {
    if (state.favOnly && !isFav(p.id)) return false;
    if (state.cat !== 'all' && p.cat !== state.cat) return false;
    if (state.level !== 'all' && p.level !== state.level) return false;

    if (!state.q) return true;

    var hay = [
      p.km, p.en, p.body, p.tip || '', (p.tags || []).join(' '),
      catOf(p.cat).km, catOf(p.cat).en
    ].join(' ').toLowerCase();

    // Every whitespace-separated term must appear somewhere
    return state.q.toLowerCase().split(/\s+/).every(function (term) {
      return hay.indexOf(term) !== -1;
    });
  }

  /* ---------- Render ---------- */

  function cardHtml(p) {
    var c = catOf(p.cat);
    var lv = levelOf(p.level);
    var tags = (p.tags || []).slice(0, 3).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');

    return '' +
      '<article class="card" data-id="' + p.id + '">' +
        '<div class="card-top">' +
          '<span class="cat-tag">' + c.icon + ' ' + esc(c.en) + '</span>' +
          '<button class="fav-btn' + (isFav(p.id) ? ' is-on' : '') + '" ' +
            'data-fav="' + p.id + '" title="រក្សាទុក" ' +
            'aria-label="រក្សាទុក ' + esc(p.km) + '">' +
            (isFav(p.id) ? '★' : '☆') +
          '</button>' +
        '</div>' +
        '<h3>' + esc(p.km) + '</h3>' +
        '<div class="en">' + esc(p.en) + '</div>' +
        '<div class="tags">' +
          '<span class="tag level-' + p.level + '">' + esc(lv.km) + '</span>' + tags +
        '</div>' +
        (p.saves && p.saves !== '—'
          ? '<div class="saves">⏱ សន្សំបាន ~' + esc(p.saves) + '</div>'
          : '') +
        '<div class="card-actions">' +
          '<button class="btn" data-open="' + p.id + '">មើលពេញ</button>' +
          '<button class="btn btn-primary" data-copy="' + p.id + '">ចម្លង</button>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var list = ALL.filter(matches);

    els.grid.innerHTML = list.length
      ? list.map(cardHtml).join('')
      : '<div class="empty"><div class="big">🔍</div>' +
        '<p>រកមិនឃើញ Prompt ត្រូវនឹងលក្ខខណ្ឌទេ។<br>' +
        'សូមសាកល្បងពាក្យស្វែងរកផ្សេង ឬសម្អាតតម្រង។</p></div>';

    els.count.textContent = 'បង្ហាញ ' + list.length + ' ក្នុងចំណោម ' +
      ALL.length + ' Prompt · រក្សាទុក ' + favs.length;
  }

  function buildFilters() {
    var catHtml = '<button class="pill is-active" data-cat="all">ទាំងអស់</button>';
    catHtml += CATS.map(function (c) {
      var n = ALL.filter(function (p) { return p.cat === c.id; }).length;
      return '<button class="pill" data-cat="' + c.id + '">' +
        c.icon + ' ' + esc(c.km) + ' <span class="muted">' + n + '</span></button>';
    }).join('');
    els.catFilters.innerHTML = catHtml;

    var lvHtml = '<button class="pill is-active" data-level="all">គ្រប់កម្រិត</button>';
    lvHtml += LEVELS.map(function (l) {
      return '<button class="pill" data-level="' + l.id + '">' + esc(l.km) + '</button>';
    }).join('');
    lvHtml += '<button class="pill" data-fav-only="1">★ រក្សាទុក</button>';
    els.levelFilters.innerHTML = lvHtml;
  }

  /* ---------- Modal ---------- */

  var openId = null;

  function openModal(id) {
    var p = ALL.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    openId = id;

    els.modalTitle.textContent = p.km;
    els.modalEn.textContent = catOf(p.cat).icon + '  ' + p.en +
      '  ·  ' + levelOf(p.level).km;
    els.modalText.innerHTML = highlightPlaceholders(p.body);

    if (p.tip) {
      els.modalTip.innerHTML = '<strong>គន្លឹះ៖</strong> ' + esc(p.tip);
      els.modalTip.style.display = '';
    } else {
      els.modalTip.style.display = 'none';
    }

    els.modalFav.textContent = isFav(id) ? '★ បានរក្សាទុក' : '☆ រក្សាទុក';
    els.modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    els.modal.classList.remove('is-open');
    document.body.style.overflow = '';
    openId = null;
  }

  /* ---------- Events ---------- */

  els.search.addEventListener('input', function (e) {
    state.q = e.target.value.trim();
    render();
  });

  els.catFilters.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.cat = btn.getAttribute('data-cat');
    els.catFilters.querySelectorAll('.pill').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    render();
  });

  els.levelFilters.addEventListener('click', function (e) {
    var favBtn = e.target.closest('[data-fav-only]');
    if (favBtn) {
      state.favOnly = !state.favOnly;
      favBtn.classList.toggle('is-active', state.favOnly);
      render();
      return;
    }
    var btn = e.target.closest('[data-level]');
    if (!btn) return;
    state.level = btn.getAttribute('data-level');
    els.levelFilters.querySelectorAll('[data-level]').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    render();
  });

  els.grid.addEventListener('click', function (e) {
    var copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      var cp = ALL.filter(function (x) {
        return x.id === copyBtn.getAttribute('data-copy');
      })[0];
      if (cp) copyPrompt(cp);
      return;
    }

    var openBtn = e.target.closest('[data-open]');
    if (openBtn) { openModal(openBtn.getAttribute('data-open')); return; }

    var favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      var on = toggleFav(favBtn.getAttribute('data-fav'));
      favBtn.classList.toggle('is-on', on);
      favBtn.textContent = on ? '★' : '☆';
      els.count.textContent = els.count.textContent.replace(
        /រក្សាទុក \d+/, 'រក្សាទុក ' + favs.length
      );
      if (state.favOnly) render();
    }
  });

  els.modalCopy.addEventListener('click', function () {
    var p = ALL.filter(function (x) { return x.id === openId; })[0];
    if (p) copyPrompt(p);
  });

  els.modalFav.addEventListener('click', function () {
    if (!openId) return;
    var on = toggleFav(openId);
    els.modalFav.textContent = on ? '★ បានរក្សាទុក' : '☆ រក្សាទុក';
    render();
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);

  els.modal.addEventListener('click', function (e) {
    if (e.target === els.modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openId) closeModal();
    if (e.key === '/' && document.activeElement !== els.search) {
      e.preventDefault();
      els.search.focus();
    }
  });

  /* ---------- Boot ---------- */

  buildFilters();
  render();
})();
