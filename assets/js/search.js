/* ============================================================
   FPB search.js — клиентский поиск
   • Источник данных: /assets/search/index.json
     (на проде регенерируется WordPress при save_post — см. docs/WORDPRESS.md)
   • Шапочный поиск (#searchInput) → dropdown #searchSuggest с топ-результатами
     по группам сущностей + ссылка «все результаты для …»
   • Страница /poisk/ (опционально: id=#fullSearchInput, контейнер #fullSearchResults)
     — full-page вариант с фильтром по типу.
   ============================================================ */
(function () {
  'use strict';

  var INDEX_URL = '/assets/search/index.json';
  var TOP_PER_GROUP = 4;       // сколько результатов в группе в dropdown
  var TOP_TOTAL_HEAD = 8;      // общий лимит в шапке
  var DEBOUNCE_MS = 150;

  var TYPE_LABELS = {
    service: 'Услуги',
    case:    'Дела',
    article: 'Журнал',
    mktu:    'Классы МКТУ'
  };
  var TYPE_ORDER = ['service', 'case', 'article', 'mktu'];

  /* Популярные запросы для пустого состояния dropdown.
     Дефолты по тематике; редактировать тут одним списком. */
  var POPULAR_QUERIES = [
    'Регистрация товарного знака',
    'Патент на изобретение',
    'Лицензионный договор',
    'Защита в ФАС',
    'Класс МКТУ 35',
    'Банкротство'
  ];

  var ARROW_ICON =
    '<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#arrow-right"/></svg>';

  var indexPromise = null;

  /* ---------------------------------------------------------
     Загрузка индекса с кэшем
     --------------------------------------------------------- */
  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL)
        .then(function (r) {
          if (!r.ok) throw new Error('search index ' + r.status);
          return r.json();
        })
        .then(function (data) {
          // pre-compute lowercase haystack per entry
          return data.map(function (item) {
            return Object.assign({}, item, {
              _haystack: ((item.title || '') + ' ' + (item.excerpt || '') + ' ' + (item.category || '')).toLowerCase()
            });
          });
        })
        .catch(function (err) {
          console.warn('Search index load failed:', err);
          return [];
        });
    }
    return indexPromise;
  }

  /* ---------------------------------------------------------
     Утилиты
     --------------------------------------------------------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Подсвечивает все вхождения каждого слова из query.
     Учитывает кириллицу: \\bX\\b плохо работает с не-ASCII, поэтому ищем без word boundary. */
  function highlight(text, words) {
    if (!words.length) return escapeHtml(text);
    var safeText = escapeHtml(text);
    // Сортируем длинные сначала, чтобы не съесть подстроки
    var sorted = words.slice().sort(function (a, b) { return b.length - a.length; });
    var pattern = sorted.map(escapeRegex).filter(Boolean).join('|');
    if (!pattern) return safeText;
    var re = new RegExp('(' + pattern + ')', 'gi');
    return safeText.replace(re, '<mark>$1</mark>');
  }

  /* Парсит query → массив непустых lowercase токенов */
  function tokenize(q) {
    return q.toLowerCase().split(/\s+/).filter(Boolean);
  }

  /* Скорит запись по запросу. 0 если не подходит. */
  function scoreItem(item, words, fullQuery) {
    var hay = item._haystack;
    var titleL = (item.title || '').toLowerCase();
    var excerptL = (item.excerpt || '').toLowerCase();
    var categoryL = (item.category || '').toLowerCase();

    // Все слова должны хоть где-то совпасть
    for (var i = 0; i < words.length; i++) {
      if (hay.indexOf(words[i]) === -1) return 0;
    }
    var score = 0;
    // Точное вхождение целой фразы
    if (fullQuery.length > 1) {
      if (titleL.indexOf(fullQuery) !== -1) score += 30;
      else if (excerptL.indexOf(fullQuery) !== -1) score += 12;
      else if (categoryL.indexOf(fullQuery) !== -1) score += 6;
    }
    // Каждое слово
    words.forEach(function (w) {
      if (titleL.indexOf(w) !== -1) score += 8;
      else if (excerptL.indexOf(w) !== -1) score += 3;
      else if (categoryL.indexOf(w) !== -1) score += 2;
      // бонус за начало title
      if (titleL.indexOf(w) === 0) score += 5;
    });
    return score;
  }

  /* Возвращает отсортированный массив { item, score } */
  function search(items, query) {
    var fullQuery = query.trim().toLowerCase();
    if (!fullQuery) return [];
    var words = tokenize(fullQuery);
    var results = [];
    items.forEach(function (item) {
      var s = scoreItem(item, words, fullQuery);
      if (s > 0) results.push({ item: item, score: s });
    });
    results.sort(function (a, b) { return b.score - a.score; });
    return results;
  }

  /* Группирует результаты по type, сохраняя порядок TYPE_ORDER */
  function groupByType(results) {
    var groups = {};
    TYPE_ORDER.forEach(function (t) { groups[t] = []; });
    results.forEach(function (r) {
      var t = r.item.type;
      if (groups[t]) groups[t].push(r);
    });
    return groups;
  }

  /* ---------------------------------------------------------
     HEADER DROPDOWN
     Layout: [.scroll list] + [.footer sticky button]
     --------------------------------------------------------- */
  function renderPopular(container) {
    var chipsHtml = POPULAR_QUERIES.map(function (q) {
      return '<li><button type="button" class="chip" data-popular-query="' +
        escapeHtml(q) + '">' + escapeHtml(q) + '</button></li>';
    }).join('');
    container.innerHTML =
      '<div class="search-suggest__scroll">' +
        '<div class="search-suggest__popular">' +
          '<h6 class="search-suggest__popular-title">Популярные запросы</h6>' +
          '<ul class="chips">' + chipsHtml + '</ul>' +
        '</div>' +
      '</div>';
    container.hidden = false;
    // Сбросить fade-маску — popular контент не скроллится
    container.removeAttribute('data-can-scroll-down');
  }

  function renderDropdown(container, query, results) {
    var words = tokenize(query.trim().toLowerCase());

    if (!query.trim()) {
      // Пустое состояние — популярные запросы (показываем при фокусе на пустом)
      renderPopular(container);
      updateScrollAffordance(container);
      return;
    }

    if (results.length === 0) {
      container.innerHTML =
        '<div class="search-suggest__scroll">' +
          '<div class="search-suggest__empty">' +
            '<p>По запросу <strong>«' + escapeHtml(query) + '»</strong> ничего не найдено.</p>' +
            '<p class="search-suggest__empty-hint">Попробуйте другие слова или ' +
            '<a href="/poisk/?q=' + encodeURIComponent(query) + '">перейдите на страницу поиска</a>.</p>' +
          '</div>' +
        '</div>';
      container.hidden = false;
      updateScrollAffordance(container);
      return;
    }

    var groups = groupByType(results.slice(0, TOP_TOTAL_HEAD * 2));
    var listHtml = '';

    TYPE_ORDER.forEach(function (type) {
      var groupResults = groups[type].slice(0, TOP_PER_GROUP);
      if (!groupResults.length) return;
      listHtml += '<div class="search-suggest__group">';
      listHtml += '<h6 class="search-suggest__group-title">' + TYPE_LABELS[type] + ' · ' + groups[type].length + '</h6>';
      listHtml += '<ul class="search-suggest__list">';
      groupResults.forEach(function (r) {
        var item = r.item;
        listHtml += '<li><a class="search-suggest__item" href="' + escapeHtml(item.url) + '">' +
          '<span class="search-suggest__title">' + highlight(item.title, words) + '</span>' +
          '<span class="search-suggest__excerpt">' + highlight(item.excerpt, words) + '</span>' +
          '</a></li>';
      });
      listHtml += '</ul></div>';
    });

    container.innerHTML =
      '<div class="search-suggest__scroll">' + listHtml + '</div>' +
      '<div class="search-suggest__footer">' +
        '<a class="search-suggest__more" href="/poisk/?q=' + encodeURIComponent(query) + '">' +
          '<span>Все результаты для «' + escapeHtml(query) + '» · ' + results.length + '</span>' +
          ARROW_ICON +
        '</a>' +
      '</div>';
    container.hidden = false;
    updateScrollAffordance(container);
  }

  /* Обновляет data-can-scroll-down на контейнере для CSS-маски */
  function updateScrollAffordance(container) {
    var scrollEl = container.querySelector('.search-suggest__scroll');
    if (!scrollEl) {
      container.removeAttribute('data-can-scroll-down');
      return;
    }
    var update = function () {
      var canScroll = scrollEl.scrollHeight - scrollEl.clientHeight - scrollEl.scrollTop > 4;
      container.setAttribute('data-can-scroll-down', canScroll ? 'true' : 'false');
    };
    update();
    if (!scrollEl._affordanceBound) {
      scrollEl.addEventListener('scroll', update, { passive: true });
      scrollEl._affordanceBound = true;
    }
  }

  /* Debounce */
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  /* ---------------------------------------------------------
     INIT — header dropdown
     --------------------------------------------------------- */
  function initHeaderSearch() {
    var input = document.getElementById('searchInput');
    var suggest = document.getElementById('searchSuggest');
    var clearBtn = document.getElementById('searchClear');
    if (!input || !suggest) return;

    var syncClear = function () {
      if (!clearBtn) return;
      clearBtn.hidden = !input.value;
    };

    var run = function () {
      var q = input.value;
      syncClear();
      if (!q.trim()) {
        renderPopular(suggest);
        return;
      }
      loadIndex().then(function (items) {
        var results = search(items, q);
        renderDropdown(suggest, q, results);
      });
    };

    // Универсальный сбрасыватель скролл-афорданса при изменении высоты dropdown
    new MutationObserver(function () { updateScrollAffordance(suggest); })
      .observe(suggest, { childList: true, subtree: true });
    var debounced = debounce(run, DEBOUNCE_MS);

    input.addEventListener('input', debounced);
    input.addEventListener('focus', function () { run(); });

    // Кнопка очистки (backspace icon)
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        syncClear();
        renderPopular(suggest);
        input.focus();
      });
    }

    // Делегирование кликов внутри suggest: chip / popular-query / sticky-more
    suggest.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-popular-query]');
      if (chip) {
        e.preventDefault();
        input.value = chip.getAttribute('data-popular-query');
        syncClear();
        run();
        input.focus();
      }
    });

    // Закрытие при клике вне
    document.addEventListener('click', function (e) {
      if (suggest.hidden) return;
      if (e.target === input) return;
      if (suggest.contains(e.target)) return;
      if (clearBtn && clearBtn.contains(e.target)) return;
      suggest.hidden = true;
    });

    // Esc — закрывает dropdown
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { suggest.hidden = true; }
    });
  }

  /* ---------------------------------------------------------
     /poisk/ — full-page search
     --------------------------------------------------------- */
  function renderFullResults(container, countsContainer, query, allResults, activeFilter) {
    var words = tokenize(query.trim().toLowerCase());
    var groups = groupByType(allResults);

    // Обновим счётчики в фильтре
    if (countsContainer) {
      countsContainer.querySelectorAll('[data-filter]').forEach(function (chip) {
        var f = chip.getAttribute('data-filter');
        var n = (f === 'all') ? allResults.length : (groups[f] ? groups[f].length : 0);
        chip.querySelector('.search-filter__count').textContent = n;
        chip.classList.toggle('is-active', f === activeFilter);
      });
    }

    // Применим фильтр
    var filtered = (activeFilter === 'all')
      ? allResults
      : allResults.filter(function (r) { return r.item.type === activeFilter; });

    if (!query.trim()) {
      container.innerHTML =
        '<div class="search-empty">' +
        '<p class="search-empty__title">Введите запрос</p>' +
        '<p class="search-empty__hint">Поиск охватывает услуги, дела, статьи журнала и классы МКТУ.</p>' +
        '</div>';
      return;
    }

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="search-empty">' +
        '<p class="search-empty__title">По запросу «' + escapeHtml(query) + '» ничего не найдено' +
        (activeFilter !== 'all' ? ' в&nbsp;разделе «' + TYPE_LABELS[activeFilter] + '»' : '') + '.</p>' +
        '<p class="search-empty__hint">Попробуйте другие слова или снимите фильтр по&nbsp;типу.</p>' +
        '</div>';
      return;
    }

    var html = '<ul class="search-results">';
    filtered.forEach(function (r) {
      var item = r.item;
      html +=
        '<li class="search-result">' +
        '<a class="search-result__link" href="' + escapeHtml(item.url) + '">' +
        '<div class="search-result__main">' +
        '<span class="search-result__type">' + TYPE_LABELS[item.type] + (item.category ? ' · ' + escapeHtml(item.category) : '') + '</span>' +
        '<h3 class="search-result__title">' + highlight(item.title, words) + '</h3>' +
        '<p class="search-result__excerpt">' + highlight(item.excerpt, words) + '</p>' +
        '</div>' +
        '<svg class="icon icon--arrow search-result__arrow" aria-hidden="true"><use href="/assets/icons/sprite.svg#arrow-right"/></svg>' +
        '</a>' +
        '</li>';
    });
    html += '</ul>';
    container.innerHTML = html;
  }

  function initFullPageSearch() {
    var input = document.getElementById('fullSearchInput');
    var resultsContainer = document.getElementById('fullSearchResults');
    var filterContainer = document.getElementById('searchFilter');
    var clearBtn = document.getElementById('fullSearchClear');
    if (!input || !resultsContainer) return;

    // Прочесть q из URL
    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get('q') || '';
    var activeFilter = urlParams.get('type') || 'all';

    input.value = initialQuery;
    input.focus();

    function syncClear() {
      if (!clearBtn) return;
      clearBtn.hidden = !input.value;
    }

    function runFull() {
      var q = input.value;
      syncClear();
      loadIndex().then(function (items) {
        var results = search(items, q);
        renderFullResults(resultsContainer, filterContainer, q, results, activeFilter);
        // Обновить URL
        var params = new URLSearchParams();
        if (q.trim()) params.set('q', q);
        if (activeFilter !== 'all') params.set('type', activeFilter);
        var newQs = params.toString();
        var newUrl = window.location.pathname + (newQs ? '?' + newQs : '');
        window.history.replaceState(null, '', newUrl);
      });
    }

    input.addEventListener('input', debounce(runFull, DEBOUNCE_MS));
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; runFull(); }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        input.value = '';
        runFull();
        input.focus();
      });
    }

    if (filterContainer) {
      filterContainer.addEventListener('click', function (e) {
        var chip = e.target.closest('[data-filter]');
        if (!chip) return;
        e.preventDefault();
        activeFilter = chip.getAttribute('data-filter');
        runFull();
      });
    }

    // Запуск стартового состояния
    runFull();
  }

  /* ---------------------------------------------------------
     Bootstrap
     --------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeaderSearch();
      initFullPageSearch();
    });
  } else {
    initHeaderSearch();
    initFullPageSearch();
  }
})();
