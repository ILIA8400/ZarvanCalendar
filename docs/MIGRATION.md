# Upgrading

Two upgrades, newest first. Nothing since v3.0.0 has been breaking, so a v3.x → v3.y upgrade is a file
copy — see the [CHANGELOG](../CHANGELOG.md) for what each release added.

- [v2 to v3](#v2-to-v3) — Persian-only, and `dist/` becomes the drop-in
- [v1 to v2](#v1-to-v2) — every class renamed, renders batched

---

# v2 to v3

Small, and it only touches you if you used the English locale, imported the package as a module, or
loaded files out of `src/`.

## 1. The English locale is gone

Zarvan is a Persian calendar, and v3 makes that a property of the library rather than a default you
could configure your way out of.

`locale: "en"` no longer resolves; it falls back to Persian. `Zarvan.locales()` returns `["fa"]`.

If you were using it, register your own — missing keys fall back to Persian, so a partial definition
works:

```js
Zarvan.registerLocale({
  code: "en",
  weekdays: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  weekdaysShort: ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"],
  months: ["Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar",
           "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand"],
  digits: null,                       // Latin numerals
  strings: { today: "Today", viewLabel: "View" },
});

Zarvan.create({ selector: "#calendar", locale: "en" });
```

The calendar system is still Jalali and the layout is still right-to-left. A locale changes wording and
numerals, not either of those.

## 2. A locale has no `direction`, and neither does the plugin context

The field looked like a per-locale decision and never was: the stylesheet is written right-to-left
throughout. The container is stamped `dir="rtl"` unconditionally.

- Remove `direction` from any locale you registered — it is ignored.
- **`cal.direction` is gone from the plugin context.** A plugin can assume right-to-left.

## 3. There is no module entry point

`package.json` no longer declares `main`, `exports`, `module` or `sideEffects`. Those advertised an
ESM/CJS entry that never worked — importing the bundle threw, because it assumes `this === window`.

```js
import Zarvan from "zarvan-calendar";   // v2: threw at runtime. v3: fails to resolve, honestly.
```

Load the script tag and read `window.Zarvan`. See [Installation](../README.md#install).

## 4. The files you copy moved to `dist/`

`files` now ships `dist` rather than scattered `src/` paths, and `dist/` is the folder a consumer
copies:

```html
<!-- v2 -->
<link rel="stylesheet" href="/vendor/zarvan/src/css/zarvan.css" />
<script src="/vendor/zarvan/src/libs/jalaali.js"></script>
<script src="/vendor/zarvan/src/js/zarvan.js"></script>

<!-- v3 — jalaali is inside zarvan.js, so there is no second tag and no order to get wrong -->
<link rel="stylesheet" href="/vendor/zarvan/zarvan.css" />
<script src="/vendor/zarvan/zarvan.js"></script>
```

`src/css/zarvan.css` and `src/js/zarvan.js` are still generated for development, but they are
gitignored and are not what you deploy.

## 5. Smaller things

- **`Zarvan.version`** now exists, stamped at build time. Useful when a vendored copy is several
  releases behind what a support ticket assumes.
- **`Zarvan._internal.locale.setDefault()` is gone.** With one bundled locale it had no meaning.
  `_internal` was never part of the public API.
- **The font is opt-in and its URL is rewritten for `dist/`.** Load `dist/zarvan-theme-fa.css` for the
  bundled Vazir face; the core stylesheet still forces no font.

Everything else is additive. v3 has since added [dark mode](API.md#dark-mode),
[loading on demand](API.md#loading-events-on-demand), `meta.element`, `zc-event-node` and
`sidebarOpen`; none of them changes existing behaviour.

---

# v1 to v2

v2 is a restructuring, not a rewrite. The API you were using still exists; what changed is every CSS
class name, the timing of renders, and a handful of behaviours that were plainly bugs.

Work through this in order. The first two sections cover almost everyone; the rest only matter if you
were doing something specific.

---

## 1. CSS class names — affects you if you wrote any CSS

**This is the big one.** v1 shipped 17 classes with no prefix at all — `.events`, `.day-number`,
`.day-cell`, `.event-item`, `.calendar-grid`, `.hour-line` and friends. Those collided with host
applications in both directions, which is the problem that started this work. Every class is now
`zc-`-prefixed and scoped under `.zc-calendar`.

If you wrote CSS targeting the calendar, it stopped matching. The authoritative table — and a reference
to every class the library renders today — is in
[CLASS-MAP.md](CLASS-MAP.md#renamed-from-v1). The ones people actually styled:

| v1 | v2 |
|---|---|
| `.day-cell` | `.zc-day-cell` |
| `.day-number` | `.zc-day-num` |
| `.events` | `.zc-day-events` |
| `.event-item` | `.zc-event` |
| `.calendar-grid` | `.zc-month-grid` |
| `.more-events-btn` | `.zc-more-btn` |
| `.hour-line` | `.zc-hour-line` |
| `.week-day-cell` | `.zc-week-col` |
| `.day-main-col` | `.zc-day-col` |

State classes moved to a `zc-is-*` convention: `.empty`/`.is-empty` → `.zc-is-empty`,
`.today`/`.is-today` → `.zc-is-today`, `.is-selected` → `.zc-is-selected`, `.is-active` →
`.zc-is-active`, `.has-events` → `.zc-has-events`, `.open` → `.zc-is-open`.

### Event type classes changed shape

v1 wrote your `type` value straight into the class attribute:

```html
<div class="event-item meeting">      <!-- v1 -->
<div class="zc-event zc-type-meeting"> <!-- v2 -->
```

The value is now sanitised to `[A-Za-z0-9_-]` and namespaced. A type containing a space, a brace or a
quote used to break the layout or the generated stylesheet outright.

```css
/* v1 */  .event-item.meeting { background: #1a73e8; }
/* v2 */  .zc-calendar .zc-type-meeting { --zc-event-bg: #1a73e8; }
```

Better still, don't write that CSS at all — `typeStyles` already does it:

```js
Zarvan.create({
  typeStyles: { meeting: { bg: "#1a73e8", color: "#fff" } },
});
```

The hardcoded `.meeting` and `.task` rules that used to be in the stylesheet are gone. They were one
consumer's vocabulary baked into a general-purpose library.

### Overrides need a little more specificity

There is no `!important` anywhere in v2's stylesheet, and the file is deliberately not wrapped in
`@layer`. Rules follow a specificity contract:

```
reset               .zc-calendar *              (0,1,0)
components / views  .zc-calendar .zc-x          (0,2,0)
state               .zc-calendar .zc-x.zc-is-y  (0,3,0)
```

So a bare `.zc-day-cell { … }` in your stylesheet will lose. Either use a token (preferred) or match the
library's specificity:

```css
.zc-calendar .zc-day-cell { background: #fafafa; }
```

The reasoning — including why `@layer` was tried and rejected — is at the top of the generated
`zarvan.css` and in [CLASS-MAP.md](CLASS-MAP.md).

---

## 2. Renders are batched — affects you if you read the DOM after an API call

v1 rendered synchronously. v2 coalesces changes into one animation frame, so this no longer works:

```js
cal.setView("week");
document.querySelector(".zc-week-grid");   // null in v2
```

Two fixes, both one line:

```js
cal.setView("week");
cal.refresh();                              // render now
```

```js
Zarvan.create({ renderMode: "sync" });      // v1 behaviour everywhere
```

`create()` itself is still synchronous — the calendar is fully in the DOM by the time it returns.

---

## 3. Behaviour fixes that change what you see

These were bugs. If you had worked around any of them, remove the workaround.

**Overlapping events in week view now fan out.** The cascade layout computed offsets and the week
renderer threw them away, so overlapping events stacked on top of each other. Day view always applied
them. Both use one implementation now, so **week view looks different** — this is the intended
appearance.

**Multi-day timed events render correctly in week view.** They used to draw their raw start and end
times on every day they touched instead of filling the interior days.

**`autoScrollToNow` works in week view.** It was only ever implemented for day.

**The mini calendar follows navigation in year and list view.** It only ever tracked month view; the
other two silently stayed on whatever week the calendar was constructed in.

**The year view's "+N" badge shows the real count.** It was hardcoded to `"+2"` for every busy day.

**`validation.onInvalid: "keep"` actually keeps.** It filtered nulls twice, so it behaved exactly like
`"drop"`. Kept events are flagged `_invalid`. If you set `"keep"` and relied on getting nothing, you
will now get the invalid events.

**`validation.autoFix` actually repairs `end < start`.** The check ran against a value that had already
been silently corrected, so it never fired and the bad end string survived into the Excel export.
Events where `end === start` are left alone — a point in time is not malformed.

**`Zarvan.create()` no longer throws on an invalid event.** It warned through the event bus before that
bus existed, so a single bad event killed construction with a `TypeError`.

**`onModalClose` no longer fires for a modal that was never opened** — including on every `destroy()`.

**Month, week and day render in hidden documents.** Layout measurement was deferred to
`requestAnimationFrame`, which does not run in a background tab, under a `display:none` ancestor, or in
a headless screenshot. Those views drew their skeleton and never filled in a single event.

---

## 4. Callbacks always get `(payload, meta, ctx)`

v1 chose what to pass by inspecting `fn.length`. A two-argument listener received
`(payload, ctx)` — so asking for `meta` the obvious way handed you the context object instead, and
the date you wanted came back `undefined`:

```js
// v1: meta is actually ctx here. Silently.
cal.on("onEventClick", function (ev, meta) { meta.jdate; });   // undefined
```

It also broke outright for functions whose `length` is not what it looks like — default parameters and
rest arguments both report `0`.

v2 always passes three arguments, and `meta` is `null` rather than absent when a callback has none:

```js
cal.on("onEventClick", function (ev, meta, ctx) { meta.jdate; });   // works
```

**What to change:** any callback that declared exactly two parameters and used the second one as the
context. Add a third parameter:

```js
// v1
onInit: function (_, ctx) { console.log(ctx.instanceId); }

// v2
onInit: function (_payload, _meta, ctx) { console.log(ctx.instanceId); }
```

Callbacks that only used the first argument, or that already declared three, are unaffected.

---

## 5. Events opened from "+N more" now carry their date

The modal built its rows without a `gdate`/`jdate`, so `onEventClick` fired with `meta.jdate === null`
for exactly the events a user reaches by clicking the overflow affordance. If you were guarding against
that null, the guard is no longer needed. `onModalOpen` also gained a `date` field.

---

## 6. `onWarn` payload gained a `code`

```js
cal.on("onWarn", function (p) {
  p.code;     // "warn.invalidStart" — stable, switch on this
  p.message;  // localised text, changes with the locale
  p.extra;    // { index, ev, reason }
});
```

`p.message` still exists but is now translated, so matching on its text will break when the locale
changes. Use `p.code`.

---

## 7. Strings are localised

Every user-facing string moved into a locale. If you were patching Persian text by reaching into the
DOM, do this instead:

```js
Zarvan.create({ locale: { code: "fa", strings: { today: "همین حالا" } } });
```

A partial locale inherits everything it does not name, and `cal.setLocale()` switches a live calendar.
See [DEVELOPING.md](DEVELOPING.md#locales).

> **If you are going straight to v3:** the `en` locale that shipped in v2 has been removed — see
> [v2 to v3](#v2-to-v3) above.

`WEEKDAY_NAMES` and `MONTH_NAMES` are no longer module-level constants; they come from the locale.

---

## 8. Three features are plugins now

Highlighting, the now indicator and Excel export moved out of core. **They are bundled and
self-registering, so by default nothing changes** — `options.highlights`, `cal.setHighlights()`,
`features.nowLine`, `features.exportExcel` and the export button all behave as before.

What is new is that you can drop them. Remove the line from `build/manifest-js.txt` and rebuild, or pass
`plugins: []` to install none.

**SheetJS is no longer required.** It is resolved when the export button is pressed, from
`options.deps.xlsx` or `window.XLSX`, and warns if absent. If you were loading the ~880 KB
`xlsx.full.min.js` only because the library demanded it, you can now load it lazily — or not at all.

```js
Zarvan.create({ deps: { xlsx: XLSX } });   // preferred for bundler users
```

---

## 9. Fonts are opt-in

Core CSS no longer forces a font. `--zc-font-family` defaults to `inherit`, so the calendar picks up
your application's typography.

The old stylesheet carried an `@font-face` with a relative path to the bundled Vazir TTF, which 404'd
in any integration where the CSS was not served from exactly `src/css/`. To keep the previous
appearance, add one line:

```html
<link rel="stylesheet" href="src/css/zarvan-theme-fa.css" />
```

---

## 10. Smaller things

- **`getContainer()` returns the element you passed.** In `shadow: true` mode the calendar renders into
  a child of a shadow root — use `getRoot()` for the `.zc-calendar` element and `getShadowRoot()` for
  the root itself. Outside shadow mode `getContainer()` and `getRoot()` are the same element.
- **`src/js/zarvan.js` and `src/css/zarvan.css` are generated.** Edit the modules under `src/js/` and the
  parts under `src/css/parts/`, then run a build script. Editing the generated files works until the
  next build overwrites them.
- **`data-view` became `data-value`** on view-switcher menu items.
- **The alert on a missing xlsx library is gone.** It warns through `onWarn` instead of calling
  `alert()`.

---

## Nothing else changed

Everything not listed above still works: `create`, `destroy`, `setEvents`, `setView`, `goNext`,
`goPrev`, `goToday`, `setTypeStyles`, `setHighlights`, `on`, `off`, `emit`, `getContainer`, the whole
`features` map, `typeLabels`, `validation`, `handlers`, and every event name.

v2 adds a good deal on top — event CRUD, `gotoDate`, `setTheme`, `setOption`, view registration, plugins,
locales and shadow mode. See [API.md](API.md).
