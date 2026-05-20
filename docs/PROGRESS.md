# PROGRESS.md — Статус работы над проектом

> Обновляется при каждом существенном изменении структуры или новой странице.
> При возвращении к проекту — читать ЭТОТ файл первым: верхний раздел «Что дальше» = next steps.

---

## ▶ Что дальше (на 20 мая 2026)

**Состояние:**

- Вёрстка сайта стабильна, превью развёрнуто на GitHub Pages: `https://omarmardanov.github.io/` (репо `github.com/omarmardanov/omarmardanov.github.io`, public, user-page). robots.txt закрыт от индексации.
- Гайд для контент-команды пересобран: `docs/content/` (9 русскоязычных .md, 890 строк) и `docs/content-docx.zip` для передачи в Яндекс.Документы.
- Решение по CMS открыто: предложены WordPress (план готов в `docs/WORDPRESS.md`) и Directus (self-hosted на тот же VDS Beget). Директор взвешивает — WP-команда уже есть, но Directus даёт лучший UX редактору. Ждём ответ от технарей по версии PHP/MySQL и возможности Node.js+PostgreSQL на хостинге.

**Что осталось:**

1. **Передать `docs/content-docx.zip` заказчику** через Яндекс.Диск (папка → «Поделиться» → «Только просмотр»). Заказчик открывает .docx из Я.Диска прямо в Я.Документах, копирует под каждый материал и заполняет.
2. **Решение по CMS** от директора (WP или Directus) → дальше разный путь внедрения, ~3–4 нед на WP силами текущей команды, ~4–6 нед на Directus с разовым подрядчиком.
3. **WP-разработчику создать 10 страниц-услуг** по шаблону `uslugi-shablon/` под slugs (если решение — WordPress):
   - `/uslugi/patenty-v-selskom-khozyaystve/`
   - `/uslugi/patenty-v-meditsine/`
   - `/uslugi/patenty-v-farmacevtike/`
   - `/uslugi/patenty-v-neftegaze/`
   - `/uslugi/patenty-v-promyshlennosti/`
   - `/uslugi/predstavitelstvo-v-sip/`
   - `/uslugi/spory-v-arbitrazhnom-sude/`
   - `/uslugi/spory-v-fas/`
   - `/uslugi/spory-v-palate-po-patentnym-sporam/`
   - `/uslugi/spory-v-verhovnom-sude/`
   Контент готовит команда заказчика по `docs/content/02-Шаблон услуги.md` (отраслевые/судебные лендинги пишутся как обычные услуги).
4. **Заполнение контентом** по шаблонам `docs/content/` — команда заказчика начинает после получения архива.

**Закрыто:**

- ~~Тестирование формы на iPhone~~ — заказчик подтвердил, работает.
- ~~Placeholder-фото в модалке~~ — решили оставить как есть (Pexels).
- ~~Доп. логотипы клиентов~~ — текущие 12 достаточны.
- ~~Hover-область email/телефонов шире текста~~ — фикс в `footer.css` / `sections.css` / `modal.css` / `mobile-menu.css` (20 мая).
- ~~Notion как платформа для контент-команды~~ — отменено: Notion не работает в РФ, перешли на Яндекс.Документы + .docx-архив.

---

## ▶ Сессия 20 мая 2026 — пересобрали контент-гайд, fix hover-области

Два блока работы перед передачей сайта заказчику.

### 1) Контент-гайд пересобран под Яндекс.Документы

Заказчик сказал, что старый гайд (`docs/content-templates/`, 9 файлов, 2110 строк) слишком сложный для контент-команды. Также Notion в РФ не работает, поэтому отменили подготовленный 17 мая `docs/notion-import.zip`.

Пересобрали:
- `docs/content/` — 9 файлов на 890 строк (сокращение в 2.4 раза):
  - `00-Старт.md`, `01-Правила и стиль.md`, `02-Шаблон услуги.md` (включая отраслевые/судебные лендинги), `03-Шаблон направления.md`, `04-Шаблон статьи.md`, `05-Шаблон кейса.md`, `06-Шаблон сотрудника.md`, `07-Перенос с прода.md`, `08-Чек-лист.md`.
- `docs/content-docx.zip` — те же 9 файлов в .docx, сгенерированы через pypandoc-binary. Для передачи через Яндекс.Диск — заказчик открывает .docx прямо в Я.Документах кликом.
- `docs/CONTENT_BRIEF.md` обновлён как индекс.
- Удалены `docs/content-templates/` и `docs/notion-import/` (старая Notion-папка + zip).

Решения, принятые с заказчиком:
- Отдельный шаблон «специализация» убран — это просто услуга (пишется по `02-Шаблон услуги.md`).
- Шаблон МКТУ убран — классы переносятся с прода как есть, без переписывания (см. `07-Перенос с прода.md`).
- Структура «направление → разделы → услуга»: «разделы» — визуальная группировка услуг внутри страницы направления, URL услуг остаются плоскими `/uslugi/{slug}/`.

### 2) Fix вёрстки — hover-область контактов

Заказчик заметил: в футере и CTA-блоке область наведения на `mailto:`/`tel:` шире самого текста — растягивалась на всю ширину flex-column контейнера.

Причина: `.footer__contact-block`, `.cta-final__contacts li`, `.modal__photo-contacts`, `.mobile-menu__contacts li` — все flex-column с дефолтным `align-items: stretch`, который растягивал `<a>` на всю ширину.

Фикс: `align-items: flex-start` на каждом из четырёх контейнеров + убран лишний `display: block` у `.modal__photo-contact`. Topbar в шапке и `/kontakty/` не трогали — там ссылки inline внутри `<span>`, уже работают корректно.

### 3) Preview-deploy

Оба коммита (`fix(css)` + `docs:`) запушены в `github.com/omarmardanov/omarmardanov.github.io` через HTTPS+PAT в osxkeychain. Превью обновлено, заказчик проверил — hover-область корректна.

---

## ▶ Сессия 17 мая 2026 — CMS-обсуждение, Notion-гайд, preview на GitHub Pages

Подготовка к передаче сайта заказчику. Три блока работы.

### 1) Обсуждение альтернатив WordPress для заказчика

Директор попросил рассмотреть варианты помимо WP. Сводка для созвона (3 финалиста):

| | WordPress | Directus | Strapi |
|---|---|---|---|
| Срок | 3–4 нед | 2–3 нед | 2–3 нед |
| Команда | текущая WP | разовый Node.js-подрядчик | разовый Node.js-подрядчик |
| UX редактора | средне | современный (как Notion) | хуже Directus |
| i18n (EN/CN на будущее) | через WPML | встроена | встроена |

Рекомендация: WordPress как «безопасная дорога» (WP-команда уже оплачивается, маркетологи знают), Directus — если решат вложиться в UX редактора. Ждём ответы технарей: версия PHP/MySQL на VDS Beget, возможность Node.js+PostgreSQL, кто держит DNS/SSL/бэкапы, кто настроит GitLab CI для деплоя статики.

Ответы заказчика на бизнес-вопросы получены: контент менять будут маркетолог + контент-менеджер (нетехнические), частота неравномерная (статьи + кейсы — основа), бюджет не критический, мультиязычность EN/CN возможна, заявки в Pyrus, данные ПДн хранятся в РФ.

### 2) Фикс дублей doc-комментариев в `scripts/sync-partials.py`

На главной и других страницах в HTML накопились дубли комментариев из partials: `<!-- FOOTER — site-footer partial. -->` × 28, `<!-- MOBILE MENU — fullscreen overlay -->` × 20, MODAL и COOKIE BANNER × 27 каждый. Итого ~102 мусорных комментария на главной.

**Причина:** regex замены в `process_file()` ловил только `<footer>...</footer>` / `<aside>...</aside>`, а ведущий doc-комментарий перед партиалом не захватывал. Каждый прогон оставлял старый комментарий и добавлял новый сверху.

