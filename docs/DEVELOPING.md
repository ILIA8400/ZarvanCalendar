# Developing

Nothing to install. No node, no npm, no bundler, no admin rights.

## Editing JavaScript

`src/js/zarvan.js` is **generated and gitignored** — do not edit it, and do not expect it in a fresh
clone until you have run a build. Edit these:

```
src/js/
├─ core/utils.js        clamp, pad2, norm, mergeDeep, typeClass, hashStr
├─ core/dom.js          qs, qsa, createEl, resolveElement
├─ calendar/jdate.js    Jalali date STRINGS: parse, format, compare, sort keys
├─ calendar/gregorian.js plain Date helpers, calendar-system agnostic
├─ calendar/jalali.js   the ONLY file that touches the jalaali library
├─ layout/overlap.js    cascade layout + conflict graph (pure interval maths)
├─ layout/columns.js    column packing (pure interval maths)
├─ data/events.js       questions about a single event (all-day? span? interval?)
├─ data/normalize.js    validation and canonicalisation of incoming events
├─ data/recurrence.js   expand repeats over a range
├─ data/organize.js     bucket events into a per-day map
├─ data/filter.js       type + free-text filtering
├─ data/source.js       where events come from: an array, or a function asked per range
├─ core/hooks.js        named extension points
├─ core/shadow.js       optional Shadow DOM mounting + style adoption
├─ core/plugins.js      plugin registry
├─ plugins/highlights.js    day backgrounds + time bands (optional)
├─ plugins/nowIndicator.js  the current-time line (optional)
├─ plugins/excelExport.js   Excel export; SheetJS injected, not required (optional)
├─ locale/index.js      translator + locale registry
├─ locale/fa.js         Persian (the default and the fallback)
├─ core/registry.js     ordered named collection (views today, plugins later)
├─ views/timegrid.js    the shared engine behind the week and day views
├─ ui/dropdown.js       the select-like control (view switcher AND type filter)
├─ ui/autocomplete.js   the search suggestion popup
├─ ui/modal.js          the overlay used by "+N more"
├─ highlights/rules.js  does a highlight rule match this day?
└─ main.js              shell: instance state, event bus, render pipeline, the five views
```

Each module is a classic IIFE that registers a namespace on a shared `ZarvanInternal` object. Order in
`build/manifest-js.txt` must follow the dependency graph — a module may only use namespaces registered
by files listed above it. `main.js` comes last and aliases everything it needs to the names the render
code already used, so the view code reads unchanged.

`data/source.js` is the one module that is stateful rather than pure, because what it owns is timing:
which answer is still current, which range has already been asked for, which fetches are in flight. It
holds no DOM and no calendar knowledge beyond a Gregorian range — `main.js` supplies the range and
decides what to do with a result. The generation counter in there is load-bearing: without it, paging
forward twice quickly can leave the slower request's events on screen.

After the shell IIFE runs, `ZarvanInternal` is deleted from `window` and re-exported as
`Zarvan._internal` — unstable, and there only so the test page can reach the pure layers.

## Editing styles

`src/css/zarvan.css` is **generated and gitignored** — do not edit it. Edit the parts:

```
src/css/parts/
├─ reset.css          scoped normalisation (lowest specificity, must stay first)
├─ tokens.css         every design token — the whole theming surface
├─ theme-dark.css     the same colour tokens re-valued under .zc-scheme-dark
├─ base.css           root box, typography, container declaration
├─ layout/            header, shell, scrollbars
├─ components/        menu-button, nav, dropdown, filters, autocomplete,
│                     export-button, mini-calendar, modal, now-indicator, event
├─ views/             month, week, day, timegrid, allday, year, list
├─ state.css          state + highlight classes (must stay after views)
└─ responsive.css     container queries (must stay last)
```

Then rebuild with whichever of these you have — all three produce byte-identical output:

```bash
powershell -ExecutionPolicy Bypass -File build/build.ps1
```

```bash
sh build/build.sh
```

```bash
node build/build.mjs
```

Order is defined once, in `build/manifest-css.txt`. Adding a part means adding a file and a line.

**One file per component.** The pre-refactor stylesheet had `.zc-nav-group` defined three times, the
last block existing only to `!important`-undo the first two. Keeping a component's rules in its own
file makes that failure mode structurally impossible.

## Why the order matters

