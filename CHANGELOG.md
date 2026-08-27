# Changelog

## 3.0.3

Overlapping events in week and day view, the focus ring on the sidebar controls, and a round of icon
and layout fixes. No API changes.

### Changed

- **Overlapping events no longer hide each other.** The cascade gave every covered event a strip of a
  flat 14% of the column — about 17px in week view — and that one sliver had to serve as both the
  click target and everything you could read of the title. Four events deep, three of them were a
  single glyph you had to hit exactly. Two changes: the step is now chosen in **pixels** from the
  measured column, so it does not shrink with the window; and a cluster too deep for every strip to
  stay usable is laid out in **columns** instead — side by side, nothing covered, nothing to hunt for.
  The decision is made per cluster, so one crowded morning does not flatten the rest of the day, and a
  wide day-view column keeps the compact cascade throughout.
- **Focusing an event still dims the rest, and now does something useful with it.** A card in a fanned
  cluster is about 23px wide — easy to click, impossible to read — so focusing one floats its title
  across the whole column. The label is a pseudo-element with `pointer-events: none`, which is the
  point: the cards it covers stay hoverable, so the pointer can walk along a pile reading one title
  after another instead of leaving and re-entering to reach the next.
- **Focus is shown on the control instead of around it.** Both dropdowns and the search input carried
  their own accent halo *and* the global focus outline, which stacked into a heavy double ring; on the
  full-width search input the outline also spilled past the sidebar it sits in. They now opt out of
  the outline and show focus the way a form control should — their own border goes accent, with a soft
  ring just outside it. The global `--zc-focus-ring` is unchanged and still governs everything else.
- **Short and narrow event boxes clamp to one ellipsised line.** `text-overflow: ellipsis` was inert:
  a `-webkit-box` with no line clamp just slices the overflowing line off mid-glyph, and in a narrow
  card `word-break` turned a Persian title into a vertical ladder of single glyphs.
- **The hamburger icon is inlined SVG** rather than a div and two pseudo-elements — crisp rounded caps
  at any size, and the same `currentColor` family as the other icons. The open/close morph to an X is
  unchanged.
- Clustering was duplicated between the cascade and the column layout; it is now one shared function
  (`clusterByOverlap`), alongside a new `peakConcurrency` helper. Both are pure and internal.

### Fixed

- **Week view measured its first column as the entire row.** Each column was rendered the moment it
  was appended, while it was still the row's only flex child, so every measurement taken from it was
  wrong — which is why the `zc-event-compact` and `zc-event-dot` density classes never fired there.
  All seven columns are now attached before any of them is filled.
- **A plain mouse click painted the keyboard focus ring on the dropdowns.** The box focuses itself
  from `pointerdown` after `preventDefault()` — which is what stops the browser doing its own,
  pointer-flavoured focus — so the scripted `focus()` inherited the previous modality and
  `:focus-visible` matched. Pointer-driven focus is now marked and skips the ring; the first key press
  clears the mark, so keyboard users still get one.
- **Week view's all-day pills had squarer corners and tighter text than every other event.** They now
  match the month grid's radius and padding.
- **The month view's event time could collide with the title.** The time is no longer allowed to
  shrink below its content, and the title absorbs the squeeze and ellipsises.
- **The year view's "+N" badge reported a hardcoded count.** It reports the real number of events.
- The Excel export button had no horizontal padding, so its label sat against the right edge.

### Testing

- 8 new assertions covering the per-cluster layout choice, the fallback when no measurement is
  available, and the two new pure helpers — 240 in total, up from 232.

## 3.0.2

Repository hygiene. No library code changed; `dist/zarvan.js` and `dist/zarvan.css` are byte-identical
to 3.0.1 apart from the version stamp.

### Removed

- **`icons/`** — dead since 2.0.1, when the nav chevron became inline SVG. Nothing loaded it; it
  survived only to make first-time visitors think they needed it.