**Фикс:** добавлен helper `_split_leading_comment()` — при загрузке шаблонов FOOTER/MODAL/MOBILE_MENU/COOKIE_BANNER ведущий комментарий отрезается и сохраняется в `PARTIAL_DOC_COMMENTS`. В начале `process_file()` все вхождения этих комментариев из страницы удаляются — разовая чистка + защита от повторения. Header уже работал правильно (его комментарий снимается в `render_header()`).

Прогон скрипта обновил 19/19 файлов. Все дубли вычищены, осталось только 2 уникальных label-комментария в `zhurnal/index.html:657,857` — но они единичные и не накапливаются, оставлены.

### 3) Гайд для контент-команды в Notion

Собран `docs/notion-import.zip` (65 КБ, 17 страниц) — одношаговый импорт в Notion для редакторов:

```
notion-import/
├── Контент-гайд 1-tm.ru.md          ← главная гайда
├── Старт за 10 минут.md
├── Правила и стиль.md                ← копия 00-pravila-i-stil.md
├── Шаблоны.md                        ← обзор 7 шаблонов
├── Шаблоны/                          ← 7 шаблонов (услуга, направление, специализация, кейс, статья, МКТУ, сотрудник)
├── Примеры.md                        ← обзор примеров
├── Примеры/                          ← 3 заполненных примера (услуга, статья, кейс)
├── Чек-лист перед публикацией.md
├── Глоссарий брендовых формулировок.md
└── Процесс и контакты.md
```

Примеры — реалистично заполненные шаблоны на основе live-страниц (`/uslugi-shablon/`, `/zhurnal/ekspertiza-tovarnyh-znakov-2026/`, `/dela/vzyskanie-kompensatsii-fmcg/`): конкретные цифры, корректные форматы, чек-листы с галочками. Маркетолог открывает пример параллельно со своим черновиком и сверяется.

Канон по-прежнему в `docs/content-templates/` для WP-разработчика. Notion — рабочая копия контент-команды. Контакты в «Процесс и контакты» — плейсхолдеры, заполнит заказчик после импорта.

### 4) Preview сайта на GitHub Pages

Развернули превью для директора и команды:

- Репо: `github.com/omarmardanov/omarmardanov.github.io` (public, user-page — сервится с корня домена, без префикса пути).
- URL превью: `https://omarmardanov.github.io/`.
- Деплой через push: `git add . && git commit -m "..." && git push` — Pages автоматически перевыкладывает за 1–2 мин.
- `robots.txt` подменён на `User-agent: *\nDisallow: /` — превью закрыто от индексации, чтобы не создавать дубль продакшна для поисковиков.
- Форма заявки сейчас не отправляет данные на бэк (только `console.log`), Яндекс.Метрика не подключена — превью безопасно для публичной выкладки.
- `.gitignore` исключает: `.DS_Store`, `.claude/`, `_old/`, `references/`, `docs/notion-import.zip`.

**Авторизация:** SSH-ключ хост-машины уже был в каком-то старом GitHub-аккаунте → решено через HTTPS + одноразовый fine-grained PAT (после push токен убран из git config и подлежит отзыву). На постоянной основе нужно настроить отдельный SSH-ключ для `omarmardanov` или хранить PAT с правами write на `1tm`.

---

## ▶ Сессия 15 мая 2026 (поздний вечер) — 404 страница + фикс sync-partials

Создана `404.html` в стиле hero главной (вариант Б по обсуждению с заказчиком):

- **Контент:** eyebrow «Ошибка 404» / H1 «Здесь *ничего нет*» / lead «Возможно, страница переехала, ссылка устарела или такого URL никогда не было. Доказательств обратного у нас нет.» / две кнопки «На главную» (`.btn--cta-light`) + «Открыть поиск» (`.btn--ghost-light`)
- **Фон:** переиспользуем `.cta-final__bg` через композицию классов на `.page-404__bg` — не дублируем ~300 КБ base64. Заказчик подберёт картинку «как в CTA, но без человека» — заменить url() в `.cta-final__bg` внутри `sections.css`. Тогда новая картинка автоматически появится и в CTA-блоке (целевое — единое визуальное «лицо» dark-фона на сайте)
- **CSS:** новый `assets/css/pages/404.css`. Типографика как у `.hero__title` главной, но через `clamp()` для адаптивности (52–88px десктоп, 36–48px ≤640). `em` берёт `--color-on-photo-mute` (не brand — на тёмном brand-коричневый плохо читается, повторяем паттерн `.cta-final__title em`)
- **Meta:** `noindex,follow` (стандарт для 404), OG/Twitter Card по дефолту, og-default.png

**Отказали в гифке Джона Траволты** — мем не соответствует тону бренда (сухо, по-юридически), плюс IP-ирония (патентное бюро публикует нелицензированный кадр из «Pulp Fiction»). Заменили на типографическую шутку «доказательств обратного нет» — в голосе юристов.

### Фикс бага в `scripts/sync-partials.py`

При обработке `<!-- @include modal -->` placeholder скрипт падал на:
```
re.PatternError: bad escape \s at position 5271
```

Причина: `re.sub(..., MODAL_TPL.rstrip('\n'), ...)` — Python интерпретирует `\s`, `\d` в replacement-строке как back-references. В модалке есть `pattern="\+7\s\d{3}..."` (phone-mask) и `pattern="[^\s@]+@..."` (email) — это и ломало.

Фикс: обернули replacement в `lambda _m: tpl_body` (helper `_literal()`). re возвращает строку как есть, без интерпретации backslashes. Применили ко всем 5 `_RE.sub()` вызовам (header, footer, modal include, mobile-menu, cookie-banner) — на случай добавления regex-special символов в любой партиал в будущем.

Без фикса любой будущий разработчик, попробовавший использовать `@include modal` в новой странице, упёрся бы в этот же баг.

---

## ▶ Сессия 15 мая 2026 (вечер) — два гайда для перехода в WordPress

После этой сессии переход на WP должен быть полностью покрыт документацией:
- **Контент-команда заказчика** работает по `docs/content-templates/` (шаблоны + правила, 9 файлов).
- **WP-разработчик** работает по `docs/WORDPRESS.md` (полная инструкция переноса).

### 1) `docs/WORDPRESS.md` — переписан с нуля как готовая инструкция

Старый WORDPRESS.md был структурным наброском (CPT, таксономии, ACF) без UX-плана для редактора. Перписали как self-contained документ для разработчика:

- **§0 Требования заказчика** — что должно получиться в итоге
- **§1 Стек** — конкретный набор: WP 6.4+, PHP 8.2+, ACF Pro, Yoast, Wordfence, Redirection. Запрет на Elementor/Divi/конструкторы.
- **§2 Кастомная тема** — структура `wp-content/themes/gmip/` с переносом `assets/` и `partials/` 1:1
- **§3 Template hierarchy** — 14 шаблонов с маппингом на исходные HTML
- **§4 CPT** — `service`, `dela_case`, `mktu_class`, `team_member`, `book` + готовые `register_post_type` блоки
- **§5 Таксономии** — `direction` (иерархическая), `case_category`, `journal_topic` + список слагов 4 направлений
- **§6 ACF Field Groups** — 9 групп с типами полей и подсказками: услуга Hero/Facts, Контент-блоки (Flexible Content), кейс, статья, МКТУ, сотрудник, Options Page, главная, юр. документ
- **§7 Специализации** — `is_specialization` флаг + 10 фиксированных слагов + rewrite rules для коротких URL `/uslugi/{slug}/`
- **§8 Мегаменю** — динамика из `direction` + хардкод полосы «Специализация»
- **§9 Партиалы темы** — header/footer/modal/mobile-menu/cookie-banner с подстановками из ACF Options
- **§10 Ограничения Gutenberg** — `allowed_block_types_all` (paragraph/heading/list/quote/image/table/separator/embed) + `theme.json` с отключённой кастомизацией цветов/размеров/отступов. Кастомные блоки НЕ нужны — всё через ACF.
- **§11 Поиск** — генерация `/assets/search/index.json` на `save_post`/`delete_post`
- **§12 Миграция** — URL redirects через Redirection, маппинг паттернов, проверка через Screaming Frog
- **§13 SEO** — Yoast + canonical + Schema.org (Organization, BreadcrumbList, Article)
- **§14 Производительность** — Redis + WP Super Cache + Imagify + правила про не-минимизировать наши CSS/JS
- **§15 Безопасность** — Wordfence + 2FA + `DISALLOW_FILE_EDIT` + UpdraftPlus
- **§16 UX редактирования** — построчная карта что видит заказчик при создании каждого типа контента
- **§17 Welcome dashboard widget** — готовый PHP-код виджета с шпаргалкой
- **§18 Чек-лист интеграции** — ~60 пунктов
- **§19 Что НЕ делать** — запретный список (конструкторы, кастомные блоки, два SEO-плагина, и т.д.)
- **§20 Перекрёстные ссылки** на остальные docs

