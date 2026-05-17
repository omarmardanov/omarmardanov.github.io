# WORDPRESS.md — Перенос сайта 1-tm.ru на WordPress

> **Полная инструкция для WP-разработчика.** Если выполнить всё, что здесь
> написано, — сайт работает 1:1 как статичная версия, заказчик удобно редактирует
> контент через админку, дизайн совпадает с эталоном.
>
> Архитектурные решения уже приняты — выбирать ничего не нужно. Следуйте плану.

---

## 0. Что должно получиться (требования заказчика)

1. **Все 18 страниц** сайта (главная, /uslugi/, /uslugi/{направление}/, единичные услуги, /dela/, /zhurnal/, /o-byuro/, /kontakty/, /mktu/, /poisk/, /legal/×5) работают на WordPress. Верстка 1:1 со статичными HTML — без визуальных регрессий.
2. **Заказчик через админку** добавляет/редактирует:
   - Услуги (~110 страниц по шаблону)
   - Специализации (10 отраслевых/судебных лендингов)
   - Кейсы (40+)
   - Статьи журнала
   - Классы МКТУ (45)
   - Сотрудников (карточки на `/o-byuro/#team`)
   - Глобальные тексты (телефоны, адреса, реквизиты, тексты footer/hero)
3. **Спец. компоненты дизайна** (facts-strip, FAQ-аккордеон, callout «Что важно знать», прайс-таблица, метрики кейса, italic-акцент в H1) — структурированные ACF-поля, не свободный HTML. Заказчик не может сломать дизайн.
4. **Со старого 1-tm.ru** настроены 301 redirects на новые URL — без потерь SEO.
5. **Дизайн** — CSS/JS из репозитория без изменений (`assets/css/`, `assets/js/`, `assets/icons/sprite.svg`). Тема только подключает их.

---

## 1. Стек

