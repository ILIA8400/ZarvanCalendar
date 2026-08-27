# Zarvan Calendar

A Jalali (Persian) calendar UI for the web — month, week, day, year and list views, recurring events,
filtering, highlighting and Excel export.

Persian and right-to-left by design. No framework, no build step, no runtime dependencies, and nothing
fetched at runtime.

**Copy `dist/` into your static assets. Add two tags.**

```html
<link rel="stylesheet" href="/vendor/zarvan/zarvan.css" />
<script src="/vendor/zarvan/zarvan.js"></script>

<div id="calendar"></div>

<script>
  Zarvan.create({
    selector: "#calendar",
    events: [
      { id: 1, title: "جلسه طراحی", start: "1405-06-02T09:00", end: "1405-06-02T10:30", type: "meeting" },
      { id: 2, title: "تعطیل", start: "1405-06-05", allDay: true, type: "holiday" },
    ],
  });
</script>
```

**Documentation:** open **[`website/index.html`](website/index.html)** in a browser. Every feature has a
live, interactive calendar beside its explanation and its code. It needs no server and no network —
double-clicking the file works.

| | |
|---|---|
| [Documentation site](website/index.html) | 28 sections, each with a live calendar |
| [docs/API.md](docs/API.md) | The written reference — every option, method, callback and token |
| [docs/CLASS-MAP.md](docs/CLASS-MAP.md) | Every class, and the override contract |
| [docs/DEVELOPING.md](docs/DEVELOPING.md) | Architecture, and how to work on the library |
| [docs/MIGRATION.md](docs/MIGRATION.md) | Upgrading from v1 or v2 |
| [CHANGELOG.md](CHANGELOG.md) | What changed, and why |

---

## Contents