**Главное архитектурное решение зафиксировано:** ВСЕ структурированные компоненты (facts strip, FAQ, callout, прайс, метрики кейса, italic-акценты в H1) — через **ACF Pro Flexible Content + repeaters**, не через кастомные Gutenberg-блоки. Это дешевле, надёжнее и привычнее WP-разработчикам.

### 2) `docs/content-templates/` — гайд по контенту для заказчика

Создана папка — 9 файлов:

- `README.md` — индекс, очерёдность подготовки, куда сдавать
- `00-pravila-i-stil.md` — единый гайд (тон, чёрный список штампов, цифры, italic-акценты, lead, анонимизация клиентов, цены, SEO-поля, типографика, фото, чек-лист)
- `01-usluga.md` — шаблон страницы услуги (110+ страниц)
- `02-napravlenie.md` — шаблон страницы направления (3 штуки)
- `03-spetsializatsiya.md` — шаблон отраслевого/судебного лендинга (10 штук). Главное отличие — H2 «Особенности отрасли/суда», обязательная секция «Наши дела в [отрасли/суде]», специфические FAQ.
- `04-keys.md` — шаблон кейса (40+). С предупреждением про согласие клиента и анонимизацию.
- `05-statya.md` — шаблон статьи журнала (5 000–15 000 знаков, 3–5 H2, callout «Что важно знать», требования к cover-фото).
- `06-mktu-klass.md` — шаблон класса МКТУ (45 штук). Рекомендация — заполнять одной таблицей Excel.
- `07-sotrudnik.md` — шаблон карточки сотрудника на /o-byuro/#team. Жёсткие правила: ФИО без отчества, должность одной строкой, до 3 строк creds в порядке статус→опыт+город→направление.

Каждый шаблон содержит:
- Шапку документа (тип, slug, автор, дата, статус)
- SEO-поля (title ≤65, meta description 130–160)
- Поля с плейсхолдерами и примерами
- Чек-лист в конце для верификации перед сдачей
- Кросс-ссылки на 00-pravila-i-stil.md

`docs/CONTENT_BRIEF.md` переработан в короткий редирект-указатель на `content-templates/`.

---

## ▶ Сессия 15 мая 2026 — полоса «Специализация» в меню

### Мегаменю (desktop)
- Под `.mega__grid` (4 колонки услуг) добавлен новый блок `.mega__rail` — отделён `border-top: 1px solid var(--color-rule)` + `margin-top var(--space-10) / padding-top var(--space-8)`.
- Eyebrow `.mega__rail-eyebrow` «Специализация» — mono caps weight 700 letter-spacing 0.08em **accent цвет** (а не mute), чтобы маркировать как сильную сторону.
- Внутри — `.mega__rail-grid` (2 колонки 1fr 1fr) с двумя `.mega__rail-block`:
  - **Патенты по отраслям**: Сельское хозяйство · Медицина · Фармацевтика · Нефтегаз · Промышленное оборудование
  - **Представительство в судах**: СИП · Арбитражный суд · ФАС · Палата по патентным спорам · Верховный Суд РФ
- Теги выведены через `.mega__tags` (flex-wrap, row-gap space-3) с `::after` разделителем `·` (на последнем элементе — `content: none`).
- Hover: ink → `--color-accent` на `a:hover`, без подчёркивания (отличается от `.mega__list a:hover`, тот тоже accent — паттерн совпадает).
- ≤1024px: `.mega__rail-grid` переключается на `grid-template-columns: 1fr` (вертикальный стек).

### Mobile-menu
- В уровне `data-level="1"` (список 4 направлений) после `<ul>` добавлен **divider-eyebrow** `.mobile-menu__section-eyebrow` с border-top + два новых drill-down пункта: «Патенты по отраслям →» и «Представительство в судах →».
- Два новых panel: `data-level="2-otrasli"` и `data-level="2-sudy"` по структуре аналогичны существующим `2-ip` / `2-sz`. Кнопка «Назад» ведёт в `data-go="1"` (на уровень направлений).
- JS-обработчик `data-go` generic (см. `main.js:121-122`) — новые уровни работают без правок JS.
- `.mobile-menu__section-eyebrow` — mono caps **accent**, border-top divider, padding по gutter.

### Целевые ссылки
Все 10 ссылок ведут на **ещё не созданные** страницы (404 при клике). Заказчик подтвердил: формат «отдельная посадочная страница на каждый low-frequency запрос», WP-разработчик создаст по шаблону `uslugi-shablon/`. Слаги зафиксированы в HTML — менять имена ломая URL не нужно.

### FUTURE_IDEAS.md почищен
Удалены устаревшие пункты из §3: «Мессенджеры в шапке/футере» (сделано 13-14 мая) и «Юр. документы» (5 страниц закрыты 13 мая).

### Cookie-баннер (152-ФЗ explicit consent)
- **`partials/cookie-banner.html`** — bottom-fixed `<aside>` с текстом + ссылкой на `/legal/cookies/` + 2 кнопки (`data-cookie-action="essential"` и `="all"`). По умолчанию `hidden`. Sync через `scripts/sync-partials.py` (новый блок `COOKIE_BANNER_*`) вставляется перед `</body>` на все 18 страниц.
- **CSS в `components.css`** — `.cookie-banner` fixed bottom, светлая paper-плашка с `box-shadow` и border-top, `transform: translateY(100%)` → `0` через класс `.is-open`. Mobile (≤1024) — кнопки в столбик. (≤480) — уменьшенные шрифты.
- **JS в `main.js`** — отдельный IIFE после блока книг. LocalStorage `cookieConsent` хранит `{v:1, essential, analytics, ts}`. Глобальные API: `window.hasAnalyticsConsent()` (boolean, использовать перед запуском Яндекс.Метрики) и `window.cookieConsentReset()` (очистить и показать заново).
- **`/legal/cookies/` обновлён** — раздел 3 «Как управлять» содержит кнопку `<button class="text-link" onclick="window.cookieConsentReset()">`. Раздел 4 «Согласие» переписан под explicit opt-in (старая формулировка «продолжая использовать сайт без изменения настроек» устарела — РКН требует явного согласия с 2022-2023).
- **`button.text-link` reset** добавлен в `components.css` — кнопка-ссылка без background/border, наследует font.
- **Когда внедрят Яндекс.Метрику** — обернуть инициализацию в `if (window.hasAnalyticsConsent()) { ym(... 'init' ...); }`. Также рекомендуется слушать кастомное событие при изменении согласия (сейчас не реализовано — можно добавить, если потребуется горячая инициализация).

