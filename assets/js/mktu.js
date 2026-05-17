/* MKTU INDEX — поиск/фильтр по классам */
(function () {
  var input  = document.getElementById('mktuSearch');
  var list   = document.getElementById('mktuList');
  var meta   = document.getElementById('mktuMeta');
  var empty  = document.getElementById('mktuEmpty');
  var items  = Array.from(list.querySelectorAll('.mktu-item'));
  var total  = items.length;

  // Store original desc HTML per item
  items.forEach(function (item) {
    item._origDesc = item.querySelector('.mktu-item__desc').innerHTML;
    item._searchText = (
      (item.getAttribute('data-search') || '') + ' ' +
      item.querySelector('.mktu-item__desc').textContent + ' ' +
      item.querySelector('.mktu-item__num').textContent
    ).toLowerCase();
  });

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function highlight(html, q) {
    if (!q) return html;
    var re = new RegExp('(' + escRe(q) + ')', 'gi');
    // only highlight text nodes — strip existing marks first
    var clean = html.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
    return clean.replace(re, '<mark>$1</mark>');
  }

  function search(raw) {
    var q = raw.trim().toLowerCase();
    var shown = 0;
    items.forEach(function (item) {
      var match = !q || item._searchText.indexOf(q) !== -1;
      item.style.display = match ? '' : 'none';
      var descEl = item.querySelector('.mktu-item__desc');
      descEl.innerHTML = match ? highlight(item._origDesc, q) : item._origDesc;
      if (match) shown++;
    });
    meta.textContent = q
      ? ('Найдено ' + shown + ' из ' + total)
      : ('Показано ' + total + ' классов из 45');
    empty.classList.toggle('is-visible', shown === 0);
  }

  input.addEventListener('input',  function () { search(this.value); });
  input.addEventListener('search', function () { search(this.value); });
})();
