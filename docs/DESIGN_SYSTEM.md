# DESIGN_SYSTEM.md — Дизайн-система FPB

## Принципы
- **Нейтральная база + один акцент:** чёрный / белый / серые + фирменный коричневый
- **Контраст типографики:** крупный serif (Cormorant) + малый sans (DM Sans)
- **Воздух:** щедрые отступы, мало элементов на экране
- **Редакционный стиль:** как в качественном деловом журнале
- Никаких градиентов, теней, скруглений на карточках (только у кнопок и инпутов где необходимо)

---

## Цвета

### Нейтральная палитра
| Токен | HEX | Применение |
|---|---|---|
| `--color-ink` | `#0a0a0a` | Основной текст, заголовки |
| `--color-ink-2` | `#1f1f1f` | Hover состояния тёмного |
| `--color-paper` | `#ffffff` | Основной фон |
| `--color-paper-2` | `#f5f5f5` | Карточки, вторичные поверхности |
| `--color-rule` | `#e5e5e5` | Разделители |
| `--color-rule-strong` | `#cfcfcf` | Усиленные разделители |
| `--color-mute` | `#717171` | Приглушённый текст (подписи, описания) |
| `--color-mute-2` | `#9d9d9d` | Очень приглушённый (мета, placeholder) |

### Фирменный акцент — премиальный коричневый
| Токен | Значение | Применение |
|---|---|---|
| `--color-brand` | `#5a3b25` | Главный акцент: курсивные `<em>` в display, hover-состояния кнопок, иконки в фирменных кружках, **`is-active` в навигации/пагинации/фильтр-чипсах/TOC** |
| `--color-brand-2` | `#6e4a30` | Чуть светлее — hover на самом коричневом фоне |
| `--color-brand-soft` | `rgba(90,59,37,0.10)` | Фоны мелких бэйджей/иконок-кружков, hover-фон |
| `--color-brand-tint` | `rgba(90,59,37,0.06)` | Очень светлый тёплый тинт для крупных поверхностей (aside-card) |
| `--color-brand-rule` | `rgba(90,59,37,0.22)` | Border-разделители внутри фирменных блоков |
| `--color-accent` | = brand | Семантический алиас — использовать в стилях вместо прямого `brand` |
| `--color-accent-fg` | `--color-paper` | Текст на коричневом фоне |

### На тёмном фоне (hero с фото)
| Токен | Значение | Применение |
|---|---|---|
| `--color-on-photo` | `#f4f4f4` | Основной текст на фото |
| `--color-on-photo-mute` | `#cfcfcf` | Приглушённый на фото |
| `--color-on-photo-mute-2` | `#aeaeae` | Метаинфо на фото |
| `--color-on-photo-rule` | `rgba(245,245,245,0.10)` | Разделители на фото |
| `--color-glass` | `rgba(255,255,255,0.20)` | Glass-кнопка (шапка на hero) |
| `--color-glass-hover` | `rgba(255,255,255,0.30)` | Glass-кнопка hover |

### Правило
Все цвета — только через CSS-переменные. Hex напрямую в стилях запрещён.

### Чёрный vs. коричневый — разделение ролей
Чтобы коричневый не «затёрся», роли разнесены:

| Чёрный (`--color-ink`) | Коричневый (`--color-accent`) |
|---|---|
| Основной текст, заголовки | Курсив `<em>` в display |
| Primary CTA (тёмная плашка) | Hover-состояния (кнопки, карточки, ссылки) |
| Цифры stats и крупный numeric-контент | **`is-active` в навигации, пагинации, фильтр-чипсах, TOC** |
| Бэйджи статуса/маркеры (если строгие) | Иконки в фирменных кружках, brand-soft фоны |

«Выбранное / текущее» состояние **всегда** коричневое — независимо от компонента. Чёрный — про структуру и нейтральную авторитарность, коричневый — про эмоциональный акцент и направление взгляда.

---

## Шрифты

```
Google Fonts URL:
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500;700&display=swap
```

| Роль | Семья | Переменная | Применение |
|---|---|---|---|
| Display | Cormorant Garamond | `--font-display` | Заголовки H1–H3, цитаты, акценты |
| Body | DM Sans | `--font-body` | Текст, интерфейс, кнопки |
| Mono | JetBrains Mono | `--font-mono` | Метки, теги, номера, breadcrumbs |

