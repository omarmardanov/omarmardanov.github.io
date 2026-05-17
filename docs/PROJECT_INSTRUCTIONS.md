# Galifanov, Malkov & Partners — Frontend Project

## Контекст
Сайт юридического патентного бюро. Разрабатываем фронтенд для последующей интеграции в WordPress.
Каждая страница — самодостаточный HTML-файл (без сборщика), который можно открыть в браузере.

## Стек
- Ванильный HTML + CSS + JS (без фреймворков, без сборки)
- CSS-переменные из дизайн-системы (файл `design-tokens.css` в проекте)
- Google Fonts: Cormorant Garamond (display), DM Sans (body), JetBrains Mono (mono)

## Архитектура файлов
Каждая страница собирается из одних и тех же блоков:
1. `<head>` с мета-тегами и подключением шрифтов
2. Полный `<style>` блок: дизайн-токены → глобальные стили → page-specific стили
3. `<header class="site-header site-header--always-solid">` — **копировать дословно** из `uslugi-intellektualnaya-sobstvennost.html`
4. `<main class="page">` — уникальный контент страницы
5. `<footer class="site-footer">` — **копировать дословно**
6. `<aside class="mobile-menu">` — **копировать дословно**
7. `<div class="modal" id="consultModal">` — **копировать дословно**
8. `<script>` — **копировать дословно** (содержит логику шапки, мобайла, модала)

**Правило:** шапку, футер, мобильное меню, модал и JS — никогда не переписывать вручную, только копировать из эталонного файла `uslugi-intellektualnaya-sobstvennost.html`.

## Готовые страницы (эталоны)
- `fpb-hero.html` — Главная (`/`)
- `uslugi-intellektualnaya-sobstvennost.html` — Страница направления (`/uslugi/{направление}/`) — **главный эталон**
- `uslugi-registratsiya-tovarnogo-znaka.html` — Страница услуги (`/uslugi/{направление}/{раздел}/{услуга}/`)
- `mktu.html` — Справочник МКТУ (`/mktu/`)
- `mktu-klass-41.html` — Страница класса МКТУ (`/mktu/klass-N/`)

## Sitemap (статус)
```
/                          → ✅
/uslugi/                   → ✅
/uslugi/{направление}/     → ✅ (эталон intellektualnaya-sobstvennost; 3 остальных в WP)
/uslugi/{направление}/{раздел}/{услуга}/  → ✅ (шаблон uslugi-shablon, страницы в WP)
/o-byuro/                  → ✅ (включает блок #team — отдельной /komanda/ нет)
/zhurnal/                  → ✅
/zhurnal/{slug}/           → ✅ (шаблон, статьи в WP)
/dela/                     → ✅
/dela/{slug}/              → ✅ (шаблон, кейсы в WP)
/kontakty/                 → ✅
/mktu/                     → mktu.html ✅
/mktu/klass-{N}/           → mktu-klass-41.html ✅ (шаблон)
/poisk/                    → ✅ (noindex)

> Текущий статус по конкретным файлам — см. `docs/PROGRESS.md` (источник истины).
```

## Классы шапки
- `site-header--always-solid` — белая шапка (все страницы кроме главной)
- Главная: шапка прозрачная поверх hero, становится белой при скролле

## Правила кода
- Минимальный JS — только то, что нельзя на CSS
- Никаких inline-стилей кроме `style="display:none"` и динамических значений
- Все цвета через CSS-переменные, не хардкодить hex
- Отступы через `--space-N`, не пиксели напрямую
- БЭМ-именование: `.block__element--modifier`
- `<main class="page">` — всегда этот класс, он даёт `padding-top: var(--header-h)`

## Форма консультации
Уже реализована в модале (`#consultModal`). Для открытия — класс `.js-open-consult` на любой кнопке.

## Контакты (реальные данные)
- Москва: +7 (495) 151-82-82
- Тюмень: +7 (345) 249-25-57  
- Email: law@1-tm.ru

## Поведение при генерации
1. Прочитай задачу
2. Возьми нужные блоки из эталонного файла дословно (grep нужные строки)
3. Добавь только page-specific CSS и HTML
4. Не переписывай то, что уже работает
