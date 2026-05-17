/* MKTU CLASS — раскрыть/свернуть перечень товаров */
(function () {
  var btn  = document.getElementById('termsToggle');
  var text = document.getElementById('termsText');
  if (!btn || !text) return;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    btn.classList.toggle('is-open', !open);
    text.classList.toggle('mktu-terms__text--collapsed', open);
    btn.querySelector('[aria-hidden]').previousSibling;
    btn.childNodes[0].textContent = open ? 'Раскрыть список' : 'Свернуть список';
  });
})();