### Типографическая шкала
| Роль | Размер | Трекинг | Высота строки | Семья |
|---|---|---|---|---|
| H1 hero | 74px (clamp до 48px) | -0.03em | 0.95 | display |
| H2 | 56px | -0.02em | 1.0 | display |
| H3 | 32px | -0.02em | 1.05 | display |
| Body | 16px | — | 1.45 | body |
| Nav | 14px | -0.02em | 1 | body |
| Button | 14px | -0.02em | 1 | body |
| Meta / mono | 12px | -0.02em | 1 | mono |

**Правило курсива:** `<em>` внутри display-заголовков — курсив Cormorant, цвет `--color-accent` (фирменный коричневый) на светлых фонах, `--color-on-photo-mute` на тёмных. Используется для стилистического акцента ключевых слов.

---

## Отступы

База: **4px**. Все отступы кратны 4.

| Токен | px | Типичное применение |
|---|---|---|
| `--space-1` | 4px | gap между иконкой и текстом |
| `--space-2` | 8px | внутренние отступы маленьких элементов |
| `--space-3` | 12px | gap в nav-списках |
| `--space-4` | 16px | padding карточек (малый) |
| `--space-5` | 20px | padding кнопок по горизонтали |
| `--space-6` | 24px | gap между блоками в строке |
| `--space-8` | 32px | padding секций (малый) |
| `--space-10` | 40px | padding кнопок, gap колонок |
| `--space-12` | 48px | padding секций |
| `--space-16` | 64px | padding крупных секций |
| `--space-20` | 80px | padding hero-секций |
| `--space-24` | 96px | padding самых крупных секций |

---

## Layout

| Токен | Значение | Описание |
|---|---|---|
| `--container` | 1180px | Максимальная ширина контента |
| `--gutter` | 32px → 24px → 20px | Горизонтальные поля (уменьшаются на tablet/mobile) |
| `--header-h` | 108px | Высота шапки desktop (топбар 38px + main 68px + границы) |
| `--header-h-mobile` | 64px | Высота шапки mobile (без топбара) |
| `--control-h` | 40px | Высота стандартных контролов |
| `--btn-h` | 40px | Высота кнопок |

---

## Breakpoints

| Название | max-width | Изменения |
|---|---|---|
| Tablet | 1024px | Скрывается топбар и десктопная навигация, появляется бургер; `--gutter: 20px` |
| Mobile | 640px | Одна колонка везде, `--gutter: 20px`, шапки у форм упрощаются |
| Small | 480px | Дополнительные уменьшения типографики |

**Шапка на mobile:** только логотип + кнопка бургера. Топбар (телефоны, email, язык) скрыт.

---

## Анимации

| Токен | Значение | Применение |
|---|---|---|
| `--dur-fast` | 150ms | hover эффекты, opacity |
| `--dur` | 250ms | transitions layout (шапка, меню) |
| `--ease` | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Все transitions |

Правило: анимировать только `opacity`, `transform`, `color`, `background`, `box-shadow`. Никогда `width`/`height` напрямую — только через `grid-template-rows: 0fr → 1fr`.

---

## Иконки
SVG inline, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.4–1.5"`.
Размеры: 16×16, 20×20, 24×24. Всегда `aria-hidden="true"` если декоративная.

---

## Состояния интерактивных элементов
- **hover:** `opacity: 0.65–0.7` на ссылках; смена `background` на кнопках
- **focus-visible:** `outline: 2px solid currentColor; outline-offset: 3px`
- **active:** `transform: translateY(0.5px)` на кнопках
- **disabled:** `opacity: 0.4; pointer-events: none`
- **placeholder:** `color: --color-mute-2`
- **field focus:** нижняя граница инпута меняется с `--color-rule-strong` на `--color-ink`

---

## Паттерны UI (единые для всех страниц)

Эти правила — единственный источник истины для решения «как должен выглядеть X». Никаких альтернативных вариантов, никаких inline-стилей, никаких hardcoded размеров на странице.

### 1. Размеры заголовков
- **H1** (только hero-страниц) — `var(--text-h1-size)` (74px → 56 → 40 на мобиле), weight 500, display.
- **H2** (крупные page-секции — «Журнал», «О бюро» на главной) — `var(--text-h2-size)` (56px → 40 → 30), weight 500, display.
- **H3** (подразделы внутри страницы — секции направления, related, case-related, dir-block) — `var(--text-h3-size)` (32px → 28 на мобиле), weight 500, display.
- **Курсив em** в любом заголовке — `font-style: italic; color: var(--color-accent); font-weight: 500` (не 600). Применяется к последним 1-2 словам.

