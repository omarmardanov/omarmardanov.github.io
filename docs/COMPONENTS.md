# COMPONENTS.md — Компоненты FPB

> Все компоненты уже реализованы в CSS эталонного файла `uslugi-intellektualnaya-sobstvennost.html`.
> При создании новых страниц — использовать существующие классы, не создавать новые без необходимости.

---

## Шапка `.site-header`

Два режима через CSS-переменные:

**Прозрачная (главная страница)** — переменные по умолчанию, текст светлый поверх hero-фото.
После скролла JS добавляет `data-scrolled` → шапка становится белой.

**Белая (все остальные страницы)** — класс `site-header--always-solid` на `<header>`, переопределяет переменные на тёмные.

### Структура
```
.site-header
  .topbar                        ← телефоны, email, язык (скрыт на mobile)
    .topbar__inner.container
      .topbar__locations
      .topbar__email
      .topbar__lang
  .header-main-wrap
    .container.header-main
      .brand                     ← логотип + подпись
      .header-nav                ← скрыт на mobile
        .btn-search
        .primary-nav
          button.nav-link        ← "Услуги" с кaret (открывает мегаменю)
          a.nav-link             ← прочие пункты
      .btn.btn--glass            ← CTA "Заявка на консультацию"
      button.nav-toggle          ← бургер, только mobile
  .header-extra                  ← раскрывается через grid-template-rows
    .mega                        ← мегаменю услуг
    .search-row                  ← строка поиска
```

### Мегаменю `.mega`
4 колонки направлений. Управляется через `data-extra="mega"` на `.site-header`.

### Поиск `.search-row`
Строка с большим italic-инпутом. Управляется через `data-extra="search"`.

---

## Мобильное меню `.mobile-menu`

Fullscreen overlay. Два уровня навигации через `data-level="0"` и `data-level="1"`.
Уровень 0 — главное меню. Уровень 1 — подменю услуг.

```
.mobile-menu
  .mobile-menu__head             ← логотип + крестик
  .mobile-menu__panel[data-level="0"]
    .mobile-menu__nav            ← список пунктов
    .btn--primary                ← CTA
    .mobile-menu__contacts       ← телефоны и email
  .mobile-menu__panel[data-level="1"]
    .mobile-menu__back           ← кнопка назад
    .mobile-menu__level-title
    .mobile-menu__nav            ← подпункты услуг
```

---

## Модал консультации `.modal`

Split-layout: фото слева (38%), форма справа (62%).

```
.modal#consultModal
  .modal__backdrop               ← клик закрывает
  .modal__dialog
    .modal__photo                ← фото + контакты городов
      .modal__photo-contacts
        .modal__photo-city
        .modal__photo-contact    ← ссылка tel: или mailto:
    .modal__body
      button.modal__close
      h2.modal__title
      p.modal__lead
      form.consult-form
        .consult-form__grid      ← сетка 2 колонки
          .field                 ← стандартное поле
          .field.field--full     ← поле на всю ширину
          .field.field--select
        label.checkbox           ← согласие на ПД
        button.btn--primary.btn--block
```

**Открытие:** любой элемент с классом `.js-open-consult`.
**Mobile:** `.modal__photo` скрыт, поля в одну колонку.

---

## Кнопки `.btn`

```css
.btn              ← базовый стиль
.btn--primary     ← чёрная заливка, белый текст
.btn--glass       ← полупрозрачная (шапка на hero)
.btn--ghost       ← обводка, прозрачный фон
.btn--block       ← width: 100%
.btn--w-220       ← фиксированная ширина 220px
.btn--icon        ← квадратная кнопка-иконка 40×40
```

Все кнопки высотой `--btn-h: 40px`. Стрелка `→` добавляется текстом, не иконкой.

---

## Поля форм `.field`

```
.field
  label.field__label    ← подпись + .req для *
  input.field__input    ← текстовый инпут
  — или —
  select.field__select  ← выпадающий список (+ .field--select на .field)
  — или —
  textarea.field__textarea
  — или —
  input[type=file].field__file  ← скрытый
  label.field__file-trigger     ← видимая кнопка прикрепления
  ul.field__file-list           ← список прикреплённых файлов
```

**Стиль инпутов:** нижняя граница (border-bottom), не рамка со всех сторон.
При `:focus` нижняя граница меняется на `--color-ink`.

---

## Чекбокс `.checkbox`

Кастомный чекбокс с SVG-галочкой.
```
label.checkbox
  input[type=checkbox].checkbox__input  ← скрытый
  span.checkbox__box                    ← визуальный квадрат + SVG галочка
  span                                  ← текст с ссылками
```

---

## Навигация по странице `.aside-nav`

Sticky-навигация на страницах направлений и услуг.
```
nav.aside-nav
  h4.aside-nav__title
  ul.aside-nav__list
    li
      a.aside-nav__link
      a.aside-nav__link.is-active   ← активный пункт
```

---

## Хлебные крошки `.breadcrumbs`

```
nav.breadcrumbs[aria-label="Хлебные крошки"]
  a.breadcrumbs__item.link   ← кликабельные
  span.breadcrumbs__sep      ← "/"
  span.breadcrumbs__item.is-current  ← последний, не кликабельный
```

---

## Карточки

### Карточка услуги `.service-card`
Используется в каталоге услуг и на страницах направлений.
Содержит: номер / название / краткое описание / ссылку.

### Карточка кейса `.case-card`
Используется в секции «Дела» на главной и на странице `/dela/`.
Содержит: категория / заголовок / результат / изображение.

