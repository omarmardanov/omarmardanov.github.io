#!/usr/bin/env python3
"""Унификация CTA-блока на всех страницах с .cta-final.

Стандарт (как на главной): одна тёмная-на-светлом кнопка «Заявка на консультацию»
+ горизонтальный список с тремя контактами (Москва · Тюмень · Email).
Заголовки и лиды CTA остаются персонализированными — трогаем только actions+contacts.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NEW_BLOCK = """<div class="cta-final__actions">
        <button type="button" class="btn btn--cta-light js-open-consult">
          Заявка на&nbsp;консультацию
        </button>
      </div>

      <ul class="cta-final__contacts">
        <li>
          <span class="cta-final__contacts-city">Москва</span>
          <a href="tel:+74951518282" class="copy-trigger" data-copy-label="Скопировать номер" data-copy-toast="Номер телефона скопирован">+7&nbsp;(495)&nbsp;151-82-82</a>
        </li>
        <li>
          <span class="cta-final__contacts-city">Тюмень</span>
          <a href="tel:+73452492557" class="copy-trigger" data-copy-label="Скопировать номер" data-copy-toast="Номер телефона скопирован">+7&nbsp;(345)&nbsp;249-25-57</a>
        </li>
        <li>
          <span class="cta-final__contacts-city">Email</span>
          <a href="mailto:law@1-tm.ru" class="copy-trigger" data-copy-label="Скопировать адрес" data-copy-toast="Адрес электронной почты скопирован">law@1-tm.ru</a>
        </li>
      </ul>"""

ACTIONS_RE = re.compile(r'<div class="cta-final__actions">[\s\S]*?</div>')
CONTACTS_RE = re.compile(r'\s*<ul class="cta-final__contacts">[\s\S]*?</ul>')


def process(path: Path) -> bool:
    text = path.read_text(encoding='utf-8')
    original = text

    m = ACTIONS_RE.search(text)
    if not m:
        return False

    end = m.end()
    rest = text[end:]
    cm = CONTACTS_RE.match(rest)
    if cm:
        full_end = end + cm.end()
    else:
        full_end = end

    text = text[:m.start()] + NEW_BLOCK + text[full_end:]

    if text != original:
        path.write_text(text, encoding='utf-8')
        return True
    return False


def main():
    targets = []
    for p in ROOT.rglob('*.html'):
        rel = p.relative_to(ROOT)
        if rel.parts and rel.parts[0] in {'_old', 'partials', 'scripts', 'docs', 'references'}:
            continue
        targets.append(p)

    changed = 0
    for p in targets:
        if process(p):
            changed += 1
            print(f'updated: {p.relative_to(ROOT)}')
    print(f'\nDone. {changed} files updated.')


if __name__ == '__main__':
    main()
