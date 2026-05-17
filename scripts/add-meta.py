#!/usr/bin/env python3
"""Добавляет / обновляет Open Graph, Twitter Card и canonical link во все index.html.

Для каждой страницы:
1. Извлекает существующий <title> и <meta name="description">
2. Вычисляет URL из пути файла (index.html → /, dela/index.html → /dela/, etc.)
3. Вставляет блок OG/twitter/canonical между маркерами :og:start / :og:end
   после <meta name="description">

Идемпотентен: при повторном запуске блок между маркерами заменяется. Если
title/description страницы менялись — OG-теги автоматически синхронизируются.

og:image — общая заглушка /assets/images/og-default.png (1200×630).
Заказчик подготовит файл по ТЗ, пока 404 при загрузке.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE_ORIGIN = 'https://1-tm.ru'
SITE_NAME = 'Галифанов, Мальков и Партнёры'
OG_IMAGE = '/assets/images/og-default.png'

MARK_START = '<!-- :og:start -->'
MARK_END = '<!-- :og:end -->'

TITLE_RE = re.compile(r'<title>(.*?)</title>', re.DOTALL)
DESC_RE = re.compile(r'<meta\s+name="description"\s+content="([^"]*)"\s*/?>', re.IGNORECASE)
EXISTING_BLOCK_RE = re.compile(
    re.escape(MARK_START) + r'.*?' + re.escape(MARK_END) + r'\n?',
    re.DOTALL,
)


def url_for(rel: Path) -> str:
    """index.html → /, foo/index.html → /foo/, foo/bar/index.html → /foo/bar/"""
    parts = rel.parts[:-1]
    if not parts:
        return '/'
    return '/' + '/'.join(parts) + '/'


def og_type_for(rel: Path) -> str:
    parts = rel.parts
    if len(parts) >= 3 and parts[0] == 'zhurnal' and parts[1] != 'index.html':
        return 'article'
    if len(parts) >= 3 and parts[0] == 'dela' and parts[1] != 'index.html':
        return 'article'
    return 'website'


def render_block(title: str, description: str, page_url: str, og_type: str) -> str:
    full_url = SITE_ORIGIN + page_url
    image_url = SITE_ORIGIN + OG_IMAGE
    return f'''{MARK_START}
  <link rel="canonical" href="{full_url}">

  <meta property="og:type" content="{og_type}">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{full_url}">
  <meta property="og:image" content="{image_url}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{image_url}">
  {MARK_END}'''


def process_file(path: Path) -> tuple[bool, str]:
    text = path.read_text(encoding='utf-8')

    title_m = TITLE_RE.search(text)
    desc_m = DESC_RE.search(text)
    if not title_m or not desc_m:
        return False, f'missing title/description: {path}'

    title = title_m.group(1).strip()
    description = desc_m.group(1).strip()

    rel = path.relative_to(ROOT)
    page_url = url_for(rel)
    og_type = og_type_for(rel)
    block = render_block(title, description, page_url, og_type)

    if MARK_START in text:
        new_text = EXISTING_BLOCK_RE.sub(block + '\n', text, count=1)
        action = 'updated'
    else:
        desc_tag = desc_m.group(0)
        insertion = desc_tag + '\n\n  ' + block
        new_text = text.replace(desc_tag, insertion, 1)
        action = 'added'

    if new_text == text:
        return False, f'no-change: {rel}'

    path.write_text(new_text, encoding='utf-8')
    return True, f'{action}: {rel} ({og_type})'


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
    print(f'\nDone. {changed}/{len(pages)} files changed.')


if __name__ == '__main__':
    main()
