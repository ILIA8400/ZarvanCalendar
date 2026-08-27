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

---

## Why you might pick it

- **It survives your app's CSS.** Every class is `zc-`-prefixed and scoped, with a reset that neutralises
  the host's `button`/`input`/`img`/global rules. There is a regression harness
  ([`test/host-hostile.html`](test/host-hostile.html)) that embeds the calendar in a deliberately
  aggressive page and asserts that nothing leaks in. For hosts that fight dirty, `shadow: true` closes
  the last gap.
- **Themed by tokens, not overrides.** 75 CSS custom properties cover colour, spacing, radius,
  typography, elevation, structure and the z-index scale. You retheme by setting variables, not by
  winning specificity fights. There is not one `!important` in the stylesheet.
- **Responsive to itself.** Layout is driven by container queries, so a calendar in a 700px column
  behaves like a 700px calendar even on a 1600px screen.
- **Operable from the keyboard.** Every clickable thing is reachable and activatable, the day grids use
  a roving tab stop rather than 372 of them, the modal traps focus and closes on `Esc`, and the
  collapsed sidebar is `inert` instead of an invisible detour through the tab order.
- **Nothing to fetch at runtime.** No images, no fonts, no network requests. Two files and jalaali.js.
- **Extensible without forking.** Views and plugins are registered, not hardcoded. Highlighting, the now
  indicator and Excel export are themselves plugins.
- **Persian, not "internationalised".** The calendar system is Jalali, the layout is right-to-left and
  the interface is Persian — decided once, so none of it is a runtime branch you can get wrong. Retune
  the wording with a partial locale.
- **Typed.** `dist/zarvan.d.ts` describes the whole surface for TypeScript consumers. It declares
  globals, not modules — point `tsconfig` at it and `Zarvan.create(…)` autocompletes.

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
`exports` rather than claim otherwise. Pin a tag or a commit SHA and copy the folder across in a
build step:

```json
"dependencies": { "zarvan-calendar": "git+ssh://git@github.com/your-org/ZarvanCalendar.git#v3.0.0" }
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

```html
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
```

### What to download

**`dist/` is the only folder you need.** Everything else in this repository exists for people working
*on* Zarvan rather than *with* it:

| | |
|---|---|
| `src/` | The unbuilt modules and stylesheet parts that `dist/` is generated from. |
| `build/` | The three build runners and their manifests. |
| `test/` | Self-verifying harnesses. Worth running if you fork. |
| `examples/` | Worth reading — `vanilla.html` drives every API method live — but not shipping. |
| `docs/` | The reference. Read it here on GitHub. |
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
  in callback payloads and `getVisibleRange()`, where they exist so you can talk to a backend.
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

## Dates

Dates are Jalali strings: `"YYYY-M-D"` for an all-day event, `"YYYY-M-DTHH:MM"` for a timed one.
Zero-padding is optional — `"1405-6-2"` and `"1405-06-02"` are the same date.

```js
{ id: 1, title: "Standup", start: "1405-06-02T09:00", end: "1405-06-02T09:15", type: "meeting" }
{ id: 2, title: "Sprint",  start: "1405-06-02",       end: "1405-06-05", allDay: true }
{ id: 3, title: "Weekly",  start: "1405-06-02T15:00", end: "1405-06-02T16:00",
  repeat: { freq: "weekly", interval: 1, byWeekday: [0, 2], until: "1405-12-29" } }
```

`repeat.freq` is `"daily"`, `"weekly"` or `"monthly"`. `byWeekday` counts from Saturday (`0`).

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
cal.setLocale({ code: "fa", strings: { today: "همین امروز" } });

cal.on("onEventClick", function (ev, meta) {
  console.log(ev.title, meta.view, meta.jdate);
});
```

Renders are batched into one animation frame, so a change is not in the DOM on the very next line.
Call `cal.refresh()` when you need it now, or pass `renderMode: "sync"`.

Full reference: **[docs/API.md](docs/API.md)**.

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

Or at runtime — `cal.setTheme({ "color-accent": "#e11d48" })`. Tokens are the supported path, and the
only one that keeps working in `shadow: true` mode.

If you need to go further than tokens, override with a selector of specificity (0,2,0) or higher:

```css
.zc-calendar .zc-day-cell { background: #fafafa; }
```

The class names and the reasoning behind that contract are in **[docs/CLASS-MAP.md](docs/CLASS-MAP.md)**.

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
  render: function (ctx) { /* draw into ctx */ },
});
```

A **plugin** attaches to hooks and may add public methods:

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

Both are documented in **[docs/DEVELOPING.md](docs/DEVELOPING.md)**.

## Examples

| File | Shows |
|---|---|
| [`examples/vanilla.html`](examples/vanilla.html) | The full option surface, live controls for every API method |
| [`examples/react.html`](examples/react.html) | A `<Calendar>` wrapper component with props and callbacks |
| [`examples/vue.html`](examples/vue.html) | The same as a Vue 3 component |
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

**v2 → v3** removed the English locale, the `direction` field on a locale, and the `main`/`exports`
fields in `package.json`, and moved the drop-in to `dist/`. See
**[CHANGELOG.md](CHANGELOG.md)**.

**v1 → v2** renamed every CSS class and changed a few behaviours. If you wrote CSS against the old class
names or relied on renders being synchronous, read **[docs/MIGRATION.md](docs/MIGRATION.md)** — it lists
every break and what to do about it.

## License

MIT — see [LICENSE](LICENSE).
