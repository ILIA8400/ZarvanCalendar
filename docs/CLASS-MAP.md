# Phase 1 — class rename map

Every previously-unprefixed class is now `zc-`-prefixed. State classes use the `zc-is-*` / `zc-has-*`
convention. This table is the authoritative migration reference for anyone who wrote CSS against the
old class names.

## Structural classes

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
| `zc-week-header-cell` (inner box) | `zc-week-col-head-inner` |
| `week-row` | `zc-week-row` |
| `week-time-cell` | `zc-week-gutter` |
| `week-day-cell` | `zc-week-col` |
| `day-grid` | `zc-day-grid` |
| `day-main-col` | `zc-day-col` |
| `day-time-col` | `zc-day-gutter` |

`zc-week-col` and `zc-day-col` stay separate in Phase 1 because their styles still differ slightly.
Phase 6 (`TimeGridView`) merges both into `zc-timegrid-col`.

## State classes

| Old | New |
|---|---|
| `empty` (on `day-cell`) | `zc-is-empty` |
| `empty` (on `week-header-cell`) | `zc-is-gutter` |
| `is-empty` | `zc-is-empty` |
| `today` | `zc-is-today` |
| `is-today` | `zc-is-today` |
| `is-selected` | `zc-is-selected` |
| `is-active` | `zc-is-active` |
| `has-events` | `zc-has-events` |
| `open` | `zc-is-open` |

## Elements that changed shape

| Element | Was | Is |
|---|---|---|
| `.zc-prev` / `.zc-next` contents | `<img src="../icons/arrow.svg">` | inline `<svg>`, painted with `currentColor` |
| Hour labels in `.zc-week-gutter` / `.zc-day-gutter` | unclassed `<div>`, positioned inline | `.zc-hour-label`, positioned by the stylesheet |
| `.zc-search-label` | `<div>` | `<label for>` bound to the search input |

If you styled the arrows through `.zc-prev img`, target `.zc-prev svg` instead. The `icons/` folder
has been deleted — the chevron is inline SVG, and nothing in the library fetches an asset at runtime.

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
event is being dispatched, and over `domEvent.target`, which is a child element in some views.

## Event type classes

Event `type` values are no longer emitted as bare class names. `type: "meeting"` used to render
`class="event-item meeting"`, which both collided with host CSS and allowed arbitrary strings into a
class attribute and into a generated stylesheet.

It now renders `class="zc-event zc-type-meeting"`, with the type sanitized to `[A-Za-z0-9_-]`.

The hardcoded `.meeting` / `.task` colour rules have been removed from the stylesheet. Type colours come
from one mechanism only: the `typeStyles` option (or the auto-generated hue when none is given).

## Removed dead CSS

`.zc-add-event`, `.zc-view-group`, `.zc-view-btn` — no code path ever created these elements. The view
switcher was replaced by `.zc-view-dd` some time ago.

## Override contract for integrators

The stylesheet is deliberately **not** wrapped in `@layer`.

Layers were implemented first and then rejected, because `test/host-hostile.html` showed what they
actually do in a real host: unlayered host CSS beats layered CSS at *any* specificity, so a host with
a global `* { box-sizing: content-box; line-height: 2.4 }` or `button { padding: 1rem }` overrode the
library reset and broke the layout. Layers make deliberate overrides pleasant, but they also wave
through collateral damage, and collateral damage is the bug this phase exists to fix.

What ships instead is a specificity contract:

| Rules | Selector shape | Specificity | Beats |
|---|---|---|---|
| reset | `.zc-calendar *` | (0,1,0) | host `*`, `button`, `div`, `img`, `span` |
| components / views | `.zc-calendar .zc-x` | (0,2,0) | the reset |
| state | `.zc-calendar .zc-x.zc-is-y` | (0,3,0) | the view rules |

To restyle the calendar, in order of preference:

1. **Override a token** — `.zc-calendar { --zc-color-accent: #e11d48; }`. 73 tokens cover colour,
   spacing, radius, typography, elevation, structure and the z-index scale. This is the supported path
   and the only one that will keep working in `shadow: true` mode.
2. **Write a (0,2,0) or higher selector** — `.zc-calendar .zc-day-cell { background: #fafafa; }`.
3. Anything at (1,x,x), e.g. `#app .zc-title`, wins outright.

Verified in `test/host-hostile.html`: with the hostile stylesheet toggled on and off, every structural
property (`box-sizing`, `line-height`, `letter-spacing`, `font-size`, `margin`, `padding`, `height`,
`width`, `border`, `text-transform`) is byte-identical. The only properties that change are the ones a
host rule deliberately aimed at a `.zc-*` class.

## Running the checks

No server, no build, no tooling. Double-click `test/host-hostile.html`, or open it from the browser's
File > Open. It runs its own checks on load and prints a PASS/FAIL verdict at the top of the page.

Two buttons: **Disable hostile CSS** toggles the aggressive host stylesheet so you can eyeball the
calendar with and without it, and **Re-run checks** re-runs the suite after you have poked at the page.

One caveat on `file://`: browsers refuse script access to the rules of an external stylesheet loaded
from a file URL, so CHECK 5 (the `!important` count) reports `skip` rather than a result. Everything
else works identically. If you want CHECK 5 too, open the page over any local HTTP server.