- [Why you might pick it](#why-you-might-pick-it)
- [Views](#views)
- [Install](#install)
- [TypeScript](#typescript)
- [Persian, and only Persian](#persian-and-only-persian)
- [Dates](#dates)
- [Events](#events)
- [Loading events on demand](#loading-events-on-demand)
- [Callbacks](#callbacks)
- [Common tasks](#common-tasks)
- [Configuration](#configuration)
- [Theming](#theming)
- [Plugins](#plugins)
- [Extending](#extending)
- [Shadow DOM](#shadow-dom)
- [Accessibility](#accessibility)
- [Offline by design](#offline-by-design)
- [Examples](#examples)
- [Browser support](#browser-support)
- [Development](#development)
- [Upgrading](#upgrading)
- [License](#license)

---

## Why you might pick it

- **It survives your app's CSS.** Every class is `zc-`-prefixed and scoped, with a reset that neutralises
  the host's `button`/`input`/`img`/global rules. There is a regression harness
  ([`test/host-hostile.html`](test/host-hostile.html)) that embeds the calendar in a deliberately
  aggressive page and asserts that nothing leaks in. For hosts that fight dirty, `shadow: true` closes
  the last gap.
- **Themed by tokens, not overrides.** 85 CSS custom properties cover colour, spacing, radius,
  typography, elevation, structure and the z-index scale. You retheme by setting variables, not by
  winning specificity fights. There is not one `!important` in the stylesheet.
- **Light and dark.** `colorScheme: "auto"` follows the system and keeps following it. Dark is the same
  tokens re-valued, not a second stylesheet, so whatever you have themed goes with it.
- **Responsive to itself.** Layout is driven by container queries, so a calendar in a 700px column
  behaves like a 700px calendar even on a 1600px screen.
- **Operable from the keyboard.** Every clickable thing is reachable and activatable, the day grids use
  a roving tab stop rather than 372 of them, the modal traps focus and closes on `Esc`, and the
  collapsed sidebar is `inert` instead of an invisible detour through the tab order.
- **Loads only what it shows.** Pass a function instead of an array and the calendar asks for one
  visible range at a time, with ordering, de-duplication and caching handled for you.
- **Nothing to fetch at runtime.** No images, no fonts, no network requests. Two files, with the date
  maths already inside them.
- **Extensible without forking.** Views and plugins are registered, not hardcoded. Highlighting, the now
  indicator and Excel export are themselves plugins.
- **Persian, not "internationalised".** The calendar system is Jalali, the layout is right-to-left and
  the interface is Persian — decided once, so none of it is a runtime branch you can get wrong. Retune
  the wording with a partial locale.
- **Typed.** `dist/zarvan.d.ts` describes the whole surface for TypeScript consumers. It declares
  globals, not modules — point `tsconfig` at it and `Zarvan.create(…)` autocompletes.

## Views

Five, and each one knows the range it covers, how far one step is, and how to draw itself.

| View | Covers | One step | Notes |
|---|---|---|---|
| `month` | One Jalali month | One month | The default. Seven columns; each cell holds as many events as fit and collapses the rest into "+N more". |
| `week` | Saturday → Friday | One week | A 24-hour time grid across seven columns, with an all-day row above it. |
| `day` | One day | One day | The same grid, one column wide. |
| `year` | Twelve months | One year | Twelve mini grids; events are dots plus a `+N` badge, not pills. |
| `list` | One Jalali month | One month | The same range as month view, rendered chronologically. Best on narrow screens. |

```js
Zarvan.create({ selector: "#calendar", view: "week" });

cal.getView();               // "week"
cal.setView("month");        // emits onViewChange
cal.getViews();              // enabled views, in switcher order

// A three-view calendar:
Zarvan.create({ selector: "#calendar", features: { views: { year: false, list: false } } });
```

Week and day keep an anchor date of their own, so switching between them does not lose the day you
were looking at. `gotoDate()` moves **every** view's anchor.

Need a sixth? [`registerView()`](#extending) puts it in the switcher alongside the built-in ones.

## Install

Everything a consumer needs is in **`dist/`**. Copy the folder into wherever you serve static assets
from and you are done — there is nothing to build, resolve or bundle.

| File | | |
|---|---|---|
| `zarvan.js` | required | The library, with the jalaali date maths already inside it. One tag, no load order to get wrong. |
| `zarvan.css` | required | The stylesheet. No `url()`, no font, no asset references. |
| `zarvan.d.ts` | optional | TypeScript definitions for the `Zarvan` global. |
| `zarvan-theme-fa.css` + `fonts/` | optional | Registers the bundled Vazir face. Core CSS forces no font of its own. |

```html
<link rel="stylesheet" href="/vendor/zarvan/zarvan.css" />
<link rel="stylesheet" href="/vendor/zarvan/zarvan-theme-fa.css" />   <!-- optional -->
<script src="/vendor/zarvan/zarvan.js"></script>
```

`Zarvan.version` reports the build you deployed.

**Pinning it as a dependency.** Zarvan is a `<script>`-tag library that lives on `window` — it is
deliberately not an ES module or a CommonJS module, and `package.json` declares no `main` or
`exports` rather than claim otherwise. `import Zarvan from "zarvan-calendar"` will not work. Pin a tag
or a commit SHA and copy the folder across in a build step:

```json
"dependencies": { "zarvan-calendar": "git+ssh://git@github.com/your-org/ZarvanCalendar.git#v3.0.3" }
```

```js
// scripts/copy-zarvan.mjs
import { cpSync } from "node:fs";
cpSync("node_modules/zarvan-calendar/dist", "public/vendor/zarvan", { recursive: true });
```

Vendoring the folder straight into your own tree works just as well, and for a private fork it is
usually simpler: no git-dependency auth in CI, and your SBOM tooling sees real files.

The Excel export additionally needs SheetJS, resolved when the button is pressed — from
`options.deps.xlsx` or `window.XLSX`. It is not bundled and not vendored; without it the button warns
through `onWarn` and nothing else changes.

### What to download

**`dist/` is the only folder you need.** Everything else in this repository exists for people working
*on* Zarvan rather than *with* it:

| | |
|---|---|
| `src/` | The unbuilt modules and stylesheet parts that `dist/` is generated from. |
| `build/` | The three build runners and their manifests. |
| `test/` | Self-verifying harnesses. Worth running if you fork. |
| `examples/` | Worth reading — `vanilla.html` drives every API method live — but not shipping. |
| `docs/` | The written reference. Read it here on GitHub. |
| `website/` | The documentation site — every feature explained beside a live, interactive calendar. Open `website/index.html`. |
| `fonts/` | The source font. Already copied into `dist/fonts/` for you. |

## TypeScript

`dist/zarvan.d.ts` declares the `Zarvan` and `jalaali` globals. It contains no `import` or `export`
on purpose: either would turn it into a module and the globals would stop being visible.

```jsonc
// tsconfig.json
{ "include": ["src/**/*", "vendor/zarvan/zarvan.d.ts"] }
```

```ts
const cal = Zarvan.create({ selector: "#calendar", events: [] });
cal.setView("week");                    // ViewName is checked
cal.on("onEventClick", (ev, meta) => console.log(ev.title, meta.jdate?.jy));
```

## Persian, and only Persian

Zarvan is a Persian calendar, and that is a decision rather than a default:

- The calendar system is **Jalali**. There is no Gregorian mode. Gregorian `Date` objects appear only
  in callback payloads, `getVisibleRange()` and the range handed to a lazy loader — where they exist so
  you can talk to a backend.
- The layout is **right-to-left**, always. The stylesheet is written that way throughout; there is no
  `direction` option and a locale cannot carry one.
- The interface is **Persian**. One locale ships. There is no English locale.

What you *can* change is the wording, with a partial locale — everything you do not name is inherited:

```js
Zarvan.create({
  selector: "#cal",
  locale: { code: "fa", strings: { today: "همین امروز", viewLabel: "نما" } },
});
```

And the numerals, if your product prefers Latin digits with Persian text:

```js
Zarvan.create({ selector: "#cal", locale: { code: "fa", digits: null } });
```

`digits` shapes every number the calendar prints — day numbers, hour labels, event times, the year in
the header.

For different vocabulary altogether, `Zarvan.registerLocale()` takes a whole locale; missing keys fall
back to Persian, so a partial definition is usable.

The date maths ships inside `zarvan.js`, so you get the `jalaali` global too:

```js
jalaali.toJalaali(2026, 8, 27);        // { jy: 1405, jm: 6, jd: 5 }
jalaali.toJalaali(new Date());         // a Date works too
jalaali.toGregorian(1405, 6, 5);       // { gy: 2026, gm: 8, gd: 27 }
jalaali.isLeapJalaaliYear(1403);       // true
jalaali.jalaaliMonthLength(1405, 12);  // 29
```

The Jalali week runs Saturday to Friday, and **Saturday is `0`** everywhere the library counts
weekdays — `repeat.byWeekday`, a highlight rule's `when.weekday`, and a locale's `weekdays` array.
`[5, 6]` is the Persian weekend. JavaScript numbers Sunday as `0`; converting is
`(date.getDay() + 1) % 7`.

## Dates

Dates are Jalali strings: `"YYYY-M-D"` for an all-day event, `"YYYY-M-DTHH:MM"` for a timed one.
Zero-padding is optional — `"1405-6-2"` and `"1405-06-02"` are the same date.

```js
{ id: 1, title: "Standup", start: "1405-06-02T09:00", end: "1405-06-02T09:15", type: "meeting" }
{ id: 2, title: "Sprint",  start: "1405-06-02",       end: "1405-06-05", allDay: true }
{ id: 3, title: "Weekly",  start: "1405-06-02T15:00", end: "1405-06-02T16:00",
  repeat: { freq: "weekly", interval: 1, byWeekday: [0, 2], until: "1405-12-29" } }
```

## Events

```js
{
  id: 1,                          // any comparable value; needed for updateEvent/removeEvent
  title: "جلسه طراحی",
  start: "1405-06-02T09:00",
  end: "1405-06-02T10:30",        // defaults to start
  type: "meeting",                // drives colour and filtering
  allDay: false,
  forceTimed: false,              // keep a multi-day event on the time grid
  repeat: { freq, interval, until, count, byWeekday },
}
```

An event is all-day if `allDay` is set, if `start` has no time component, or if it spans more than one
day without `forceTimed`.

**Recurrence.** `repeat.freq` is `"daily"`, `"weekly"` or `"monthly"`; `interval` defaults to `1`;
`byWeekday` counts from Saturday (`0`); `until` is inclusive; `count` caps occurrences within the
queried range. One object is stored and expanded across the visible range only, so a daily event
running for ten years costs one object rather than 3,650.

**Types and colours.** `type` is a free string. Give it a colour with `typeStyles`, a display name with
`typeLabels`, or neither — a type with no entry gets a stable colour derived from the name itself, so a
type your backend invents this morning is still legible this afternoon.

```js
Zarvan.create({
  selector: "#calendar",
  typeStyles: { meeting: { bg: "#2563eb", color: "#fff" }, holiday: { bg: "#dc2626", color: "#fff" } },
  typeLabels: { meeting: "جلسه", holiday: "تعطیل" },
});
```

**Validation.** Events are checked as they arrive. A malformed one is reported through `onWarn` with a
stable `code` and dropped — the calendar does not throw and does not render half an event. Use
`validation: { onInvalid: "keep" }` to keep and flag them instead, and `autoFix` to repair an `end`
that falls before its `start`.

**Highlights.** Declarative background rules for days and bands of time — a weekend, a holiday list,
working hours — without touching a single event:

```js
Zarvan.create({
  selector: "#calendar",
  highlights: [
    { when: { weekday: [5, 6] }, day: { bg: "rgba(220,38,38,.08)" } },
    { when: { jDates: ["1405-01-01", "1405-01-02"] }, day: { bg: "rgba(220,38,38,.20)", className: "is-holiday" } },
    { views: ["week", "day"], when: { weekday: [0, 1, 2, 3, 4] },
      time: { start: "09:00", end: "17:00", bg: "rgba(16,185,129,.10)" } },
  ],
});
```

All `when` clauses must match, and later rules override earlier ones. Zarvan ships no holiday list —
public holidays change by country, year and employer, and a stale list baked into a UI library is worse
than none.

## Loading events on demand

An array means every event lives in memory, which is fine for hundreds and hopeless for years of
history. Pass a **function** instead and the calendar asks for one visible range at a time:

```js
Zarvan.create({
  selector: "#calendar",
  events: async ({ startG, endG }) => fetchEventsFromServer(startG, endG),
});
```

You get `startG` / `endG` as Gregorian `Date`s — what a backend speaks — plus `startJ` / `endJ` as
Jalali objects, and the `view` being drawn.

It asks when the visible range changes: navigating, and switching view. Re-renders that leave the
range alone — filtering, searching, editing — do not re-request. Ranges already fetched come from a
capped cache, so paging back and forth costs nothing, and two requests for the same range share one
call. A slow answer that lands after a newer one is discarded rather than overwriting it.

What comes back **replaces** what was loaded: the source is the authority for the range it was asked
about. Local `addEvent` / `updateEvent` / `removeEvent` show immediately and survive on the current
range; they drop the cache, so navigating away and back reloads from the source. Persist them through
your own API, and call `cal.refetchEvents()` when you want the server's version now.

A failed range leaves whatever is on screen alone rather than blanking the calendar, reports through
`onEventsLoadError` (and `onError`), and is not cached — so returning to it tries again.

```js
cal.isLazy();          // events came from a function
cal.isLoading();       // a load is outstanding
cal.refetchEvents();   // reload the visible range, ignoring the cache
cal.setEvents(fn);     // swap the source; pass an array to go back to static
```

While any load is outstanding the container carries `zc-is-loading`, which draws a hairline progress
bar across the top of the grid. Style that class if you want something heavier.

## Callbacks

Every callback has the same signature — `(payload, meta, ctx)` — and `meta` is `null` rather than
absent when there is none, so destructuring is safe. Subscribe at construction with `handlers`, or at
any time with `.on()`.

```js
const cal = Zarvan.create({
  selector: "#calendar",
  handlers: {
    onEventClick: (ev, meta) => console.log(ev.title, meta.view, meta.jdate, meta.element),
    onViewChange: (p) => console.log(p.from, "→", p.to),
    onWarn: (p) => console.warn(p.code, p.extra),     // switch on code, not message
  },
});

const off = cal.on("onDateChange", (p) => console.log(p.source));
off();
```

There are around forty names, grouped into lifecycle and rendering, events, loading, interaction,
export and diagnostics. The full table is in [docs/API.md](docs/API.md#callbacks).

Every node that stands for an event carries `zc-event-node`, and `meta.element` hands you that node
directly — the right anchor for a popover.

## Common tasks

```js
var cal = Zarvan.create({ selector: "#calendar", events: events });

cal.addEvent({ id: 9, title: "New", start: "1405-06-10T09:00" });
cal.updateEvent(9, { title: "Renamed" });
cal.removeEvent(9);

cal.setView("week");
cal.gotoDate({ jy: 1405, jm: 6, jd: 20 });
cal.next(); cal.prev(); cal.today();

cal.setTheme({ "color-accent": "#e11d48" });
cal.setColorScheme("dark");
cal.setSidebarOpen(true);
cal.setLocale({ code: "fa", strings: { today: "همین امروز" } });
cal.setOption("features.nowLine", false);

cal.destroy();
```

Renders are batched into one animation frame, so a change is not in the DOM on the very next line.
Call `cal.refresh()` when you need it now, or pass `renderMode: "sync"`.

`destroy()` releases every listener, interval, node and injected style tag, and hands the element back
as it was found — including every inline `--zc-*` property the instance wrote. Custom properties the
*host* set on that element are left alone.

Full reference: **[docs/API.md](docs/API.md)**, or the documentation site — open
**[`website/index.html`](website/index.html)** in a browser and every feature has a live calendar beside it.

## Configuration

Options decide what the calendar *is*; feature flags decide which parts of it exist. Every flag
defaults to `true` except `autoScrollToNow`, so you configure mostly by turning things off.

```js
Zarvan.create({
  selector: "#calendar",
  view: "month",              // day | week | month | year | list, or a registered view
  events: [],                 // an array, or a loader function
  locale: "fa",
  colorScheme: "auto",        // light | dark | auto        (default: light)
  sidebarOpen: true,          // whether the sidebar STARTS open  (default: false)
  renderMode: "batched",      // or "sync"
  shadow: false,

  features: {
    sidebar: true, miniCalendar: true, menuButton: true,
    viewDropdown: true, navigation: true, prevNext: true, todayButton: true,
    filters: true, typeFilter: true, search: true, autocomplete: true, exportExcel: true,
    views: { month: true, week: true, day: true, year: true, list: true },
    dayHighlights: true, timeHighlights: true, nowLine: true, autoScrollToNow: false,
    allDayRow: true, allDayBar: true, moreEventsModal: true,
    interactions: { click: true, dblClick: true, hover: true, contextMenu: true, focus: true },
    typeStyleInjection: true, events: true, overlapFocus: true,
    timeGridLayout: "overlap",   // or "columns"
  },
});
```

`timeGridLayout` chooses how colliding events are laid out in week and day view: `"overlap"` cascades
them with a visible offset, `"columns"` packs them side by side.

**Hot options.** Feature flags are hot — `cal.setOption("features.views.year", false)`, dotted paths to
any depth — and so are `view`, `locale`, `colorScheme`, `sidebarOpen`, `typeLabels`, `typeStyles`, `highlights` and
`events`. Anything structural was consumed while the instance was being built and warns with
`warn.optionNotHot` rather than pretending to have worked.

**The sidebar.** `sidebarOpen` sets the state the calendar is built in; construction itself emits no
`onSidebarToggle`, because nothing toggled. After that, `setSidebarOpen()` is the programmatic half of
the menu button — it takes the same path a click does, so it animates, moves focus and reports
identically.

```js
cal.setSidebarOpen(true);   // returns the state in force
cal.isSidebarOpen();        // true

// Idempotent, so this is safe to call without checking first:
window.addEventListener("resize", () => cal.setSidebarOpen(window.innerWidth > 1200));
```

With `features.sidebar: false` there is no panel, and `setSidebarOpen(true)` returns `false` and warns
with `warn.sidebarDisabled` rather than doing nothing quietly.

## Theming

```css
.zc-calendar {
  --zc-color-accent: #e11d48;
  --zc-color-surface: #fff;
  --zc-font-family: inherit;
  --zc-month-row-height: 160px;
  --zc-radius-lg: 4px;
}
```

Or at runtime — `cal.setTheme({ "color-accent": "#e11d48" })`; bare names are namespaced and `null`
clears an override. Tokens are the supported path, and the only one that keeps working in
`shadow: true` mode, because custom properties pierce a shadow boundary.

The core stylesheet forces **no font**: `--zc-font-family` defaults to `inherit`, so the calendar takes
your application's typeface. Load `zarvan-theme-fa.css` for the bundled Vazir face instead.

The complete list of 85 tokens is in [docs/API.md](docs/API.md#design-tokens).

### Dark mode

```js
Zarvan.create({ selector: "#cal", colorScheme: "auto" });   // "light" | "dark" | "auto"
```

Dark is the same tokens re-valued under a `zc-scheme-dark` class, not a second stylesheet — so a
calendar you have already themed goes dark with everything else. `"auto"` is resolved in JS rather
than by a media query, so it keeps following the system for as long as it is set: flip the OS to dark
and the calendar follows without a reload.

```js
cal.setColorScheme("dark");
cal.getResolvedColorScheme();   // "light" | "dark" — never "auto"
cal.on("onColorSchemeChange", (p) => document.body.classList.toggle("dark", p.resolved === "dark"));
```

Your `typeStyles` colours are left alone in both schemes, on the grounds that a brand colour is not
the library's to reinterpret; set them per scheme from `onColorSchemeChange` if one does not survive
the change of ground. Full detail in [docs/API.md](docs/API.md#dark-mode).

### Going further than tokens

If you need to, override with a selector of specificity (0,2,0) or higher:

```css
.zc-calendar .zc-day-cell { background: #fafafa; }
```

The class names and the reasoning behind that contract are in **[docs/CLASS-MAP.md](docs/CLASS-MAP.md)**.

## Plugins

Three of the library's own features are plugins, bundled and self-registering — so by default nothing
about them is different from core:

| Plugin | What it does |
|---|---|
| `highlights` | Applies the `highlights` rules to days and time bands. |
| `now-indicator` | The red current-time line, on a 30-second tick, plus `autoScrollToNow`. |
| `excel-export` | The sidebar button and `cal.exportToExcel()`. Resolves SheetJS at click time. |

What that buys you is the ability to drop them. `plugins: []` installs none; removing a line from
`build/manifest-js.txt` and rebuilding removes the feature and its cost together.

```js
cal.plugins();                                            // what this instance has
Zarvan.plugins();                                         // what is registered
Zarvan.create({ selector: "#calendar", plugins: [] });    // none
```

Your own attaches the same way, to the same four hooks — `dayElement`, `timeColumn`, `sidebar` and
`viewRendered`:

```js
Zarvan.use({
  name: "weekend-shading",
  install: function (cal) {
    return cal.hooks.on("dayElement", function (e) {
      var wd = (e.gdate.getDay() + 1) % 7;           // Saturday = 0
      if (wd === 5 || wd === 6) e.el.classList.add("is-weekend");
    });
  },
});
```

The function `install` returns is the uninstall, and it is what makes `destroy()` complete. A plugin
may also add public methods, by assigning to `cal.api`.

## Extending

A **view** is an object that knows its date range and how to draw itself:

```js
Zarvan.registerView("agenda", {
  label: "Agenda",
  order: 60,
  range:  function () { return { startG: ..., endG: ... }; },
  anchor: function () { return aDate; },
  step:   function (dir) { /* dir is +1 or -1 */ },
  title:  function (ctx) { return "Agenda"; },
  render: function (ctx) { /* draw, using ctx.bindEventItem and ctx.eventsFor */ },
});
```

Register it before `create()` and it appears in the switcher, participates in next/prev, drives the
mini calendar and receives the same event bus as a built-in view. `ctx.bindEventItem(el, ev, meta)` is
the call that matters: it gives a node the bus, keyboard activation, the ARIA role and the
`zc-event-node` marker.

Both views and plugins are documented in **[docs/DEVELOPING.md](docs/DEVELOPING.md)**, and the
documentation site builds a working resource timeline this way under *Custom views*.

## Shadow DOM

The scoped reset handles ordinary hostility. For a page you do not control at all, `shadow: true`
renders the calendar inside a shadow root:

```js
Zarvan.create({ selector: "#calendar", shadow: true, styles: zarvanCssText });
```

A `<link>` in the light DOM does not cross a shadow boundary, so the stylesheet has to go *inside* the
tree. The library reads it from `document.styleSheets` when the sheet is same-origin; `options.styles`
(a string, a `CSSStyleSheet`, or an array of either) is for when it is not. If it finds nothing to
adopt it warns clearly rather than rendering unstyled.

In shadow mode the calendar renders into a `div` inside the root, so the host keeps whatever layout
role your page gave it: `getContainer()` is the element you passed, `getRoot()` is the `.zc-calendar`
element, and `getShadowRoot()` is the root. Design tokens still work; plain CSS overrides do not.

## Accessibility

Everything clickable is operable from the keyboard, and everything focusable has a visible focus ring
(`--zc-focus-ring`).

- Event pills: `Enter` / `Space`.
- Dropdowns and the suggestion list: arrows to move, `Enter` to choose, `Esc` to close.
- Day grids use a **roving tab stop** — a year view is 12 tab stops rather than 372, with arrows,
  `Home` and `End` moving within the grid.
- The modal is a real dialog: `role="dialog"`, `aria-modal`, focus enters on open, `Tab` cycles inside
  it, `Esc` closes, and focus returns to the opener.
- The collapsed sidebar is `inert` and `aria-hidden`, so it is not an invisible detour through the tab
  order. Focus is moved out before the panel is inerted.
- The loading progress bar is suppressed under `prefers-reduced-motion`.

## Offline by design

Nothing in the library fetches anything at runtime — no images, no webfonts, no CDN, no telemetry.
The chevrons are inline SVG, the date maths is concatenated into `zarvan.js`, and `zarvan.css`
contains no `url()` at all. Two files on your own origin are the whole delivery.

That extends to this repository: the documentation site, the examples and the three test harnesses all
run from `file://` with no network. The one exception is deliberate and opt-in — SheetJS for the Excel
export, which is resolved when the button is pressed and warns instead of failing when absent.

## Examples

| File | Shows |
|---|---|
| [`website/index.html`](website/index.html) | The documentation site — every feature, beside a live calendar |
| [`examples/vanilla.html`](examples/vanilla.html) | The full option surface, live controls for every API method |
| [`examples/react.html`](examples/react.html) | A `<Calendar>` wrapper component with props and callbacks |
| [`examples/vue.html`](examples/vue.html) | The same as a Vue 3 component |
| [`src/index.html`](src/index.html) | The general demo — two instances, all five views, filters, export, recurrence |
| [`test/dist.html`](test/dist.html) | The drop-in itself: loads only the two `dist/` files, self-verifying |
| [`test/host-hostile.html`](test/host-hostile.html) | CSS isolation, self-verifying |
| [`test/index.html`](test/index.html) | The unit suite, self-verifying |

## Browser support

Anything with container queries and `Object.assign` — Chrome 105+, Edge 105+, Firefox 110+, Safari 16+.
`shadow: true` additionally needs `attachShadow`, which is older than all of those.

The collapsed sidebar uses the `inert` attribute (Chrome 102+, Firefox 112+, Safari 15.5+) and falls
back to `aria-hidden` elsewhere, which hides it from assistive technology but not from `Tab`.

## Development

`src/js/zarvan.js`, `src/css/zarvan.css` and the whole of `dist/` are **generated**. Edit the modules
under `src/js/` and the parts under `src/css/parts/`, then run one of these — all three produce
byte-identical output, and none of them needs a toolchain:

```bash
powershell -ExecutionPolicy Bypass -File build/build.ps1
```

```bash
sh build/build.sh
```

```bash
node build/build.mjs
```

The build also stamps `package.json`'s version into `Zarvan.version`, so that is the one place a
release number lives.

`dist/` is committed — it is the product. The two intermediates, `src/js/zarvan.js` and
`src/css/zarvan.css`, are gitignored: nothing loads them (every page in this repository points at
`dist/`), and the CSS one is byte-identical to its `dist/` counterpart. Run a build after cloning if
you intend to change anything.

Tests are three HTML files you open in a browser — `test/dist.html`, `test/index.html` and
`test/host-hostile.html`. Each prints its own PASS/FAIL verdict. Nothing to install; use
`npm run serve` if you want them over http rather than `file://`.

See **[docs/DEVELOPING.md](docs/DEVELOPING.md)**.

## Upgrading

Nothing since v3.0.0 has been breaking, so a v3.x → v3.y upgrade is a file copy.

**v2 → v3** removed the English locale, the `direction` field on a locale, and the `main`/`exports`
fields in `package.json`, and moved the drop-in to `dist/`.

**v1 → v2** renamed every CSS class and changed a few behaviours.

Both are walked through step by step in **[docs/MIGRATION.md](docs/MIGRATION.md)**, and
**[CHANGELOG.md](CHANGELOG.md)** has the full record.

## License

MIT — see [LICENSE](LICENSE).
