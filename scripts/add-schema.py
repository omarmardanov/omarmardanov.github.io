#!/usr/bin/env python3
"""Генерирует JSON-LD разметку Schema.org для всех 18 страниц.

Размещаемые схемы:
• Главная (/): LegalService (Organization) + WebSite с SearchAction
• /kontakty/: LegalService с двумя location[] + BreadcrumbList
• /zhurnal/<article>/: Article + BreadcrumbList
• /dela/<case>/: Article + BreadcrumbList
• Прочие глубокие страницы: BreadcrumbList

Все блоки JSON-LD вставляются перед </head> между маркерами
<!-- :ld:start --> и <!-- :ld:end -->. При повторном запуске блок
обновляется (идемпотентно).

Запуск из корня репозитория: python3 scripts/add-schema.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://1-tm.ru'
ORG_ID = f'{ORIGIN}/#org'

MARK_START = '<!-- :ld:start -->'
MARK_END = '<!-- :ld:end -->'
EXISTING_BLOCK_RE = re.compile(
    re.escape(MARK_START) + r'.*?' + re.escape(MARK_END) + r'\n?',
    re.DOTALL,
)
LEGACY_LD_RE = re.compile(
    r'\s*<script type="application/ld\+json">.*?</script>\n?',
    re.DOTALL,
)

TITLE_RE = re.compile(r'<title>(.*?)</title>', re.DOTALL)
DESC_RE = re.compile(r'<meta\s+name="description"\s+content="([^"]*)"\s*/?>', re.IGNORECASE)
TIME_RE = re.compile(r'<time\s+datetime="([^"]+)"')
AUTHOR_NAME_RE = re.compile(r'<span class="article-author__name">([^<]+)</span>')
AUTHOR_ROLE_RE = re.compile(r'<span class="article-author__role">([^<]+)</span>')


# ────────────────────────────────────────────────────────────────────
# Organization / LegalService — единый identity-блок
# ────────────────────────────────────────────────────────────────────

def org_schema() -> dict:
    """Базовый LegalService — identity бюро, один источник истины."""
    return {
        '@context': 'https://schema.org',
        '@type': 'LegalService',
        '@id': ORG_ID,
        'name': 'Галифанов, Мальков и Партнёры',
        'alternateName': 'GMP',
        'url': ORIGIN + '/',
        'logo': ORIGIN + '/Logo1m.svg',
        'image': ORIGIN + '/assets/images/og-default.png',
        'foundingDate': '2014',
        'description': 'Юридическая фирма с 2014 года. Интеллектуальная собственность, договоры, судебная практика, сопровождение бизнеса. Москва и Тюмень.',
        'email': 'law@1-tm.ru',
        'telephone': '+7-495-151-82-82',
        'areaServed': {'@type': 'Country', 'name': 'Россия'},
        'sameAs': ['https://t.me/urberau'],
        'address': [
            {
                '@type': 'PostalAddress',
                'addressCountry': 'RU',
                'addressLocality': 'Москва',
                'streetAddress': 'ул. Ленинская слобода, 19',
                'postalCode': '115280',
            },
            {
                '@type': 'PostalAddress',
                'addressCountry': 'RU',
                'addressLocality': 'Тюмень',
                'streetAddress': 'ул. Республики, 145, оф. 408',
            },
        ],
        'contactPoint': [
            {
                '@type': 'ContactPoint',
                'contactType': 'customer service',
                'telephone': '+7-495-151-82-82',
                'email': 'law@1-tm.ru',
                'areaServed': 'RU',
                'availableLanguage': 'Russian',
            },
            {
                '@type': 'ContactPoint',
                'contactType': 'customer service',
                'telephone': '+7-345-249-25-57',
                'areaServed': 'RU',
                'availableLanguage': 'Russian',
            },
        ],
    }


def org_with_locations() -> dict:
    """Расширенный LegalService для /kontakty/ — с location[]."""
    base = org_schema()
    base['location'] = [
        {
            '@type': 'Place',
            'name': 'Офис в Москве',
            'address': base['address'][0],
            'telephone': '+7-495-151-82-82',
        },
        {
            '@type': 'Place',
            'name': 'Офис в Тюмени',
            'address': base['address'][1],
            'telephone': '+7-345-249-25-57',
        },
    ]
    return base


def website_schema() -> dict:
    """WebSite с SearchAction — для главной."""
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': f'{ORIGIN}/#website',
        'url': ORIGIN + '/',
        'name': 'Галифанов, Мальков и Партнёры',
        'publisher': {'@id': ORG_ID},
        'inLanguage': 'ru-RU',
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': f'{ORIGIN}/poisk/?q={{search_term_string}}',
            },
            'query-input': 'required name=search_term_string',
        },
    }


# ────────────────────────────────────────────────────────────────────
# BreadcrumbList — генерируется из пути файла
# ────────────────────────────────────────────────────────────────────

PATH_TITLES = {
    '/': 'Главная',
    '/uslugi/': 'Услуги',
    '/uslugi-shablon/': 'Шаблон страницы услуги',
    '/uslugi/intellektualnaya-sobstvennost/': 'Интеллектуальная собственность',
    '/o-byuro/': 'О бюро',
    '/kontakty/': 'Контакты',
    '/zhurnal/': 'Журнал',
    '/dela/': 'Дела',
    '/mktu/': 'Классы МКТУ',
    '/legal/privacy/': 'Политика конфиденциальности',
    '/legal/personal-data/': 'Обработка персональных данных',
    '/legal/cookies/': 'Использование cookie',
    '/legal/oferta/': 'Договор оферты',
    '/legal/rekvizity/': 'Реквизиты',
    '/poisk/': 'Поиск',
}


def breadcrumbs_schema(rel_path: Path, page_title: str) -> dict | None:
    """Возвращает BreadcrumbList или None для главной."""
    parts = list(rel_path.parts[:-1])  # отрезаем 'index.html'
    if not parts:
        return None

    items = [{
        '@type': 'ListItem',
        'position': 1,
        'name': 'Главная',
        'item': ORIGIN + '/',
    }]
    accumulated = ''
    for i, part in enumerate(parts):
        accumulated += '/' + part
        url = accumulated + '/'
        is_leaf = (i == len(parts) - 1)
        name = PATH_TITLES.get(url)
        if not name:
            # Для статей/кейсов/прочего — используем title страницы (без суффикса фирмы)
            if is_leaf:
                name = page_title.split(' · ')[0].split(' — ')[0].strip()
            else:
                # Промежуточные сегменты, для которых не задан title — fallback по slug
                # /legal/ → «Документы» (родитель не в карте, но handle для legal)
                if part == 'legal':
                    name = 'Документы'
                else:
                    name = part.replace('-', ' ').capitalize()
        items.append({
            '@type': 'ListItem',
            'position': i + 2,
            'name': name,
            'item': ORIGIN + url,
        })

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': items,
    }


# ────────────────────────────────────────────────────────────────────
# Article — для статей журнала и кейсов
# ────────────────────────────────────────────────────────────────────

def article_schema(rel_path: Path, page_title: str, description: str, text: str) -> dict:
    """Article для /zhurnal/<slug>/ и /dela/<slug>/."""
    is_case = rel_path.parts[0] == 'dela'

    # Дата публикации — первый <time datetime="...">
    date_m = TIME_RE.search(text)
    date_published = date_m.group(1) if date_m else None

    # Автор — для статей журнала
    author_name_m = AUTHOR_NAME_RE.search(text)
    author_name = author_name_m.group(1).strip() if author_name_m else None

    page_url = ORIGIN + '/' + '/'.join(rel_path.parts[:-1]) + '/'

    schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': page_title.split(' · ')[0].split(' — ')[0].strip(),
        'description': description,
        'image': ORIGIN + '/assets/images/og-default.png',
        'url': page_url,
        'mainEntityOfPage': {'@type': 'WebPage', '@id': page_url},
        'publisher': {'@id': ORG_ID},
        'inLanguage': 'ru-RU',
    }
    if date_published:
        schema['datePublished'] = date_published
        schema['dateModified'] = date_published
    if author_name:
        schema['author'] = {
            '@type': 'Person',
            'name': author_name,
            'worksFor': {'@id': ORG_ID},
        }
    else:
        # Для кейсов — авторство фирмы как организации
        schema['author'] = {'@id': ORG_ID}

    if is_case:
        schema['articleSection'] = 'Кейс'

    return schema


# ────────────────────────────────────────────────────────────────────
# Сборка JSON-LD блоков для конкретной страницы
# ────────────────────────────────────────────────────────────────────

def detect_page_type(rel_path: Path) -> str:
    parts = rel_path.parts
    if parts == ('index.html',):
        return 'home'
    if parts[0] == 'kontakty':
        return 'contacts'
    if parts[0] == 'zhurnal' and len(parts) >= 3:
        return 'article'
    if parts[0] == 'dela' and len(parts) >= 3:
        return 'case'
    return 'generic'


def build_schemas(rel_path: Path, page_title: str, description: str, text: str) -> list:
    ptype = detect_page_type(rel_path)
    out = []

    if ptype == 'home':
        out.append(org_schema())
        out.append(website_schema())
    elif ptype == 'contacts':
        out.append(org_with_locations())
        bc = breadcrumbs_schema(rel_path, page_title)
        if bc:
            out.append(bc)
    elif ptype in ('article', 'case'):
        out.append(article_schema(rel_path, page_title, description, text))
        bc = breadcrumbs_schema(rel_path, page_title)
        if bc:
            out.append(bc)
    else:  # generic
        bc = breadcrumbs_schema(rel_path, page_title)
        if bc:
            out.append(bc)

    return out


def render_block(schemas: list) -> str:
    body = '\n'.join(
        '  <script type="application/ld+json">\n'
        + json.dumps(s, ensure_ascii=False, indent=2)
        + '\n  </script>'
        for s in schemas
    )
    return f'{MARK_START}\n{body}\n  {MARK_END}'


# ────────────────────────────────────────────────────────────────────
# Обработка файла
# ────────────────────────────────────────────────────────────────────

def process_file(path: Path) -> tuple[bool, str]:
    text = path.read_text(encoding='utf-8')

    title_m = TITLE_RE.search(text)
    desc_m = DESC_RE.search(text)
    if not title_m or not desc_m:
        return False, f'missing title/description: {path.relative_to(ROOT)}'

    page_title = title_m.group(1).strip()
    description = desc_m.group(1).strip()
    rel = path.relative_to(ROOT)

    schemas = build_schemas(rel, page_title, description, text)
    if not schemas:
        return False, f'no schema: {rel}'

    block = render_block(schemas)

    if MARK_START in text:
        new_text = EXISTING_BLOCK_RE.sub(block + '\n', text, count=1)
    else:
        # Сначала чистим legacy JSON-LD без маркеров (например, старый stub на /kontakty/)
        cleaned = LEGACY_LD_RE.sub('', text)
        # Вставляем перед </head> с правильным отступом
        new_text = cleaned.replace('</head>', '  ' + block + '\n</head>', 1)

    if new_text == text:
        return False, f'no-change: {rel}'

    path.write_text(new_text, encoding='utf-8')
    return True, f'updated: {rel} ({detect_page_type(rel)}, {len(schemas)} schemas)'


def find_pages() -> list[Path]:
    return sorted(
        p for p in ROOT.rglob('index.html')
        if 'node_modules' not in p.parts and '.git' not in p.parts
    )


def main() -> None:
    pages = find_pages()
    changed = 0
    for path in pages:
        ok, msg = process_file(path)
        print(msg)
        if ok:
            changed += 1
    print(f'\nDone. {changed}/{len(pages)} files updated.')


if __name__ == '__main__':
    main()