- **`src/libs/xlsx.full.min.js`** — 882 KB of vendored SheetJS, 43% of the repository, shipped in no
  build output. It is an optional dependency resolved at click time, not a dependency of the library.
  `src/index.html` and `examples/vanilla.html` load it from a CDN; `test/host-hostile.html` had a
  script tag for it and never used it, so that tag is gone.

### Changed

- **Every page in the repository now loads `dist/`** rather than the intermediates under `src/`. The
  harnesses now exercise the artefact consumers actually receive, and a fresh clone works immediately
  because `dist/` is committed.
- **Added `.gitignore`.** The two generated intermediates (`src/js/zarvan.js`, `src/css/zarvan.css`)
  are excluded — nothing loads them and the CSS one duplicates `dist/zarvan.css` byte for byte.
  `dist/` is deliberately **not** ignored: it is the product.
- Docs updated throughout: what to download, which folders are not yours, and the SheetJS story.

## 3.0.1

### Fixed

- **The sidebar rendered on the left.** `.zc-content` used `flex-direction: row-reverse` without
  declaring a direction of its own, which only put the first child (the sidebar) on the right while
  the calendar happened to sit in a left-to-right document. 2.0.1 started stamping `dir="rtl"` on the
  container — correct for text entry, caret placement and screen readers — and the two negations
  cancelled, moving the sidebar to the left. The rule now declares `direction: rtl` and uses a plain
  `row`, so the sidebar is on the right regardless of the container attribute or the host document's
  direction. Nothing else was affected: every other reversed row in the stylesheet already sets its
  own `direction`.
- `test/dist.html` gained two checks for it — one that the sidebar opens on the right, and one that an
  LTR host document cannot flip it.

## 3.0.0

Zarvan is a Persian calendar. This release makes that a property of the library rather than a default
you could configure your way out of, and turns the drop-in into one folder you copy.

### Breaking

- **The English locale is gone.** `locale: "en"` no longer resolves and falls back to Persian.
  `Zarvan.locales()` returns `["fa"]`. If you were using it, register your own locale with
  `Zarvan.registerLocale()` — missing keys still fall back to Persian, so a partial definition works.
- **A locale no longer has a `direction` field**, and the translator no longer reports one. The layout
  is right-to-left, always; that was never a per-locale decision, it was a field that looked like one.
  The container is stamped `dir="rtl"` unconditionally.
- **`cal.direction` is gone from the plugin context.** A plugin can assume right-to-left.
- **`Zarvan._internal.locale.setDefault()` is gone.** With one bundled locale it had no meaning.
  (`_internal` was never part of the public API.)
- **`package.json` no longer declares `main`, `exports`, `module` or `sideEffects`.** Zarvan is a
  `<script>`-tag library that lives on `window`; those fields advertised an ESM/CJS entry point that
  never worked — importing it threw, because the bundle assumes `this === window`. Declaring nothing
  is honest, and the failure mode becomes "no entry point" instead of a confusing runtime error.
- **The published files moved to `dist/`.** `files` now ships `dist`, not scattered `src/` paths.

### Added

- **`dist/` — the drop-in.** `zarvan.js` (with the jalaali date library concatenated in ahead of it),
  `zarvan.css`, `zarvan.d.ts`, plus the optional `zarvan-theme-fa.css` and its font with the URL
  rewritten to match. Two tags, no load order to get wrong, nothing fetched at runtime.
- **`dist/zarvan.d.ts` — TypeScript definitions** for the `Zarvan` and `jalaali` globals: every
  option, method, callback payload, hook payload and plugin/view contract. It declares globals and
  contains no `import`/`export`, which is what keeps them visible.
- **`Zarvan.version`**, stamped at build time from `package.json`. A vendored copy is often several
  releases behind what a support ticket assumes; now it can say so.
- **`test/dist.html`** — a self-verifying page that loads *only* the two `dist/` files and asserts the
  README's instructions are true: 17 checks covering the globals, rendering, RTL, Persian digits, the
  API surface, plugins and `destroy()`.

