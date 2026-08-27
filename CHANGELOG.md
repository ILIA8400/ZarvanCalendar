# Changelog

## Unreleased

### Added

- **`sidebarOpen` — the sidebar's initial state.** Closed by default, so a calendar that says nothing
  looks exactly as it always has.

  ```js
  Zarvan.create({ selector: "#calendar", sidebarOpen: true });
  ```

  It is also a hot option, so `setOption("sidebarOpen", true)` works and is the same call as
  `setSidebarOpen(true)` below. Construction itself emits no `onSidebarToggle` — nothing toggled, and
  `onInit` is the callback that reports construction.

  `zc-sidebar-open` and `zc-sidebar-ready` are set together and before the first paint. The second is
  normally added when the width transition ends; there is no transition to wait for here, so the panel
  is simply open in the first frame rather than sliding open in front of the reader on load. The option
  is ignored when `features.sidebar` is `false` — there is no panel to open.

- **`setSidebarOpen(open)` and `isSidebarOpen()`.** The programmatic half of the menu button, and the
  reason `sidebarOpen` is a hot option rather than construction-only.

  ```js
  cal.setSidebarOpen(true);    // returns the state in force
  cal.isSidebarOpen();         // true
  ```

  It goes through the same internal toggle a click does, so a programmatic open gets the same
  transition, the same focus handling and the same `onSidebarToggle` — one path rather than two that
  can drift. Idempotent: asking for the state it is already in does nothing and emits nothing, which
  is what makes it safe to call from a resize handler or a route change without checking first.

  With `features.sidebar: false` there is no panel, so `isSidebarOpen()` is always `false` and
  `setSidebarOpen(true)` returns `false` and warns with the new `warn.sidebarDisabled` code — silently
  doing nothing there would look exactly like a bug in the caller.

- **The documentation site, `website/`.** 28 sections, each pairing prose and an API table with a live
  calendar the reader can drive. Open `website/index.html` — no server, no build step, no network. Every
  demo uses the public API only, and is destroyed when the reader navigates away, so browsing it
  exercises `destroy()` a few dozen times.

- **Dark mode.** `colorScheme: "light" | "dark" | "auto"`, defaulting to `"light"`, so an existing
  calendar looks exactly as it did.

  ```js
  Zarvan.create({ selector: "#cal", colorScheme: "auto" });
  ```

  Dark is not a second stylesheet. `src/css/parts/theme-dark.css` re-values the colour tokens under a
  `zc-scheme-dark` class and declares nothing structural, so every rule in the stylesheet goes dark
  without knowing that dark mode exists — and a calendar already themed through tokens goes with it.
  Specificity is (0,2,0) against tokens.css's (0,1,0), so the dark values win where both apply and
  inline properties written by `setTheme()` still win over both.

  `"auto"` is resolved in JS rather than by a `@media (prefers-color-scheme: dark)` block. Either
  would work; this way the dark palette is written once instead of duplicated into a media block that
  then has to be kept in step with the class, and `"auto"` keeps *following* the system rather than
  being sampled at construction — flip the OS to dark and the calendar follows, no reload. The
  `matchMedia` listener is attached only while `"auto"` is in force and is registered on the instance
  store, so `destroy()` takes it with everything else.

  The scheme class is stamped on `.zc-calendar` and, separately, on the modal overlay: that overlay is
  appended to `<body>` rather than to the calendar, so it is not a descendant and inherits none of the
  container's custom properties.

  New API: `setColorScheme(s)`, `getColorScheme()` (the setting, which may be `"auto"`) and
  `getResolvedColorScheme()` (what is on screen, never `"auto"`). `colorScheme` is a hot option, so
  `setOption("colorScheme", "dark")` works too. New callback: `onColorSchemeChange`
  `{scheme, resolved, source}`, where `source` is `"api"` or `"system"`. Changing the scheme does not
  re-render — the DOM is the same either way. A plugin can read the resolved scheme from
  `ctx.getColorScheme()`.

  Two things deliberately do **not** follow the scheme: colours you set in `typeStyles`, because a
  brand colour is not the library's to reinterpret, and tokens written by `setTheme()`, because those
  are inline and win in both. Set either per scheme from an `onColorSchemeChange` listener.

  Nine tokens were added on the way, all with their existing light values, so that the last hardcoded
  colours in the parts had somewhere to go: `--zc-color-canvas`, `--zc-color-on-accent`,
  `--zc-color-scrim`, `--zc-color-conflict-border`, `--zc-color-border-strong`,
  `--zc-color-border-stronger`, `--zc-color-scrollbar-gutter`, `--zc-shadow-button` and
  `--zc-shadow-button-focus`. `--zc-color-canvas` is `transparent` in light — the calendar's padding
  keeps showing the host page exactly as before — and painted in dark, because a dark widget cannot
  leave its ground to a light host.

