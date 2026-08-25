# Upgrading from v1 to v2

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

If you wrote CSS targeting the calendar, it stopped matching. The full table is in
[CLASS-MAP.md](CLASS-MAP.md); the ones people actually styled:

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

> **v3 note:** the `en` locale that shipped in v2 has been removed — Zarvan is a Persian calendar.
> `Zarvan.registerLocale()` is still there if you need different vocabulary.

`WEEKDAY_NAMES` and `MONTH_NAMES` are no longer module-level constants; they come from the locale.

---

## 8. Three features are plugins now

Highlighting, the now indicator and Excel export moved out of core. **They are bundled and
self-registering, so by default nothing changes** — `options.highlights`, `cal.setHighlights()`,
`features.nowLine`, `features.exportExcel` and the export button all behave as before.

What is new is that you can drop them. Remove the line from `build/manifest-js.txt` and rebuild, or pass
`plugins: []` to install none.

**SheetJS is no longer required.** It is resolved when the export button is pressed, from
`options.deps.xlsx` or `window.XLSX`, and warns if absent. If you were loading the 881 KB
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