### Fixed

- **`build.ps1` emitted CRLF between concatenated parts** while `build.sh` and `build.mjs` emitted LF,
  so the "three equivalent runners" produced three different files. All three are byte-identical now,
  and there is a check for it.
- **`build.sh` could not fail on a missing manifest entry.** The check ran inside a pipeline subshell,
  where `exit 1` stops the subshell and lets the build finish. Missing files are now detected up front.

## 2.0.1

A bug-fix pass over the 2.0.0 restructuring. No API was removed and no class was renamed; the two
behavioural changes worth reading before upgrading are numerals and the list view, both below.

### Fixed — layout

- **Month view scrolled sideways at any width under 980px.** `--zc-grid-min-width` was a flat 980px, so
  a calendar in a 700px column got a horizontal scrollbar on a grid that fits seven columns comfortably
  at half that. The token now defaults to `0` — seven fluid columns need no floor — and responsive.css
  raises it to 546px below a 560px container, where the "+N more" label starts to clip. Above 640px
  there is no horizontal overflow at all. Set the token yourself to restore the old behaviour.
- **The nav arrows pointed at `../icons/arrow.svg`**, a path resolved against the *host document*. It
  worked for the pages in this repository, which happen to sit one directory below `icons/`, and 404'd
  for a bundler, a CDN, or any page at another depth. The chevron is inlined as SVG and painted with
  `currentColor`. `icons/` is no longer fetched or shipped; style `.zc-prev svg`, not `.zc-prev img`.
- **`--zc-hour-height` did nothing.** It fed one CSS rule and nothing in JavaScript, so the hour lines,
  the events, the highlight bands and the now indicator were all hardcoded to 60px an hour. Setting it
  to anything else left four elements on three different scales. It now drives all of them.
- **The month all-day pill was capped at `max-width: 145px`**, a leftover from the fixed-980px grid.

### Fixed — keyboard and assistive technology

