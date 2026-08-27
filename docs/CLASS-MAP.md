# Class reference

Every class the library renders, what it marks, and the rules for overriding any of it.

Theming through [design tokens](API.md#design-tokens) is the supported path and the only one that
keeps working in `shadow: true` mode. Reach for a class when a token cannot express what you need.

- [Naming](#naming)
- [The classes](#the-classes)
- [State classes](#state-classes)
- [Finding event nodes](#finding-event-nodes-zc-event-node)
- [Event type classes](#event-type-classes)
- [Override contract](#override-contract)
- [Renamed from v1](#renamed-from-v1)

## Naming

Every class is `zc-`-prefixed and scoped under `.zc-calendar`. State is `zc-is-*` or `zc-has-*`.
There are two exceptions to the scoping, both because they are appended to `<body>` rather than to the
calendar: `.zc-modal-overlay` and the `.zc-modal` inside it.

## The classes

### Shell

| Class | On |
|---|---|
| `zc-calendar` | The container. Also carries `dir="rtl"`, `lang` and `data-zc-id`. |
| `zc-header` | The header bar. |
| `zc-right` · `zc-center` · `zc-left` | The header's three clusters: menu and view switcher; title; navigation. |
| `zc-content` | Sidebar plus body. |
| `zc-body` | The scrolling area the active view draws into. |
| `zc-sidebar` · `zc-sidebar-inner` | The collapsible panel and its padded interior. |

### Header controls

| Class | On |
|---|---|
| `zc-menu-btn` · `zc-menu-icon` · `zc-menu-bar` (`-top` `-mid` `-bottom`) | The sidebar toggle and the three lines that animate into an X. |
| `zc-title` | The header title text. |
| `zc-nav-group` | The prev/next/today cluster. |
| `zc-prev` · `zc-next` | The chevron buttons. Inline `<svg>`, painted with `currentColor`. |
| `zc-today` | The "today" button. |
| `zc-view-dd` · `-selected` · `-label` · `-value` · `-caret` · `-menu` · `-item` | The view switcher. |

### Sidebar

| Class | On |
|---|---|
| `zc-mini` · `zc-mini-header` · `zc-mini-title` · `zc-mini-nav` · `zc-mini-prev` · `zc-mini-next` | The mini calendar's chrome. |
| `zc-mini-weekdays` · `zc-mini-grid` · `zc-mini-day` | Its weekday row and day grid. |
| `zc-filters` | The filter panel. |
| `zc-dd` · `-selected` · `-label` · `-value` · `-caret` · `-menu` · `-item` | The type filter dropdown. |
| `zc-search` · `zc-search-label` · `zc-search-box` · `zc-search-input` | The search field. The label is a real `<label for>`. |
| `zc-ac` · `zc-ac-item` | The suggestion list. |
| `zc-export-btn` | The Excel export button, added by the plugin. |

### Month view

| Class | On |
|---|---|
| `zc-month-weekdays` · `zc-month-weekday` | The weekday header row. |
| `zc-month-grid` | The seven-column grid. |
| `zc-day-cell` · `zc-day-num` · `zc-day-name` | A day, its number and its weekday name. |
| `zc-day-events` | The event stack inside a cell. |
| `zc-event` | A coloured event pill. |
| `zc-month-timed` · `zc-month-time` · `zc-month-title` · `zc-month-dot` | A timed event's row: its time, title and colour dot. |
| `zc-more-btn` | The "+N more" affordance. |

### Week and day views

| Class | On |
|---|---|
| `zc-week-grid` · `zc-week-header` · `zc-week-row` | The week shell. |
| `zc-week-col-head` · `zc-week-col-head-inner` | A day column's header. |
| `zc-week-col` · `zc-week-gutter` | A day column and the hour gutter beside it. |
| `zc-day-grid` · `zc-day-col` · `zc-day-gutter` | The day shell — a CSS grid rather than a flex row. |
| `zc-day-title-text` · `zc-day-today-pill` | The day view's heading. |
| `zc-hour-line` · `zc-hour-label` | The hour rules and their labels. |
| `zc-allday-row` · `zc-allday-cell` · `zc-allday-time` · `zc-allday-more` · `zc-allday-divider` | The all-day strip above the grid. |
| `zc-day-allday` · `zc-day-allday-label` · `zc-day-allday-list` | The same, in day view. |
| `zc-now-line` · `zc-now-dot` | The now indicator, added by the plugin. |
| `zc-time-highlight` | A `time` highlight band. |

Week and day keep separate column classes on purpose: they share one rendering *engine*
(`views/timegrid.js`) but their DOM shells differ, and forcing one markup on both would mean restyling
day view for no functional gain.

### Year and list views

| Class | On |
|---|---|
| `zc-year` · `zc-year-grid` · `zc-year-month` · `zc-year-month-header` | The twelve mini grids. |
| `zc-year-weekdays` · `zc-year-wd` · `zc-year-days` · `zc-year-day` · `zc-year-day-num` | A month's weekday row and days. |
| `zc-year-dots` · `zc-year-dot` · `zc-year-more` | Event dots and the `+N` badge. Year view draws no per-event nodes. |
| `zc-list` · `zc-list-day` · `zc-list-day-header` · `zc-list-items` | The list shell, grouped by day. |
| `zc-list-item` · `zc-list-time` · `zc-list-title` · `zc-list-dot` | One row. |
| `zc-list-empty` | The "no events in this range" message. |

### Modal

| Class | On |
|---|---|
| `zc-modal-overlay` | The backdrop. Appended to `<body>` — or to the shadow root in shadow mode. |
| `zc-modal` | The dialog. `role="dialog"`, `aria-modal`, focus-trapped. |
| `zc-modal-header` · `zc-modal-title` · `zc-modal-close` · `zc-modal-body` · `zc-modal-events` | Its parts. |
| `zc-modal-event-item` · `zc-modal-event-title` · `zc-modal-event-time` | One row. |

## State classes

| Class | Means |
|---|---|
| `zc-is-today` | On a day number, a week column head, a mini-calendar day or a year day. |
| `zc-is-selected` | The mini calendar's selected day. |
| `zc-is-active` | The highlighted row in a dropdown or the suggestion list. |
| `zc-is-empty` | A day cell outside the current month; a year day with no date. |
| `zc-is-gutter` | The empty corner cell in the week header. |
| `zc-is-open` | An open dropdown. |
| `zc-has-events` | A day that has at least one. |
| `zc-has-day-hl` | A day carrying a `day` highlight. Its colour arrives as `--zc-hl-bg`. |
| `zc-hidden` | Hidden by the library rather than by CSS state. |
| `zc-is-loading` | On the container while a lazy load is outstanding. Draws the progress hairline. |
| `zc-sidebar-open` | On the container. The panel has width. |
| `zc-sidebar-ready` | Added once the width transition ends, so dropdowns can overflow the panel. |
| `zc-scheme-dark` | On the container **and** on the modal overlay. Carries nothing but re-valued colour tokens. |
| `zc-short` · `zc-tiny` · `zc-event-compact` | Density classes, applied by measurement: an event under 25px tall, under 17px tall, or under 55px wide. |
| `zc-ov-fanned` · `zc-ov-conflict` · `zc-ov-dim` · `zc-ov-focus` | Overlap layout and the `overlapFocus` effect. |

`zc-scheme-dark` is set for you by `colorScheme` / `setColorScheme()`. Setting it by hand works, but
then `"auto"` is yours to track — see [Dark mode](API.md#dark-mode).

## Finding event nodes: `zc-event-node`

Every node that stands for an event carries `zc-event-node`, whichever view drew it. It is a marker
only — no rule in the stylesheet targets it, so it is safe to key your own CSS or selectors off it.

`.zc-event` is **not** the class for this. It carries the pill's colours, and three of the six event
nodes never had it:

| View | Event node | `.zc-event`? | `.zc-event-node`? |
|---|---|---|---|
| week / day (timed and all-day) | `.zc-event` | yes | yes |
| month — all-day pill | `.zc-event.zc-month-allday-pill` | yes | yes |
| month — timed row | `.zc-month-timed` | **no** | yes |
| list | `.zc-list-item` | **no** | yes |
| "+N more" modal row | `.zc-modal-event-item` | **no** | yes |

So `closest(".zc-event")` returns null in list view and in the month grid's timed rows — a selector
that appears to work until someone opens the list. Use `closest(".zc-event-node")`.

The year view has no per-event nodes at all: it draws dots and a `+N` badge, and clicking a day emits
`onDayNumberClick`, not `onEventClick`.

Better still, do not go through the DOM: `onEventClick` and friends hand you the node as
`meta.element`. Prefer it over `domEvent.currentTarget`, which is the same node but only while the
event is being dispatched, and over `domEvent.target`, which is a child element in some views. Any
re-render replaces the node, so do not hold on to it.

## Event type classes

An event's `type` renders as `class="zc-event zc-type-meeting"`, with the value sanitized to
`[A-Za-z0-9_-]`. It is never emitted as a bare class name: that collided with host CSS and let
arbitrary strings into a class attribute and into a generated stylesheet.

Type colours come from one mechanism only — the `typeStyles` option, or the auto-generated hue when
no entry is given. The library injects one rule per type, scoped to the instance:

```css
[data-zc-id="zc4f2a1b"] .zc-type-meeting {
  --zc-event-bg: #2563eb;
  --zc-event-fg: #fff;
}
```

The stylesheet decides which elements consume those two properties — the pill background, the month
dot, the year dot, the list dot — so a new event-coloured element is a CSS change rather than a
JavaScript one. `features.typeStyleInjection: false` stops the injection if you would rather write the
type rules yourself.

## Override contract

The stylesheet is deliberately **not** wrapped in an `@layer`. Layers were tried first and rejected:
unlayered host CSS beats layered CSS at any specificity, which is fine for a host that deliberately
targets `.zc-*` classes, but it also lets collateral damage through — a global reset or a broad element
rule in the host would win over the library's reset and break the layout. That is the exact failure
this design exists to prevent, so the reset has to be able to win.

What ships instead is a specificity contract:

| Rules | Selector shape | Specificity | Beats |
|---|---|---|---|
| reset | `.zc-calendar *` | (0,1,0) | host `*`, `button`, `div`, `img`, `span` |
| components / views | `.zc-calendar .zc-x` | (0,2,0) | the reset |
| state | `.zc-calendar .zc-x.zc-is-y` | (0,3,0) | the view rules |

To restyle the calendar, in order of preference:

1. **Override a token** — `.zc-calendar { --zc-color-accent: #e11d48; }`. 85 tokens cover colour,
   spacing, radius, typography, elevation, structure and the z-index scale. This is the supported path
   and the only one that keeps working in `shadow: true` mode.
2. **Write a (0,2,0) or higher selector** — `.zc-calendar .zc-day-cell { background: #fafafa; }`.
3. Anything at (1,x,x), e.g. `#app .zc-title`, wins outright.

There is no `!important` anywhere in the stylesheet.

Verified in [`test/host-hostile.html`](../test/host-hostile.html): with the hostile stylesheet toggled
on and off, every structural property (`box-sizing`, `line-height`, `letter-spacing`, `font-size`,
`margin`, `padding`, `height`, `width`, `border`, `text-transform`) is byte-identical. The only
properties that change are the ones a host rule deliberately aimed at a `.zc-*` class.

### Running the check

No server, no build, no tooling. Open `test/host-hostile.html` in a browser; it runs its own checks on
load and prints a PASS/FAIL verdict at the top. Two buttons: **Disable hostile CSS** toggles the
aggressive host stylesheet so you can eyeball the calendar with and without it, and **Re-run checks**
re-runs the suite after you have poked at the page.

On `file://` the `!important` check reports `skip`, because browsers block script access to a file-URL
stylesheet's rules. Use `npm run serve` (or any static server) to get the full set.

## Renamed from v1

Every previously-unprefixed class. This table is the authoritative reference for anyone upgrading CSS
written against the old names; see [MIGRATION.md](MIGRATION.md) for the rest of that upgrade.

| Old (unprefixed — collided with host apps) | New |
|---|---|
| `calendar-grid` | `zc-month-grid` |
| `month-week-header` | `zc-month-weekdays` |
| `month-week-header-cell` | `zc-month-weekday` |
| `day-cell` | `zc-day-cell` |
| `day-number` | `zc-day-num` |
| `day-name` | `zc-day-name` |
| `events` | `zc-day-events` |
| `event-item` | `zc-event` |
| `more-events-btn` | `zc-more-btn` |
| `hour-line` | `zc-hour-line` |
| *(unclassed `<div>` in the gutter)* | `zc-hour-label` |
| `week-grid-rtl` | `zc-week-grid` |
| `week-header-row` | `zc-week-header` |
| `week-header-cell` | `zc-week-col-head` |
| *(inner box)* | `zc-week-col-head-inner` |
| `week-row` | `zc-week-row` |
| `week-time-cell` | `zc-week-gutter` |
| `week-day-cell` | `zc-week-col` |
| `day-grid` | `zc-day-grid` |
| `day-main-col` | `zc-day-col` |
| `day-time-col` | `zc-day-gutter` |

State classes moved to the `zc-is-*` convention: `empty`/`is-empty` → `zc-is-empty`,
`today`/`is-today` → `zc-is-today`, `is-selected` → `zc-is-selected`, `is-active` → `zc-is-active`,
`has-events` → `zc-has-events`, `open` → `zc-is-open`. The `empty` class on a week header cell became
`zc-is-gutter`.

Two elements changed shape rather than name:

- **The nav chevrons** were `<img src="../icons/arrow.svg">` and are now inline `<svg>` painted with
  `currentColor`. If you styled them through `.zc-prev img`, target `.zc-prev svg`. The `icons/` folder
  is gone — nothing in the library fetches an asset at runtime.
- **The search label** was a `<div>` and is now a `<label for>` bound to the input.