**Не использовать** inline `font-size: 36px/40px/48px` на заголовках. Только токены.

### 2. Карточка
Два типа, не больше:
- **line-card** — без фона, отделена `border-bottom: 1px solid var(--color-rule)`. Для длинных списков (журнал, team, dela).
- **tint-card** — на фоне `var(--color-paper)` внутри секции `var(--color-brand-tint)`. Padding `--space-6`. Без border. Для блоков «Популярные услуги», `.aside-card`.

Запрещены: рамки со всех 4 сторон, рамки с 2-3 сторон, фоны `#ebebeb`/`#f3eee5`/произвольные.

### 3. Hover интерактивной строки/карточки
**Везде один паттерн:**
- Фон → `var(--color-brand-soft)`
- Акцентный текст (название, стрелка) → `var(--color-accent)`
- `transition: var(--dur-fast) var(--ease)` на `background-color` и `color`

Серый `--color-paper-2` для hover **не используется**.

### 4. Meta-строка / индекс
Один паттерн через mono 12px, `letter-spacing: 0.08em`:
- **Индекс** (число `01`, `01 / ИС`) — цвет `var(--color-accent)`.
- **Метка/счётчик** («28 услуг», «Партнёр направления») — цвет `var(--color-mute)`.

Eyebrow с горизонтальной чёрточкой (`.eyebrow`) — **только** в шапке секции (hero, cta-final). Inline meta строки — без чёрточки.

### 5. Разделители секций
- Тонкая `1px solid var(--color-rule)` между равными по весу блоками.
- `var(--color-rule-strong)` только для больших границ «начало/конец большой группы».
- **Запрещено**: border-top + border-bottom + border-right на одном гриде (как было на office-cards). Используем gap, не рамки.
- **Запрещено**: border-bottom на ul + border-top на :first-child через negative-margin хаки. Делаем border-top на самом ul.

### 6. Иконки и стрелки
- Только из `assets/icons/sprite.svg` через `<use href="...#name"/>`.
- **Запрещено** дублировать inline SVG для одинаковых иконок (особенно arrow-right в списках).
- Размеры через CSS на родителе (`width`/`height` на `.icon` или классе элемента).

### 7. Фон секций
Альтернация белый ↔ `var(--color-brand-tint)`. Серый `--color-paper-2` — только для блочных плейсхолдеров (карта на /kontakty/), не как фон полной секции. На мобиле тинт **не отключаем** — паттерн един с десктопом.

**Ловушка**: на главной (`/index.html`) `<body>` не имеет класса `page-body-light`, поэтому `html { background: var(--color-ink) }` остаётся чёрным. Если на такой странице применить `--color-brand-tint` (rgba) к секции, альфа-канал композируется с чёрным фоном страницы → визуально получается *тёмный коричневатый*, а не светлый бежевый. Решение: на тёмно-body страницах использовать **сплошные предкомпонованные цвета** (см. `.section.cases` в `home.css` — `#faf9f8` ≈ 3% коричневого поверх белого, `#efebe9` ≈ 10% для hover). Все остальные страницы имеют `body.page-body-light` → rgba-токены работают как ожидается.

**Brand-секция** (`.about--brand` на главной) — сплошной `var(--color-brand)` фон, контент инвертируется (paper + on-photo-mute), em → on-photo-mute (не accent — правило DS для тёмных фонов). Реализована как «brown beat» перед финальным CTA.

### 8. Текстовая гиперссылка (`.text-link`)
**Единый стиль** для inline-ссылок в теле текста (article-prose, legal-page__content, case-stage__body, about-intro__text, checkbox-согласие, search-suggest empty-state):

- Норма: `color: var(--color-ink)`, `text-decoration: underline` (1px, color `--color-rule-strong`, offset 3px)
- Hover: `color: var(--color-accent)`, `text-decoration-color: var(--color-accent)` (правило «hover = коричневый»)

Реализовано одним правилом в `components.css` через групповой селектор `.text-link, .article-prose a, .legal-page__content a, ...`. Утилита `.text-link` — для точечной разметки одиночных inline-ссылок.

**Не использовать**: `border-bottom` для подчёркивания (сдвигает layout, не ломается по строкам), per-page переопределения цвета/толщины, hover через `opacity` для текстовых ссылок (только для иконок/кнопок).

Ссылки в навигации (`.aside-nav__link`, `.article-toc__list a`, `.legal-toc__list a`, `.footer__list a`, `.mega__list a`) — **отдельный паттерн** (color: mute → ink/accent), `.text-link` к ним не применяется.