There is no `@layer` here, by design (see the generated file's header, or `CLASS-MAP.md`). The cascade
is controlled by specificity plus source order:

- `reset.css` first, at `(0,1,0)` — beats the host's `*` and element rules, loses to our own.
- components and views at `(0,2,0)`.
- `state.css` after views, so equal-specificity state rules win.
- `responsive.css` last.

Reordering the manifest will silently change which rules win. It is not an arbitrary list.

## Responsive rules

Use `@container zc (max-width: …)`, not `@media`. The calendar declares
`container-type: inline-size` on its root, so queries read the calendar's own width — which is the
whole point: embedded beside a host nav rail, the viewport is wide while the calendar is narrow.

Two exceptions that must stay `@media`, both documented inline in `responsive.css`:

1. Rules that size `.zc-calendar` itself — a container cannot be queried to style itself.
2. Rules for the modal — it is appended to `<body>`, outside the container.

## Fonts

Core CSS forces no font; it sets `font-family: var(--zc-font-family)` and defaults that token to
`inherit`. `src/css/zarvan-theme-fa.css` is optional and registers the bundled Vazir face. The build
copies it to `dist/zarvan-theme-fa.css` with the font URL rewritten to `./fonts/`, so `dist/` is
self-contained.

## SheetJS is not vendored

The Excel export resolves SheetJS when the button is pressed — from `options.deps.xlsx` or
`window.XLSX` — and warns through `onWarn` if it is absent. It is not a dependency and it is not
committed: at 882 KB it was the largest thing in the repository and it ships in no build output.

`src/index.html` and `examples/vanilla.html` load it from a CDN. Offline, those two pages still work;
the export button reports `warn.xlsxMissing` instead of downloading, which is the documented and
tested fallback. To work on the export offline, drop a copy at `src/libs/xlsx.full.min.js` — that path
is gitignored for exactly this — and point the two pages at it locally.

## Testing

Three pages, all self-verifying. Open them in a browser — nothing installed, no test runner.

**Run a build first.** Every page loads `dist/`, which is the artefact consumers receive; testing the
intermediate would test something nobody runs. A fresh clone already has `dist/` committed, so this
only matters after you edit a part.

### `test/dist.html` — the drop-in

19 checks against **only** the two files a consumer copies: the globals, rendering, right-to-left,
Persian numerals, the whole public API surface, plugins and `destroy()`. If this passes, the install
instructions in README.md are true. This is the one to run after any packaging change.

### `test/index.html` — unit tests

253 assertions across 24 suites covering every pure layer plus the UI widgets. Prints a PASS/FAIL
verdict with per-assertion detail. Add a case with `test("name", function () { eq(actual, expected); })`
inside a `suite(...)`.

A case may **return a promise**, which is what the lazy event source needs — there is no synchronous
way to assert on something that arrives a round trip later. The case is recorded in order immediately
and filled in when it settles; the report waits for all of them. `after(ms)` returns a promise for
waiting on a fake server:

```js
test("loads the visible range", function () {
  var c = Zarvan.create({ selector: host, events: fakeServer.load });
  return after(60).then(function () { eq(fakeServer.calls.length, 1); c.destroy(); });
});
```

An async case outlives the synchronous sweep, so it must create and destroy its own host rather than
relying on a suite's shared teardown.

The runner is ~60 lines at the top of the file and has no dependencies, on purpose: a contributor
should not have to install anything to run or extend the tests.

### `test/host-hostile.html` — CSS isolation

Embeds the calendar in a deliberately hostile host page and runs its own checks. No server needed; on
`file://` the `!important` check reports `skip`, because browsers block script access to a file-URL
stylesheet's rules. Use `npm run serve` (or any static server) to get the full set.

`src/index.html` is the general demo — two instances, all five views, filters, export, recurrence.

## The documentation site

`website/` is the documentation site: 28 sections, each pairing prose and an API table with a **live
calendar** the reader can drive. Open `website/index.html` — it needs no server and no network.

```
website/
├─ index.html        every section, inline. One page, no fetch, so file:// works.
└─ assets/
   ├─ docs.css       the site's own stylesheet; every class is zd- prefixed
   ├─ docs.js        routing, search, syntax highlighting, copy buttons, theme
   └─ demos.js       one factory per section — the live calendars
```

Three rules it is built to, and worth keeping:

- **No CDN, no webfont, no build step.** The syntax highlighter is ~90 lines in `docs.js` rather than
  a dependency, precisely so the page opens with no network. The only requests it makes are for
  `dist/` and its own two asset files.
- **Demos use the public API only.** Nothing reaches into `Zarvan._internal`. If a demo works, the
  documented API works — which is what makes the site a test of the documentation rather than a
  parallel description of it.
- **Every demo returns a teardown.** A section's demo is built when it is opened and destroyed when
  the reader leaves, so navigating the site exercises `destroy()` a few dozen times per visit.

Sections are plain `<section class="zd-section" id="section-NAME">` elements with `data-title`,
`data-group` and `data-keywords`; the sidebar, the search index, the "on this page" list and the
previous/next pager are all derived from the document at load, so adding a section means adding the
markup and one sidebar link.

To add a demo, put `[data-mount]` in the section and register a factory in `demos.js`:

```js
demo("my-section", function (d) {
  var cal = d.calendar("[data-mount]", { view: "month", events: sampleEvents() });
  d.click("[data-role=go]", function () { cal.next(); });
});
```

`d.calendar()` creates one that follows the site's theme and is destroyed automatically; `d.on`,
`d.click` and `d.add` register anything else that has to be undone.

The site deliberately documents **only what exists**. It has no Timeline or Resource view section,
because the library has five views and neither of those is one of them — the resource timeline under
*Custom views* is an example built on `registerView()`, and is labelled as such.

## Lifetimes: the disposable stores

Nothing that outlives a statement is tracked by hand. Every document-level listener, interval, timer,
externally-parked node and injected `<style>` tag registers on a store at the moment it is created:

- **`instanceStore`** — released by `destroy()`.
- **`renderStore`** — released at the top of *every* render.

The second one exists because a render can create an unknown number of things. The week view sets up one
now-indicator interval per day column; the old code kept the id in a single `nowTick` variable inside the
seven-iteration loop, so six were unreachable and leaked on every re-render. Registering them means the
count no longer matters.

Consequence for contributors: **never call `addEventListener` on `document` or `window`, `setInterval`,
or `setTimeout` directly.** Use `instanceStore.addListener(...)` / `.addInterval(...)` / `.addTimeout(...)`,
or `renderStore` if the thing should die at the next render. Listeners on elements *inside* the container
need no registration — they are released when the container is emptied.

## Rendering is batched

Renders are coalesced into one animation frame, so

```js
cal.setEvents(list);
cal.setView("week");
```

costs one render, not two.

This means **a change is not in the DOM on the next line**. Two escape hatches:

- `cal.refresh()` renders anything pending immediately.
- `Zarvan.create({ renderMode: "sync" })` renders on every change, which is how the library behaved
  before batching was introduced.

`create()` itself always renders synchronously, so a calendar is fully in the document by the time
`create()` returns.

## Instance state

All mutable per-instance state lives on one `state` object in `main.js` (`view`, `currentJalali`,
`currentWeekDate`, `currentDayDate`, `miniJ`, `baseEvents`, `eventsByDay`, `highlights`, `filterState`)
rather than as loose closure variables. That is the groundwork for Phase 6: a view can be handed this
object as an explicit context instead of reaching into the enclosing scope.

## ui/ widgets

Files under `ui/` know nothing about calendars. They render a control, expose a small imperative API,
and report back through callbacks. Anything that understands what an *event* is stays in `main.js`.

`ui/modal.js` is the clearest example of that split: it owns the overlay, the header and the scrolling
body, but `show(title, nodes)` takes finished DOM nodes. The function that turns an event into a row
lives in `main.js`, because only it knows about all-day handling, time formatting and click binding.

### One dropdown, two uses

The header view switcher and the sidebar type filter used to be two separate implementations that
differed only in a class prefix, a data attribute, whether they marked an active item, and whether they
emitted events. Every behavioural fix had to be made twice, and in practice was not. They are now the
same component, configured differently:

```js
createDropdown({
  prefix: "zc-view-dd",          // or "zc-dd"
  label: "نمایش",
  store: instanceStore,          // owns the outside-click listener
  items: function () { ... },    // rebuilt on every open
  onSelect: function (value) { ... },
  onOpen: function () { ... },   // optional
  onClose: function (info) { ... },
});
```

Menu items are rebuilt on each open rather than kept in sync, because both callers derive them from
state that changes underneath — the set of available event types, and which views are enabled.

Each dropdown owns its own outside-click listener and closes over its own element. The previous code
shared one listener behind a module-level flag and captured the first element it ever saw, so after any
header re-render it was testing a node that had left the document.

### Widgets take a store

Every widget that binds a document-level listener or parks a node outside the container accepts a
`store` and registers its teardown there. Pass `instanceStore` unless the thing should die at the next
render. See the lifetimes section above.

## Views are registered, not hardcoded

A view is one object. It knows the range it covers, the date that anchors it, how to step forward and
back, which month the mini calendar should follow, what the header says, and how to draw itself:

```js
Zarvan.registerView("agenda", {
  label: "دستور کار",
  order: 60,                                  // position in the switcher
  range:         function () { return { startG, endG }; },
  anchor:        function () { return aDate; },     // "did navigation move?"
  step:          function (dir) { ... },            // dir is +1 or -1
  focusDate:     function () { return aDate; },     // month the mini calendar shows
  selectedJDate: function () { return aJDate; },    // day the mini calendar marks
  title:         function (ctx) { return "..."; },  // or null to set it yourself
  render:        function (ctx) { ... },
});
```

Call it before `create()`. The view then appears in the switcher, participates in next/prev, drives the
mini calendar, and is reachable through `setView()` — without touching library internals.

This replaced **27 `state.view === "..."` comparisons spread across nine functions**: the render
dispatcher, the range calculation, the active-date calculation, `goNext`, `goPrev`, the feature map, the
label lookup, the fallback-view search, and the switcher's item list. Adding a view used to mean finding
all nine; there are now zero such comparisons in the codebase.

`render` and `title` receive a **view context** — `features`, `state`, `emit`, the render store, and the
helpers a view needs (`bindEventItem`, `eventsFor`, highlight application, and so on) — passed
explicitly rather than reached for through the enclosing scope.

## Week and day share one engine

`views/timegrid.js` holds the logic both views need: hour gutter, hour lines, the now indicator, mapping
events to minute intervals, layout mode selection, positioning, and the density pass.

The DOM *shells* stay per-view on purpose. Week is a flex column of rows; day is a CSS grid. Forcing one
markup on both would mean restyling day view for no functional gain. What is shared is the logic, which
is where the two copies had drifted apart.

## Never defer measurement to an animation frame

`requestAnimationFrame` does not run while the document is hidden — a background tab, a `display:none`
ancestor, a headless screenshot. Layout still computes in all of those; only frames are suspended.

Month view used to defer its fit-to-cell measurement to a frame, and week/day deferred their density
classes the same way. In a hidden document they rendered the grid and then never filled in a single
event.

Measurement is synchronous now. Two consequences for contributors:

- **Attach before you measure.** `TimeGrid.renderColumn` measures the events it places, so the column
  must already be in the document when you call it.
- **Batch the reads.** Month collects every cell's fit and runs them once after the grid is complete,
  rather than each cell forcing its own layout.

## Locales

No user-facing string is written in render code. A locale is a plain object — weekday names, short
weekday names, month names, an optional numeral map, and a flat string table:

```js
Zarvan.registerLocale({
  code: "fa-formal",
  weekdays: [...7, starting Saturday],
  weekdaysShort: [...7],
  months: [...12],          // Jalali months; only the wording changes, not the calendar
  digits: null,             // or ["۰".."۹"] to shape numerals
  strings: { today: "امروز", ... },
});
```

**Persian is the only bundled locale, and there is no `direction` field.** Zarvan is a Persian,
right-to-left, Jalali calendar; none of those three is a runtime choice. A locale controls wording and
numerals, nothing else. The English locale was removed in 3.0.0 — it existed mainly to smoke out
hardcoded strings, and the unit suite now does that with a registered test locale instead.

The common case is not a new locale but a partial one, which inherits everything it does not name:

```js
Zarvan.create({ locale: { code: "fa", strings: { today: "همین حالا" } } });
Zarvan.create({ locale: { code: "fa", digits: null } });   // Persian text, Latin numerals
cal.setLocale({ code: "fa", strings: { today: "امروز" } }); // rebuilds the header, emits onLocaleChange
```

Two calendars on the same page can run different wording. A missing key falls back to Persian and then
to the key itself, so a typo shows up as `warn.someKey` rather than an empty label.

When you add a string to `locale/fa.js`, use it through `t("key")` in render code — never inline. The
unit suite renders every view in a locale that defines almost nothing, so a hardcoded string shows up
as text that failed to change.

### `t` is the translator — never shadow it

`t(key, params)` is in scope throughout `main.js`. Do **not** introduce a local called `t`.

This bit three times during the extraction. `typeToFa(t)`, `var t = getTimeParts(ev)` in the list
renderer, and the same in the modal row builder all shadowed it — and because `var` hoists to the top of
the function, `t("allDayEvent")` earlier in the same scope threw rather than merely shadowing. The
locals are now named for what they hold (`type`, `times`), which reads better anyway.

### Warnings carry a code

`data/` modules emit a stable code, not a sentence — they carry no language at all. `zWarn` translates:

```js
cal.on("onWarn", function (p) {
  p.code;     // "warn.invalidStart" - stable, switch on this
  p.message;  // localised, for display
  p.extra;    // { index, ev, reason }
});
```

### Numerals

`locale.num()` shapes digits for locales that define a `digits` array. It is applied to the Excel
export only, which is where it has always been used. The interface itself renders Latin numerals in
both locales — day cells, the year in the header, hour labels and the "+N more" badge. Shaping the
whole interface would be a coherent change, but it is a visual decision rather than part of extracting
the strings, so it is deliberately left alone.

## Plugins

Three features that used to live in core are now plugins: **highlighting**, the **now indicator**, and
**Excel export**. Each registers itself when its file loads, so the default build behaves exactly as
before — but each is a line in `build/manifest-js.txt`, and deleting that line removes the feature, its
code and its dependencies together.

```js
Zarvan.use({
  name: "my-plugin",
  install: function (cal) {
    var off = cal.hooks.on("dayElement", function (e) {
      e.el.classList.add("my-marker");
    });

    cal.api.myMethod = function () { ... };   // becomes a public method on every instance

    return function uninstall() { off(); };   // runs on destroy()
  },
});
```

Registering a name that already exists **replaces** it, which is how you substitute a bundled plugin
with your own. `Zarvan.unuse(name)` removes one; `Zarvan.plugins()` lists them.

Per instance, `plugins: [...]` installs a specific set instead of the registered ones — `plugins: []`
installs none.

### Hooks

Core announces moments; it never asks who is listening. The whole contract is four names:

| Hook | Payload | Used by |
|---|---|---|
| `dayElement` | `{ el, gdate, jdate, view }` | highlighting |
| `timeColumn` | `{ el, gdate, jdate, view, store }` | now indicator, time bands |
| `sidebar` | `{ el, ctx }` | the export button |
| `viewRendered` | `{ view, body, days }` | scroll-to-now |

`dayElement` fires for anything standing for a single day — a month cell, a week header cell, an all-day
cell, a year day, a list day header, a time column. `store` on `timeColumn` is the **render** store, so
anything registered there is released at the next render.

A handler that throws is reported and skipped. One bad plugin must not take the calendar down, and the
same is true of a plugin that throws during `install`.

### SheetJS is not a dependency

`plugins/excelExport.js` looks up SheetJS when the button is pressed, not when the page loads:

1. `options.deps.xlsx` — an explicit reference, which is what a bundler user should pass
2. `window.XLSX` — the global, for the `<script>` tag case
3. absent — the button reports `warn.xlsxMissing` and nothing breaks

That is the whole reason it is a plugin: an 881 KB dependency for one optional button should not be
something every consumer pays for.

### Writing a plugin

`install(cal)` receives a curated surface, not the internals — the hooks, the configuration it must
respect (`cal.features`), the translator (`cal.t`, `cal.num`), the instance store, `cal.api` to extend,
and a few narrow operations (`getEvents`, `getVisibleRange`, `expandRecurring`, `applyFilters`,
`requestRender`).

Two rules:

- **Respect the feature flags.** `features.nowLine`, `features.dayHighlights` and friends still work;
  the plugin checks them rather than assuming it should draw.
- **Register teardown.** Return an uninstall function, or use `cal.store`. Anything else leaks when the
  calendar is destroyed.

## Public API

```js
var cal = Zarvan.create({ selector, events, view, locale, features, plugins, shadow, renderMode });
```

**Events**

| Method | Notes |
|---|---|
| `getEvents()` | A copy of the list. Event objects are shared — treat them as read-only. |
| `getEventById(id)` | Matches on `ev.id`. |
| `setEvents(list)` | Replaces everything. |
| `addEvent(ev)` | Returns the **normalised** stored event, or `null` if validation rejected it. |
| `updateEvent(id, patch)` | Merges and re-validates; a rejected patch leaves the event untouched. |
| `removeEvent(id)` | Returns the removed event, or `null`. |

Every mutation emits `onEventsChange` with `{ type: "set"|"add"|"update"|"remove", event, events }`.

**Navigation**

`getView()` · `setView(v)` · `getViews()` · `getDate()` · `getJDate()` · `gotoDate(date)` ·
`getVisibleRange()` · `next()` · `prev()` · `today()`

`gotoDate` accepts a `Date` or `{ jy, jm, jd }` and moves **every** view's anchor, so switching views
afterwards lands on the same date rather than wherever that view was last left.

`goNext`/`goPrev`/`goToday` still work; `next`/`prev`/`today` are the names to prefer.

**Configuration**

`setOption(key, value)` · `setTheme(tokens)` · `setTypeStyles(map)` · `setHighlights(list)` ·
`getHighlights()` · `setLocale(l)` · `getLocale()` · `setColorScheme(s)` · `getColorScheme()` ·
`getResolvedColorScheme()`

`setTheme` namespaces bare names, so `{ "color-accent": "#e11d48" }` and
`{ "--zc-color-accent": "#e11d48" }` are the same. A `null` value clears an override.

`setColorScheme` is the other half of theming and stays separate from it: it takes `"light"`,
`"dark"` or `"auto"` and only toggles the `zc-scheme-dark` class, because dark mode is a re-valuing of
the colour tokens (`parts/theme-dark.css`) rather than a second stylesheet. Nothing re-renders — the
DOM is the same either way. `"auto"` is resolved here rather than in a
`@media (prefers-color-scheme: dark)` block so the dark palette is written once instead of
duplicated into a media block that then has to be kept in step with the class; the controller keeps a
`matchMedia` listener on the instance store for as long as `"auto"` is in force, and drops it the
moment it is not.

`setOption` is deliberately narrow. Feature flags are hot (`setOption("features.nowLine", false)`);
so are `view`, `locale`, `colorScheme`, `typeLabels`, `typeStyles`, `highlights` and `events`. Anything
structural was consumed while the instance was being built, and warns with `warn.optionNotHot` rather
than pretending.

Feature flags are merged **into** the existing object rather than replacing it — plugins and view
contexts hold a reference to it from construction, and swapping it out would leave every one of them
reading a stale copy.

**DOM**

`getContainer()` returns the element you passed. `getRoot()` returns the `.zc-calendar` element — the
same thing unless shadow mode is on. `getShadowRoot()` returns the shadow root or `null`.

## Shadow DOM mode

```js
Zarvan.create({ selector: "#cal", shadow: true });
```

The prefixed, scoped stylesheet already survives a hostile host. `.zc-calendar *` is (0,1,0) and beats a
bare `*` (0,0,0), which is why the harness passes with a Preflight-style reset applied.

What it cannot beat is an **ID-scoped** universal selector:

```css
#app * { box-sizing: content-box !important; }   /* (1,0,0) — outranks the reset */
```

No stylesheet can win that. A shadow root can, because host rules never cross the boundary.
`test/host-hostile.html` CHECK 6 enables exactly that rule and measures both calendars on the same page:
the light DOM goes `content-box`, the shadow DOM stays `border-box`.

**The cost:** a host can no longer restyle internals with plain CSS. Design tokens still work, because
custom properties inherit *through* a shadow boundary — which is why the theming surface was built out
of them in the first place.

**Styles must be supplied**, since a `<link>` in the document does not reach inside a shadow root:

1. `options.styles` — CSS text, a `CSSStyleSheet`, or an array of either
2. otherwise the library's own stylesheet is located in the document and copied
3. if neither works, it renders unstyled and says so in the console

Auto-discovery reads `cssRules`, which throws for a cross-origin stylesheet — a CDN without CORS
headers. That is exactly when you have to pass `options.styles` yourself.

In shadow mode the modal and the injected type-colour `<style>` go **inside** the shadow root rather
than `<body>` and `<head>`, since a node in the light DOM would not be reached by the adopted sheet.

### Outside clicks and `composedPath()`

An event leaving a shadow tree is **retargeted** to the host, so `el.contains(e.target)` reports false
for a click that visibly landed inside the calendar. Every outside-click handler goes through
`Z.dom.eventHitsElement(e, el)`, which tests `composedPath()` when available. If you write a plugin that
needs the same test, use that helper rather than `contains`.
