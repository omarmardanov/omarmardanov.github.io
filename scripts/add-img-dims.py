#!/usr/bin/env python3
"""Добавляет width/height/loading/decoding ко всем <img> в HTML-страницах.

Зачем: CLS-фикс для Core Web Vitals. Без width/height браузер не может зарезервировать
место под изображение, и при загрузке весь контент ниже «прыгает».

Размеры читаются автоматически:
• .jpg/.png — через `sips -g pixelWidth -g pixelHeight` (macOS встроенная утилита)
• .svg — из атрибута viewBox

Также добавляются loading="lazy" и decoding="async". На сайте нет img выше first
viewport (hero — CSS background), поэтому lazy безопасно для всех.

Идемпотентный: если у тега уже есть width= или height= — не трогает.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets' / 'images'

IMG_RE = re.compile(r'<img\s+([^>]*?)>', re.IGNORECASE)
SRC_RE = re.compile(r'src="([^"]+)"')
VIEWBOX_RE = re.compile(r'viewBox="([\d.\s\-eE+]+)"')


def get_raster_size(file: Path) -> tuple[int, int] | None:
    try:
        out = subprocess.check_output(
            ['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(file)],
            stderr=subprocess.DEVNULL,
        ).decode()
        w = h = None
        for line in out.splitlines():
            parts = line.strip().split(': ')
            if len(parts) == 2:
                key, val = parts
                if key == 'pixelWidth':
                    w = int(val)
                elif key == 'pixelHeight':
                    h = int(val)
        if w and h:
            return w, h
    except Exception:
        pass
    return None


def get_svg_size(file: Path) -> tuple[int, int] | None:
    try:
        text = file.read_text(encoding='utf-8', errors='ignore')
        m = VIEWBOX_RE.search(text)
        if not m:
            return None
        parts = m.group(1).split()
        if len(parts) != 4:
            return None
        w = round(float(parts[2]))
        h = round(float(parts[3]))
        return w, h
    except Exception:
        return None


def get_size(src: str) -> tuple[int, int] | None:
    """src — путь вида /assets/images/clients/foo.svg"""
    if not src.startswith('/'):
        return None
    file = ROOT / src.lstrip('/')
    if not file.exists():
        return None
    if file.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
        return get_raster_size(file)
    if file.suffix.lower() == '.svg':
        return get_svg_size(file)
    return None


def process_img(tag_inner: str, size_cache: dict) -> str | None:
    """Возвращает новый inner attribute string или None если правка не нужна."""
    src_m = SRC_RE.search(tag_inner)
    if not src_m:
        return None
    src = src_m.group(1)

    has_width = 'width=' in tag_inner
    has_height = 'height=' in tag_inner
    has_loading = 'loading=' in tag_inner
    has_decoding = 'decoding=' in tag_inner

    if has_width and has_height and has_loading and has_decoding:
        return None

    if src not in size_cache:
        size_cache[src] = get_size(src)
    size = size_cache[src]

    additions = []
    if size and not has_width:
        additions.append(f'width="{size[0]}"')
    if size and not has_height:
        additions.append(f'height="{size[1]}"')
    if not has_loading:
        additions.append('loading="lazy"')
    if not has_decoding:
        additions.append('decoding="async"')

    if not additions:
        return None

    return tag_inner.rstrip() + ' ' + ' '.join(additions)


def process_file(path: Path, size_cache: dict) -> int:
    text = path.read_text(encoding='utf-8')
    changes = 0

    def replace(m: re.Match) -> str:
        nonlocal changes
        new_inner = process_img(m.group(1), size_cache)
        if new_inner is None:
            return m.group(0)
        changes += 1
        return f'<img {new_inner}>'

    new_text = IMG_RE.sub(replace, text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
    return changes


def find_pages() -> list[Path]:
    return sorted(
        p for p in ROOT.rglob('index.html')
        if 'node_modules' not in p.parts and '.git' not in p.parts
    )


def main() -> None:
    pages = find_pages()
    size_cache: dict[str, tuple[int, int] | None] = {}
    total = 0
    for path in pages:
        n = process_file(path, size_cache)
        if n:
            print(f'{path.relative_to(ROOT)}: {n} img updated')
            total += n
    print(f'\nDone. {total} img tags updated across {len(pages)} pages.')

    missing = sorted(k for k, v in size_cache.items() if v is None)
    if missing:
        print('\nWARNING: size not detected for:')
        for src in missing:
            print(f'  - {src}')


if __name__ == '__main__':
    main()