- **`events` can be a function, and the calendar loads one visible range at a time.** An array keeps
  every event in memory for the life of the page, which is fine for hundreds and hopeless for years
  of history.

  ```js
  events: async ({ startG, endG }) => fetchEventsFromServer(startG, endG)
  ```

  The range arrives as Gregorian `Date`s — what a backend speaks — plus the Jalali equivalents and
  the view being drawn. Loads are triggered by the visible range changing: navigation and view
  switches. A re-render that leaves the range alone — filtering, searching, a local edit — does not
  re-request.

  The three things that make an async source correct rather than merely working are handled in
  `data/source.js`:

  - **Ordering.** Every request carries a generation and a result whose generation is no longer
    current is dropped. Without it, paging forward twice quickly can leave the first page's events on
    screen because that request happened to be the slowest.
  - **De-duplication.** Two asks for one range share a single call.
  - **Repetition.** Fetched ranges are remembered in a capped cache (`eventCacheLimit`, default 12),
    so paging back and forth does not re-request.

  What comes back **replaces** what was loaded — the source is the authority for the range it was
  asked about. Merging would quietly accumulate events from months the reader navigated away from, in
  memory, in `getEvents()` and in the Excel export. Local mutations show immediately and are *not*
  clobbered: they drop the cache so future navigation is fresh, but deliberately do not reload the
  visible range, because the server's answer does not have the edit in it yet and the edit would
  appear to undo itself.

  A failed range leaves what is on screen alone rather than blanking the calendar, and is not cached,
  so returning to it tries again. A load still in flight when `destroy()` runs is ignored rather than
  resolving into a torn-down calendar.

  New API: `refetchEvents()`, `isLazy()`, `isLoading()`, and `setEvents()` now also accepts a
  function to swap the source at runtime. New callbacks: `onEventsLoadStart`, `onEventsLoadEnd`,
  `onEventsLoadError`. `onEventsChange` gained a `"load"` type. While any load is outstanding the
  container carries `zc-is-loading`, which draws a hairline progress bar — motion suppressed under
  `prefers-reduced-motion`.

  Passing an array behaves exactly as before.

- **`meta.element` on every event callback** — the node the event was drawn as, for `onEventClick`,
  `onEventDblClick`, `onEventHover`, `onEventLeave`, `onEventContextMenu` and the focus callbacks.
  Anchor a popover to it. It is better than the two things a consumer previously had to reach for:
  `domEvent.currentTarget` is the same node but only while the event is being dispatched, and
  `domEvent.target` is a *child* in some views — a list row's title, a month timed row's title span.
  Note that any re-render replaces the node, so do not hold on to it across navigation, a view
  change, a filter change or a data change.
- **`zc-event-node` on every event node**, whichever view drew it. `.zc-event` could not serve as
  that selector: it carries the pill's colours, and three of the six event nodes never had it — the
  month grid's timed rows (`.zc-month-timed`), list rows (`.zc-list-item`) and "+N more" modal rows
  (`.zc-modal-event-item`). So `closest(".zc-event")` returned null in list view and in the month
  grid's timed rows, which is a selector that appears to work until someone opens the list.
  `zc-event-node` is a marker only — no rule in the stylesheet targets it, so nothing about the
  existing appearance changes, and it is safe to key your own CSS off it. It is applied in
  `bindEventItem`, the one function every event node in the library passes through, so views added
  later inherit the guarantee. Documented in `docs/CLASS-MAP.md`.

  The year view still has no per-event nodes: it draws dots and a `+N` badge, and clicking a day
  emits `onDayNumberClick`, not `onEventClick`.

### Fixed

- **The menu button jumped to the left edge on narrow calendars.** Below the 768px container query the
  header wraps to two rows, and the two control clusters were ordered `.zc-left` then `.zc-right`. The
  header is `direction: rtl`, so the *lower* order sits at the right edge — which put the hamburger on
  the far left while the sidebar it opens slides in from the right: a control pointing away from the
  thing it controls. The orders are swapped, so the cluster carrying the menu button and the view
  switcher stays on the right at every width, exactly where it is in the wide layout.

  There is a regression test for it, and it asserts the geometry rather than the declaration: the
  button has to land in the right half of the header, against the edge the panel opens from.

- **`aria-expanded` on the menu button went stale after a header rebuild.** `renderHeader()` built the
  button with a hardcoded `aria-expanded="false"`, so `setLocale()` — or any feature change — on a
  calendar with an open sidebar left the button announcing the opposite of what was on screen. It is
  now written from the real state by `syncSidebarHidden()`, which is the one place that already knew
  it, and which both toggle branches and the header rebuild all call.

### Changed

- **The last hardcoded colours in the stylesheet parts now go through tokens** — the "today" button's
  border, ink and shadows, the modal scrim, the mini-calendar's hover, the week header day number and
  its hover, the year month-header rule, the scrollbar thumb's inset, the conflict outline and the
  three places that painted white ink on the accent. They had to be tokens for dark mode to reach
  them at all.

  Four of them landed on the nearest existing semantic token rather than a new one of their own,
  which moves them by a shade or two in light mode: the mini-calendar's `#f3f3f3` hover and the today
  button's 4% veil both become `--zc-color-hover-veil` (6%), the week header day number's `#333`
  becomes `--zc-color-text` (`#202124`), its `#e7e7e7` hover becomes `--zc-color-active-veil`
  (`#e6e6e6` over white), and the year month-header's `#eef0f3` rule becomes
  `--zc-color-border-faint` (`#f0f2f5`). Sub-perceptual, and worth it to keep the token surface from
  growing a near-duplicate for each.

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