### Карточка статьи `.journal-card`
Используется в секции «Журнал» на главной и на странице `/zhurnal/`.
Содержит: дата / рубрика / заголовок / лид / ссылка.

---

## Секции страниц

### `.section-head` — заголовок секции
```
.section-head                  ← базовый
.section-head--with-action     ← с кнопкой «все →» справа
  .section-head__label         ← моно-метка сверху (опционально)
  h2.section-head__title
  .section-head__action        ← ссылка/кнопка "Все дела →"
```

### `.page-hero` — hero страниц направлений и услуг
```
.page-hero
  .page-hero__grid             ← 2 колонки
    .page-hero__head
      .breadcrumbs
      h1
      p.lead
      .page-hero__actions      ← кнопки
    .page-hero__aside          ← aside-nav или дополнительный контент
```

### `.cta-final` — финальная CTA-секция перед футером

Тёмная секция с фотофоном и оверлеем, призыв к консультации. Структура одна на всех страницах — текст индивидуальный под контекст.

```
section.cta-final
  .cta-final__bg                ← фоновое фото
  .cta-final__overlay           ← затемнение
  .container
    .cta-final__content
      span.eyebrow.eyebrow--no-rule   ← короткая подводка (моно), 3-6 слов
      h2.cta-final__title             ← заголовок с <em>акцентом</em>, 2 строки <br>
      p.cta-final__lead               ← 2-3 предложения призыва
      .cta-final__actions
        button.btn--cta-light.js-open-consult   ← основная кнопка
        a.btn--ghost-light.cta-final__phone     ← телефон Москвы
```

**Правила применения:**

| Тип страницы | CTA-final | Тон текста |
|---|---|---|
| Главная | ✓ | Общий призыв к работе с бюро |
| Каталог (`/uslugi/`, `/dela/`, `/zhurnal/`) | ✓ | «Не уверены, с чего начать?» / «Ваше дело уникально» |
| Направление, шаблон услуги | ✓ | По теме раздела/услуги: «Защитите бренд», «Подадим в Роспатент» |
| Контентная страница (статья, кейс) | ✓ | По теме материала: «Похожая ситуация?», «Получили отказ?» |
| О бюро | ✓ | Знакомство → действие: «Узнали о бюро. Расскажите о задаче» |
| Справочник МКТУ | ✓ | Утилитарный → тематический: «Нашли класс — поможем зарегистрировать» |
| Контакты | ✗ | Сама страница = призыв (формы, телефоны) |
| Поиск | ✗ | Утилитарная, без CTA |
| Страница класса МКТУ (`/mktu/klass-N/`) | заменяется на `.mktu-cta` | Узкий контекст |

**Тон-оф-войс:** короткое, без штампов «команда профессионалов», заголовок строится как <em>сильное обещание</em> или <em>прямой вопрос</em>. Lead раскрывает что произойдёт после клика (срок ответа, бесплатная консультация). Без восклицательных знаков.

---

## Футер `.site-footer`

Тёмный фон (`--color-ink`), светлый текст.
```
.site-footer
  .container
    .footer__cols              ← grid 4 колонки → 2 → 1 на mobile
      .footer__col             ← бренд + описание
      .footer__col             ← направления (ссылки)
      .footer__col             ← бюро (ссылки)
      .footer__col             ← контакты
        .footer__contact-block (×3 — Москва, Тюмень, Email)
    .footer__bottom            ← копирайт + юр. ссылки
      .footer__legal
```

---

## Специфичные компоненты МКТУ

### `.mktu-item` — строка класса в списке
Flex: описание слева, номер класса справа. Hover: лёгкий фон.

### `.mktu-terms__box` — блок перечня товаров
Серый фон, текст с `line-clamp` по умолчанию, кнопка «Раскрыть список».

### `.mktu-cta` — CTA-баннер на странице класса
Тёмный баннер с текстом и кнопкой консультации.

---

## Карточка сотрудника (`.member`) — блок «Команда» на `/o-byuro/`

Изящная карточка без фона: квадратное фото сверху (`aspect-ratio: 1 / 1`),
текст под ним, тонкая линия снизу разделяет ряды. Сетка `team-grid` — 3 кол. на
десктопе, 2 на ≤1024, 1 на ≤640.

```
<article class="member">
  <div class="member__portrait" data-initials="ИФ"></div>
  <div>
    <h3 class="member__name">Имя Фамилия</h3>
    <p class="member__role"><strong>Должность</strong></p>
  </div>
  <div class="member__creds">
    <span><strong>Статус</strong></span>            ← опционально
    <span>Опыт — N лет · Город</span>
    <span>Направление</span>
  </div>
</article>
```

**Правила заполнения для WP:**
- `member__name` — только ФИО.
- `member__role` — только должность («Юрист», «Партнёр», «Старший юрист»).
  Без `·` и хвостов: статус, направление, город идут в `member__creds`.
- `member__creds` — до 3 строк строго в этом порядке:
  1. **Статус** (опционально): «Патентный поверенный РФ», «Адвокат · АП Москвы»,
     «Бывший сотрудник ФАС России». Если статуса нет — строку пропускаем,
     не оставляем пустой `<span>`.
  2. **Опыт + город** одной строкой: `Опыт — 12 лет · Москва`.
  3. **Направление**: «Товарные знаки, патенты», «Арбитражные споры, СИП».
- `data-initials` — инициалы (2 буквы кириллицы) для placeholder-фото; когда
  будет настоящий портрет, фото готовится на `--color-paper-2` фоне,
  чтобы естественно сливаться с карточкой.