### Технический аудит + фиксы (SEO/CLS)
- **OG + Twitter Card + canonical** — добавлены на все 18 страниц через новый `scripts/add-meta.py`. Скрипт идемпотентный (повторный запуск обновляет между маркерами `<!-- :og:start --> / <!-- :og:end -->`). og:type = `article` для страниц журнала и кейсов, `website` для остальных. og:image = `/assets/images/og-default.png` 1200×630 — **файл готовит заказчик по ТЗ** (тёмный фон #0a0a0a + логотип + подпись «Юристы для бизнеса · с 2014 года»). canonical ведёт на https://1-tm.ru (без www, как в sitemap.xml).
- **CLS-фикс на img** — добавлены `width/height/loading="lazy"/decoding="async"` ко всем 36 img через `scripts/add-img-dims.py`. Размеры читаются автоматически: JPG через `sips`, SVG через viewBox. Books 820×1094, Team 1000×1000, Clients SVG — индивидуальные viewBox. Браузер использует эти атрибуты для intrinsic aspect-ratio, CSS-нормализация высоты через `--logo-h-base` сохраняется.
- **Шаблон `partials/head.html`** обновлён — содержит маркер для будущих страниц и инструкцию запускать add-meta.py.

### Что не правили (норма)
- 20 «битых» внутренних ссылок — это запланированные будущие WP-страницы (10 специализаций + 3 направления + статьи журнала + кейсы + классы МКТУ).
- Декоративные `<img alt="">` в скрытой второй полосе marquee клиентов — намеренные (родитель `aria-hidden="true"`, это дубликат для бесшовной анимации).
- 0 дублей id, все title/description уникальные и присутствуют.

### Футер — sitemap + contact-rail
Перестроил `partials/footer.html`:
- `.footer__cols` теперь 4 колонки (1.5/1/1.3/1fr): **Brand · Направления · Специализация · Бюро**. Колонка «Контакты» из сетки убрана.
- Колонка «Специализация» — паттерн **α** (как в мегаменю): `.footer__subhead` подзаголовок «Патенты по отраслям» + 5 ссылок, второй подзаголовок «Представительство в судах» + 5 ссылок. Те же 10 слагов, что в мегаменю.
- Новый блок `.footer__contact-rail` между `.footer__cols` и `.footer__bottom`: `grid-template-columns: repeat(4, 1fr)`, **border-top: 1px** разделителем от sitemap. 4 равных блока: Москва · Тюмень · Email · Мессенджеры.
- Мобильное (≤1024): cols 2×2, rail 2×2. (≤640): всё в стек. TG-канал через `display:contents + order:1` на `.footer__col--brand` всё ещё выносится в конец `.footer__cols` перед rail-плашкой.
- Ссылка «Контакты» в блоке «Бюро» **оставлена** — ведёт на `/kontakty/` с расширенной информацией про офисы.

### Команда — фото и данные (14 мая)
- Файлы `assets/images/team/{Galifanov,Malkov,Kolesnikov,Rudneva,Piven,Kochurov,Vishnyakov,Biruk,Vinogradova,Parshina}.jpg` — все 1000×1000 JPG на сером фоне.
- `<img>` подключён внутри `.member__portrait`; CSS-правило в `assets/css/pages/about.css`: `img { object-fit: cover }` + `[data-initials]::after` оставлен как fallback для будущих новых членов команды без фото.
- Сетка `repeat(3, 1fr)` → 3+3+3+1 (последний ряд с одной карточкой) — заказчик ок с этим, не трогаем.
- Реальные роли по сравнению с предыдущими заглушками: убраны Анна Соколова / Дмитрий Воронин / Елена Краснова / Игорь Лебедев / Мария Орлова / Сергей Платонов. Добавлены Денис Колесников (фин. директор), Ольга Руднева (Тюмень), Юрий Кочуров, Кирилл Вишняков, Гузель Бирюк, Екатерина Виноградова, Лилия Паршина. Опыт/специализации частично выдуманы — заказчик дал только имена + должности, попросил «заглушку выдуманную».

### Логотипы клиентов — паттерн балансировки (14 мая)
`.partners__logo img` нормализуется по высоте через `calc(var(--logo-h-base) * var(--logo-scale))`.
- `--logo-h-base`: 44 / 36 / 30 на десктопе / планшете / мобиле (через media-queries).
- `--logo-scale`: точечный множитель по `img[src*="<name>"]`.
- Множители: mdmprint/olimpparketa/brealit/ratep ×0.78; hetero/smpbank ×1.22; investtumen ×1.6 (через модификатор `.partners__logo--tall`).
- `filter: brightness(0) invert(1) opacity(0.78)` в `.about--brand` — чёрные SVG превращаются в светло-paper на brand-фоне.
- Сетка `.partners__set` через `grid-auto-flow: column; grid-auto-columns: 200px;` — добавлять/убирать лого можно без правки CSS.

---

## ▶ Сессия 13–14 мая 2026 — книги, канал, мессенджеры, форма

### Главная — «Авторские книги от основателей»
- Подсекция `.founder-books` внутри `.about--brand` между grid'ом «Команда» и `.partners`. 2 карточки `.book-card`: «Охраноспособность и охрана товарных знаков» и «Проблемы изобретательства», цена **1 700 ₽** каждая. CSS-стопка через 3 слоя `.book-stack__sheet` (paper смещены на 6/12/18 px вправо-вниз, opacity 0.85/0.65/0.45).
- Обложки в `/assets/images/books/{ohranosposobnost,problemy-izobretatelstva}.jpg`.
- Кнопка `.book-card__order` «Заказать ▾» → popover `.messenger-popover` (WA + TG, иконки) с pre-fill сообщением «Здравствуйте! Хочу заказать книгу «…». Подскажите, как оплатить и получить.»
- JS в `main.js` IIFE «Заказ книги»: `BOOK_LINKS = { whatsapp, telegram }`, `data-book-title` на карточке → URL-encoded text.

### Мессенджеры как общие контакты компании
WA **+7 925 896-31-88** (`wa.me/79258963188`), TG **@gmip_23** (`t.me/gmip_23`). **Max убран отовсюду** — заказчик отказался.
- Footer: блок `<strong>Мессенджеры</strong>` под Email в колонке «Контакты», outline-плашки 36×36
- Mobile-menu: ряд в `.mobile-menu__contacts`, плашки 40×40
- Modal: отдельный блок с label «Мессенджеры» в `.modal__photo-contacts`
- `/kontakty/`: `.office-card__row--full` «Мессенджеры» под Email в каждой карточке офиса

### Telegram-канал «Заметки юристов» (@urberau)
Компонент `.channel-promo` в `components.css` (brand-tint баннер: иконка telegram в рамке, eyebrow, title, lead, handle+arrow). Использован в 4 местах:
- `/zhurnal/` — между фильтрами и сеткой статей
- `/o-byuro/` — между «Хроникой» и «Командой» (eyebrow «Делимся практикой»)
- Главная — `.section-head--with-action` в секции «Журнал»: telegram-иконка + «Канал "Заметки юристов"» + стрелка
- Footer — карточка `.footer__channel` в первой колонке **под `.footer__about`** с margin-top: var(--space-10). На мобиле через `.footer__col--brand { display: contents }` + `order: 1` канал выносится в самый конец стека. Внутренний враппер `.footer__col-inner` сохраняет нативные margin'ы между brand/sub/about.

### Иконка Telegram (sprite)
Финальная — svgrepo.com/447799 (64×64 stroke-width 3). Tabler и Lucide-стиль самолётик отбракованы — выглядели «криво» в мелком размере. У svgrepo правильная геометрия хвоста с подзагибом крыла.

### Форма модалки
- **Phone mask** изменён с `+7 (___) ___-__-__` на **`+7 XXX XXX XX XX`** (только пробелы как разделители). Placeholder `+7`, pattern `\+7\s\d{3}\s\d{3}\s\d{2}\s\d{2}`, maxlength 16. На focus подставляется `+7 `. Error: «Введите номер в формате +7 XXX XXX XX XX».
- **Select «Способ связи»** расширен: phone / **whatsapp** / telegram / **email** / yandex-meet / google-meet. Опция `max` удалена.
- **Условное поле `#cf-telegram-wrap`** «Юзернейм в Telegram» — показывается только при `channel === 'telegram'`. Когда видно, у `#cf-company-wrap` снимается `field--full` → оба поля встают в пару 50/50. JS-функция `syncTelegramField()`. Маска `bindUsernameMask`: автопрефикс `@`, разрешены `a-zA-Z0-9_`. Важно: добавлен `.field[hidden] { display: none }` в `components.css`, иначе `.field { display: flex }` побеждает нативный `[hidden]`.
- **Градиент на `.modal__photo::after`**: 3-stop 180deg, transparent 20% → rgba(10,10,10,0.55) 55% → rgba(10,10,10,0.9) 100%. Был диагональный 160deg 15-65%.

### Контакты (/kontakty/) — фикс выравнивания
`.office-card__row:nth-child(even)` получил `:not(.office-card__row--full)` — иначе full-width ряд (Мессенджеры) получал `padding-left: var(--space-6)` и сдвигался вправо относительно других full-rows.

### channel-promo мобильный layout
- ≤1024px: action перевешен на колонку body (`grid-column: 2; justify-self: start`) — handle оказывается под текстом, не под иконкой
- ≤640px: вся карточка переключается в `grid-template-columns: 1fr` (иконка/body/action стекают вертикально)

### Прочее
- ШаблонToken `--reading-narrow/wide` подключён через `tokens.css` — двухуровневая схема editorial-страниц (использовалось ранее).
- `.field[hidden]` фикс — добавлен в components.css из-за `display: flex` на `.field`.
- Все partials прокатаны через `scripts/sync-partials.py` (18 файлов).

---


**Что закрыто 13 мая:**

| Блок | Результат |
|---|---|
| `/poisk/` (full-page search) | Переведена на `.page-hero`, hover результатов по паттерну `.service-list`, кастомная backspace-кнопка очистки, нативный webkit-крестик отключён, лишний border-bottom у фильтра убран |
| Все 5 `/legal/<doc>/` страниц | Hero → стандартный `.page-hero` (eyebrow «Документ № N из 5» + lead «Редакция от…»); layout на `--reading-wide` (1080) + content `max-width: --reading-narrow` (820); TOC под `.aside-nav` (per-link border-left, accent на is-active); `.legal-note` под `.article-callout` (paper-2 + ink border — убрана коричневая warning-окраска); scroll-spy `setupNavScrollSpy(legalToc, …)`; **на мобиле TOC скрыт** (`.legal-toc { display: none }` ≤1024) — был бы в самом низу страницы, бессмыслен |
| Реквизиты в `/legal/rekvizity/` | ИНН 7724305271, КПП 772501001, ОГРН 1157746099829, юр.адрес 115280, Москва, Ленинская Слобода, 19, ком.210; банк ООО «Банк Точка», р/с 40702810301270004437, БИК 044525104, к/с 30101810745374525104 — все поля с copy-trigger (`<span>` чтобы на мобиле не было прыжка по `href="#"`) |
| DM Sans italic | URL обновлён до `DM+Sans:ital,wght@0,400;0,500;1,400;1,500` во всех 18 страницах + `partials/head.html`. Site-wide `<em>` в body — настоящий italic, не faux |
| Toast | Светлый (paper bg, ink text, accent border-left + accent иконка). Был ink + paper |
| Модалка заявки | Фото → Pexels `9597177`; над контактами display-заголовок «Защищаем клиентов по всей *России*» (Cormorant italic 28, em → on-photo-mute) |
| `.text-link` единое правило | Групповой селектор для `.article-prose a`, `.legal-page__content a`, `.case-stage__body a`, `.about-intro__text a`, `.checkbox a`, `.search-suggest__empty-hint a`. ink + underline rule-strong → accent на hover. См. DS п.8 |
| Главная hero | Title «Партнёр в сложных делах — *от Роспатента до Верховного Суда*». Lead «Сопровождаем компании, директоров и изобретателей по всей России с 2014 года: …». Из CTA убрана inline-стрелка |
| Главная — порядок секций | Дела подняты до Процесса (proof раньше в B2B UX-арке) |
| Главная — фон-ритм | Дела с `#faf9f8` (≈3% коричневого предкомпонованный — на тёмно-body главной rgba не работает, нужны solid hex). Команда — `.about--brand` (полный `--color-brand`), brown-beat перед финальным CTA. Stats в правой колонке вертикально, marquee «Нам доверяют» внутри brand-секции с transparent логотип-карточками. `.card--case` hover теперь меняет цвет title и стрелки (был только translateX) |
| Форма (label↔input gap) | `.field` gap 8→4, инпут `padding-top` 10→4 (асимметричный `4 0 10`). Видимое расстояние ~8px |
| Топбар (header) | Mirror email-блока: город из bright-bold → мид-mute, телефон → bright-bold. Единый паттерн «label · value» |
| Site-wide DS-аудит | Weight 600→500 на 31 display-заголовке (полная раскатка правила); удалён dead CSS `.about__cover*`; `.principle__title em` получил accent; `.modal__photo-contact:hover #fff` → token; `14.5px` → `--text-nav-size` |
| Правило «is-active = коричневый» | Pagination в `/dela/` и `/zhurnal/`, legal-toc подтянуты под aside-nav/article-toc. См. DS «Чёрный vs коричневый» |

**Ключевые токены/паттерны введены в этой серии (для справки):**
- `--reading-narrow: 820px` / `--reading-wide: 1080px` в `tokens.css` — двухуровневая схема для editorial-страниц.
- Иконка `send` в спрайте + accent-кнопка `.btn-consult-mobile` (mobile only).
- Правило «list-divider OK / wireframe-wrap NO» в DESIGN_SYSTEM.md.
- **`.text-link`** в components.css — единый стиль body-ссылок (DS п.8).
- **Чёрный vs. коричневый** разделение ролей в DS — «is-active = коричневый».
- **Ловушка rgba-тинт на тёмно-body странице** в DS «Фон секций».

---

## ▶ Сессия 12–13 мая 2026 — внутренние страницы по DS

### `/kontakty/`
- Удалена секция с формой `.contact-section` перед футером (дублировала модалку).
- `.office-cards` — снят весь рамочный фрейм (border-top/bottom грид, border-right между, internal border-top в `__details`). Padding карточек убран → контент выровнен по gutter контейнера.
- Между карточками офисов на мобиле — `--space-16` (64px).
- Телефон/email в карточках стали `copy-trigger`.
- Title через `--text-h3-size` + token leading/tracking.
- Внутри `__details` ВЕРНУЛИ функциональные `border-bottom` между строками (это list-divider'ы, OK).

### `/uslugi/` (каталог направлений)
- Полностью переделан: вместо `directions__grid` (4 small cards) теперь 4 раскрытые секции `.dir-block` (flat, без обводок и фонов): meta + title+lead + сетка карточек услуг + CTA «Все N услуг».
- Услуги внутри направления = карточки `.dir-srv` на `--color-paper-2` фоне в 3-кол гриде. Стрелка → внизу карточки. Hover: brand-soft + accent на названии + translateX(4) на стрелке.
- min-height: 180 + line-clamp на hint (2 строки) — карточки в ряду одинаковы по высоте на десктопе. На мобиле — full content, 1 кол.

### `/uslugi/intellektualnaya-sobstvennost/` (эталон DS pass)
- Section-anchor: title через `--text-h3-size` weight 500. Num accent (был mute).
- Service-list: hover brand-soft + accent на title и стрелке. Slide-эффект через рост padding 0→space-5 на hover. Первая строка имеет свой border-top. Box-shadow trick для верхней границы при hover (перекрывает border-bottom предыдущей строки) — у первой подавлен, чтобы не было 2px.
- Service-list margin: 0 (был -space-3) — содержимое не выходит за пределы main-колонки.
- Aside-nav: border-bottom у `__title` убран.
- 30+ inline SVG-стрелок заменены на `<use href=".../sprite.svg#arrow-right"/>`.
- Удалён блок «Популярные услуги» (был `.related` секция) — дублировал основной список.
- Добавлен блок «Другие направления» перед CTA-final: 3 строки-ссылки на остальные направления, паттерн совпадает с service-list.
- Первая услуга «Регистрация товарного знака» теперь линкует на `/uslugi-shablon/` (демо-шаблон).

### `/uslugi-shablon/`
- Восстановлен `.related__grid`/`.related__item` (card-grid стиль) после неудачной попытки переделать в типографические строки на тинте — оказалось хуже исходного.
- `.related__item-arrow` теперь `margin-top: auto` (внизу карточки) + accent цвет на hover.

### `/o-byuro/`
- **Stats-band**: убран фрейм (top+bottom+right между ячейками). Стал `background: var(--color-brand-tint)` секцией — тёплая полоса вместо «вайрфрейма».
- **Principles**: убраны top+bottom+right linies — только gap-10 между колонками.
- **Timeline**: убран border-top контейнера, ВЕРНУЛИ border-bottom между строками-годами (list-divider OK).
- **Team grid**: ВЕРНУЛИ border-bottom под каждой карточкой члена (list-divider OK).
- Правило закодировано: линии-разделители между братьями = OK, обёртки top+bottom = NO.

### `/zhurnal/<article>/`
- `.article-head` и `.article-cover` выровнены по левому краю (`margin: 0`), narrow reading-column (820).
- `.article-layout` (контент + sticky TOC) — wide reading-column (1080), через `var(--reading-wide)`.
- TOC статьи (`.article-toc`) перестроен под паттерн `.aside-nav`: per-link border-left transparent → accent при is-active, mono 12 caps title, weight 500 на активе. Идентично с aside-nav на странице направления.
- Scroll-spy в `main.js` обобщён через `setupNavScrollSpy(nav, linkSelector)` — работает и для aside-nav, и для article-toc. Click на пункт сразу ставит is-active + IO заглушается на 800ms (чтобы не сбивало во время smooth-scroll).
- На мобиле `.article-layout__aside` целиком `display: none` (был display:none только у TOC, оставался пустой grid-cell с gap).
- Добавлены `figure`-блоки внутри статьи + кейса с picsum-плейсхолдерами и `.figure-placeholder` стилями (в `case-stage__body figure` тоже).
- `<div class="article-prose__label">Введение</div>` перед интро-абзацем — mono caps mute, как case-stage__num.
- H3 в `.article-prose`: 22 → 26 weight 500 (был 22 weight 600) — иначе зрительно мельче body p.

### `/dela/<case>/`
- Case-head компактнее: убраны border-top и border-bottom вокруг `.case-headline`, padding 40→0, margin-bottom title 48→32, meta margin-bottom 32→20.
- Title через `--text-h2-size` token (был hardcoded 56).
- `.case-head` — narrow (820), `.case-stages` и `.case-related` — wide (1080). Унифицировано с article через `--reading-narrow`/`--reading-wide` токены.
- Все hero-блоки editorial-страниц теперь margin: 0 (по левому краю, не центру).
- `dela-card` (используется на кейс-related + /dela/ каталог): min-height 320→240, title/result-value weight 600→500, добавлен `:hover .dela-card__title { color: var(--color-accent) }` + `.dela-card__arrow { color: var(--color-accent) }`.

### `/mktu/` (каталог классов)
- Удалена иконка-плашка (4 чёрных квадрата на серой подложке) из hero.
- Поле поиска переделано под header-search стиль: Cormorant italic 28, иконка-search из спрайта слева, прозрачный input, подчёркивающая `--color-rule-strong` линия.
- `.mktu-item` строки → DS hover pattern (как service-list).
- `.mktu-hero` border-bottom убран (была дублирующая линия), оставлен `border-top` у первой `.mktu-item`.
- mark (подсветка поиска) — на `--color-brand-soft`.

### `/mktu/klass-41/`
- Удалена inline `.mktu-cta` тёмная плашка, заменена на стандартный `.cta-final`.
- Title через `--text-h1-size` token weight 500.
- Удалён дубль `.btn--cta-light` (он уже в sections.css).
- Mute → accent на `.mktu-class-hero__num`.

### Модалка (партиал, синхронизирован на 18 страниц)
- Контакты переделаны: 3 блока вместо 2. **Москва**: адрес (Яндекс.Карты) + телефон (copy). **Тюмень**: адрес + телефон. **Email**: одна почта (copy). Дубль email удалён.
- Все контакты теперь интерактивны (target=_blank на адресах, copy-trigger на тел/email).
- Форма: row gap полей `--space-4 → --space-6` (24px) + `--space-8` (32px) на мобиле — лейблы явно прижаты к своим инпутам.

### Мобильная шапка
- Добавлена accent-кнопка `.btn-consult-mobile` рядом с бургером — открывает модалку. Иконка `send` (бумажный самолётик) — новая в спрайте.
- Цвет наследуется от `--header-fg` (как у бургера), hover opacity 0.65. Без фона.
- Остаётся видна при открытом меню.
- Между accent-кнопкой и бургером компактный gap (`margin-left: -space-5`).
- Логотип на мобиле: `brand__name 20→24px`, `brand__sub 9.5→11.5px`. ≤480: `name 20px / sub 10px`.
- При `body.mobile-open` форсим `--header-rule: var(--color-rule)` — иначе на transparent-шапке (главная) линия снизу была невидима. Убран `box-shadow` (создавал двойную линию на solid).

### Mobile-menu
- Удалён `margin-top: auto` у `.mobile-menu__bottom` — теперь блок идёт сразу за nav-меню, кнопка «Заявка» симметрична: 32px от линии сверху, 32px от линии снизу. Раньше auto-margin давал переменный пустой gap.

### Глобально
- `html { scroll-behavior: smooth }` теперь на всех ширинах (был только ≤1024). Использует aside-nav и article-toc.
- `font-weight: 500` стало правилом DS для всех заголовков (h1/h2/h3) и em внутри — постепенно прокатано по всем page-CSS.

---

## ▶ Сессия 12 мая 2026 — единая дизайн-система + страницы

### Дизайн-система (`tokens.css`, `docs/DESIGN_SYSTEM.md`)
- Brand стал ярче: `#453125` → **`#5a3b25`**. brand-2, brand-soft, brand-rule пересчитаны.
- Новый токен **`--color-brand-tint`** — `rgba(90,59,37,0.06)` для крупных тёплых поверхностей.
- В `DESIGN_SYSTEM.md` добавлена секция «Фирменный акцент»; правило курсива переписано (em = `--color-accent`).
- Серые плейсхолдеры заменены на коричневые в курсивах заголовков: `.modal__title em`, `.related__title em`, `.case-related__title em` — теперь `--color-accent`.
- Hover карточек везде: `#ebebeb` → **`--color-brand-soft`** (`.card--direction`, `.card--case`, `.related__item`, `.dela-card`).

### Главная (`index.html`, `home.css`)
- About-блок (Команда+логотип): `align-items: stretch` → `start` — коричневый квадрат больше не выезжает за свою колонку.
- Журнал на мобиле: у `.card--article-large` `border-bottom` + `padding-bottom` ниже 1024px — линия отделяет featured от списка row-карточек.

### Страница направления (`uslugi/intellektualnaya-sobstvennost/`, `direction.css`)
- `page-hero__lead` 18px ink → 16px mute + выровнен по верху H1 (через `display: contents` на `.page-hero__head`).
- Убрана линия между разделами `.section-anchor + .section-anchor`.
- Верхняя обводка первой услуги: `border-top` на `<li>:first-child`, а не на `<ul>` (учитывает negative margin item'а).
- «Популярные услуги» — 4 → 3 карточки.
- Секция `.related` на десктопе: фон → `--color-brand-tint` (тёплый).
- На мобиле `.related__item` = линейный список как process на главной (без фона/паддингов, разделители `border-bottom`).
- Sticky-полоса разделов: `.aside-nav__list` full-bleed (margin `-gutter` + padding `gutter`) — скролл от края до края экрана.
- Унифицирован заголовок «Дела» (`.case-related__title`) — 36/28 px, weight 600 (был 32/24 weight 500).

### CTA-final (везде)
- 9 страниц: `eyebrow eyebrow--no-rule + inline color` → `eyebrow eyebrow--on-dark` (есть чёрточка перед надзаголовком как на главной).
- Tooltip копирования в `.cta-final` — светлый (paper/ink) вместо тёмного.

### Футер (везде)
- `.footer__brand` 24→22px, `.footer__brand-sub` 11→10px (как `.brand__name`/`.brand__sub` в шапке).
- `.footer__about` 14px → 12px (`--text-meta-size`).

### Плавный скролл
- `html { scroll-behavior: smooth }` под 1024px (плюс reset для `prefers-reduced-motion`) в `base.css`.

### Страница услуги (`uslugi-shablon/`, `service.css`)
- Контакты в `.aside-card` получили `copy-trigger` + data-* (как везде); placeholder email `trademarks@1-tm.ru` → `law@1-tm.ru`.
- `.aside-card`: фон `#f3eee5` → `--color-brand-tint`; divider → `--color-brand-rule`; иконки контактов → `--color-brand-soft` фон + `--color-accent`.
- FAQ на мобиле: вопрос 17px → 20px (явный контраст с ответом 16px).

### О бюро (`o-byuro/index.html`, `about.css`)
- **Удалены `cta-strip` и `offices-strip`** перед CTA-final (дублирование). 11 копий комментария `<!-- FOOTER -->` сжаты в одну.
- Заголовки по токенам: `page-hero__title` 80px → `var(--text-h1-size)` (74); `about-intro__title` 56px → `var(--text-h2-size)`. 3 inline-style блока заменены на `<header class="section-head">`.
- **Stats-band переделан**: убран full-width чёрный фон → ничего/без фона; цифры `--color-ink`, em — `--color-accent` (коричневый); тонкие линии `--color-rule`. На мобиле 640: 2×2 «крест» (внутренние линии без рамки), padding меньше.
- **Команда**: `team-filter` (вкладки) **удалён** из HTML и CSS; `member__index` («01 / Партнёр») удалён из всех карточек.
- **Карточки**: квадрат 1/1, линия `border-bottom` снизу, без фона карточки (фото на `--color-paper-2`, гото́во к фото подготовленным на сером).
- **Шаблон карточки** зафиксирован: HTML-комментарий перед `.team-grid` + раздел в `docs/COMPONENTS.md` (правила: `role` — только должность; `creds` — 3 строки в порядке статус→опыт+город→направление; пустые строки не оставляем).

### Мобильные правки (общие)
- `section-title` на десктопе 56px → **40px** ≤1024, **30px** ≤640 (`sections.css` — глобально, не только /o-byuro/). `section-head { margin-bottom }` тоже скорректирован.
- `.about-intro__title` ≤640: 36px.
- `.principle` ≤1024: убраны боковые padding'и — текст прижат к gutter container.
- `body { overflow-x: clip }` перенесён из `direction.css` в `base.css` — теперь защита от горизонтального скролла глобальная.
- Stats-band ≤640: «крест» из 2 внутренних линий, без внешней рамки.

### Журнал (`zhurnal/`, `journal.css`)
- Eyebrow «Аналитика бюро · 7-й год выпуска» → «Аналитика бюро».
- **Фильтры-чипсы** → стиль `.chip` дизайн-системы (квадратный 2px, `--color-paper-2` фон, hover → `--color-brand-soft` + `--color-accent`, активный — `--color-accent`).
- Featured карточка: `align-items: center` → `start` — текст выровнен по верху картинки.
- Страница статьи: `.article-head` — `margin: 0` (по левому краю), `max-width: 820px` сохранён.

### Унификация компонентов (12 мая, последнее)
- **Filter-chip** — единый стиль в `components.css` через групповой селектор `.journal-filter, .dela-filter, .search-filter__chip` + соответствующие `:hover` / `.is-active` / `__count`. Дубли удалены из `journal.css`, `dela.css`, `search.css`.
- **Quote/Callout** — единый компонент в `components.css`: `.callout, .article-prose blockquote` (левая чёрточка `--color-accent`, font-display italic 500 22px, max-width 680px, на мобиле 18px). Дубли удалены из `service.css` и `journal.css`.

---

## ▶ Хронология крупных работ 10 мая

### Десктоп — общесистемные правки
- **Дизайн-система:** `--color-brand: #453125` (фирменный коричневый) внедрён в токены и через все hover-состояния (`.btn--primary/glass/ghost`, `chip`, `mega-link`, `.section-head__action`, `.copy-trigger`). Lining + tabular figures для Cormorant.
- **Sprite иконок** — `assets/icons/sprite.svg`. Все unicode-стрелки заменены на SVG `arrow-right`. Иконки: search, close, backspace, chevron-down, copy, check, map-pin, paperclip, info, alert.
- **Шапка:** топбар без пробелов вокруг точки в email; copy-on-click + tooltip + toast (см. `assets/js/copy-tooltip.js` + `utils.css`); кнопка «Услуги» с компактным chevron; мегаменю — ровно 6 услуг в каждом направлении (плейсхолдеры в «Договоры» и «Сопровождение» помечены, заказчик переименует).
- **Поиск в шапке:** sticky-футер «Все результаты», fade-маска при скролле, chips популярных запросов при пустом поле, отдельная кнопка backspace для очистки.
- **Главная:** hero-стрелки SVG; блоки 2/3 с `.section-head--with-lead-aside` (лид справа от H2); блок 5 (журнал) — фикс специфичности с-action; блок 6 (О бюро) — поменян порядок, логотип `Logo1m.svg` на коричневом квадрате; «Нам доверяют» — marquee-анимация без кнопки «все клиенты» (placeholder под реальные SVG логотипы клиентов).
- **CTA унифицирован** на 10 страницах в формат «1 кнопка + 3 контакта в ряд» через `scripts/sync-cta.py`. Стрелка в кнопке по запросу убрана.
- **Футер:** copy для тел/email с tooltip-ом сверху; кликабельные адреса → Яндекс.Карты с map-pin иконкой; выровнен брэнд через `line-height: 0.78`.

### Юр-страницы (5 шт.)
- `/legal/privacy/`, `/legal/personal-data/`, `/legal/cookies/`, `/legal/oferta/`, `/legal/rekvizity/` — собственные тексты по 152-ФЗ + ГК РФ. Двухколоночный layout (контент + sticky-TOC), типографика `assets/css/pages/legal.css`. Реквизиты компании остались плейсхолдерами.

### Форма заявки
- Маска телефона `+7 (___) ___-__-__`, валидация на blur+submit, состояния `field--filled/valid/invalid` с подписями ошибок. Чекбокс согласия со ссылками на 3 правовых документа.
- Файлы: до 3, 10 МБ каждый, 25 МБ суммарно; форматы PDF/DOC/DOCX/XLS/XLSX/JPG/PNG/ZIP/RAR/7Z. Накопительный `savedFiles` в JS-замыкании (браузер при повторном выборе перезаписывает `input.files`, мы добавляем поверх).

### Мобильная (главная)
- Hero 70vh с центрированным контентом + замена фоновой картинки на `ImageMobile.png` (обновлялась трижды, чтобы градиент бесшовно переходил в статус-бар). Финальный цвет дизайн-системы — `#0a0a0a` (`--color-ink`).
- iOS статус-бар: meta `theme-color` + динамическая смена через JS при открытии меню; `html { background }` для подстраховки.
- Меню: поле поиска в стиле системы над nav; крупные контакты + CTA 56px; mobile-menu подключено ко всем 18 страницам (раньше на legal не было).
- Бургер ↔ X в одной точке. Шапка при `body.mobile-open` поднимается над меню (`z-index`), форсится в solid-режим, тонкая линия снизу. `.mobile-menu__head` спрятан, panel получает `padding-top: header-h-mobile`.
- Cases — 6 карточек на mobile (`nth-child(n+7) { display: none }`).
- CTA-final — фон сдвинут на 30/22% влево.
- Tooltip только на `(hover: hover) and (pointer: fine)` — на тач-устройствах не появляется при tap.
- Copy-on-click тоже только на pointer:fine — на телефоне tap по тел/email сразу выполняет нативное действие.
- Map-pin для адресов — заменили CSS-mask на inline svg (mask нестабилен в старых iOS Safari).

### Скрипты автоматизации (`scripts/`)
- `sync-partials.py` — header/footer/modal/mobile-menu из `partials/*` во все 18 inline-копий. Auto-добавление `theme-color`, `utils.css`, `main.js`, `search.js`, `copy-tooltip.js`. Поддерживает `<!-- @include name -->` placeholder и регекс-замену существующих блоков.
- `sync-cta.py` — унификация cta-final actions+contacts на 10 страницах (заголовки и лиды трогает не).

---

## ✅ Готово

### Структура проекта (8 мая 2026)
Монолитные HTML-файлы разнесены на shared CSS/JS + page-specific. Папочная структура совпадает с целевыми URL.

| Файл | URL | Примечания |
|---|---|---|
| `index.html` | `/` Главная | Hero, 4 направления, процесс, дела, журнал, о бюро, CTA. Прозрачная шапка → белая при скролле. |
| `uslugi/index.html` | `/uslugi/` | Каталог услуг — 4 направления крупными карточками. *(8 мая)* |
| `uslugi/intellektualnaya-sobstvennost/index.html` | `/uslugi/intellektualnaya-sobstvennost/` | Эталон страницы направления. Page hero, sticky aside-nav, 6 секций-якорей, related directions. |
| `uslugi-shablon/index.html` | (шаблон) | Шаблон страницы услуги (110 шт. в WP по этому шаблону). Facts strip, content blocks, prose, FAQ, pricing. |
| `o-byuro/index.html` | `/o-byuro/` | История, ценности, цифры. *(8 мая)* |
| `kontakty/index.html` | `/kontakty/` | Москва + Тюмень, формы. *(8 мая)* |
| `poisk/index.html` | `/poisk/` | Страница поиска (noindex), JS — `assets/js/search.js`. *(8 мая)* |
| `zhurnal/index.html` | `/zhurnal/` | Каталог статей: hero, фильтры рубрик, featured + 7 карточек, пагинация. *(9 мая)* |
| `zhurnal/ekspertiza-tovarnyh-znakov-2026/index.html` | (шаблон статьи) | Шаблон статьи: header+lead, cover, layout (контент + sticky TOC), prose-типографика, автор, related. *(9 мая)* |
| `dela/index.html` | `/dela/` | Каталог кейсов: hero, фильтры по направлениям, 9 текстовых карточек (без фото, монохром), пагинация. *(9 мая)* |
| `dela/vzyskanie-kompensatsii-fmcg/index.html` | (шаблон кейса) | Шаблон кейса: head с большим результатом, 3 этапа (Задача / Решение / Результат) с sticky-метками, метрики, related. *(9 мая)* |
| `mktu/index.html` | `/mktu/` | Каталог классов МКТУ с поиском (5 из 45). |
| `mktu/klass-41/index.html` | `/mktu/klass-41/` | Шаблон страницы класса (45 шт. в WP по этому шаблону). |

### Shared assets

CSS:
- `assets/css/tokens.css` — все CSS-переменные
- `assets/css/base.css` — reset, layout, page padding, gutter responsive
- `assets/css/components.css` — text-meta, link, btn, card, section-head, partners, form, breadcrumbs
- `assets/css/header.css` — site-header, mega-menu, search-row, responsive
- `assets/css/mobile-menu.css` — fullscreen overlay, drill-down уровни
- `assets/css/footer.css`
- `assets/css/sections.css` — обёртки `.section`, `.cta-final`
- `assets/css/modal.css` — split-layout consult modal
- `assets/css/pages/{home,direction,service,mktu,mktu-class,about,contacts,search,journal,dela}.css`

JS:
- `assets/js/main.js` — header, mobile-menu, modal, file upload, aside-nav scroll-spy
- `assets/js/mktu.js` — поиск/фильтр по классам
- `assets/js/mktu-class.js` — раскрыть/свернуть перечень
- `assets/js/search.js` — логика страницы поиска

Partials (для копирования при создании новых страниц / для WP-разработчика):
- `partials/head.html`, `header.html`, `mobile-menu.html`, `footer.html`, `modal.html`

Прочее: `robots.txt`, `sitemap.xml`, `README.md`.

### Что было исправлено в этом рефакторе
- Форма заявки приведена к новому split-layout (фото слева, форма справа) на ВСЕХ страницах. Раньше split был только на главной.
- Контакты в модале — Москва + Тюмень (раньше был placeholder Санкт-Петербург).
- CSS вынесен из inline `<style>` в shared-файлы — изменение токенов / шапки / модала теперь правится в одном месте.
- JS-логика `headerAlwaysSolid` корректно работает на обеих ветках (транспарентная и белая шапка).

---

## 🔲 Осталось создать

### ~~Приоритет 1~~ — закрыт 8 мая 2026
- ~~`uslugi/index.html`~~ ✅
- ~~`kontakty/index.html`~~ ✅
- ~~`o-byuro/index.html`~~ ✅

### ~~Приоритет 2~~ — закрыт 9 мая 2026
- ~~`zhurnal/index.html` + шаблон статьи~~ ✅
- ~~`dela/index.html` + шаблон кейса~~ ✅
- ~~`komanda/index.html`~~ ❌ отменено: команда живёт блоком `#team` внутри `/o-byuro/`

### ~~Приоритет 3~~ — закрыт 8 мая 2026
- ~~`poisk/index.html`~~ ✅ (noindex)

### Приоритет 4 — недостающие страницы направлений
3 направления (`dogovory-i-sdelki`, `spory-i-zashchita`, `soprovozhdenie-biznesa`) создаются в WordPress по шаблону `uslugi/intellektualnaya-sobstvennost/`. Если хотим иметь их статически для review — копировать и заменять контент.

### Приоритет 5 — продолжение
- 40 оставшихся классов МКТУ (создаются в WP по шаблону `mktu/klass-41/`)
- 110 страниц услуг (создаются в WP по шаблону `uslugi-shablon/`)

---

## 📋 Известные задачи и замечания

- [ ] Заменить placeholder-фото в модале (Unsplash URL) на реальное изображение бюро
- [ ] Подтвердить адреса офисов: «ул. Тверская, 12, оф. 510» (Москва), «ул. Республики, 65, оф. 304» (Тюмень) — в footer указаны примерные
- [ ] Заменить placeholder-логотипы клиентов и СМИ на реальные
- [ ] Проверить hero фоновое фото (главная) — заменить на реальное
- [ ] Подтвердить домен и обновить `robots.txt` + `sitemap.xml` если отличается от `1-tm.ru`