- **The reset removed every focus ring and put nothing back.** `outline: 0` on `.zc-calendar *` (there
  to stop the host's focus styling leaking in) left no focusable control in the calendar with a visible
  focus indicator. New `--zc-focus-ring` token; set it to `none` to opt out.
- **The collapsed sidebar kept five controls in the tab order.** `width: 0` hides it to the eye only, so
  tabbing through a closed calendar walked into an invisible search box, dropdown and export button. It
  is now `inert` and `aria-hidden` while collapsed.
- **Event pills claimed to be buttons and ignored every key.** They carried `role="button"` and
  `tabindex="0"` with no key handling; `Enter` and `Space` now fire `onEventClick`.
- **The view switcher and type filter were dead tab stops** — focusable, with no key handling at all.
  Both now open on `Enter` / `Space` / `↓`, move with the arrows, select with `Enter` and close on
  `Esc`, and carry `role`/`aria-expanded`/`aria-haspopup` with a `listbox` menu.
- **The search suggestions were mouse-only.** `↑` `↓` highlight, `Enter` accepts, `Esc` dismisses; the
  popup is a `listbox` the input owns through `aria-activedescendant`, and the label is a real
  `<label for>`.
- **The "+N more" modal was an overlay that looked like a dialog.** No `role`, no `aria-modal`, no
  label, no `Esc`, no focus management — the keyboard walked straight past it. It now takes focus on
  open, cycles `Tab` inside itself, returns focus to whatever opened it, and closes on `Esc`.
- **Day numbers, year cells, list day headers and both "+N more" affordances** were `<div>`s with a
  click listener and nothing else. All are operable now — and the day grids use a roving tab stop, so
  the year view is 12 tab stops rather than 372 and the mini calendar is 1 rather than 31.
- The menu button states `aria-expanded` from the start and names what it controls.

### Fixed — behaviour

- **Clicking an event in list view fired `onEventClick` *and* jumped to day view.** The row carried two
  click listeners; `stopPropagation()` does not stop a sibling listener on the same element. No other
  view navigates on an event click, and the day header directly above it already does. The row now only
  reports the click.
- **`onDestroy` with `{phase: "after"}` never reached `.on()` subscribers.** The listener table was
  cleared before it was emitted, so only `handlers` saw it.
- **`destroy()` handed back an element that still looked like a calendar** — the `zc-calendar` class
  (carrying `container-type`, `max-width` and margins), `data-zc-id`, and every inline `--zc-*`
  property `setTheme()` had written. All removed; custom properties the *host* set are left alone.
- The hour gutter printed `9:00` rather than `09:00`, hardcoded, in Latin digits — the one string the
  English locale exists to smoke out.

### Changed

- **`locale.digits` now shapes every number on screen**, not just the Excel export. Day numbers, hour
  labels, event times and the year in the header render in Persian digits under the `fa` locale, which
  is what that locale has always declared. For Latin digits with a Persian interface, pass
  `locale: { code: "fa", digits: null }`.
- The container carries `dir` and `lang` from the locale. **The layout is still right-to-left in every
  locale** — that is a stylesheet-wide property, not a runtime one. Under `locale: "en"` you get English
  text and correct text entry in an RTL grid. A left-to-right layout is not supported; see the README.
- `.zc-search-label` is a `<label>`, not a `<div>`. Hour labels carry `.zc-hour-label` and are
  positioned from the stylesheet rather than inline.
- The `timeColumn` and `viewRendered` hook payloads carry `metrics` (`{hourHeight, pxPerMin,
  dayHeight}`), so a plugin drawing into a column shares the grid's vertical scale.
- `TimeGrid.buildHourGutter(className, metrics, formatHour)` replaces `(className, labelRight)`;
  `buildHourLines` and `placeEvent` take `metrics`. `TimeGrid.scrollToNow` is gone — it was an unused
  duplicate of the now-indicator plugin's own.
- `icons/` is dropped from the published package. Nothing loads it any more.
- `test/index.html` is up to 228 assertions across 23 suites.

## 2.0.0

A restructuring, not a rewrite. The library went from one 3,549-line file and one 1,987-line stylesheet
to 30 tested modules and 25 stylesheet parts, both concatenated into the same two files consumers load.

Upgrading: **[docs/MIGRATION.md](docs/MIGRATION.md)** lists every break.

### Breaking

- **Every CSS class is `zc-`-prefixed and scoped.** v1 shipped 17 unprefixed classes — `.events`,
  `.day-number`, `.day-cell`, `.event-item` — which collided with host applications in both directions.
  See [docs/CLASS-MAP.md](docs/CLASS-MAP.md).
- **Renders are batched** into one animation frame. Use `cal.refresh()` or `renderMode: "sync"` if you
  read the DOM right after an API call. `create()` is still synchronous.
- **Callbacks always receive `(payload, meta, ctx)`.** v1 picked the arguments from `fn.length`, so a
  two-argument listener silently got `(payload, ctx)`.
- **Event `type` values are sanitised and namespaced** — `class="event-item meeting"` became
  `class="zc-event zc-type-meeting"`. The hardcoded `.meeting` / `.task` rules are gone.
- **Fonts are opt-in.** Core CSS forces none; load `zarvan-theme-fa.css` for the bundled Vazir face.
- **`getContainer()` returns the element you passed.** Use `getRoot()` for the `.zc-calendar` element.
- `onWarn` gained a stable `code`; `message` is now localised.
- `data-view` became `data-value` on view-switcher items.
- The `alert()` on a missing xlsx library is gone; it warns through `onWarn`.

### Fixed

- **Overlapping events in week view stacked instead of fanning out.** The cascade layout computed
  offsets and the week renderer discarded them; day view applied them. Both share one implementation now.
- **Multi-day timed events drew the wrong span in week view** — raw start/end times on every day they
  touched, instead of filling the interior days.
- **`validation.onInvalid: "keep"` behaved exactly like `"drop"`.** Nulls were filtered twice.
- **`validation.autoFix` never repaired `end < start`.** It compared against a value that had already
  been silently corrected, so the check could not fire and the bad string reached the Excel export.
- **`Zarvan.create()` threw on an invalid event.** It warned through the event bus ~25 lines before that
  bus was initialised.
- **The week view leaked six intervals per render.** One now-indicator interval per day column, all
  stored in a single variable inside the loop.
- **The view dropdown's outside-click handler captured a stale element** and stopped working after any
  header re-render.
- **Month, week and day rendered nothing in a hidden document.** Layout measurement was deferred to
  `requestAnimationFrame`, which does not run in a background tab or under a `display:none` ancestor.
- **Batched renders never fired in a hidden document** either; the scheduler now falls back to a timeout.
- **The mini calendar ignored navigation in year and list view.**
- **The year view's "+N" badge was hardcoded to `"+2"`** for every busy day.
- **`autoScrollToNow` was only implemented for day view.**
- **`onModalClose` fired for modals that were never opened**, including on every `destroy()`.
- **Events opened from "+N more" had `meta.jdate === null`.**
- **An event `type` containing a brace or quote** was written straight into a class attribute and into a
  generated stylesheet.
- The PowerShell build corrupted every Persian string by reading BOM-less files as ANSI.

### Added

- **Event CRUD** — `getEvents`, `getEventById`, `addEvent`, `updateEvent`, `removeEvent`, plus an
  `onEventsChange` callback.
- **Navigation** — `getView`, `getViews`, `getDate`, `getJDate`, `gotoDate`, `getVisibleRange`, and
  `next` / `prev` / `today`.
- **Configuration** — `setOption`, `setTheme`, `getHighlights`, `getLocale`, `setLocale`.
- **Custom views** — `Zarvan.registerView()` / `unregisterView()` / `registeredViews()`. Replaced 27
  `view === "..."` comparisons spread across nine functions.
- **Plugins** — `Zarvan.use()` / `unuse()` / `plugins()`, with four hooks. Highlighting, the now
  indicator and Excel export are now plugins themselves, bundled by default and removable.
- **Locales** — `fa` and `en` ship; `Zarvan.registerLocale()`; per-instance `locale` and live
  `setLocale()`. 139 hardcoded strings moved out of render code.
- **Shadow DOM** — `shadow: true`, with style adoption and `composedPath()`-based hit testing. Closes
  the one gap a scoped stylesheet cannot: an ID-scoped universal selector in the host.
- **73 design tokens** covering colour, spacing, radius, typography, elevation, structure and z-index.
  v1 had three.
- **Container queries** — layout responds to the calendar's own width, not the viewport.
- **SheetJS is optional.** Resolved at click time from `options.deps.xlsx` or `window.XLSX`; absent, the
  export warns and nothing breaks.
- Two self-verifying test pages — `test/index.html` (211 assertions at the time of this release) and
  `test/host-hostile.html` (6 CSS isolation checks) — plus vanilla, React and Vue examples.

### Changed internally

- `src/js/zarvan.js` and `src/css/zarvan.css` are **generated** by concatenation from
  `build/manifest-{js,css}.txt`. Three equivalent runners ship (`build.ps1`, `build.sh`, `build.mjs`);
  none requires a toolchain.
- Zero `!important` in the stylesheet, down from 32. Ordering is an explicit specificity contract;
  `@layer` was tried and rejected because unlayered host CSS beats it unconditionally.
- Week and day share one time-grid engine — 513 duplicated lines became 175 plus a shared module.
- Every listener, interval, timer and injected node registers on a disposable store, so `destroy()` is
  two calls rather than a hand-maintained checklist.
- All Jalali conversion goes through `calendar/jalali.js`; nothing else names the `jalaali` global.

## 1.x

See the git history.
