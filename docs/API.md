# API reference

- [Creating a calendar](#creating-a-calendar)
- [Options](#options)
- [Events (data)](#events-data)
- [Instance methods](#instance-methods)
- [Callbacks](#callbacks)
- [Dark mode](#dark-mode)
- [Design tokens](#design-tokens)
- [Keyboard and assistive technology](#keyboard-and-assistive-technology)
- [Wording and numerals](#wording-and-numerals)
- [Static methods](#static-methods)

---

## Creating a calendar

Zarvan is loaded with a `<script>` tag and lives on `window.Zarvan`. It is not an ES module or a
CommonJS module — copy `dist/` into your static assets and add two tags. See the README.

```js
var cal = Zarvan.create({ selector: "#calendar", events: [] });
```

`Zarvan.version` reports the build.

`create()` renders synchronously — the calendar is in the DOM by the time it returns. Every subsequent
change is batched into one animation frame unless you pass `renderMode: "sync"`.

---

## Options

### Core

| Option | Type | Default | Notes |
|---|---|---|---|
| `selector` | string \| Element | — | Required. |
| `events` | array \| function | `[]` | An array, or a function asked for one range at a time — see [Loading events on demand](#loading-events-on-demand). |
| `eventCacheLimit` | number | `12` | How many fetched ranges to remember. Lazy sources only. |
| `view` | string | `"month"` | `day` `week` `month` `year` `list`, or a registered view. Falls back if disabled. |
| `locale` | string \| object | `"fa"` | Persian is the only bundled locale. Pass a partial one to retune its wording — see [Wording and numerals](#wording-and-numerals). |
| `colorScheme` | `"light"` \| `"dark"` \| `"auto"` | `"light"` | `"auto"` follows the system's `prefers-color-scheme` and keeps following it. See [Dark mode](#dark-mode). |
| `sidebarOpen` | boolean | `false` | Whether the sidebar starts open. Needs `features.sidebar`; change it later with [`setSidebarOpen()`](#configuration). |
| `renderMode` | `"batched"` \| `"sync"` | `"batched"` | `"sync"` renders on every change. |
| `shadow` | boolean | `false` | Render inside a shadow root. |
| `styles` | string \| CSSStyleSheet \| array | — | Shadow mode only; CSS to adopt. |
| `plugins` | array | registered set | `[]` installs none. |
| `deps` | object | `{}` | `{ xlsx }` for the export plugin. |
| `handlers` | object | `{}` | Callbacks by name; same set as `.on()`. |

### Presentation

| Option | Type | Notes |
|---|---|---|
| `typeLabels` | object | `{ meeting: "پیگیری" }` — display names per event type. |
| `typeStyles` | object | `{ meeting: { bg, color } }`. Types without an entry get a stable auto-colour. |
| `highlights` | array | Day backgrounds and time bands. See [Highlight rules](#highlight-rules). |
| `validation` | object | `{ enabled, requireNumericId, onInvalid, autoFix }`. |

`validation.onInvalid` is `"drop"` (default) or `"keep"`; kept events are flagged `_invalid`.
`validation.autoFix` repairs an `end` that falls strictly before `start`.

### The sidebar

Collapsed unless you ask for it open:

```js
Zarvan.create({ selector: "#calendar", sidebarOpen: true });
```

An initially-open sidebar is open in the first frame rather than sliding open in front of the reader.
Construction emits no `onSidebarToggle` — nothing toggled, and `onInit` is the callback that reports
construction.

After that, `setSidebarOpen()` is the programmatic half of the menu button:

```js
cal.setSidebarOpen(true);    // returns the state in force
cal.isSidebarOpen();         // true
cal.setOption("sidebarOpen", false);   // the same thing; it is a hot option
```

It takes the same path a click does, so it animates, moves focus and reports through
`onSidebarToggle` identically — there is one path, not two that can drift.

It is **idempotent**: asking for the state it is already in does nothing and emits nothing, which is
what makes it safe to call from a resize handler or a route change without checking first.

```js
window.addEventListener("resize", () => cal.setSidebarOpen(window.innerWidth > 1200));
```

With `features.sidebar: false` there is no panel: `isSidebarOpen()` is always `false`, and
`setSidebarOpen(true)` returns `false` and warns with `warn.sidebarDisabled` rather than doing nothing
quietly.

### `features`

Every flag defaults to `true` except `autoScrollToNow`.

```js
features: {
  sidebar, miniCalendar, filters, typeFilter, search, autocomplete, exportExcel,
  viewDropdown, menuButton, navigation, prevNext, todayButton,
  views: { month, week, day, year, list },
  dayHighlights, timeHighlights, nowLine, autoScrollToNow,
  moreEventsModal, allDayRow, allDayBar,
  interactions: { click, dblClick, hover, contextMenu, focus },
  typeStyleInjection, events, overlapFocus,
  timeGridLayout: "overlap" | "columns",
}
```

`timeGridLayout` chooses how overlapping events are laid out: `"overlap"` cascades them with a visible
offset, `"columns"` packs them side by side like Google Calendar.

---

## Events (data)

```js
{
  id: 1,                                 // any comparable value; needed for updateEvent/removeEvent
  title: "جلسه طراحی",
  start: "1405-06-02T09:00",             // "YYYY-M-D" or "YYYY-M-DTHH:MM", padding optional
  end: "1405-06-02T10:30",               // defaults to start
  type: "meeting",                       // drives colour and filtering
  allDay: false,
  forceTimed: false,                     // keep a multi-day event on the time grid
  repeat: { freq, interval, until, count, byWeekday },
}
```

An event is all-day if `allDay` is set, if `start` has no time component, or if it spans more than one
day without `forceTimed`.

`repeat.freq` is `"daily"` / `"weekly"` / `"monthly"`; `interval` defaults to `1`; `byWeekday` counts
from Saturday (`0`); `until` is inclusive; `count` caps occurrences within the queried range.

### Highlight rules

```js
{
  views: ["month", "week"],              // optional; all views when omitted
  when: {
    weekday: [5, 6],                     // Saturday = 0
    jDates: ["1405-06-02"],
    jRange: { start: "1405-06-01", end: "1405-06-31" },
  },
  day:  { bg: "#fff3f3", className: "is-holiday" },
  time: { start: "09:00", end: "17:00", bg: "rgba(0,128,0,.1)" },   // week/day only
}
```

All `when` clauses must match. Later rules override earlier ones. `when` may be omitted and its keys
written at the top level.

### Loading events on demand

An array keeps every event in memory for the life of the page. Pass a **function** and the calendar
asks for one visible range at a time:

```js
Zarvan.create({
  selector: "#calendar",
  events: async ({ startG, endG, startJ, endJ, view }) => {
    return fetchEventsFromServer(startG, endG);   // array, or a promise of one
  },
});
```

| Field | Type | |
|---|---|---|
| `startG` / `endG` | `Date` | Gregorian, inclusive — what a backend speaks. |
| `startJ` / `endJ` | `{ jy, jm, jd }` | The same bounds in Jalali. |
| `view` | string | The view being drawn. |

**When it asks.** On the visible range changing: navigation, and switching view. A re-render that
leaves the range where it is — filtering, searching, a local edit — does not re-request.

**What it remembers.** Fetched ranges are cached (`eventCacheLimit`, default 12), so paging back and
forth does not re-request. Two asks for the same range share one call.

**Out-of-order answers.** Every request carries a generation; a result that is no longer current is
discarded. Paging forward twice quickly cannot leave the slower request's events on screen.

**What comes back replaces what was loaded.** The source is the authority for the range it was asked
about. Merging would accumulate events from ranges the reader has navigated away from — in memory, in
`getEvents()`, and in the Excel export.

**Local edits.** `addEvent` / `updateEvent` / `removeEvent` show immediately and are not overwritten
on the visible range. They drop the cache, so navigating away and back reloads from the source.
Persist them through your own API; call `refetchEvents()` when you want the source's version now.

**Failures.** A rejected load leaves what is on screen alone rather than blanking the calendar,
reports through `onEventsLoadError` and `onError`, and is not cached — returning to that range tries
again. A load still in flight when `destroy()` runs is ignored.

While any load is outstanding the container carries `zc-is-loading`, which draws a hairline progress
bar across the top of the grid (suppressed under `prefers-reduced-motion`). Style that class for
anything heavier.

---

## Instance methods

### Data

| Method | Returns | Notes |
|---|---|---|
| `getEvents()` | array | A copy. The event objects are shared — treat them as read-only. |
| `getEventById(id)` | object \| null | |
| `setEvents(list)` | array | Replaces everything. Pass a **function** to switch to [loading on demand](#loading-events-on-demand); pass an array to switch back. |
| `addEvent(ev)` | object \| null | Returns the **normalised** stored event; `null` if rejected. |
| `updateEvent(id, patch)` | object \| null | Merges and re-validates. A rejected patch changes nothing. |
| `removeEvent(id)` | object \| null | Returns what was removed. |
| `refetchEvents()` | boolean | Reloads the visible range, ignoring the cache. `false` when `events` is an array. |
| `isLazy()` | boolean | Whether events come from a function. |
| `isLoading()` | boolean | Whether a load is outstanding. |

### Navigation

| Method | Returns | Notes |
|---|---|---|
| `getView()` / `setView(v)` | string | |
| `getViews()` | array | Enabled views, in switcher order. |
| `getDate()` | Date | The active view's anchor date. |
| `getJDate()` | `{jy,jm,jd}` | |
| `gotoDate(date)` | Date \| null | `Date` or `{jy,jm,jd}`. Moves **every** view's anchor. |
| `getVisibleRange()` | `{startG,endG}` | Copies. |
| `next()` / `prev()` / `today()` | | `goNext` / `goPrev` / `goToday` are the older names. |

### Configuration

| Method | Notes |
|---|---|
| `setOption(key, value)` | Feature flags plus `view`, `locale`, `colorScheme`, `sidebarOpen`, `typeLabels`, `typeStyles`, `highlights`, `events`. Anything else warns. |
| `setTheme(tokens)` | Bare names are namespaced; `null` clears an override. |
| `getColorScheme()` | The setting, which may be `"auto"`. |
| `getResolvedColorScheme()` | `"light"` or `"dark"` — what is on screen. |
| `setColorScheme(scheme)` | Returns the scheme in force. Emits `onColorSchemeChange`; no re-render is needed. |
| `isSidebarOpen()` | Always `false` when `features.sidebar` is off. |
| `setSidebarOpen(open)` | Returns the state in force. Idempotent; takes the same path a click on the menu button does. |
| `setTypeStyles(map)` | |
| `getHighlights()` / `setHighlights(list)` | |
| `getLocale()` / `setLocale(l)` | Rebuilds the header, emits `onLocaleChange`. |

### DOM and lifecycle

| Method | Notes |
|---|---|
| `getContainer()` | The element you passed to `create()`. |
| `getRoot()` | The `.zc-calendar` element. Same as above outside shadow mode. |
| `getShadowRoot()` | The shadow root, or `null`. |
| `refresh()` | Render any pending change immediately. |
| `destroy()` | Releases every listener, interval, node and style tag, and hands the element back as it was found: the `zc-calendar` class, `data-zc-id`, `dir`/`lang` and every inline `--zc-*` property the instance wrote are removed. Custom properties the *host* set on that element are left alone. |
| `plugins()` | Names installed into this instance. |

### Bus

`on(name, fn)` → unsubscribe · `off(name, fn)` · `emit(name, payload)`

---

## Callbacks

Pass them as `handlers: { … }` or attach with `.on()`.

**Lifecycle** — `onInit` · `onDestroy` `{phase}` · `onRenderStart` · `onRenderEnd` · `onViewRender`

`onDestroy` fires twice, `{phase: "before"}` then `{phase: "after"}`. Both reach `.on()` subscribers
as well as `handlers`; the listener table is cleared after the second, not before it.

**Navigation** — `onViewChange` `{from,to,source}` · `onDateChange` `{from,to,source}` ·
`onRangeChange` `{startG,endG,view}` · `onNext` · `onPrev` · `onToday`

**Events** — `onEventsSet` · `onEventsChange` `{type,event,events}` · `onEventClick` ·
`onEventDblClick` · `onEventHover` · `onEventLeave` · `onEventContextMenu` · `onEventFocus` ·
`onEventBlur`

Event callbacks receive `(event, meta, ctx)` where `meta` is
`{view, gdate, jdate, isAllDay, domEvent, element}`.

`meta.element` is the node the event was drawn as. Prefer it over `domEvent.currentTarget`, which is
the same node but only while the event is being dispatched, and over `domEvent.target`, which is a
*child* in some views. Every event node also carries the `zc-event-node` class. Any re-render replaces
the node, so do not hold on to it across navigation or a data change.

`onEventsChange.type` is `"set"` · `"add"` · `"update"` · `"remove"`, or `"load"` when a lazy source
has answered.

**Loading** — `onEventsLoadStart` `{startG,endG,view}` · `onEventsLoadEnd` `{events,startG,endG,view}`
· `onEventsLoadError` `{error,startG,endG,view}`

These fire only when `events` is a function. See
[Loading events on demand](#loading-events-on-demand).

**Interaction** — `onDayNumberClick` `{gdate,jdate,view}` · `onWeekHeaderDayClick` ·
`onMoreEventsClick` `{date,events,view}` · `onModalOpen` · `onModalClose` · `onSidebarToggle` ·
`onFiltersChange` `{type,q,source}` · `onAutocompleteSelect` · `onViewDropdownOpen` ·
`onViewDropdownClose`

**Export** — `onExportStart` `{view,fileName}` · `onExportEnd` `{view,fileName,count}` ·
`onExportError`

**Diagnostics** — `onWarn` `{code,message,extra}` · `onError` · `onLocaleChange` `{code}` ·
`onColorSchemeChange` `{scheme,resolved,source}`

Switch on `p.code` in `onWarn`; `p.message` is localised and will change with the locale.

---

## Dark mode

```js
const cal = Zarvan.create({ selector: "#cal", colorScheme: "auto" });
```

`"light"` (the default), `"dark"`, or `"auto"`. Dark is not a second stylesheet: it re-values the
colour tokens under a `zc-scheme-dark` class, so anything you have themed through tokens keeps
working, and so does `shadow: true`.

`"auto"` is resolved in JS rather than by a media query, which means the calendar keeps following the
system for as long as it is set — flip the OS to dark and the calendar goes dark, no reload. The
scheme in force is on `getResolvedColorScheme()`, never `"auto"`:

```js
cal.setColorScheme("dark");
cal.getColorScheme();          // "dark"
cal.getResolvedColorScheme();  // "dark"

cal.on("onColorSchemeChange", (p) => {
  // p.source is "api" when you changed it, "system" when the OS did
  document.body.classList.toggle("dark", p.resolved === "dark");
});
```

Two things do **not** follow the scheme, both deliberately:

- **`typeStyles` colours.** They are yours, and a brand colour is not the library's to reinterpret.
  Give the dark scheme its own set from an `onColorSchemeChange` listener if a colour does not
  survive the change of ground. Types with no entry take the accent, which does follow.
- **Tokens written by `setTheme()`.** Those land as inline custom properties, so they win in both
  schemes. Set them per scheme if they need to differ.

The calendar paints its own background in dark mode (`--zc-color-canvas`), because a dark widget
cannot leave its padding to a light host page. In light mode that token is `transparent`, as before.

---

## Design tokens

The complete theming surface: 85 custom properties, with their light-scheme defaults. Override any of
them on `.zc-calendar` (or a parent) to retheme, or write them at runtime with
[`setTheme()`](#configuration).

Custom properties inherit through a shadow boundary, which is why tokens keep working in
`shadow: true` mode when no other override technique does. The colour tokens — and only those — are
re-valued under `.zc-scheme-dark`; see [Dark mode](#dark-mode).

### Colour

```css
/* brand */
--zc-color-accent: #1a73e8;
--zc-color-accent-weak: #e8f0fe;
--zc-color-accent-tint: #f1f5ff;
--zc-color-accent-tint-alt: #f3f6ff;
--zc-color-accent-ring: rgba(26, 115, 232, .15);
--zc-color-accent-border: #cfd8ff;

/* surfaces */
--zc-color-canvas: transparent;      /* the ground the calendar paints behind itself */
--zc-color-surface: #fff;
--zc-color-surface-alt: #fafafa;
--zc-color-surface-sunken: #f7f7f7;
--zc-color-surface-gutter: #f0f0f0;
--zc-color-surface-header: #f6f7f9;

/* text */
--zc-color-text: #202124;
--zc-color-text-strong: #111827;
--zc-color-text-muted: #5f6368;
--zc-color-text-subtle: #6b7280;
--zc-color-text-faint: #666;
--zc-color-text-icon: #444;

/* lines */
--zc-color-border: #ddd;
--zc-color-border-soft: #eee;
--zc-color-border-softer: #e5e7eb;
--zc-color-border-menu: #e6e6e6;
--zc-color-border-faint: #f0f2f5;
--zc-color-border-strong: rgba(0, 0, 0, .22);
--zc-color-border-stronger: rgba(0, 0, 0, .30);

/* semantic */
--zc-color-now: #ea4335;             /* the now indicator */
--zc-color-on-accent: #fff;          /* ink for anything sitting ON the accent */
--zc-color-hover-veil: rgba(0, 0, 0, .06);
--zc-color-active-veil: rgba(0, 0, 0, .10);
--zc-color-scrim: rgba(0, 0, 0, .35);
--zc-color-conflict-border: #000;
--zc-color-scrollbar: rgba(0, 0, 0, .22);
--zc-color-scrollbar-hover: rgba(0, 0, 0, .32);
--zc-color-scrollbar-gutter: rgba(255, 255, 255, .85);
```

### Event chrome and focus

```css
--zc-event-bg: var(--zc-color-accent);
--zc-event-fg: #fff;
--zc-event-border: rgba(0, 0, 0, .08);

--zc-hl-bg: transparent;             /* written per element by the highlight rules */

/* The reset clears `outline` so the host's focus styling cannot leak in; this replaces it.
   Set it to `none` to suppress the calendar's focus ring altogether. */
--zc-focus-ring: 2px solid var(--zc-color-accent);
--zc-focus-ring-offset: 2px;
```

### Typography

```css
--zc-font-family: inherit;           /* the core stylesheet forces no font */
--zc-font-size-xs: 10px;
--zc-font-size-sm: 11px;
--zc-font-size-md: 12px;
--zc-font-size-lg: 13px;
--zc-font-size-xl: 14px;
--zc-font-size-2xl: 18px;
--zc-line-height: 1.5;
```

### Spacing, radius, elevation and motion

```css
--zc-space-1: 4px;   --zc-space-2: 6px;   --zc-space-3: 8px;
--zc-space-4: 10px;  --zc-space-5: 12px;  --zc-space-6: 15px;

--zc-radius-xs: 4px;  --zc-radius-sm: 6px;   --zc-radius-md: 8px;
--zc-radius-lg: 10px; --zc-radius-xl: 12px;  --zc-radius-pill: 999px;

--zc-shadow-menu: 0 8px 24px rgba(0, 0, 0, .12);
--zc-shadow-modal: 0 4px 16px rgba(0, 0, 0, .2);
--zc-shadow-focus: 0 6px 18px rgba(0, 0, 0, .18);
--zc-shadow-button: 0 1px 2px rgba(0, 0, 0, .06);
--zc-shadow-button-focus: 0 0 0 3px rgba(0, 0, 0, .12);

--zc-transition-fast: .15s ease;
--zc-transition-base: .25s ease;
```

### Structure

```css
--zc-max-width: 1100px;
--zc-week-gutter-width: 69.5px;
--zc-day-gutter-width: 60px;
--zc-sidebar-width: 280px;
--zc-month-row-height: 140px;
--zc-hour-height: 60px;              /* the whole vertical scale of the time grid */
--zc-grid-min-width: 0px;
--zc-week-min-width: 900px;
```

`--zc-hour-height` is the one that matters most: everything positioned on the time grid — events, the
hour lines, the now indicator — is derived from it, so changing it rescales the day rather than
breaking it.

### The z-index scale

Every stacking decision in the library, in one place, so a host that needs to sit something above or
below part of the calendar has a number to aim at rather than a guess to make.

```css
--zc-z-highlight: 2;
--zc-z-hour-line: 3;
--zc-z-event: 10;
--zc-z-event-focus: 18;
--zc-z-gutter: 20;
--zc-z-now: 25;
--zc-z-sticky: 60;
--zc-z-sticky-week: 70;
--zc-z-dropdown: 200;
--zc-z-modal: 1000;
```

The overlap-focus effect also reads four properties the renderer writes, which you can retune:
`--zc-ov-duration`, `--zc-ov-easing`, `--zc-ov-delay` and `--zc-ov-dim-opacity`.

If tokens are not enough, override with a selector of specificity (0,2,0) or higher. The class names
and the reasoning behind that contract are in [CLASS-MAP.md](CLASS-MAP.md).

---

## Keyboard and assistive technology

Everything clickable is operable from the keyboard, and everything focusable has a visible focus ring
(`--zc-focus-ring`; set it to `none` to suppress it).

| Control | Keys |
|---|---|
| Event pill | `Enter` / `Space` fire `onEventClick` |
| View switcher, type filter | `Enter` / `Space` / `↓` open · `↑` `↓` move · `Enter` select · `Esc` close |
| Search suggestions | `↑` `↓` highlight · `Enter` accept · `Esc` dismiss |
| Month, year and mini-calendar day grids | one tab stop each; `←` `→` `↑` `↓` `Home` `End` move within the grid, `Enter` / `Space` open the day |
| "+N more" | `Enter` / `Space` |
| Modal | `Esc` closes · `Tab` cycles inside it · focus enters on open and returns to the opener on close |

The day grids use the roving-tabindex pattern, so a year view is 12 tab stops rather than 372.

The sidebar is `inert` and `aria-hidden` while collapsed: its controls exist in the DOM but are not
reachable by `Tab` and are not announced.

## Wording and numerals

Zarvan is a Persian calendar. The calendar system is Jalali, the layout is right-to-left, and Persian
is the only bundled locale — none of the three is configurable. The container is stamped
`dir="rtl"`, and `lang` follows the locale code.

What a locale *does* control is wording and numerals. Pass a partial locale and everything you do not
name is inherited:

```js
Zarvan.create({
  selector: "#cal",
  locale: { code: "fa", strings: { today: "همین امروز", viewLabel: "نما" } },
});
```

`digits` shapes every number the calendar prints — day numbers, hour labels, event times, the year in
the header. Set it to `null` for Persian text with Latin numerals:

```js
Zarvan.create({ selector: "#cal", locale: { code: "fa", digits: null } });
```

`Zarvan.registerLocale(def)` adds a whole locale for consumers who need different vocabulary
altogether; missing keys fall back to Persian, so a partial definition is usable. A locale has no
`direction` field — right-to-left is a property of the stylesheet, not of the language.

---

## Static methods

| Method | Notes |
|---|---|
| `Zarvan.version` | The build this file came from. A property, not a function. |
| `Zarvan.create(options)` | |
| `Zarvan.registerView(key, def)` | See [DEVELOPING.md](DEVELOPING.md#views-are-registered-not-hardcoded). |
| `Zarvan.unregisterView(key)` / `Zarvan.registeredViews()` | |
| `Zarvan.use(plugin)` / `Zarvan.unuse(name)` / `Zarvan.plugins()` | See [DEVELOPING.md](DEVELOPING.md#plugins). |
| `Zarvan.registerLocale(def)` / `Zarvan.locales()` | See [DEVELOPING.md](DEVELOPING.md#locales). |

`Zarvan._internal` exposes the module registry. It is unstable, exists for the test suite, and is not
part of the API.