- **WordPress** 6.4+ (последняя стабильная)
- **PHP** 8.2+
- **MySQL/MariaDB** актуальная
- **ACF Pro** — обязательно. Все структурированные поля идут через него. Без ACF Pro заказчик увидит свободный HTML-редактор и сломает дизайн через неделю.
- **Yoast SEO** или **Rank Math** — meta tags, sitemap.xml, OG-теги
- **UpdraftPlus** — ежедневные бэкапы
- **Wordfence** или **iThemes Security** — безопасность
- **WP Super Cache** или **W3 Total Cache** — кэширование
- **Redirection** — для 301 redirects со старого сайта
- **HTTPS** обязательно (Let's Encrypt)

**НЕ ставить:** Elementor, Divi, WPBakery, Beaver Builder — любой визуальный конструктор конфликтует с дизайном и не нужен. Тема кастомная.

---

## 2. Кастомная тема

Имя темы: `gmip` (или `one-tm`, на ваш вкус). Создаётся в `wp-content/themes/{name}/`.

### Что копировать из репозитория в тему

```
wp-content/themes/gmip/
├── assets/                       ← целиком из репо
│   ├── css/
│   ├── js/
│   ├── icons/sprite.svg
│   └── images/
├── template-parts/               ← из репо partials/, переименовать
│   ├── header.php                ← из partials/header.html
│   ├── footer.php                ← из partials/footer.html
│   ├── mobile-menu.php           ← из partials/mobile-menu.html
│   ├── modal.php                 ← из partials/modal.html
│   ├── cookie-banner.php         ← из partials/cookie-banner.html
│   └── head.php                  ← из partials/head.html (meta, fonts, OG)
├── (шаблоны страниц, см. §3)
├── functions.php
├── style.css                     ← только заголовок темы, импорт base.css
├── screenshot.png
└── theme.json                    ← см. §10
```

### `style.css` (заголовок темы)

```css
/*
Theme Name: GMIP
Description: Тема для патентного бюро «Галифанов, Мальков и Партнёры»
Version: 1.0.0
*/
@import url('assets/css/tokens.css');
@import url('assets/css/base.css');
@import url('assets/css/components.css');
/* и т.д., либо подключать через wp_enqueue_style */
```

Рекомендуется enqueue через `functions.php`, не `@import` — даёт версионирование.

### `functions.php` — что обязательно

- `add_theme_support('post-thumbnails')`
- `add_theme_support('title-tag')`
- Регистрация CPT (см. §4)
- Регистрация таксономий (см. §5)
- `wp_enqueue_scripts` для всех CSS/JS из `assets/`
- Регистрация ACF Field Groups (см. §6) — через PHP или JSON-импорт
- `allowed_block_types_all` фильтр (см. §10)
- Регенерация поискового индекса (см. §11)
- Создание Options Page для глобальных настроек (см. §6.7)

---

## 3. Шаблоны страниц (template hierarchy)

Структура файлов темы:

| Файл темы | URL | Источник статики |
|---|---|---|
| `front-page.php` | `/` | `index.html` |
| `page-uslugi.php` | `/uslugi/` | `uslugi/index.html` |
| `taxonomy-direction.php` | `/uslugi/{направление}/` | `uslugi/intellektualnaya-sobstvennost/index.html` |
| `single-service.php` | `/uslugi/{...}/{slug}/` | `uslugi-shablon/index.html` |
| `archive-dela_case.php` | `/dela/` | `dela/index.html` |
| `single-dela_case.php` | `/dela/{slug}/` | `dela/vzyskanie-kompensatsii-fmcg/index.html` |
| `home.php` | `/zhurnal/` | `zhurnal/index.html` |
| `single.php` | `/zhurnal/{slug}/` | `zhurnal/ekspertiza-tovarnyh-znakov-2026/index.html` |
| `page-o-byuro.php` | `/o-byuro/` | `o-byuro/index.html` |
| `page-kontakty.php` | `/kontakty/` | `kontakty/index.html` |
| `archive-mktu_class.php` | `/mktu/` | `mktu/index.html` |
| `single-mktu_class.php` | `/mktu/klass-{N}/` | `mktu/klass-41/index.html` |
| `page-poisk.php` | `/poisk/` | `poisk/index.html` |
| `page-legal.php` | `/legal/{slug}/` | `legal/privacy/index.html` (универсальный для 5 документов) |
| `header.php`, `footer.php` | inclusions | partials |
| `404.php` | not found | `404.html` — кастомный тёмный hero, переиспользует фон `.cta-final__bg`, типографика «Здесь *ничего нет*» + кнопки «На главную» / «Открыть поиск». Не статичная заглушка — порт 1:1, см. `assets/css/pages/404.css` |

**Правило переноса:** каждый HTML-шаблон превращается в PHP, статичные данные заменяются на `the_field()`, `the_title()`, циклы и т.д. Структура DOM сохраняется 1:1.

---

## 4. Custom Post Types

Регистрировать в `functions.php` через `register_post_type`.

```php
// Услуга
register_post_type('service', [
  'labels' => ['name' => 'Услуги', 'singular_name' => 'Услуга'],
  'public' => true,
  'has_archive' => false,
  'rewrite' => ['slug' => 'uslugi', 'with_front' => false],
  'supports' => ['title', 'thumbnail', 'revisions', 'excerpt'],
  'menu_icon' => 'dashicons-portfolio',
  'show_in_rest' => true,
]);

// Кейс
register_post_type('dela_case', [
  'labels' => ['name' => 'Дела', 'singular_name' => 'Дело'],
  'public' => true,
  'has_archive' => true,
  'rewrite' => ['slug' => 'dela', 'with_front' => false],
  'supports' => ['title', 'thumbnail', 'revisions'],
  'menu_icon' => 'dashicons-hammer',
]);

// Класс МКТУ
register_post_type('mktu_class', [
  'labels' => ['name' => 'Классы МКТУ', 'singular_name' => 'Класс МКТУ'],
  'public' => true,
  'has_archive' => true,
  'rewrite' => ['slug' => 'mktu', 'with_front' => false],
  'supports' => ['title'],
  'menu_icon' => 'dashicons-list-view',
]);

// Сотрудник (закрытый CPT — карточки выводятся внутри /o-byuro/)
register_post_type('team_member', [
  'labels' => ['name' => 'Команда', 'singular_name' => 'Сотрудник'],
  'public' => false,
  'show_ui' => true,
  'show_in_menu' => true,
  'supports' => ['title', 'thumbnail'],
  'menu_icon' => 'dashicons-groups',
]);

// Книга основателей (для блока на главной)
register_post_type('book', [
  'labels' => ['name' => 'Книги', 'singular_name' => 'Книга'],
  'public' => false,
  'show_ui' => true,
  'supports' => ['title', 'thumbnail'],
  'menu_icon' => 'dashicons-book',
]);
```

Журнал — стандартный `post`. Юр. документы (/legal/…), главная, /o-byuro/, /kontakty/, /uslugi/, /poisk/ — обычные `page`.

---

## 5. Таксономии

### `direction` (иерархическая, для услуг)

Двухуровневая: **направление → раздел**. Услуги привязываются к разделу (или сразу к направлению — для гибких случаев).

```php
register_taxonomy('direction', 'service', [
  'labels' => ['name' => 'Направления', 'singular_name' => 'Направление'],
  'hierarchical' => true,
  'rewrite' => ['slug' => 'uslugi', 'with_front' => false],
  'show_in_rest' => true,
]);
```

**4 направления (термины верхнего уровня):**
| Slug | Название UI |
|---|---|
| `intellektualnaya-sobstvennost` | Интеллектуальная собственность |
| `dogovory-i-sdelki` | Договоры и сделки |
| `spory-i-zashchita` | Споры и защита |
| `soprovozhdenie-biznesa` | Сопровождение бизнеса |

**Разделы внутри направлений (термины с parent):**
Список — у заказчика, заполняется по `docs/content-templates/02-napravlenie.md`. Пример для ИС:
- `tovarnye-znaki` — Товарные знаки
- `patenty` — Патенты
- `avtorskoe-pravo` — Авторское право
- `litsenzii` — Лицензии и роялти
- ...

### `case_category` (плоская)

Категории кейсов. Слаги:
`tovarnye-znaki`, `patenty`, `avtorskoe-pravo`, `korporativnye`, `nalogovye`, `fas`, `bankrotstvo`, `goszakupki`.

```php
register_taxonomy('case_category', 'dela_case', [
  'hierarchical' => false,
  'rewrite' => ['slug' => 'dela-category'],
]);
```

### `journal_topic` (плоская)

Темы статей. Слаги:
`tovarnye-znaki`, `patenty`, `avtorskoe-pravo`, `spory`, `nalogi`, `bankrotstvo`, `goszakupki`, `korp-pravo`, `dogovory`.

```php
register_taxonomy('journal_topic', 'post', [
  'hierarchical' => false,
  'rewrite' => ['slug' => 'zhurnal-topic'],
]);
```

---

## 6. ACF Field Groups — главное для UX

**Это сердце всей работы.** Чтобы заказчик редактировал контент удобно, каждое поле в админке должно быть структурированным, понятным и с подсказкой.

> Все Field Groups можно экспортировать в JSON и хранить в `assets/acf-json/` —
> ACF Pro поддерживает синхронизацию из JSON. Тогда изменения в полях лежат в git.

### 6.1 Field Group: «Услуга — Hero и факты»

Привязка: `post_type == service`.

| Поле | Тип | Обязательно | Подсказка |
|---|---|---|---|
| `eyebrow` | text | ✓ | Моно-метка над H1 (3–6 слов). Пример: «Товарные знаки · ИС» |
| `h1_emphasis` | text | — | Слово/фраза для курсива в H1. Для H1 «Регистрация товарного знака **в Роспатенте**» — введите «в Роспатенте». Тема обернёт в `<em>` |
| `lead` | textarea (rows 3) | ✓ | Лид-абзац под H1, 150–400 символов |
| `facts` | repeater (min 3, max 3) | ✓ | Ровно 3 ячейки: `label` (text ≤15 симв.) + `value` (text ≤25 симв.) |
| `aside_card_title` | text | — | Призыв в правом блоке («Бесплатная оценка шансов») |
| `aside_card_text` | textarea | — | 1–2 предложения о том, что произойдёт после клика |
| `aside_card_cta` | text | — | Текст кнопки (2–4 слова) |
| `is_specialization` | true/false | — | Включить, если это отраслевой/судебный лендинг (см. §7) |

### 6.2 Field Group: «Услуга — Контентные блоки»

Привязка: `post_type == service`. Тип группы — **Flexible Content**.

Заказчик жмёт «Добавить блок» и выбирает один из шаблонов:

#### Блок «H2-секция (свободный текст)»
| Поле | Тип |
|---|---|
| `heading` | text — заголовок H2 |
| `heading_emphasis` | text (опц.) — italic-акцент |
| `body` | WYSIWYG (Gutenberg или TinyMCE) — допускает H3, списки, цитаты, ссылки |

#### Блок «Что входит»
| Поле | Тип |
|---|---|
| `intro` | textarea (опц.) — вводный абзац |
| `items` | repeater: `text` (textarea) — пункт списка |

Рендерится как `<ul class="service-list">`.

#### Блок «Этапы работы»
| Поле | Тип |
|---|---|
| `items` | repeater: `name` (text) + `description` (textarea) + `duration` (text) |

Рендерится как нумерованный список с метками сроков.

#### Блок «Стоимость и пошлины»
| Поле | Тип |
|---|---|
| `rows` | repeater: `item` (text — название позиции) + `price` (text — сумма) |
| `total_label` | text (по умолчанию «Итого») |
| `total_value` | text |
| `note` | textarea (опц.) — пояснение под таблицей |

Рендерится как `<table class="pricing">` с разделением «бюро / пошлины» через `row_type` (опц.).

#### Блок «FAQ»
| Поле | Тип |
|---|---|
| `items` | repeater: `question` (text) + `answer` (WYSIWYG) |

Рендерится как `<details class="faq__item">…</details>`.

#### Блок «Callout — Что важно знать» (используется в статьях, но также доступен и здесь)
| Поле | Тип |
|---|---|
| `title` | text (по умолчанию «Что важно знать») |
| `body` | textarea |

### 6.3 Field Group: «Кейс»

Привязка: `post_type == dela_case`.

| Поле | Тип | Подсказка |
|---|---|---|
| `eyebrow` | text | Категории кейса через «·», например «Товарные знаки · ИС» |
| `h1_emphasis` | text | Italic-акцент в H1 |
| `case_number` | text | Номер дела: «А40-128456/24» |
| `jurisdiction` | text | «Арбитраж · Москва» / «СИП · Москва» |
| `period` | text | Год или диапазон: «2024–2025» |
| `result_label` | text | 1–3 слова: «Взыскано», «Снято доначислений» |
| `result_value` | text | Короткое значение: «12,4 млн ₽», «100%» |
| `result_description` | textarea | 1 предложение под крупным числом |
| `task` | WYSIWYG | Задача — 200–500 слов |
| `solution` | WYSIWYG | Решение — 300–700 слов |
| `result_body` | WYSIWYG | Результат — 100–300 слов |
| `metrics` | repeater (ровно 3) | `name` (text) + `value` (text) |
| `cta_eyebrow` | text | Для CTA-final внизу кейса |
| `cta_h2` | text | |
| `cta_h2_emphasis` | text (опц.) | Italic-акцент в H2 CTA |
| `cta_lead` | textarea | |
| `consent_file` | file (опц.) | PDF с согласием клиента — внутренний |

### 6.4 Field Group: «Статья журнала»

Привязка: `post_type == post`.

| Поле | Тип |
|---|---|
| `h1_emphasis` | text — italic-акцент |
| `lead` | textarea — лид-абзац (250–500 симв.) |
| `reading_time` | text — например «12 мин чтения» (можно автоматизировать через хук) |
| `author` | post relation (CPT `team_member`) — выбор из списка сотрудников |
| `cta_eyebrow`, `cta_h2`, `cta_h2_emphasis`, `cta_lead` | text/textarea — CTA-final под контекст статьи |

Тело статьи — **стандартный Gutenberg editor** (с ограничениями §10).

### 6.5 Field Group: «Класс МКТУ»

Привязка: `post_type == mktu_class`.

| Поле | Тип |
|---|---|
| `class_number` | number (1–45) |
| `short_description` | text (50–150 симв.) — для каталога |
| `terms_list` | WYSIWYG — полный перечень товаров/услуг |
| `related_services` | post relationship (CPT `service`, multiple) |
| `related_cases` | post relationship (CPT `dela_case`, multiple) |

### 6.6 Field Group: «Сотрудник»

Привязка: `post_type == team_member`.

| Поле | Тип | Подсказка |
|---|---|---|
| `first_name` | text | Имя |
| `last_name` | text | Фамилия (title поста собирается автоматически) |
| `role` | text | Только должность — без `·`, статуса, региона. Пример: «Партнёр», «Старший юрист» |
| `status` | text (опц.) | «Патентный поверенный РФ», «Адвокат · АП Москвы». Пропустить, если нет |
| `experience_years` | number (опц.) | Только если ≥ 3 |
| `city` | select | Москва / Тюмень |
| `specialization` | text (опц.) | «Товарные знаки, патенты» |
| `photo` | image — required size 1000×1000 | Серый фон `#F0EEEA`. См. `docs/content-templates/07-sotrudnik.md` |
| `order` | number | Сортировка в гриде |

### 6.7 Options Page: «Общие настройки сайта»

Создать через `acf_add_options_page` в `functions.php`. Здесь — то, что один раз настраивается и используется по всему сайту.

```php
acf_add_options_page([
  'page_title' => 'Общие настройки сайта',
  'menu_slug'  => 'site-settings',
  'capability' => 'manage_options',
  'icon_url'   => 'dashicons-admin-settings',
]);
```

**Поля:**

| Группа | Поля |
|---|---|
| **Контакты** | `phone_moscow`, `phone_tyumen`, `email_main`, `address_moscow`, `address_tyumen` |
| **Мессенджеры** | `whatsapp_number`, `whatsapp_link`, `telegram_username`, `telegram_link` |
| **Соцсети** | `telegram_channel_handle` (`@urberau`), `telegram_channel_link` |
| **Реквизиты** | `legal_name`, `inn`, `kpp`, `ogrn`, `legal_address`, `bank_name`, `account_number`, `bik`, `kor_account` — для `/legal/rekvizity/` |
| **Footer** | `footer_about` (textarea), `copyright_year` |
| **Cookie** | `cookie_banner_text` (опц., можно хардкод) |
| **Главная Hero** | `home_hero_title_pre`, `home_hero_title_emphasis`, `home_hero_lead` |
| **CTA по умолчанию** | `default_cta_eyebrow`, `default_cta_h2`, `default_cta_lead` — fallback для страниц без своего CTA |

### 6.8 Field Group: «Главная страница»

Привязка: `page == главная` (через post ID или slug).

| Секция | Поля |
|---|---|
| Hero | `hero_title_html` (text — с допустимыми `<em>` для italic), `hero_subtitle` (textarea), `hero_bg_image` (image), `hero_cta_primary` (text), `hero_cta_secondary` (text + link) |
| Направления | автоматически из таксономии `direction` (не редактируется здесь) |
| Процесс | repeater: `step_number` + `name` + `description` |
| Дела | `featured_cases` (post relation — выбор 3 кейсов вручную) или `auto` (3 последних) |
| Журнал | `featured_articles` (post relation — выбор 3) или `auto` |
| Книги | repeater из CPT `book` (или прямо здесь): `title`, `cover_image`, `price`, `whatsapp_text`, `telegram_text` |
| About | `about_title`, `about_text`, `about_image`, `team_link_text` |
| Партнёры (Нам доверяют) | gallery (SVG-логотипы клиентов) + per-logo поле `scale` (число для балансировки размера) |
| CTA-final | `cta_eyebrow`, `cta_h2`, `cta_h2_emphasis`, `cta_lead` |

### 6.9 Field Group: «Юридический документ»

Привязка: `page` с `page_template == page-legal.php`.

| Поле | Тип |
|---|---|
| `document_number` | number (1–5) — для eyebrow «Документ № N из 5» |
| `edition_date` | date — для lead «Редакция от…» |
| `toc_items` | repeater: `anchor_id` + `title` — Table of Contents |
| `body` | WYSIWYG — основной текст документа |

---

## 7. Специализации (10 страниц) — особый случай

Отраслевые/судебные лендинги (`/uslugi/patenty-v-meditsine/`, `/uslugi/spory-v-sip/` и т.д.).

**Технически это CPT `service`** с особенностями:
- `is_specialization` (ACF, true/false) — если true:
  - URL: `/uslugi/{slug}/` (один уровень — без направления и раздела)
  - Не привязан к таксономии `direction`
  - Шаблон тот же — `single-service.php`
  - Дополнительная H2-секция «Особенности отрасли/суда» обязательна

**В админке** для этих 10 страниц редактор включает `is_specialization`, и страница не требует выбора направления. Slug фиксируется по списку:

| Slug |
|---|
| `patenty-v-selskom-khozyaystve` |
| `patenty-v-meditsine` |
| `patenty-v-farmacevtike` |
| `patenty-v-neftegaze` |
| `patenty-v-promyshlennosti` |
| `predstavitelstvo-v-sip` |
| `spory-v-arbitrazhnom-sude` |
| `spory-v-fas` |
| `spory-v-palate-po-patentnym-sporam` |
| `spory-v-verhovnom-sude` |

**Rewrite rules:** для `is_specialization=true` посты идут по короткому URL, для остальных — по полному с направлением. Реализуется через фильтр `post_type_link`:

```php
add_filter('post_type_link', function($url, $post) {
  if ($post->post_type !== 'service') return $url;
  if (get_field('is_specialization', $post->ID)) {
    return home_url('/uslugi/' . $post->post_name . '/');
  }
  // полный путь с направлением и разделом
  $terms = wp_get_post_terms($post->ID, 'direction');
  // собираем направление и раздел
  return home_url('/uslugi/' . $direction_slug . '/' . $section_slug . '/' . $post->post_name . '/');
}, 10, 2);
```

И регистрация rewrite rule для коротких URL спец-страниц.

---

## 8. Мегаменю и навигация

В шапке — мегаменю с 4 колонками направлений + полоса «Специализация» (10 ссылок).

**Реализация:**
1. **4 колонки направлений** — динамически: для каждого `direction` (parent=0) выводим его дочерние термины (разделы) + первые N услуг из раздела с количеством через `wp_count_posts` или `count(get_posts(...))`.
2. **Полоса «Специализация»** — 10 ссылок на спец-страницы. Можно:
   - Хардкодить в `template-parts/header.php` (10 ссылок неизменны)
   - Либо через ACF Options Page «Mega menu — specializations» (repeater с 10 элементами)
   Хардкод проще и достаточен.
3. **Mobile menu** — та же структура в `template-parts/mobile-menu.php`, с drill-down уровнями (см. `assets/js/main.js`).

---

## 9. Партиалы темы (template parts)

Содержимое `partials/` репозитория → `template-parts/` темы. Переводим HTML в PHP с подстановками ACF Options:

**`template-parts/header.php`** — шапка. Телефон/email из `get_field('phone_moscow', 'option')`, мегаменю из таксономии, мобильное меню инклудится.

**`template-parts/footer.php`** — футер. 4 колонки: brand, направления (динамически), специализация (хардкод 10 ссылок), бюро. Контакт-rail внизу с 4 ячейками (Москва, Тюмень, Email, Мессенджеры) — все из ACF Options.

**`template-parts/modal.php`** — модал консультации. Контакты в нём также из ACF Options.

**`template-parts/cookie-banner.php`** — explicit consent с 2 категориями. JS-логика — в `assets/js/main.js` (`window.hasAnalyticsConsent`, `window.cookieConsentReset`). Текст из ACF Options.

**`template-parts/head.php`** — `<head>` блок: meta, OG, Twitter Card, шрифты, иконки favicon. Все meta-теги динамические:
- `<title>` — Yoast/Rank Math + ACF fallback
- `<meta name="description">` — Yoast/Rank Math + ACF fallback
- `<link rel="canonical">` — Yoast (на www → без www)
- `og:image` — `/assets/images/og-default.png` по умолчанию, ACF override per-page
- `theme-color` — `#0a0a0a` для мобильного статус-бара

---

## 10. Ограничения Gutenberg (чтобы клиент не сломал дизайн)

В `functions.php`:

```php
// Разрешённые блоки
add_filter('allowed_block_types_all', function($allowed, $editor_context) {
  return [
    'core/paragraph',
    'core/heading',     // H2, H3 — стилизуются нашим CSS
    'core/list',
    'core/list-item',
    'core/quote',       // <blockquote> — стилизуется как .article-prose blockquote
    'core/image',
    'core/table',
    'core/separator',
    'core/embed',       // YouTube и т.п.
  ];
}, 10, 2);
```

**Запрещены:** Cover, Media&Text, Buttons, Columns, Spacer, Group, Cover Image. Они либо ломают дизайн, либо не нужны.

В `theme.json` отключить кастомизацию:

```json
{
  "version": 2,
  "settings": {
    "color": {
      "custom": false,
      "customGradient": false,
      "background": false,
      "text": false,
      "link": false
    },
    "typography": {
      "customFontSize": false,
      "dropCap": false,
      "lineHeight": false,
      "fontStyle": false,
      "letterSpacing": false
    },
    "spacing": {
      "padding": false,
      "margin": false
    }
  }
}
```

**Результат:** клиент в Gutenberg видит только базовые блоки и базовое форматирование (жирный, курсив, ссылка, выделение). Цвет, размер шрифта, отступы — недоступны. Дизайн контролирует тема.

**Кастомные блоки (callout «Что важно знать», facts strip и т.д.) — не нужны.** Они реализованы через ACF (см. §6).

---

## 11. Поиск

JS-логика в `assets/js/search.js` — рисует UI, делает фильтрацию. Ему нужен JSON-индекс.

**Эндпоинт:** `/wp-content/themes/{name}/assets/search/index.json`

**Генерация:**

```php
add_action('save_post', 'gmip_regenerate_search_index');
add_action('delete_post', 'gmip_regenerate_search_index');
add_action('wp_update_term', 'gmip_regenerate_search_index');

function gmip_regenerate_search_index() {
  $index = [];
  $post_types = ['service', 'dela_case', 'mktu_class', 'post'];
  foreach ($post_types as $type) {
    $posts = get_posts(['post_type' => $type, 'numberposts' => -1, 'post_status' => 'publish']);
    foreach ($posts as $p) {
      $excerpt = $p->post_excerpt ?: wp_trim_words(strip_tags($p->post_content), 30);
      $index[] = [
        'id' => $p->ID,
        'type' => $type,
        'title' => get_the_title($p),
        'excerpt' => $excerpt,
        'url' => get_permalink($p),
        'category' => wp_get_post_terms($p->ID, $type === 'dela_case' ? 'case_category' : ($type === 'post' ? 'journal_topic' : 'direction'), ['fields' => 'slugs']),
      ];
    }
  }
  $path = get_template_directory() . '/assets/search/index.json';
  file_put_contents($path, json_encode($index, JSON_UNESCAPED_UNICODE));
}
```

Учитывать права на запись в `assets/search/`. На продакшене может быть нужен writable storage и хук на регенерацию.

---

## 12. Миграция со старого 1-tm.ru

### Контент

1. **Определить старую CMS.** Если WP — экспорт через WP Importer (XML). Если другое (Bitrix, Joomla, кастом) — выгрузка скриптом или ручной перенос.
2. **Маппинг URL** старых страниц на новые — см. ниже.
3. **Изображения** — перенести в Media Library или копировать в `assets/images/migrated/`.

### URL Redirects (критично для SEO)

301 redirects настроить через плагин **Redirection** или `.htaccess`. Полный список — задача WP-разработчика после анализа старого сайта. Примеры паттернов:

| Старый URL | Новый URL |
|---|---|
| `/services/registratsiya-tovarnogo-znaka` | `/uslugi/intellektualnaya-sobstvennost/tovarnye-znaki/registratsiya-tovarnogo-znaka/` |
| `/news/123-statya` | `/zhurnal/{новый-slug}/` |
| `/portfolio/case-fmcg` | `/dela/vzyskanie-kompensatsii-fmcg/` |
| `/about` | `/o-byuro/` |
| `/contacts` | `/kontakty/` |

**Обязательно сохранить:** все URL, по которым приходит трафик из Яндекса/Google. Перед запуском выгрузить из Метрики/GA топ-200 страниц и убедиться, что для каждой есть redirect.

### XML sitemap

Yoast/Rank Math генерируют автоматически. Проверить:
- Покрывает все CPT (`service`, `dela_case`, `mktu_class`, `post`, `team_member`-NO)
- Покрывает все статичные страницы
- Покрывает таксономии (`direction`, `case_category`, `journal_topic`)
- НЕ включает /poisk/ и /legal/cookies/-консент-страницы (если такие есть)

### robots.txt

Из репо `robots.txt` — без изменений. После запуска проверить, что Yoast не перезаписывает его автоматически.

### Проверка 404

После запуска прогнать инструмент типа **Screaming Frog SEO Spider** по новому сайту с импортом списка старых URL. Все 404 — закрыть redirect'ами или прямой публикацией контента.

---

## 13. SEO

### Meta теги

Через Yoast SEO или Rank Math — на каждой странице доступны поля:
- SEO title (≤ 65 символов)
- Meta description (130–160 символов)
- OG image (1200×630)
- Twitter Card

Дополнительно через ACF (на случай если хочется обойтись без Yoast — не рекомендую):
- `seo_title` (text)
- `seo_description` (textarea)
- `og_image` (image)

### Canonical

Все страницы → канонический URL без `www`, с `https://`. Yoast делает это автоматически.

### Schema.org

Yoast Premium добавляет Organization, BreadcrumbList, Article schema. Минимально нужно:
- `Organization` на главной (LegalService, с адресами Москвы и Тюмени)
- `BreadcrumbList` на внутренних страницах
- `Article` на статьях журнала

---

## 14. Производительность

- **Object cache** (Redis) — если хостинг поддерживает
- **Page cache** — WP Super Cache в режиме mod_rewrite
- **Image optimization** — Imagify или ShortPixel: WebP с fallback на JPG
- **CSS/JS** — НЕ минифицировать через плагины. Файлы из репо уже модульные. Только включить gzip на сервере и `Cache-Control: max-age=31536000` для `/assets/`.
- **Defer non-critical JS** — `main.js` загружается с `defer`, `copy-tooltip.js` тоже
- **Lazy loading** — на `<img>` уже стоит `loading="lazy"`, сохранить

### Цели

- LCP < 2.5s на 4G мобильном
- CLS < 0.1 (CLS-фиксы уже в репо — `width`/`height` на всех `<img>`)
- TBT < 200ms

---

## 15. Безопасность

- **Wordfence или iThemes Security** — базовая защита
- **2FA** для всех админов
- **Скрыть `/wp-admin/`** под нестандартный slug (`/management/` или подобное)
- **Disable XML-RPC** если не нужен Jetpack
- **`DISALLOW_FILE_EDIT`** в `wp-config.php`:
  ```php
  define('DISALLOW_FILE_EDIT', true);
  ```
- **Регулярные бэкапы** — UpdraftPlus, ежедневные, хранение 30 дней в облаке
- **Ограничение попыток входа** — Wordfence
- **HTTPS** обязательно, HSTS header

---

## 16. UX редактирования — что увидит заказчик

Это ключевая ценность всей работы. Заказчик должен сразу понять, что куда писать. Ниже — карта того, как должно выглядеть редактирование в админке для каждого типа контента.

### 16.1 Создание услуги

1. Заказчик: «Услуги» → «Добавить новую»
2. На экране:
   - **Заголовок** (input — это H1 без italic-акцента)
   - **Slug** под заголовком (генерируется автоматически из транслитерации, можно поправить)
   - **Направление** (select из 4) → **Раздел** (select зависит от направления)
   - Внизу слева — **ACF группа «Hero и факты»**:
     - `eyebrow` (text), подсказка «Моно-метка над H1»
     - `h1_emphasis` (text), подсказка «Italic-акцент в H1»
     - `lead` (textarea)
     - `facts` (3 строки label+value)
     - `aside_card_*`
     - `is_specialization` (checkbox) — для 10 спец-страниц
   - Ниже — **ACF группа «Контентные блоки» (Flexible Content)**:
     - Кнопка «+ Добавить блок» → меню: H2-секция / Что входит / Этапы / Стоимость / FAQ
     - Каждый блок раскрывается со своими полями
     - Можно перетаскивать, удалять, дублировать
   - Справа — **SEO-вкладка Yoast** (title, description)
3. «Опубликовать» → страница появилась.

### 16.2 Создание кейса

1. «Дела» → «Добавить новое»
2. На экране:
   - **Заголовок** (H1)
   - **Категория** (taxonomy)
   - **ACF группа «Кейс»** — все поля в логичном порядке (eyebrow, h1_emphasis, case_number, jurisdiction, period, result_label, result_value, result_description, task, solution, result_body, 3 metrics, cta_*)
   - WYSIWYG-редакторы у `task` / `solution` / `result_body` — с базовыми кнопками (жирный, курсив, ссылка, список, цитата)
3. Опубликовать.

### 16.3 Написание статьи

1. «Записи» → «Добавить новую»
2. На экране:
   - **Заголовок** (H1)
   - **Тема** (taxonomy `journal_topic`)
   - **Featured image** (cover, 1600×700)
   - **ACF поля**: `h1_emphasis`, `lead`, `reading_time`, `author` (выбор из CPT team_member)
   - **Gutenberg editor** для тела — только разрешённые блоки (см. §10)
   - **SEO Yoast**
3. Опубликовать.

### 16.4 Класс МКТУ

1. «Классы МКТУ» → «Добавить новый»
2. На экране:
   - **Заголовок** (например, «Класс 41 МКТУ»)
   - **ACF**: `class_number`, `short_description`, `terms_list` (WYSIWYG для длинного списка), `related_services`, `related_cases`
3. Опубликовать.

### 16.5 Сотрудник

1. «Команда» → «Добавить новый»
2. На экране:
   - **ACF**: `first_name`, `last_name`, `role`, `status`, `experience_years`, `city`, `specialization`, `photo`, `order`
3. Опубликовать. Карточка появляется в `/o-byuro/#team` автоматически.

### 16.6 Глобальные настройки

- «Настройки → Общие настройки сайта» (ACF Options Page)
- Все контакты, реквизиты, тексты footer и т.д. — здесь.
- Изменения применяются по всему сайту.

### 16.7 Редактирование главной

- «Страницы» → «Главная»
- Стандартный редактор + большая ACF-группа с секциями (Hero, Процесс, Книги, About, Партнёры, CTA)

---

## 17. Welcome Dashboard для заказчика

Добавить в `functions.php` виджет в админке (на главной):

```php
add_action('wp_dashboard_setup', function() {
  wp_add_dashboard_widget('gmip_welcome', '📘 Как редактировать сайт',
    'gmip_welcome_widget');
});

function gmip_welcome_widget() {
  echo '
    <p><strong>Быстрая навигация:</strong></p>
    <ul>
      <li>📄 Услуги — раздел «Услуги» в левом меню</li>
      <li>⚖️ Кейсы — раздел «Дела»</li>
      <li>📝 Статьи журнала — раздел «Записи»</li>
      <li>📚 Классы МКТУ — раздел «Классы МКТУ»</li>
      <li>👥 Команда — раздел «Команда»</li>
      <li>⚙️ Телефоны, адреса, общие тексты — «Общие настройки сайта»</li>
    </ul>
    <p><strong>Перед публикацией проверьте:</strong></p>
    <ul>
      <li>H1 содержит italic-акцент (поле «h1_emphasis»)</li>
      <li>Цифры конкретные (не «много» и «значительно»)</li>
      <li>Нет штампов «команда профессионалов», «индивидуальный подход»</li>
    </ul>
    <p>Подробные правила и шаблоны → файлы в Google Drive: <code>content-templates/</code></p>
  ';
}
```

---

## 18. Чек-лист интеграции (для разработчика)

### Подготовка
- [ ] Создан репозиторий темы, скопирована структура из репозитория проекта
- [ ] Локальная среда (Local, Docker, MAMP) поднята
- [ ] Установлены: WordPress, ACF Pro, Yoast/Rank Math, UpdraftPlus, Wordfence, Redirection

### Структуры
- [ ] CPT зарегистрированы: `service`, `dela_case`, `mktu_class`, `team_member`, `book`
- [ ] Таксономии: `direction` (иерархическая), `case_category`, `journal_topic`
- [ ] 4 термина-направления заведены + разделы под ними (по списку заказчика)
- [ ] ACF Field Groups импортированы (§6.1–6.9)
- [ ] ACF Options Page «Общие настройки сайта» создана и заполнена

### Шаблоны
- [ ] `front-page.php` — главная (со всеми секциями)
- [ ] `page-uslugi.php` — каталог 4 направлений
- [ ] `taxonomy-direction.php` — страница направления
- [ ] `single-service.php` — страница услуги (рендерит ACF Flexible Content)
- [ ] `archive-dela_case.php`, `single-dela_case.php`
- [ ] `home.php` (журнал), `single.php` (статья)
- [ ] `page-o-byuro.php` — с циклом по team_member
- [ ] `page-kontakty.php`
- [ ] `archive-mktu_class.php`, `single-mktu_class.php`
- [ ] `page-poisk.php` (с `<meta name="robots" content="noindex">`)
- [ ] `page-legal.php` — универсальный для 5 правовых документов
- [ ] `404.php` — рендерит контент из `404.html` (тёмный hero, eyebrow «Ошибка 404», H1 «Здесь *ничего нет*», 2 кнопки). Подключить `assets/css/pages/404.css`. Добавить `<meta name="robots" content="noindex,follow">` и убедиться, что сервер отдаёт HTTP 404 (а не 200) — иначе ссылочный вес «утекает»
- [ ] `template-parts/header.php`, `footer.php`, `mobile-menu.php`, `modal.php`, `cookie-banner.php`, `head.php`

### Специализации
- [ ] `is_specialization` ACF-поле работает
- [ ] Rewrite rules для коротких URL спец-страниц
- [ ] 10 страниц спец. опубликованы (или подготовлены к публикации после получения контента)

### Поиск
- [ ] `gmip_regenerate_search_index` хук работает на `save_post`/`delete_post`
- [ ] `/assets/search/index.json` доступен

### SEO
- [ ] Yoast/Rank Math настроен
- [ ] sitemap.xml доступен и покрывает все CPT
- [ ] robots.txt корректный
- [ ] Canonical, OG, Twitter Card работают
- [ ] URL redirects со старого сайта настроены (Redirection)
- [ ] 404 проверка через Screaming Frog пройдена

### Gutenberg
- [ ] `allowed_block_types_all` фильтр работает
- [ ] `theme.json` ограничивает кастомизацию
- [ ] В редакторе доступны только разрешённые блоки

### UX редактирования
- [ ] Welcome dashboard виджет добавлен
- [ ] Названия CPT и полей в админке — на русском
- [ ] Подсказки (instructions) у ACF-полей заполнены
- [ ] Дисплей-условия (conditional logic) у полей работают (например, спец-страницы прячут «Направление»)

### Безопасность и производительность
- [ ] HTTPS работает (HSTS)
- [ ] Wordfence настроен
- [ ] 2FA включена для админов
- [ ] `DISALLOW_FILE_EDIT` в wp-config
- [ ] UpdraftPlus ежедневный бэкап
- [ ] WP Super Cache настроен
- [ ] Imagify / ShortPixel оптимизирует картинки

### Финальная проверка
- [ ] Все 18 страниц визуально проверены — соответствуют статичной версии 1:1
- [ ] DOM-структура каждой страницы совпадает (нужно для совместимости с CSS)
- [ ] Cookie-баннер работает (`window.hasAnalyticsConsent` доступна)
- [ ] Форма консультации работает (включая phone-mask, file-upload, valid/invalid состояния, Telegram conditional field)
- [ ] Поиск работает: эндпоинт + страница `/poisk/`
- [ ] Мегаменю работает на desktop, mobile-menu на mobile
- [ ] CTA-final на всех страницах берёт текст из ACF (с fallback на дефолт из Options)

---

## 19. Что НЕ делать

- ❌ Не менять CSS/JS из репо без согласования с автором дизайна
- ❌ Не создавать кастомные Gutenberg-блоки (дольше, хрупче, чем ACF Flexible Content)
- ❌ Не использовать визуальные конструкторы (Elementor, Divi, WPBakery)
- ❌ Не ставить два SEO-плагина, два кэш-плагина — конфликты
- ❌ Не менять структуру URL без согласования (SEO-критично)
- ❌ Не править файлы темы напрямую через WP-админку (Appearance → Theme Editor) — только через git/FTP
- ❌ Не отключать ACF Pro после настройки полей — все данные станут недоступны на фронте
- ❌ Не давать клиенту роль Administrator — только Editor или специальная роль с ограниченными правами

---

## 20. Контакты и материалы

| Что | Где |
|---|---|
| Структура страниц фронта | `docs/PAGES.md` |
| CSS-компоненты | `docs/COMPONENTS.md` |
| Дизайн-система (токены, цвета, шрифты) | `docs/DESIGN_SYSTEM.md` |
| Текущий прогресс | `docs/PROGRESS.md` |
| Гайд по контенту для заказчика | `docs/content-templates/` (9 файлов) |
| Будущие фичи (необязательные) | `docs/FUTURE_IDEAS.md` |
| Бриф проекта (история и общий контекст) | `docs/BRIEF.md` |

При неясностях по фронту — смотреть исходный HTML/CSS в репо. Если что-то рендерится не так — DOM-структура темы должна совпадать со статичным HTML, тогда CSS подхватит.

При вопросах от заказчика про правила контента — направлять в `docs/content-templates/`. Не отвечать «как лучше написать» — это задача контент-команды, у них есть гайд.
