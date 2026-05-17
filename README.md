# Galifanov, Malkov & Partners — Frontend

Статический фронтенд патентного бюро **1-tm.ru**. Ванильный HTML + CSS + JS, без сборщика.
Передаётся WordPress-разработчику как набор готовых HTML-шаблонов.

## Запуск локально

```bash
# из корня проекта
python3 -m http.server 8000
# открыть http://localhost:8000
```

Абсолютные пути (`/assets/css/...`, `/uslugi/...`) работают только через HTTP-сервер.
Открытие `file://` не покажет шрифты и сломает navигацию между страницами.

## Структура

```
/
├── index.html                                       Главная
├── uslugi/
│   ├── intellektualnaya-sobstvennost/index.html     Направление: ИС (эталон)
│   ├── dogovory-i-sdelki/                           — создаётся в WP по шаблону
│   ├── spory-i-zashchita/                           — то же
│   └── soprovozhdenie-biznesa/                      — то же
├── uslugi-shablon/index.html                        Шаблон страницы услуги
├── mktu/
│   ├── index.html                                   Каталог МКТУ
│   └── klass-41/index.html                          Шаблон класса МКТУ
├── assets/
│   ├── css/
│   │   ├── tokens.css         CSS-переменные (цвета, шрифты, отступы, Z)
│   │   ├── base.css           reset + body + .container + .page padding
│   │   ├── components.css     btn, card, field, breadcrumbs, partners, link, text-meta
│   │   ├── header.css         site-header + topbar + mega-menu + search-row
│   │   ├── mobile-menu.css    fullscreen mobile-menu с drill-down
│   │   ├── footer.css         site-footer (тёмный)
│   │   ├── sections.css       .section + .cta-final
│   │   ├── modal.css          split-layout consult modal
│   │   └── pages/
│   │       ├── home.css       hero, directions, process, cases, journal, about
│   │       ├── direction.css  page-hero, layout-aside, aside-nav, section-anchor, service-list, related
│   │       ├── service.css    facts, service-layout, aside-card, prose, content-block, callout, pricing, faq
│   │       ├── mktu.css       список классов с поиском
│   │       └── mktu-class.css страница одного класса
│   └── js/
│       ├── main.js            header, mobile-menu, modal, file upload, aside-nav scroll-spy
│       ├── mktu.js            поиск/фильтр по классам
│       └── mktu-class.js      раскрыть/свернуть перечень
├── partials/                  Эталонные HTML-фрагменты для WP-разработчика
│   ├── head.html              <head> с подключением шрифтов и CSS
│   ├── header.html            site-header (документация для двух режимов)
│   ├── mobile-menu.html
│   ├── footer.html
│   └── modal.html
├── robots.txt
├── sitemap.xml
└── docs/
    ├── BRIEF.md               О проекте, аудитория, цели
    ├── PROJECT_INSTRUCTIONS.md  Стек, архитектура, правила кода
    ├── DESIGN_SYSTEM.md       Цвета, шрифты, отступы, breakpoints
    ├── COMPONENTS.md          Документация компонентов
    ├── PAGES.md               Список страниц и их секций
    └── PROGRESS.md             Статус работы
```

## Как создать новую страницу

1. Скопируйте структуру из ближайшего готового файла (например, `uslugi/intellektualnaya-sobstvennost/index.html`).
2. В `<head>` подключите нужный page-specific CSS из `assets/css/pages/`.
3. Шапку, мобильное меню, модал, футер берите дословно из `partials/`.
4. Обновите `<title>`, `<meta description>`, breadcrumbs и контент.
5. Добавьте URL в `sitemap.xml`.

## Шапка: два режима

| Режим | Класс на `<header>` | Атрибут `data-state` | Когда |
|---|---|---|---|
| Прозрачная → белая при скролле | `site-header` | `transparent` | Только главная (`/`) |
| Всегда белая | `site-header site-header--always-solid` | `solid` | Все остальные страницы |

`<body>` на внутренних страницах должен иметь класс `page-body-light` —
он включает белый фон и `overflow-x: clip` для sticky-сайдбаров.

## Форма заявки

Открывается на любом элементе с классом `.js-open-consult`.
Один глобальный модал на странице (`#consultModal`) — берётся из `partials/modal.html`.

## Контакты (источник истины — `partials/`)

- Москва: +7 (495) 151-82-82
- Тюмень: +7 (345) 249-25-57
- Email: law@1-tm.ru

При смене контактов — править ТОЛЬКО `partials/header.html`, `partials/footer.html`,
`partials/mobile-menu.html`, `partials/modal.html`, затем переcкопировать в страницы.

## Дизайн-система

Все значения — через CSS-переменные из `tokens.css`. Hex напрямую запрещён.
Отступы — только `--space-N` (шаг 4px). Подробнее — `docs/DESIGN_SYSTEM.md`.

## TODO

См. `docs/PROGRESS.md` (раздел «Что дальше» наверху). Кратко на 9 мая 2026:
все основные страницы готовы. Дальше — Приоритет 4 (3 страницы направлений
для review-вёрстки) и наполнение контентом в WordPress.
