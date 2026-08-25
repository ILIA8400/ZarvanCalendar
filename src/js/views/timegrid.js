/* Zarvan / views/timegrid - the engine behind the week and day views.
 *
 * Week and day are the same thing at different widths: a vertical 24-hour grid of day columns, an
 * all-day strip above it, and an hour gutter beside it. They shipped as two independent renderers of
 * roughly 250 lines each, and the copies had drifted apart in three ways that this module resolves:
 *
 *   1. Overlap positioning. `layoutDayEventsOverlap` computes a cascade (offsetPct / widthPct /
 *      stackIndex). Day applied it. Week threw it away for exactly the events that needed it - its
 *      conflict branch set no width or offset at all - so overlapping events piled up on top of each
 *      other instead of fanning out.
 *   2. Multi-day clipping. Day clipped an event's span at midnight so a multi-day timed event fills
 *      its interior days; week used the raw start/end times and drew the wrong span. Day did this by
 *      hand-inlining what `dataEvents.getTimedIntervalForDay` already does; both now call it.
 *   3. `autoScrollToNow` was only ever implemented for day.
 *
 * Decoration is not done here. The column is announced through the "timeColumn" hook and whatever is
 * listening - the now indicator, highlight bands - draws into it.
 *
 * The DOM *shells* stay per-view on purpose. Week is a flex column of rows; day is a CSS grid. Forcing
 * one markup on both would mean restyling day view for no functional gain. What is shared here is the
 * logic - which is where the divergence lived.
 *
 * Vertical scale comes from --zc-hour-height, resolved once per render and passed down as `metrics`.
 * The "timeColumn" hook payload carries it too, so a plugin drawing into a column (the now indicator,
 * highlight bands) positions itself against the same scale rather than re-deriving it. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var typeClass = Z.utils.typeClass;
  var jdate = Z.jdate;
  var evUtil = Z.dataEvents;
  var overlap = Z.layoutOverlap;
  var columns = Z.layoutColumns;

  var HOUR_HEIGHT = 60;
  var DAY_MINUTES = 24 * 60;
  var GAP = 6;
  var MIN_HEIGHT = 22;

  /* Pixels per hour, read from --zc-hour-height rather than assumed.
   *
   * Every vertical measurement here used to be a bare minute count, which silently hardcoded 60px an
   * hour. The token was therefore inert: it fed exactly one CSS rule (.zc-week-row's min-height), so
   * setting it to anything but 60px left the hour lines, the events, the highlight bands and the now
   * indicator all positioned against a scale nothing else agreed with.
   *
   * Resolved once per render pass and threaded through, because reading a computed style is a forced
   * style recalculation and week view would otherwise do it seven times. */
  function hourHeight(el) {
    if (!el || typeof getComputedStyle !== "function") return HOUR_HEIGHT;
    var raw = parseFloat(getComputedStyle(el).getPropertyValue("--zc-hour-height"));
    return raw > 0 ? raw : HOUR_HEIGHT;
  }

  function metrics(el) {
    var hh = hourHeight(el);
    return { hourHeight: hh, pxPerMin: hh / 60, dayHeight: hh * 24 };
  }

  /* The hour column. Labels are placed by `top` only; their inset, size and colour belong to
     .zc-hour-label in the stylesheet. */
  function buildHourGutter(className, m, formatHour) {
    m = m || metrics(null);
    var gutter = createEl("div", className);
    gutter.style.position = "relative";
    gutter.style.height = m.dayHeight + "px";

    for (var h = 0; h < 24; h++) {
      var label = createEl("div", "zc-hour-label");
      label.style.top = h * m.hourHeight + "px";
      // Localised and zero-padded. This was a bare `h + ":00"` - hardcoded, and the one number the
      // Persian locale's digits never reached.
      label.innerText = formatHour ? formatHour(h) : h + ":00";
      gutter.appendChild(label);
    }
    return gutter;
  }

  function buildHourLines(col, m) {
    for (var h = 0; h < 24; h++) {
      var line = createEl("div", "zc-hour-line");
      line.style.top = h * m.hourHeight + "px";
      col.appendChild(line);
    }
  }

  function toIntervals(events, jday) {
    return events.map(function (ev) {
      var span = evUtil.getTimedIntervalForDay(ev, jday);
      return {
        ev: ev,
        startMin: span.startMin,
        endMin: span.endMin,
        colCount: 1,
        colSpan: 1,
        colIndex: 0,
      };
    });
  }

  function layoutIntervals(items, mode, idPrefix) {
    var laid =
      mode === "overlap"
        ? overlap.layoutDayEventsOverlap(items)
        : columns.layoutDayEventsColumns(items);
    if (mode === "overlap") overlap.buildOverlapGraph(laid, idPrefix);
    return laid;
  }

  function placeEvent(div, item, mode, m) {
    m = m || metrics(null);
    div.style.top = item.startMin * m.pxPerMin + "px";
    div.style.height =
      Math.max(MIN_HEIGHT, (item.endMin - item.startMin) * m.pxPerMin) + "px";

    if (mode === "overlap") {
      div.style.width = "calc(" + item.widthPct + "% - " + GAP + "px)";
      div.style.right = "calc(" + item.offsetPct + "% + " + GAP / 2 + "px)";
      div.style.zIndex = 10 + (item.stackIndex || 0);
    } else {
      var unit = 100 / item.colCount;
      div.style.width = "calc(" + unit * item.colSpan + "% - " + GAP + "px)";
      div.style.right = "calc(" + item.colIndex * unit + "% + " + GAP / 2 + "px)";
    }
  }

  /* Density classes need measured boxes. Reading offsetHeight forces layout, which is exactly what we
     want and is cheap when done once per column rather than once per event.
   *
   * Deliberately NOT deferred to an animation frame. requestAnimationFrame does not run at all while
   * the document is hidden - a background tab, a display:none ancestor, a headless screenshot - so a
   * frame-deferred measurement leaves the calendar half-rendered until the page becomes visible.
   * Layout still computes in those states, so measuring synchronously is both correct and simpler.
   *
   * The caller must have attached the column to the document first, otherwise every box measures 0. */
  function applyDensityClasses(divs) {
    divs.forEach(function (div) {
      var h = div.offsetHeight;
      var w = div.offsetWidth;
      if (h < 25) div.classList.add("zc-short");
      if (h < 17) div.classList.add("zc-tiny");
      if (w < 55) div.classList.add("zc-event-compact");
      if (w < 38) div.classList.add("zc-event-dot");
    });
  }

  /* Renders one day column: hour lines, day and time highlights, the now indicator, and every timed
     event laid out for that day. Used identically by week (seven times) and day (once).
   *
   * `col` must already be in the document - the density pass measures it. */
  function renderColumn(opts) {
    var col = opts.col;
    var ctx = opts.ctx;
    var gdate = opts.gdate;
    var jday = opts.jdate;
    var viewName = opts.viewName;
    var m = opts.metrics || metrics(col);

    col.style.height = m.dayHeight + "px";
    buildHourLines(col, m);

    /* Announce the column rather than decorating it. Day highlighting, time bands and the now
       indicator are plugins now; core neither knows nor cares whether any of them is present. */
    ctx.decorateDay(col, gdate, jday, viewName);
    ctx.hooks.run("timeColumn", {
      el: col,
      gdate: gdate,
      jdate: jday,
      view: viewName,
      store: ctx.store,
      metrics: m,
    });

    var timed = (opts.events || []).filter(function (ev) {
      return !evUtil.isAllDayEvent(ev);
    });

    var mode = ctx.getTimeGridLayout();
    var laid = layoutIntervals(
      toIntervals(timed, jday),
      mode,
      ctx.instanceId + ":" + jdate.makeDayKey(jday)
    );

    var divs = [];

    laid.forEach(function (item) {
      var ev = item.ev;
      var div = createEl("div", "zc-event " + typeClass(ev.type));
      div.innerText = ev.title;
      div.title = ev.title;

      placeEvent(div, item, mode, m);

      if (mode === "overlap" && item._ovHas) {
        div.classList.add("zc-ov-conflict");
        if (ctx.overlapFocusEnabled()) {
          div.dataset.zcOvId = item._ovId;
          div.dataset.zcOvWith = (item._ovWith || []).join(",");
          ctx.wireOverlapHover(div, col);
        }
      }

      col.appendChild(div);
      ctx.bindEventItem(div, ev, {
        view: viewName,
        gdate: gdate,
        jdate: jday,
        isAllDay: false,
      });
      divs.push(div);
    });

    applyDensityClasses(divs);
    return col;
  }

  /* Fills an all-day container with pills plus a "+N more" affordance. The container itself belongs to
     the caller, because week and day wrap it in different markup. */
  function renderAllDayInto(opts) {
    var host = opts.host;
    var ctx = opts.ctx;
    var gdate = opts.gdate;
    var jday = opts.jdate;
    var viewName = opts.viewName;
    var max = opts.max;

    var allDays = (opts.events || []).filter(evUtil.isAllDayEvent);

    allDays.slice(0, max).forEach(function (ev) {
      var pill = createEl("div", "zc-event " + typeClass(ev.type));
      pill.innerText = ev.title;
      pill.title = ev.title;
      host.appendChild(pill);
      ctx.bindEventItem(pill, ev, {
        view: viewName,
        gdate: gdate,
        jdate: jday,
        isAllDay: true,
      });
    });

    if (allDays.length > max) {
      var more = createEl("div", "zc-allday-more", ctx.moreLabel(allDays.length - max));

      function openAll(e) {
        e.stopPropagation();
        ctx.emit("onMoreEventsClick", {
          date: { gdate: gdate, jdate: jday },
          events: allDays,
          view: viewName,
        });
        if (ctx.features.moreEventsModal) {
          ctx.showEventsModal(allDays, ctx.dayLabel(jday), { gdate: gdate, jdate: jday });
        }
      }

      // Click plus Enter/Space, the same as every other "+N more" in the calendar.
      if (ctx.onActivate) ctx.onActivate(more, null, openAll);
      else more.addEventListener("click", openAll);

      host.appendChild(more);
    }

    return allDays;
  }

  Z.viewsTimeGrid = {
    HOUR_HEIGHT: HOUR_HEIGHT,
    DAY_MINUTES: DAY_MINUTES,
    GAP: GAP,
    MIN_HEIGHT: MIN_HEIGHT,
    hourHeight: hourHeight,
    metrics: metrics,
    buildHourGutter: buildHourGutter,
    buildHourLines: buildHourLines,
    toIntervals: toIntervals,
    layoutIntervals: layoutIntervals,
    placeEvent: placeEvent,
    renderColumn: renderColumn,
    renderAllDayInto: renderAllDayInto,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
