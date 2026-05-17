/* ============================================================
   FPB copy-tooltip.js
   • Делегатор для <a data-copy> и др. элементов с data-copy
   • Hover: tooltip «Скопировать» (CSS, через data-copy-label)
   • Click: copy в буфер + toast с data-copy-toast или дефолтом
   • Источник для копирования:
       — data-copy="literal value"  → копируется значение
       — иначе href: tel:+7… → +7…, mailto:law@… → law@…
       — иначе textContent
   ============================================================ */
(function () {
  'use strict';

  var DEFAULT_LABEL = 'Скопировать';

  /* ------------------------ Toast ------------------------ */
  var stack = null;
  function ensureStack() {
    if (stack) return stack;
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
    return stack;
  }
  function showToast(message, opts) {
    var s = ensureStack();
    var t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    var icon = (opts && opts.icon) || 'check';
    t.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="/assets/icons/sprite.svg#' + icon + '"/></svg>' +
      '<span></span>';
    t.querySelector('span').textContent = message;
    s.appendChild(t);
    // animate
    requestAnimationFrame(function () { t.classList.add('is-visible'); });
    var ttl = (opts && opts.ttl) || 2400;
    setTimeout(function () {
      t.classList.remove('is-visible');
      setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 320);
    }, ttl);
  }

  /* ------------------------ Copy ------------------------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (e) { reject(e); }
    });
  }

  /* Извлекает значение для копирования из элемента */
  function valueFor(el) {
    var explicit = el.getAttribute('data-copy');
    if (explicit) return explicit;
    var href = el.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) return href.slice(4);
    if (href.indexOf('mailto:') === 0) return href.slice(7);
    return (el.textContent || '').trim();
  }
  function toastFor(el, copied) {
    var custom = el.getAttribute('data-copy-toast');
    if (custom) return custom;
    var href = el.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) return 'Номер телефона скопирован';
    if (href.indexOf('mailto:') === 0) return 'Адрес электронной почты скопирован';
    return 'Скопировано';
  }

  /* ------------------------ Init ------------------------- */
  function init() {
    // Установить tooltip-label на все copy-trigger, если не задан
    document.querySelectorAll('[data-copy], .copy-trigger').forEach(function (el) {
      el.classList.add('copy-trigger');
      if (!el.hasAttribute('data-copy-label')) {
        el.setAttribute('data-copy-label', DEFAULT_LABEL);
      }
    });

    document.addEventListener('click', function (e) {
      var trg = e.target.closest('[data-copy], .copy-trigger[href^="tel:"], .copy-trigger[href^="mailto:"]');
      if (!trg) return;
      // На тач-устройствах (мобайл/планшет) не перехватываем — пусть отрабатывает
      // нативное поведение: tel: → набор, mailto: → почтовый агент, https: → переход.
      // Tooltip на тач не показывается всё равно (нет hover).
      if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
      // Только если у элемента действительно есть значение для копирования
      var value = valueFor(trg);
      if (!value) return;
      e.preventDefault();
      copyText(value).then(function () {
        showToast(toastFor(trg));
        trg.classList.add('is-copied');
        setTimeout(function () { trg.classList.remove('is-copied'); }, 1200);
      }).catch(function () {
        showToast('Не удалось скопировать. Скопируйте вручную: ' + value, { icon: 'alert', ttl: 4000 });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспортируем toast для использования из других модулей (например main.js — форма)
  window.fpbToast = showToast;
})();
