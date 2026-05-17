/* ============================================================
   FPB main.js — общий клиентский JS
   Header (мегаменю, поиск, скролл-состояние),
   Mobile menu (drill-down),
   Consult modal (открытие, файлы, отправка),
   Aside-nav scroll-spy (на внутренних страницах с якорной навигацией).

   Все элементы выбираются по id/классам; если элемент не найден,
   соответствующий блок просто не активируется.
   ============================================================ */
(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  if (!header) return;

  var servicesToggle = document.getElementById('servicesToggle');
  var searchToggle   = document.getElementById('searchToggle');
  var searchClose    = document.getElementById('searchClose');
  var searchInput    = document.getElementById('searchInput');
  var mobileToggle   = document.getElementById('mobileToggle');
  var mobileClose    = document.getElementById('mobileClose');
  var mobileMenu     = document.getElementById('mobileMenu');
  var consultModal   = document.getElementById('consultModal');
  var consultForm    = document.getElementById('consultForm');
  var fileInput      = document.getElementById('cf-files');
  var fileList       = document.getElementById('cf-file-list');

  var headerAlwaysSolid = header.classList.contains('site-header--always-solid');

  /* ---------------------------------------------------------
     HEADER — мегаменю / поиск (data-extra)
     --------------------------------------------------------- */
  function setExtra(kind) {
    header.setAttribute('data-extra', kind || '');
    if (!headerAlwaysSolid) {
      header.setAttribute('data-state', kind ? 'solid' : 'transparent');
    }
    if (servicesToggle) servicesToggle.setAttribute('aria-expanded', kind === 'mega' ? 'true' : 'false');
    if (searchToggle)   searchToggle.setAttribute('aria-expanded', kind === 'search' ? 'true' : 'false');
    if (kind === 'search' && searchInput) {
      setTimeout(function () { searchInput.focus(); }, 60);
    }
  }
  function getExtra() { return header.getAttribute('data-extra') || ''; }

  if (servicesToggle) {
    servicesToggle.addEventListener('click', function () {
      setExtra(getExtra() === 'mega' ? '' : 'mega');
    });
  }
  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      setExtra(getExtra() === 'search' ? '' : 'search');
    });
  }
  if (searchClose) {
    searchClose.addEventListener('click', function () { setExtra(''); });
  }

  /* Закрытие на клик вне шапки */
  document.addEventListener('click', function (e) {
    if (!getExtra()) return;
    if (header.contains(e.target)) return;
    setExtra('');
  });

  /* ---------------------------------------------------------
     HEADER — состояние «прокручено» (только для прозрачной шапки)
     --------------------------------------------------------- */
  if (!headerAlwaysSolid) {
    var SCROLL_THRESHOLD = 300;
    var updateScrolled = function () {
      header.setAttribute('data-scrolled', window.scrollY > SCROLL_THRESHOLD ? 'true' : 'false');
    };
    window.addEventListener('scroll', updateScrolled, { passive: true });
    updateScrolled();
  }

  /* ---------------------------------------------------------
     MOBILE MENU — open/close + drill-down
     --------------------------------------------------------- */
  function goLevel(level) {
    if (!mobileMenu) return;
    mobileMenu.querySelectorAll('.mobile-menu__panel').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-level') === level);
    });
    var active = mobileMenu.querySelector('.mobile-menu__panel.is-active');
    if (active) active.scrollTop = 0;
  }
  function setMobile(open) {
    document.body.classList.toggle('mobile-open', open);
    if (mobileMenu)   mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) goLevel('0');
    applyThemeColor();
  }

  /* iOS: статус-бар окрашивается в meta theme-color. На главной фон тёмный
     (#0a0a0a), на внутренних — белый (paper). При открытии меню фон под
     статус-баром становится белым, при закрытии — возвращается. iOS Safari
     не пересчитывает theme-color сам, поэтому делаем это вручную. */
  function applyThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var isMobileOpen = document.body.classList.contains('mobile-open');
    var isLightPage = document.body.classList.contains('page-body-light');
    meta.setAttribute('content', (isMobileOpen || isLightPage) ? '#ffffff' : '#0a0a0a');
  }
  applyThemeColor();
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function () {
      setMobile(!document.body.classList.contains('mobile-open'));
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', function () { setMobile(false); });
  }
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      var goBtn = e.target.closest('[data-go]');
      if (goBtn) goLevel(goBtn.getAttribute('data-go'));
    });
  }

  /* ---------------------------------------------------------
     CONSULT MODAL — открытие, закрытие, файлы, отправка
     --------------------------------------------------------- */
  function openConsult() {
    if (!consultModal) return;
    consultModal.classList.add('is-open');
    consultModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (document.body.classList.contains('mobile-open')) setMobile(false);
    if (getExtra()) setExtra('');
  }
  function closeConsult() {
    if (!consultModal) return;
    consultModal.classList.remove('is-open');
    consultModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.js-open-consult, .btn-consult-hide-mobile').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openConsult();
    });
  });
  if (consultModal) {
    consultModal.addEventListener('click', function (e) {
      // closest, а не matches — чтобы клик по svg/path внутри кнопки тоже закрывал
      if (e.target.closest('[data-modal-close]')) closeConsult();
    });
  }

  /* ------------------------------------------------------------------
     CONSULT FORM — маски, валидация, вложения
     ------------------------------------------------------------------ */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
  }

  /* ----- Phone mask: +7 (XXX) XXX-XX-XX ----- */
  function formatPhone(raw) {
    var digits = raw.replace(/\D/g, '');
    // Если начинается с 8 или 7 — выкидываем (потом подставим +7)
    if (digits.length && (digits[0] === '8' || digits[0] === '7')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    if (!digits.length) return '';
    /* Формат: +7 XXX XXX XX XX — только пробелы как разделители */
    var out = '+7';
    if (digits.length) out += ' ' + digits.slice(0, 3);
    if (digits.length >= 4) out += ' ' + digits.slice(3, 6);
    if (digits.length >= 7) out += ' ' + digits.slice(6, 8);
    if (digits.length >= 9) out += ' ' + digits.slice(8, 10);
    return out;
  }
  function bindPhoneMask(el) {
    var apply = function () { el.value = formatPhone(el.value); };
    el.addEventListener('input', apply);
    el.addEventListener('focus', function () {
      if (!el.value) el.value = '+7 ';
    });
    el.addEventListener('blur', function () {
      // Если ничего не ввёл, кроме +7 — сбрасываем
      if (el.value.replace(/\D/g, '') === '7') el.value = '';
    });
  }

  /* ----- Telegram username mask: всегда префикс @, разрешены a-z 0-9 _ ----- */
  function bindUsernameMask(el) {
    function apply() {
      var v = el.value.replace(/@+/g, '').replace(/[^a-zA-Z0-9_]/g, '');
      el.value = v ? '@' + v : '';
    }
    el.addEventListener('input', apply);
    el.addEventListener('focus', function () {
      if (!el.value) el.value = '@';
    });
    el.addEventListener('blur', function () {
      if (el.value === '@') el.value = '';
    });
  }

  /* ----- Validation per field ----- */
  function setFieldState(field, state, message) {
    if (!field) return;
    var wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.remove('field--valid', 'field--invalid');
    if (state) wrap.classList.add('field--' + state);
    var msgEl = wrap.querySelector('.field__error[data-for="' + field.id + '"]');
    if (msgEl) msgEl.textContent = message || '';
    field.setAttribute('aria-invalid', state === 'invalid' ? 'true' : 'false');
  }

  function validateField(field) {
    if (!field) return true;
    // checkValidity() учитывает required, minlength, pattern, type=email
    var ok = field.checkValidity();
    if (!ok) {
      var msg = field.getAttribute('data-error') || field.validationMessage || 'Поле заполнено некорректно';
      setFieldState(field, 'invalid', msg);
      return false;
    }
    // Только если поле непустое — помечаем зелёным (valid). Если пустое и не required — нейтральное.
    if (field.value && field.value.trim() !== '') {
      setFieldState(field, 'valid', '');
    } else {
      setFieldState(field, '', '');
    }
    return true;
  }

  /* ----- File validation ----- */
  function readFileLimits(form) {
    return {
      max:        parseInt(form.getAttribute('data-files-max') || '3', 10),
      sizeEach:   parseInt(form.getAttribute('data-files-size-each') || '10485760', 10),
      sizeTotal:  parseInt(form.getAttribute('data-files-size-total') || '26214400', 10),
      accept:    (form.getAttribute('data-files-accept') || '').split(',').map(function(x){ return x.trim().toLowerCase(); }).filter(Boolean)
    };
  }
  function fileExt(name) {
    var i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i).toLowerCase() : '';
  }
  function showToastFromMain(msg, opts) {
    // Используем глобальный showToast из copy-tooltip.js, если он подгружен
    if (typeof window !== 'undefined' && window.fpbToast) return window.fpbToast(msg, opts);
    // fallback — alert
    alert(msg);
  }

  // Постоянный state выбранных файлов — input.files ресетится браузером на каждое
  // открытие диалога, поэтому накопительный список держим в JS.
  var savedFiles = [];

  function applyFiles(filesToAdd) {
    if (!fileInput) return;
    var form = fileInput.closest('form');
    var limits = readFileLimits(form);

    var current = savedFiles.slice();
    var added = [];
    var rejected = [];

    Array.from(filesToAdd).forEach(function (f) {
      // Тип
      var ext = fileExt(f.name);
      if (limits.accept.length && limits.accept.indexOf(ext) === -1) {
        rejected.push(f.name + ' — формат не поддерживается');
        return;
      }
      // Индивидуальный размер
      if (f.size > limits.sizeEach) {
        rejected.push(f.name + ' — больше ' + formatSize(limits.sizeEach));
        return;
      }
      // Дубликат
      if (current.concat(added).some(function (x) { return x.name === f.name && x.size === f.size; })) return;
      added.push(f);
    });

    // Лимит количества
    var combined = current.concat(added);
    if (combined.length > limits.max) {
      rejected.push('Можно прикрепить не более ' + limits.max + ' файлов');
      combined = combined.slice(0, limits.max);
    }
    // Лимит суммарного размера
    var total = combined.reduce(function (sum, f) { return sum + f.size; }, 0);
    while (total > limits.sizeTotal && combined.length > current.length) {
      var dropped = combined.pop();
      rejected.push(dropped.name + ' — суммарный размер превысил ' + formatSize(limits.sizeTotal));
      total -= dropped.size;
    }

    savedFiles = combined;

    var dt = new DataTransfer();
    combined.forEach(function (f) { dt.items.add(f); });
    fileInput.files = dt.files;
    renderFileList();
    validateField(fileInput);

    if (rejected.length) {
      showToastFromMain('Не добавлено: ' + rejected.join(' · '), { icon: 'alert', ttl: 4500 });
    }
  }

  function renderFileList() {
    if (!fileInput || !fileList) return;
    fileList.innerHTML = '';
    var files = Array.from(fileInput.files || []);
    var total = files.reduce(function (s, f) { return s + f.size; }, 0);
    var form  = fileInput.closest('form');
    var limits = form ? readFileLimits(form) : null;

    files.forEach(function (file, idx) {
      var li = document.createElement('li');
      li.className = 'field__file-item';
      li.innerHTML =
        '<span>' + escapeHtml(file.name) + ' · ' + formatSize(file.size) + '</span>' +
        '<button type="button" class="field__file-remove" aria-label="Удалить файл" data-idx="' + idx + '">' +
        '<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#close"/></svg>' +
        '</button>';
      fileList.appendChild(li);
    });

    // Сводка под списком (количество и суммарный размер)
    if (files.length && limits) {
      var li = document.createElement('li');
      li.className = 'field__file-summary';
      li.textContent = files.length + ' из ' + limits.max + ' · ' + formatSize(total) + ' из ' + formatSize(limits.sizeTotal);
      fileList.appendChild(li);
    }
  }

  if (fileInput && fileList) {
    // На каждое открытие диалога браузер кладёт в input.files ТОЛЬКО новый набор
    // (старые файлы теряются). Мы поэтому держим savedFiles в closure и собираем
    // итоговый список в applyFiles на основе saved + новых.
    fileInput.addEventListener('change', function () {
      var picked = Array.from(fileInput.files || []);
      applyFiles(picked);
    });
    fileList.addEventListener('click', function (e) {
      var btn = e.target.closest('.field__file-remove');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      savedFiles = savedFiles.filter(function (_, i) { return i !== idx; });
      var dt = new DataTransfer();
      savedFiles.forEach(function (f) { dt.items.add(f); });
      fileInput.files = dt.files;
      renderFileList();
      validateField(fileInput);
    });
  }

  /* ----- Init form ----- */
  if (consultForm) {
    // Bind masks
    consultForm.querySelectorAll('[data-mask="phone"]').forEach(bindPhoneMask);
    consultForm.querySelectorAll('[data-mask="username"]').forEach(bindUsernameMask);

    /* Telegram-юзернейм показывается только при выборе канала «Telegram».
       Параллельно у Названия компании снимаем --full, чтобы поля встали в пару. */
    var channelSel = consultForm.querySelector('#cf-channel');
    var tgWrap = consultForm.querySelector('#cf-telegram-wrap');
    var tgInput = consultForm.querySelector('#cf-telegram');
    var companyWrap = consultForm.querySelector('#cf-company-wrap');
    if (channelSel && tgWrap && companyWrap) {
      function syncTelegramField() {
        var on = channelSel.value === 'telegram';
        tgWrap.hidden = !on;
        if (tgInput) tgInput.required = on;
        companyWrap.classList.toggle('field--full', !on);
        if (!on) setFieldState(tgInput, '', '');
      }
      channelSel.addEventListener('change', syncTelegramField);
      syncTelegramField();
    }

    // Live validation: blur (после ввода) и change (для select/checkbox)
    consultForm.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('change', function () { validateField(field); });
      // При повторном вводе после ошибки — снимаем invalid сразу
      field.addEventListener('input', function () {
        var wrap = field.closest('.field');
        if (wrap && wrap.classList.contains('field--invalid')) {
          if (field.checkValidity()) setFieldState(field, '', '');
        }
      });
    });

    consultForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Валидируем все поля по очереди
      var fields = consultForm.querySelectorAll('input[required], select[required], textarea[required]');
      var firstInvalid = null;
      fields.forEach(function (f) {
        if (!validateField(f) && !firstInvalid) firstInvalid = f;
      });
      // Доп. проверка чекбокса согласия
      var agree = consultForm.querySelector('#cf-agree');
      if (agree && !agree.checked) {
        showToastFromMain(agree.getAttribute('data-error') || 'Необходимо согласие', { icon: 'alert', ttl: 4000 });
        if (!firstInvalid) firstInvalid = agree;
      }
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      var data = Object.fromEntries(new FormData(consultForm));
      console.log('Заявка на консультацию:', data);
      showToastFromMain('Заявка отправлена. Свяжемся в течение рабочего дня.', { icon: 'check', ttl: 3500 });
      consultForm.reset();
      consultForm.querySelectorAll('.field--valid, .field--invalid').forEach(function (w) {
        w.classList.remove('field--valid', 'field--invalid');
      });
      savedFiles = [];
      if (fileList) fileList.innerHTML = '';
      closeConsult();
    });
  }

  /* ---------------------------------------------------------
     ESCAPE — закрывает что угодно открытое
     --------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (consultModal && consultModal.classList.contains('is-open')) { closeConsult(); return; }
    if (getExtra()) { setExtra(''); return; }
    if (document.body.classList.contains('mobile-open')) setMobile(false);
  });

  /* ---------------------------------------------------------
     STICKY-NAV scroll-spy — обобщённый. Поднимает .is-active на пункте,
     соответствующем секции в viewport. Работает для:
     • .aside-nav на странице направления (id=asideNav) — секции .section-anchor
     • .article-toc на странице статьи (id=articleToc) — H2 с id
     • .legal-toc на legal-страницах (id=legalToc) — H2 с id
     Цели находим по href пунктов (#id) → document.getElementById(id).
     На мобайле скроллит активный пункт в видимую часть, если список горизонтальный.
     --------------------------------------------------------- */
  function setupNavScrollSpy(nav, linkSelector) {
    if (!nav) return;
    var navLinks = nav.querySelectorAll(linkSelector);
    if (!navLinks.length) return;

    var navList = nav.querySelector('ul, ol');
    var byId = {};
    var sections = [];
    navLinks.forEach(function (l) {
      var href = l.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var id = href.slice(1);
      var section = document.getElementById(id);
      if (section) {
        byId[id] = l;
        sections.push(section);
      }
    });
    if (!sections.length) return;

    var setActiveLink = function (link) {
      navLinks.forEach(function (l) { l.classList.remove('is-active'); });
      link.classList.add('is-active');
      if (navList && window.innerWidth <= 1024) {
        var listRect = navList.getBoundingClientRect();
        var linkRect = link.getBoundingClientRect();
        if (linkRect.left < listRect.left || linkRect.right > listRect.right) {
          var target = link.offsetLeft - (navList.clientWidth - link.clientWidth) / 2;
          navList.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
        }
      }
    };

    /* Когда пользователь только что кликнул по пункту nav, мы хотим
       зафиксировать его выбор и не дать IO во время smooth-scroll'а
       (через который проходит ряд секций) перебить состояние на соседнюю. */
    var muted = false;
    var muteTimer = null;

    var io = new IntersectionObserver(function (entries) {
      if (muted) return;
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var l = byId[e.target.id];
          if (l) setActiveLink(l);
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function (s) { io.observe(s); });

    navLinks.forEach(function (l) {
      l.addEventListener('click', function () {
        setActiveLink(l);
        muted = true;
        clearTimeout(muteTimer);
        muteTimer = setTimeout(function () { muted = false; }, 800);
      });
    });
  }

  setupNavScrollSpy(document.getElementById('asideNav'),   '.aside-nav__link');
  setupNavScrollSpy(document.getElementById('articleToc'), '.article-toc__list a');
  setupNavScrollSpy(document.getElementById('legalToc'),   '.legal-toc__list a');

  /* Заказ книги: кнопка открывает popover с выбором мессенджера, ссылки
     генерируются с pre-fill текстом из data-book-title карточки. */
  (function () {
    var BOOK_LINKS = {
      whatsapp: 'https://wa.me/79258963188',
      telegram: 'https://t.me/gmip_23'
    };
    var cards = document.querySelectorAll('[data-book-card]');
    if (!cards.length) return;

    cards.forEach(function (card) {
      var title = card.getAttribute('data-book-title') || '';
      var text = 'Здравствуйте! Хочу заказать книгу «' + title + '». Подскажите, как оплатить и получить.';
      var enc = encodeURIComponent(text);
      card.querySelectorAll('[data-messenger]').forEach(function (a) {
        var key = a.getAttribute('data-messenger');
        var base = BOOK_LINKS[key];
        if (!base) return;
        /* WhatsApp/Telegram поддерживают ?text= для pre-fill */
        a.href = base + '?text=' + enc;
      });
    });

    function closeAll() {
      document.querySelectorAll('[data-book-popover][data-open]').forEach(function (p) {
        p.removeAttribute('data-open');
        var btn = p.parentElement && p.parentElement.querySelector('[data-book-trigger]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    document.querySelectorAll('[data-book-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var pop = btn.parentElement.querySelector('[data-book-popover]');
        if (!pop) return;
        var wasOpen = pop.hasAttribute('data-open');
        closeAll();
        if (!wasOpen) {
          pop.setAttribute('data-open', '');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.book-cta')) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  })();
})();

/* ============================================================
   COOKIE CONSENT — отдельный модуль, не зависит от наличия header.
   Хранит согласие в localStorage с версией. Глобальные API:
   • window.hasAnalyticsConsent()  — boolean, использовать перед запуском Яндекс.Метрики
   • window.cookieConsentReset()   — очистить согласие и показать баннер
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookieConsent';
  var CONSENT_VERSION = 1;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.v !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function writeConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: CONSENT_VERSION,
        essential: true,
        analytics: !!analytics,
        ts: Date.now()
      }));
    } catch (e) {}
  }

  function show() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    banner.removeAttribute('hidden');
    // Двойной rAF: hidden→visible применяется до transform-перехода
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('is-open');
      });
    });
  }

  function hide() {
    var banner = document.getElementById('cookieBanner');
    if (!banner) return;
    banner.classList.remove('is-open');
    setTimeout(function () { banner.setAttribute('hidden', ''); }, 300);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cookie-action]');
    if (!btn) return;
    writeConsent(btn.getAttribute('data-cookie-action') === 'all');
    hide();
  });

  window.hasAnalyticsConsent = function () {
    var c = readConsent();
    return !!(c && c.analytics);
  };

  window.cookieConsentReset = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    show();
  };

  if (!readConsent()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }
})();
