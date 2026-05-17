#!/usr/bin/env python3
"""Синхронизация partials/header.html и partials/footer.html во все HTML-страницы.

Использование:
    python3 scripts/sync-partials.py

Алгоритм:
1. Берём шаблон из partials/header.html и partials/footer.html
2. Для каждой страницы (кроме _old/ и partials/):
   • извлекаем тип шапки (transparent/solid) из текущего <header>
   • извлекаем set активных навигационных пунктов (is-current)
   • рендерим header с нужными атрибутами и is-current
   • заменяем <header class="site-header"...>...</header>
   • заменяем <footer class="site-footer">...</footer>
3. Также подключаем utils.css и copy-tooltip.js, если их ещё нет в <head>.

Перезатирание не трогает уникальный контент страниц.
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _split_leading_comment(tpl: str):
    """Возвращает (leading_html_comment_or_empty, tpl_без_этого_комментария).

    Partials начинаются с doc-комментария для разработчика — в проде он не нужен
    и не должен накапливаться при повторных прогонах sync-partials."""
    m = re.match(r'^(<!--[\s\S]*?-->)\s*', tpl)
    if m:
        return m.group(1), tpl[m.end():]
    return '', tpl


HEADER_TPL = (ROOT / 'partials' / 'header.html').read_text(encoding='utf-8')
HEADER_DOC_COMMENT, _ = _split_leading_comment(HEADER_TPL)

_FOOTER_RAW = (ROOT / 'partials' / 'footer.html').read_text(encoding='utf-8')
FOOTER_DOC_COMMENT, FOOTER_TPL = _split_leading_comment(_FOOTER_RAW)

HEADER_RE = re.compile(r'<header class="site-header[\s\S]*?</header>', re.MULTILINE)
HEADER_OPEN_RE = re.compile(r'<header class="site-header[^"]*"[^>]*>')
FOOTER_RE = re.compile(r'<footer class="site-footer">[\s\S]*?</footer>', re.MULTILINE)

# Карта URL→strings.contains для определения активного пункта меню
NAV_HREFS = ['/o-byuro/', '/zhurnal/', '/dela/', '/kontakty/']

# CSS/JS, которые нужно подключить во всех страницах
CSS_LINKS = [
    '<link rel="stylesheet" href="/assets/css/utils.css">',
]
JS_SCRIPTS = [
    '<script src="/assets/js/main.js"></script>',
    '<script src="/assets/js/search.js"></script>',
    '<script src="/assets/js/copy-tooltip.js" defer></script>',
]

_MODAL_RAW = (ROOT / 'partials' / 'modal.html').read_text(encoding='utf-8')
MODAL_DOC_COMMENT, MODAL_TPL = _split_leading_comment(_MODAL_RAW)
MODAL_INCLUDE_RE = re.compile(r'<!--\s*@include\s+modal\s*-->')
MODAL_OPEN_RE = re.compile(r'<div\s+class="modal"\s+id="consultModal"[^>]*>')

_MOBILE_MENU_RAW = (ROOT / 'partials' / 'mobile-menu.html').read_text(encoding='utf-8')
MOBILE_MENU_DOC_COMMENT, MOBILE_MENU_TPL = _split_leading_comment(_MOBILE_MENU_RAW)
MOBILE_MENU_INCLUDE_RE = re.compile(r'<!--\s*@include\s+mobile-menu\s*-->')
MOBILE_MENU_RE = re.compile(r'<aside class="mobile-menu"[\s\S]*?</aside>')

_COOKIE_BANNER_RAW = (ROOT / 'partials' / 'cookie-banner.html').read_text(encoding='utf-8')
COOKIE_BANNER_DOC_COMMENT, COOKIE_BANNER_TPL = _split_leading_comment(_COOKIE_BANNER_RAW)
COOKIE_BANNER_INCLUDE_RE = re.compile(r'<!--\s*@include\s+cookie-banner\s*-->')
COOKIE_BANNER_RE = re.compile(r'<aside class="cookie-banner"[\s\S]*?</aside>')

# Список всех doc-комментариев partials — для чистки накопленных дубликатов
# в продовых страницах (см. process_file).
PARTIAL_DOC_COMMENTS = [
    c for c in (
        HEADER_DOC_COMMENT,
        FOOTER_DOC_COMMENT,
        MODAL_DOC_COMMENT,
        MOBILE_MENU_DOC_COMMENT,
        COOKIE_BANNER_DOC_COMMENT,
    ) if c
]


def replace_existing_modal(text: str) -> str:
    """Находит существующий <div class="modal" id="consultModal"> и заменяет
    его (целиком, со всеми вложенными div) на свежий партиал MODAL_TPL.

    Балансировка <div>/</div> через простой счётчик, чтобы корректно дойти
    до парного закрывающего тега."""
    m = MODAL_OPEN_RE.search(text)
    if not m:
        return text

    start = m.start()
    pos = m.end()
    depth = 1
    open_re = re.compile(r'<div\b[^>]*>', re.IGNORECASE)
    close_re = re.compile(r'</div\s*>', re.IGNORECASE)

    while depth > 0 and pos < len(text):
        next_open = open_re.search(text, pos)
        next_close = close_re.search(text, pos)
        if not next_close:
            return text  # неконсистентный HTML — не трогаем
        if next_open and next_open.start() < next_close.start():
            depth += 1
            pos = next_open.end()
        else:
            depth -= 1
            pos = next_close.end()
    if depth != 0:
        return text
    end = pos
    return text[:start] + MODAL_TPL.rstrip('\n') + text[end:]


def extract_active_nav(old_header: str) -> set:
    """Возвращает set href, у которых был class is-current в старой шапке."""
    active = set()
    for href in NAV_HREFS:
        # ищем <a href="/o-byuro/" ... is-current ...>
        pat = re.compile(r'<a\s+href="' + re.escape(href) + r'"[^>]*is-current[^>]*>')
        if pat.search(old_header):
            active.add(href)
    return active


def render_header(transparent: bool, active_set: set) -> str:
    """Рендерит шаблон шапки с нужным data-state и is-current."""
    html = HEADER_TPL
    # Удаляем HTML-комментарий-документацию (не нужен в продовых страницах)
    html = re.sub(r'^<!--[\s\S]*?-->\s*', '', html, count=1)

    # Подставляем класс/data-state на корневом <header>
    if transparent:
        html = re.sub(
            r'<header class="site-header site-header--always-solid" id="siteHeader" data-state="solid"',
            '<header class="site-header" id="siteHeader" data-state="transparent"',
            html,
            count=1,
        )

    # Расставляем is-current и aria-current на активные ссылки
    for href in active_set:
        html = re.sub(
            r'<a href="' + re.escape(href) + r'" class="nav-link"',
            '<a href="' + href + '" class="nav-link is-current" aria-current="page"',
            html,
            count=1,
        )
    return html


def update_head_links(content: str) -> str:
    """Добавляет CSS_LINKS, JS_SCRIPTS и META_TAGS если их ещё нет."""
    # Meta theme-color — управление цветом iOS статус-бара (динамика в main.js)
    if 'name="theme-color"' not in content:
        content = content.replace(
            '<meta name="viewport"',
            '<meta name="theme-color" content="#0a0a0a">\n  <meta name="viewport"',
            1,
        )

    for css in CSS_LINKS:
        href = re.search(r'href="([^"]+)"', css).group(1)
        if href not in content:
            # Вставляем перед последним <link rel="stylesheet"... в head — или перед </head>
            # Берём наиболее «обобщённый» якорь — после header.css
            anchor = '<link rel="stylesheet" href="/assets/css/components.css">'
            if anchor in content:
                content = content.replace(anchor, anchor + '\n  ' + css, 1)
            else:
                content = content.replace('</head>', '  ' + css + '\n</head>', 1)
    for js in JS_SCRIPTS:
        src = re.search(r'src="([^"]+)"', js).group(1)
        if src not in content:
            content = content.replace('</body>', '  ' + js + '\n</body>', 1)
    return content


def process_file(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    original = text

    # Чистка накопленных doc-комментариев partials. Ранее sync-partials вставлял
    # каждый partial вместе с его ведущим doc-комментарием — а regex замены не
    # захватывал старый комментарий, поэтому на каждом прогоне появлялась лишняя
    # копия. Снимаем все вхождения этих комментариев одним проходом.
    for comment in PARTIAL_DOC_COMMENTS:
        text = re.sub(re.escape(comment) + r'\s*\n?', '', text)

    # Partials содержат HTML-атрибуты вида pattern="\+7\s\d{3}..." — в строке-replacement
    # для re.sub() обратные слеши интерпретируются как back-references (\1, \g<...>).
    # Оборачиваем replacement в lambda, чтобы re возвращал строку как есть.
    def _literal(tpl):
        body = tpl.rstrip('\n')
        return lambda _m: body

    # Header
    m = HEADER_RE.search(text)
    if m:
        old_header = m.group(0)
        # Тип шапки — по классу
        open_match = HEADER_OPEN_RE.search(old_header)
        is_transparent = bool(
            open_match and 'site-header--always-solid' not in open_match.group(0)
        )
        active_set = extract_active_nav(old_header)
        new_header = render_header(is_transparent, active_set)
        text = HEADER_RE.sub(_literal(new_header + '\n'), text, count=1)

    # Footer
    if FOOTER_RE.search(text):
        text = FOOTER_RE.sub(_literal(FOOTER_TPL + '\n'), text, count=1)

    # Modal placeholder (<!-- @include modal -->) — подставляем партиал
    if MODAL_INCLUDE_RE.search(text):
        text = MODAL_INCLUDE_RE.sub(_literal(MODAL_TPL), text, count=1)
    else:
        # Существующий modal: ищем <div class="modal" id="consultModal"...> и
        # балансом <div>/</div> находим конец, заменяем целиком на свежий партиал.
        text = replace_existing_modal(text)

    # Mobile menu — пробуем плейсхолдер, иначе заменяем существующий <aside>
    if MOBILE_MENU_INCLUDE_RE.search(text):
        text = MOBILE_MENU_INCLUDE_RE.sub(_literal(MOBILE_MENU_TPL), text, count=1)
    elif MOBILE_MENU_RE.search(text):
        text = MOBILE_MENU_RE.sub(_literal(MOBILE_MENU_TPL), text, count=1)
    else:
        # Нет ни плейсхолдера, ни <aside> — вставляем перед </body>
        if '</body>' in text:
            text = text.replace('</body>', MOBILE_MENU_TPL.rstrip('\n') + '\n</body>', 1)

    # Cookie banner — пробуем плейсхолдер, иначе заменяем существующий <aside>
    if COOKIE_BANNER_INCLUDE_RE.search(text):
        text = COOKIE_BANNER_INCLUDE_RE.sub(_literal(COOKIE_BANNER_TPL), text, count=1)
    elif COOKIE_BANNER_RE.search(text):
        text = COOKIE_BANNER_RE.sub(_literal(COOKIE_BANNER_TPL), text, count=1)
    else:
        # Нет ни плейсхолдера, ни существующего — вставляем перед </body>
        if '</body>' in text:
            text = text.replace('</body>', COOKIE_BANNER_TPL.rstrip('\n') + '\n</body>', 1)

    # CSS/JS links
    text = update_head_links(text)

    if text != original:
        path.write_text(text, encoding='utf-8')
        return True
    return False


def main():
    targets = []
    for p in ROOT.rglob('*.html'):
        rel = p.relative_to(ROOT)
        # Исключаем _old/ и partials/
        if rel.parts and (rel.parts[0] in {'_old', 'partials', 'scripts', 'docs', 'references'}):
            continue
        targets.append(p)

    changed = 0
    for p in targets:
        try:
            if process_file(p):
                changed += 1
                print(f'updated: {p.relative_to(ROOT)}')
        except Exception as e:
            print(f'error in {p}: {e}', file=sys.stderr)
            raise
    print(f'\nDone. {changed}/{len(targets)} files updated.')


if __name__ == '__main__':
    main()
