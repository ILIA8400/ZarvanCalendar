// ================== Zarvan (Single-file, Multi-instance safe) ==================
var Zarvan = (function () {
  "use strict";

  // --------------------------- Utils ---------------------------
  function resolveElement(selOrEl) {
    if (!selOrEl) return null;
    if (typeof selOrEl === "string") return document.querySelector(selOrEl);
    return selOrEl; // HTMLElement
  }

  function isPlainObject(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }

  function mergeDeep(a, b) {
    a = a || {};
    b = b || {};
    var out = Array.isArray(a) ? a.slice() : Object.assign({}, a);

    Object.keys(b).forEach(function (k) {
      var av = out[k];
      var bv = b[k];
      if (isPlainObject(bv))
        out[k] = mergeDeep(isPlainObject(av) ? av : {}, bv);
      else out[k] = bv;
    });
    return out;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function pad2(x) {
    return String(x).padStart(2, "0");
  }

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase();
  }

  function dayPart(str) {
    return String(str || "").split("T")[0];
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function createEl(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function gDateStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  function isSameYMD(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function minuteOfDay(dt) {
    return dt.getHours() * 60 + dt.getMinutes() + dt.getSeconds() / 60;
  }

  function weekdayIndexFromGDate(gdate) {
    // شنبه=0 ... جمعه=6
    return (gdate.getDay() + 1) % 7;
  }

  function toMin(timeStr) {
    if (!timeStr) return 0;
    var p = String(timeStr).split(":").map(Number);
    return (p[0] || 0) * 60 + (p[1] || 0);
  }

  function parseJDateTime(str) {
    // "1403-09-20" یا "1403-09-20T09:30"
    var parts = String(str || "").split("T");
    var d = (parts[0] || "0-0-0").split("-").map(Number);
    var t = (parts[1] || "00:00").slice(0, 5).split(":").map(Number);

    return {
      jy: d[0] || 0,
      jm: d[1] || 0,
      jd: d[2] || 0,
      hh: t[0] || 0,
      mm: t[1] || 0,
    };
  }

  function formatJDT(jy, jm, jd, hh, mm, allDay) {
    if (allDay) return jy + "-" + jm + "-" + jd;
    return jy + "-" + jm + "-" + jd + "T" + pad2(hh) + ":" + pad2(mm);
  }

  function parseDayKey(key) {
    var p = String(key || "")
      .split("-")
      .map(Number);
    return { jy: p[0] || 0, jm: p[1] || 0, jd: p[2] || 0 };
  }

  function cmpJ(a, b) {
    if (a.jy !== b.jy) return a.jy - b.jy;
    if (a.jm !== b.jm) return a.jm - b.jm;
    return a.jd - b.jd;
  }

  // --------------------------- Defaults / Constants ---------------------------
  var WEEKDAY_NAMES = [
    "شنبه",
    "یک‌شنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
  ];
  var MONTH_NAMES = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  var DEFAULT_FEATURES = {
    sidebar: true,
    miniCalendar: true,

    filters: true,
    typeFilter: true,
    search: true,
    autocomplete: true,
    exportExcel: true,

    viewDropdown: true,
    menuButton: true,
    navigation: true,
    prevNext: true,
    todayButton: true,

    views: { month: true, week: true, day: true, year: true, list: true },

    dayHighlights: true,
    timeHighlights: true,
    nowLine: true,
    autoScrollToNow: false,

    moreEventsModal: true,

    allDayRow: true,
    allDayBar: true,

    interactions: {
      click: true,
      dblClick: true,
      hover: true,
      contextMenu: true,
      focus: true,
    },

    typeStyleInjection: true,
    events: true,

    overlapFocus: true,

    // time-grid layout options
    timeGridLayout: "overlap", // "overlap" | "columns"
  };

  // --------------------------- Factory ---------------------------
  function create(options) {
    options = options || {};

    var container = resolveElement(options.selector);
    if (!container) throw new Error("Zarvan: container not found.");

    var features = mergeDeep(DEFAULT_FEATURES, options.features || {});
    var TYPE_LABELS = options.typeLabels || {};

    function isViewEnabled(v) {
      var m = features.views || {};
      return m[v] !== false;
    }

    function firstEnabledView() {
      var order = ["month", "week", "day", "year", "list"];
      for (var i = 0; i < order.length; i++)
        if (isViewEnabled(order[i])) return order[i];
      return "month";
    }

    // Instance id
    var instanceId = "zc" + Math.random().toString(36).slice(2, 9);
    container.dataset.zcId = instanceId;
    container.classList.add("zc-calendar");

    // --------------------------- State ---------------------------
    var view = options.view || "month";
    if (!isViewEnabled(view)) view = firstEnabledView();

    var currentJalali = jalaali.toJalaali(new Date());
    var currentWeekDate = new Date();
    var currentDayDate = new Date();

    var baseEvents = normalizeEvents(options.events || []);
    var eventsByDay = {};
    var nowTick = null;

    var sidebarEl = null;
    var miniWrapEl = null;
    var miniJ = { jy: currentJalali.jy, jm: currentJalali.jm };

    var highlights = Array.isArray(options.highlights)
      ? options.highlights
      : [];
    var filterState = { type: "__all__", q: "" };

    var viewDdEl = null;

    var _docClickFiltersBound = null;
    var _docClickHeaderBound = null;

    var _lastRange = null;
    var _lastActiveDate = null;

    var MAX_EVENTS_PER_DAY = 2;
    var MAX_MONTH_ALLDAY = 1;
    var MAX_MONTH_TIMED = 2;

    // --------------------------- Event Bus ---------------------------
    var _listeners = Object.create(null);
    var _handlers = options.handlers || {};

    function buildCtx(extra) {
      return Object.assign(
        {
          instanceId: instanceId,
          container: container,
          view: view,
          filterState: filterState,
          currentJalali: currentJalali,
          currentWeekDate: currentWeekDate,
          currentDayDate: currentDayDate,
        },
        extra || {}
      );
    }

    function on(name, fn) {
      if (!name || typeof fn !== "function") return;
      (_listeners[name] = _listeners[name] || []).push(fn);
      return function unsubscribe() {
        off(name, fn);
      };
    }

    function off(name, fn) {
      var arr = _listeners[name];
      if (!arr || !arr.length) return;
      var i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    }

    function emit(name, payload, extraCtx, meta) {
      if (!features.events) return;

      var ctx = buildCtx(extraCtx);

      function callOne(fn) {
        if (typeof fn !== "function") return;

        // new signature support: (payload, meta, ctx)
        if (meta !== undefined) {
          if (fn.length >= 3) return fn(payload, meta, ctx);
          if (fn.length === 2) return fn(payload, ctx);
          if (fn.length === 1) return payload == null ? fn(ctx) : fn(payload);
          return fn(payload, meta, ctx);
        }

        // old signature: (payload, ctx) + lifecycle (ctx)
        if (fn.length >= 2) return fn(payload, ctx);
        if (fn.length === 1) return payload == null ? fn(ctx) : fn(payload);
        return fn(payload, ctx);
      }

      // option handlers
      var hs = _handlers && _handlers[name];
      if (hs) {
        try {
          if (Array.isArray(hs)) hs.forEach(callOne);
          else callOne(hs);
        } catch (e) {
          console.error("Zarvan handler error:", name, e);
        }
      }

      // runtime listeners
      var arr = _listeners[name];
      if (!arr || !arr.length) return;

      arr.slice().forEach(function (fn) {
        try {
          callOne(fn);
        } catch (e) {
          console.error("Zarvan listener error:", name, e);
        }
      });
    }

    function zWarn(message, extra) {
      emit("onWarn", { message: message, extra: extra });
    }
    function zError(err) {
      emit("onError", err);
    }

    // --------------------------- Style helpers ---------------------------
    function ensureStyleTag(attrName) {
      var sel = "style[" + attrName + '="' + instanceId + '"]';
      var tag = document.querySelector(sel);
      if (!tag) {
        tag = document.createElement("style");
        tag.setAttribute(attrName, instanceId);
        document.head.appendChild(tag);
      }
      return tag;
    }

    // ---- Type style injection
    var userTypeStyles = options.typeStyles || {};
    var typeStyleTag = null;

    function hashStr(str) {
      str = String(str || "");
      var h = 2166136261;
      for (var i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    function autoStyleForType(t) {
      var h = hashStr(t);
      var hue = h % 360;
      return { bg: "hsl(" + hue + ", 70%, 45%)", color: "#fff" };
    }

    function getAllTypes() {
      var set = {};
      (baseEvents || []).forEach(function (ev) {
        var t = String(ev.type || "").trim();
        if (t) set[t] = true;
      });
      return Object.keys(set);
    }

    function getStyleForType(t) {
      var u = userTypeStyles && userTypeStyles[t];
      if (u && (u.bg || u.color)) return { bg: u.bg, color: u.color };
      return autoStyleForType(t);
    }

    function renderTypeStyles() {
      if (!features.typeStyleInjection) {
        if (typeStyleTag && typeStyleTag.parentNode)
          typeStyleTag.parentNode.removeChild(typeStyleTag);
        typeStyleTag = null;
        return;
      }

      var css = "";
      getAllTypes().forEach(function (t) {
        var st = getStyleForType(t);
        var bg = st.bg || autoStyleForType(t).bg;
        var color = st.color != null ? st.color : "#fff";

        css +=
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .event-item.' +
          t +
          "{ background:" +
          bg +
          "; color:" +
          color +
          "; }" +
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .zc-month-timed.' +
          t +
          " .zc-month-dot{ background:" +
          bg +
          "; }" +
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .zc-year-dot.' +
          t +
          "{ background:" +
          bg +
          "; }" +
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .zc-list-item.' +
          t +
          " .zc-list-dot{ background:" +
          bg +
          "; }";
      });

      typeStyleTag = ensureStyleTag("data-zc-type-style");
      typeStyleTag.textContent = css;
    }

    // ---- Overlap focus styles
    var ovStyleTag = null;

    function overlapFocusEnabled() {
      return features.overlapFocus !== false;
    }

    function renderOverlapFocusStyles() {
      var css =
        '\n.zc-calendar[data-zc-id="' +
        instanceId +
        '"] .event-item.zc-ov-conflict{' +
        "\n  border:1px solid #000 !important;" +
        "\n  box-sizing:border-box;" +
        "\n}";

      if (overlapFocusEnabled()) {
        var ms = 280,
          dms = 60,
          easing = "cubic-bezier(.2,.8,.2,1)";
        var dim = 0.07;

        css +=
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .week-day-cell .event-item,' +
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .day-main-col .event-item{' +
          "\n  transition:" +
          "\n    opacity " +
          ms +
          "ms " +
          easing +
          " " +
          dms +
          "ms," +
          "\n    box-shadow " +
          ms +
          "ms " +
          easing +
          " " +
          dms +
          "ms," +
          "\n    filter " +
          ms +
          "ms " +
          easing +
          " " +
          dms +
          "ms;" +
          "\n  will-change: opacity;" +
          "\n}" +
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .event-item.zc-ov-dim{ opacity:' +
          dim +
          "; }" +
          '\n.zc-calendar[data-zc-id="' +
          instanceId +
          '"] .event-item.zc-ov-focus{' +
          "\n  opacity:1; box-shadow:0 6px 18px rgba(0,0,0,.18);" +
          "\n}";
      }

      ovStyleTag = ensureStyleTag("data-zc-ov-style");
      ovStyleTag.textContent = css;
    }

    // --------------------------- Date / Range logic ---------------------------
    function formatTitle(jy, jm) {
      return MONTH_NAMES[jm - 1] + " " + jy;
    }

    function toGDateFromJ(jy, jm, jd) {
      var g = jalaali.toGregorian(jy, jm, jd);
      return new Date(g.gy, g.gm - 1, g.gd);
    }

    function getWeekStart(date) {
      var temp = new Date(date);
      var dayOfWeek = (temp.getDay() + 1) % 7;
      var weekStart = new Date(temp);
      weekStart.setDate(temp.getDate() - dayOfWeek);
      return weekStart;
    }

    function getVisibleRangeG() {
      var startG, endG;

      if (view === "month" || view === "list") {
        var gFirst = jalaali.toGregorian(currentJalali.jy, currentJalali.jm, 1);
        startG = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd);

        var len = jalaali.jalaaliMonthLength(
          currentJalali.jy,
          currentJalali.jm
        );
        var gLast = jalaali.toGregorian(
          currentJalali.jy,
          currentJalali.jm,
          len
        );
        endG = new Date(gLast.gy, gLast.gm - 1, gLast.gd);
      } else if (view === "year") {
        var gY1 = jalaali.toGregorian(currentJalali.jy, 1, 1);
        startG = new Date(gY1.gy, gY1.gm - 1, gY1.gd);

        var lastDay = jalaali.jalaaliMonthLength(currentJalali.jy, 12);
        var gY2 = jalaali.toGregorian(currentJalali.jy, 12, lastDay);
        endG = new Date(gY2.gy, gY2.gm - 1, gY2.gd);
      } else if (view === "week") {
        var ws = getWeekStart(currentWeekDate);
        startG = new Date(ws);
        endG = new Date(ws);
        endG.setDate(ws.getDate() + 6);
      } else if (view === "day") {
        startG = new Date(currentDayDate);
        endG = new Date(currentDayDate);
      } else {
        startG = new Date();
        endG = new Date();
      }

      return { startG: startG, endG: endG };
    }

    function getActiveGDate() {
      if (view === "day") return new Date(currentDayDate);
      if (view === "week") return getWeekStart(currentWeekDate);

      if (view === "month" || view === "list") {
        var gFirst = jalaali.toGregorian(currentJalali.jy, currentJalali.jm, 1);
        return new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd);
      }

      if (view === "year") {
        var gY = jalaali.toGregorian(currentJalali.jy, 1, 1);
        return new Date(gY.gy, gY.gm - 1, gY.gd);
      }

      return new Date();
    }

    function emitDateChangeIfNeeded(source, prevActiveG) {
      var nextActiveG = getActiveGDate();
      var a = prevActiveG ? gDateStart(prevActiveG).getTime() : null;
      var b = gDateStart(nextActiveG).getTime();

      if (_lastActiveDate == null) _lastActiveDate = a;

      if (a != null && b !== a) {
        emit("onDateChange", {
          from: new Date(a),
          to: new Date(b),
          source: source || "internal",
        });
      }
      _lastActiveDate = b;
    }

    function emitRangeChangeIfNeeded() {
      var rg = getVisibleRangeG();
      if (!rg || !rg.startG || !rg.endG) return;

      var start = gDateStart(rg.startG).getTime();
      var end = gDateStart(rg.endG).getTime();

      if (
        !_lastRange ||
        _lastRange.start !== start ||
        _lastRange.end !== end ||
        _lastRange.view !== view
      ) {
        emit("onRangeChange", {
          startG: new Date(start),
          endG: new Date(end),
          view: view,
        });
        _lastRange = { start: start, end: end, view: view };
      }
    }

    // --------------------------- Events / Data ---------------------------
    function normalizeEvents(list) {
      return (list || []).map(function (ev) {
        ev = Object.assign({}, ev);
        if (!ev.end) ev.end = ev.start;
        return ev;
      });
    }

    function isMultiDay(ev) {
      var s = dayPart(ev.start);
      var e = dayPart(ev.end || ev.start);
      return s && e && s !== e;
    }

    function isAllDayEvent(ev) {
      if (ev.allDay) return true;
      if (ev.start && ev.start.indexOf("T") === -1) return true;
      if (isMultiDay(ev) && !ev.forceTimed) return true;
      return false;
    }

    function makeDayKey(j) {
      return j.jy + "-" + j.jm + "-" + j.jd;
    }

    function getTimeParts(ev) {
      var s = (String(ev.start).split("T")[1] || "00:00").slice(0, 5);
      var e = (String(ev.end || ev.start).split("T")[1] || "00:00").slice(0, 5);
      return { s: s, e: e };
    }

    function jdtSortKey(str) {
      var p = parseJDateTime(str);
      return (
        p.jy * 100000000 + p.jm * 1000000 + p.jd * 10000 + p.hh * 100 + p.mm
      );
    }

    function filterEventsForCurrentView(events) {
      var t = filterState.type;
      var q = norm(filterState.q);

      return (events || []).filter(function (ev) {
        if (t && t !== "__all__") {
          if ((ev.type || "") !== t) return false;
        }
        if (q) {
          if (!norm(ev.title).includes(q)) return false;
        }
        return true;
      });
    }

    function organizeEvents(events) {
      var map = {};
      (events || []).forEach(function (ev) {
        var sD = dayPart(ev.start).split("-").map(Number);
        var eD = dayPart(ev.end || ev.start)
          .split("-")
          .map(Number);

        var startG = jalaali.toGregorian(sD[0], sD[1], sD[2]);
        var endG = jalaali.toGregorian(eD[0], eD[1], eD[2]);

        var cur = new Date(startG.gy, startG.gm - 1, startG.gd);
        var end = new Date(endG.gy, endG.gm - 1, endG.gd);

        while (cur <= end) {
          var j = jalaali.toJalaali(
            cur.getFullYear(),
            cur.getMonth() + 1,
            cur.getDate()
          );
          var key = makeDayKey(j);
          if (!map[key]) map[key] = [];
          map[key].push(ev);
          cur.setDate(cur.getDate() + 1);
        }
      });
      return map;
    }

    function getTimedIntervalForDay(ev, dayJ) {
      var s = parseJDateTime(ev.start);
      var e = parseJDateTime(ev.end || ev.start);

      var startMin = s.hh * 60 + s.mm;
      var endMin = e.hh * 60 + e.mm;

      var sD = { jy: s.jy, jm: s.jm, jd: s.jd };
      var eD = { jy: e.jy, jm: e.jm, jd: e.jd };

      if (cmpJ(sD, dayJ) < 0) startMin = 0;
      if (cmpJ(eD, dayJ) > 0) endMin = 1440;

      if (endMin <= startMin) endMin = startMin + 15;

      startMin = clamp(startMin, 0, 1440);
      endMin = clamp(endMin, 0, 1440);

      return { startMin: startMin, endMin: endMin };
    }

    /**
     * repeat schema:
     * ev.repeat = { freq:"daily|weekly|monthly", interval:1, until:"1404-12-29", count:50, byWeekday:[0..6] }
     */
    function expandRecurringForRange(events, rangeStartG, rangeEndG) {
      var out = [];

      (events || []).forEach(function (ev) {
        if (!ev.repeat) {
          out.push(ev);
          return;
        }

        var r = ev.repeat || {};
        var freq = r.freq || "daily";
        var interval = Math.max(1, Number(r.interval || 1));

        var s = parseJDateTime(ev.start);
        var e = parseJDateTime(ev.end || ev.start);

        var gStart = toGDateFromJ(s.jy, s.jm, s.jd);
        gStart.setHours(s.hh || 0, s.mm || 0, 0, 0);

        var gEnd = toGDateFromJ(e.jy, e.jm, e.jd);
        gEnd.setHours(e.hh || 0, e.mm || 0, 0, 0);

        var isAllDay = isAllDayEvent(ev);
        var durMs = isAllDay ? 0 : Math.max(15 * 60 * 1000, gEnd - gStart);

        var untilG = null;
        if (r.until) {
          var u = parseJDateTime(r.until);
          untilG = gDateStart(toGDateFromJ(u.jy, u.jm, u.jd));
        }

        var maxCount = r.count ? Number(r.count) : null;

        var cur = gDateStart(rangeStartG);
        var end = gDateStart(rangeEndG);
        var produced = 0;

        function inRangeDay(gDay) {
          var x = gDateStart(gDay).getTime();
          return (
            x >= gDateStart(rangeStartG).getTime() &&
            x <= gDateStart(rangeEndG).getTime()
          );
        }

        while (cur <= end) {
          if (gDateStart(cur) < gDateStart(gStart)) {
            cur.setDate(cur.getDate() + 1);
            continue;
          }
          if (untilG && gDateStart(cur) > untilG) break;

          var ok = false;

          if (freq === "daily") {
            var diffDays = Math.floor(
              (gDateStart(cur) - gDateStart(gStart)) / (24 * 60 * 60 * 1000)
            );
            ok = diffDays % interval === 0;
          } else if (freq === "weekly") {
            var dayIndex = (cur.getDay() + 1) % 7;
            var by = Array.isArray(r.byWeekday) ? r.byWeekday : null;
            if (!by) by = [(gStart.getDay() + 1) % 7];
            if (by.indexOf(dayIndex) !== -1) {
              var diffDaysW = Math.floor(
                (gDateStart(cur) - gDateStart(gStart)) / (24 * 60 * 60 * 1000)
              );
              var diffWeeks = Math.floor(diffDaysW / 7);
              ok = diffWeeks % interval === 0;
            }
          } else if (freq === "monthly") {
            var jCur = jalaali.toJalaali(
              cur.getFullYear(),
              cur.getMonth() + 1,
              cur.getDate()
            );
            if (jCur.jd === s.jd) {
              var monthsA = s.jy * 12 + (s.jm - 1);
              var monthsB = jCur.jy * 12 + (jCur.jm - 1);
              ok = (monthsB - monthsA) % interval === 0;
            }
          }

          if (ok && inRangeDay(cur)) {
            var jOcc = jalaali.toJalaali(
              cur.getFullYear(),
              cur.getMonth() + 1,
              cur.getDate()
            );

            var occStartStr = formatJDT(
              jOcc.jy,
              jOcc.jm,
              jOcc.jd,
              s.hh,
              s.mm,
              isAllDay
            );
            var occEndStr;

            if (isAllDay) {
              occEndStr = formatJDT(jOcc.jy, jOcc.jm, jOcc.jd, 0, 0, true);
            } else {
              var gOccStart = new Date(cur);
              gOccStart.setHours(s.hh, s.mm, 0, 0);
              var gOccEnd = new Date(gOccStart.getTime() + durMs);

              var jEndOcc = jalaali.toJalaali(
                gOccEnd.getFullYear(),
                gOccEnd.getMonth() + 1,
                gOccEnd.getDate()
              );
              occEndStr = formatJDT(
                jEndOcc.jy,
                jEndOcc.jm,
                jEndOcc.jd,
                gOccEnd.getHours(),
                gOccEnd.getMinutes(),
                false
              );
            }

            out.push(
              Object.assign({}, ev, {
                start: occStartStr,
                end: occEndStr,
                allDay: isAllDay,
                _occurrence: true,
              })
            );

            produced++;
            if (maxCount && produced >= maxCount) break;
          }

          cur.setDate(cur.getDate() + 1);
        }
      });

      return out;
    }

    function refreshEvents() {
      var rg = getVisibleRangeG();
      var expanded = expandRecurringForRange(baseEvents, rg.startG, rg.endG);
      var filtered = filterEventsForCurrentView(expanded);

      eventsByDay = organizeEvents(filtered);
    }

    // --------------------------- Highlight system ---------------------------
    function parseJDateOnly(jStr) {
      var p = String(jStr || "")
        .split("T")[0]
        .split("-")
        .map(Number);
      return { jy: p[0] || 0, jm: p[1] || 0, jd: p[2] || 0 };
    }

    function jToNum(j) {
      return (j.jy || 0) * 10000 + (j.jm || 0) * 100 + (j.jd || 0);
    }

    function dayMatchesRule(rule, gdate, jdateObj, viewName) {
      if (!rule) return false;

      var views = rule.views;
      if (Array.isArray(views) && views.length) {
        if (views.indexOf(viewName) === -1) return false;
      }

      var when = rule.when || rule;

      var w = when.weekday || when.weekdays;
      if (Array.isArray(w) && w.length) {
        var wd = weekdayIndexFromGDate(gdate);
        if (w.indexOf(wd) === -1) return false;
      }

      var jDates = when.jDates || when.dates;
      if (Array.isArray(jDates) && jDates.length) {
        var key =
          jdateObj.jy + "-" + pad2(jdateObj.jm) + "-" + pad2(jdateObj.jd);
        var ok = jDates.some(function (x) {
          var jj = parseJDateOnly(x);
          var k2 = jj.jy + "-" + pad2(jj.jm) + "-" + pad2(jj.jd);
          return k2 === key;
        });
        if (!ok) return false;
      }

      var r = when.jRange || when.range;
      if (r && (r.start || r.end)) {
        var a = r.start ? jToNum(parseJDateOnly(r.start)) : -Infinity;
        var b = r.end ? jToNum(parseJDateOnly(r.end)) : Infinity;
        var x = jToNum(jdateObj);
        if (x < a || x > b) return false;
      }

      return true;
    }

    function getDayHighlightStyle(gdate, jdateObj, viewName) {
      if (!features.dayHighlights) return null;

      var style = null;
      (highlights || []).forEach(function (rule) {
        if (!dayMatchesRule(rule, gdate, jdateObj, viewName)) return;
        if (rule.day || rule.bg || rule.className) {
          var d = rule.day || {};
          style = {
            bg: d.bg || rule.bg || null,
            className: d.className || rule.className || null,
          };
        }
      });
      return style;
    }

    function applyDayHighlight(elm, style) {
      if (!elm || !style) return;
      elm.classList.add("zc-has-day-hl");
      if (style.bg) elm.style.setProperty("--zc-hl-bg", style.bg);
      if (style.className) elm.classList.add(style.className);
    }

    function addTimeHighlightsToColumn(colElm, gdate, jdateObj, viewName) {
      if (!features.timeHighlights) return;

      (highlights || []).forEach(function (rule) {
        if (!dayMatchesRule(rule, gdate, jdateObj, viewName)) return;

        var t = rule.time;
        if (!t && (rule.timeStart || rule.timeEnd))
          t = { start: rule.timeStart, end: rule.timeEnd, bg: rule.bg };
        if (!t || !t.start || !t.end) return;

        var startMin = clamp(toMin(t.start), 0, 1440);
        var endMin = clamp(toMin(t.end), 0, 1440);
        if (endMin <= startMin) return;

        var block = createEl("div", "zc-time-highlight " + (t.className || ""));
        block.style.top = startMin + "px";
        block.style.height = endMin - startMin + "px";
        block.style.background = t.bg || "rgba(26,115,232,0.08)";
        colElm.appendChild(block);
      });
    }

    // --------------------------- UI helpers ---------------------------   

    function fitMonthEvents(eventContainer, nodes, makeMoreBtn) {
      eventContainer.innerHTML = "";

      var shown = [];
      for (var i = 0; i < nodes.length; i++) {
        eventContainer.appendChild(nodes[i].node);
        shown.push(nodes[i]);

        if (eventContainer.scrollHeight > eventContainer.clientHeight) {
          eventContainer.removeChild(nodes[i].node);
          shown.pop();
          break;
        }
      }

      var hidden = nodes.length - shown.length;
      if (hidden <= 0) {
        shown.forEach(function (x) {
          x.bind && x.bind();
        });
        return;
      }

      var moreBtn = makeMoreBtn(hidden);
      eventContainer.appendChild(moreBtn);

      while (
        eventContainer.scrollHeight > eventContainer.clientHeight &&
        shown.length > 0
      ) {
        var last = shown.pop();
        if (last.node.parentNode === eventContainer)
          eventContainer.removeChild(last.node);
        hidden++;
        moreBtn.innerText = "+" + hidden + " رویداد دیگر";
      }

      shown.forEach(function (x) {
        x.bind && x.bind();
      });
    }

    function typeToFa(t) {
      t = (t || "").trim();
      if (!t) return "بدون نوع";
      return TYPE_LABELS[t] || t;
    }

    function viewToFa(v) {
      return v === "month"
        ? "ماه"
        : v === "week"
        ? "هفته"
        : v === "day"
        ? "روز"
        : v === "list"
        ? "لیست"
        : "سال";
    }

    function syncViewDropdown() {
      if (!viewDdEl) return;
      var v = qs(".zc-view-dd-value", viewDdEl);
      if (v) v.innerText = viewToFa(view);
    }

    function closeViewDropdown(reason) {
      if (!viewDdEl) return;
      var wasOpen = viewDdEl.classList.contains("open");
      if (!wasOpen) return;
      viewDdEl.classList.remove("open");
      emit("onViewDropdownClose", { reason: reason || "outside" });
    }

    function createViewDropdown() {
      var dd = createEl("div", "zc-view-dd");
      var sel = createEl("div", "zc-view-dd-selected");
      sel.tabIndex = 0;

      sel.appendChild(createEl("div", "zc-view-dd-label", "نمایش"));
      sel.appendChild(createEl("div", "zc-view-dd-value", viewToFa(view)));
      sel.appendChild(createEl("div", "zc-view-dd-caret", "▾"));

      var menu = createEl("div", "zc-view-dd-menu");

      function buildMenu() {
        menu.innerHTML = "";
        [
          { key: "day", label: "روز" },
          { key: "week", label: "هفته" },
          { key: "month", label: "ماه" },
          { key: "year", label: "سال" },
          { key: "list", label: "لیست" },
        ]
          .filter(function (it) {
            return isViewEnabled(it.key);
          })
          .forEach(function (it) {
            var item = createEl("div", "zc-view-dd-item", it.label);
            item.dataset.view = it.key;
            if (it.key === view) item.classList.add("is-active");
            menu.appendChild(item);
          });
      }

      sel.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        e.stopPropagation();
        buildMenu();

        var wasOpen = dd.classList.contains("open");
        dd.classList.toggle("open");
        if (!wasOpen) emit("onViewDropdownOpen", null);
        else emit("onViewDropdownClose", { reason: "toggle" });

        sel.focus();
      });

      menu.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var item = e.target.closest(".zc-view-dd-item");
        if (!item) return;

        dd.classList.remove("open");
        emit("onViewDropdownClose", { reason: "select" });
        setView(item.dataset.view, "dropdown");
      });

      dd.appendChild(sel);
      dd.appendChild(menu);

      if (!_docClickHeaderBound) {
        _docClickHeaderBound = function (e) {
          if (dd.contains(e.target)) return;
          closeViewDropdown("outside");
        };
        document.addEventListener("pointerdown", _docClickHeaderBound, true);
      }

      return dd;
    }

    function stopNowTick() {
      if (nowTick) {
        clearInterval(nowTick);
        nowTick = null;
      }
    }

    // --------------------------- Sidebar Filters ---------------------------
    var _acTitles = [];

    function updateAutocompleteTitles(eventsInRange) {
      var set = {};
      (eventsInRange || []).forEach(function (ev) {
        var title = String(ev.title || "").trim();
        if (title) set[title] = true;
      });
      _acTitles = Object.keys(set).sort();
    }

    function getAvailableTypes() {
      var set = {};
      (baseEvents || []).forEach(function (ev) {
        var t = (ev.type || "").trim();
        if (t) set[t] = true;
      });
      return Object.keys(set).sort();
    }

    function syncFilterUI(filtersWrap) {
      var ddValue = qs(".zc-dd-value", filtersWrap);
      if (ddValue)
        ddValue.innerText =
          filterState.type === "__all__" ? "همه" : typeToFa(filterState.type);

      var input = qs(".zc-search-input", filtersWrap);
      if (input && input.value !== filterState.q)
        input.value = filterState.q || "";
    }

    function renderSidebarFilters() {
      if (!features.sidebar || !features.filters || !miniWrapEl) return;

      var hasAny =
        !!features.typeFilter || !!features.search || !!features.exportExcel;
      if (!hasAny) {
        var ex = qs(".zc-filters", miniWrapEl);
        if (ex && ex.parentNode) ex.parentNode.removeChild(ex);
        filterState.type = "__all__";
        filterState.q = "";
        return;
      }

      var existing = qs(".zc-filters", miniWrapEl);
      if (existing) {
        syncFilterUI(existing);
        return;
      }

      // cleanup old outside listeners
      if (_docClickFiltersBound) {
        document.removeEventListener(
          "pointerdown",
          _docClickFiltersBound,
          true
        );
        _docClickFiltersBound = null;
      }

      var wrap = createEl("div", "zc-filters");
      miniWrapEl.appendChild(wrap);

      var closeDropdown = function () {};
      var showAC = function () {};
      var hideAC = function () {};

      // ---- Type dropdown
      if (features.typeFilter) {
        var dd = createEl("div", "zc-dd");
        var ddSel = createEl("div", "zc-dd-selected");
        ddSel.tabIndex = 0;

        ddSel.appendChild(createEl("div", "zc-dd-label", "نوع"));
        ddSel.appendChild(createEl("div", "zc-dd-value", ""));
        ddSel.appendChild(createEl("div", "zc-dd-caret", "▾"));

        var menu = createEl("div", "zc-dd-menu");

        function buildMenu() {
          menu.innerHTML = "";
          var allItem = createEl("div", "zc-dd-item", "همه");
          allItem.dataset.value = "__all__";
          menu.appendChild(allItem);

          getAvailableTypes().forEach(function (t) {
            var it = createEl("div", "zc-dd-item", typeToFa(t));
            it.dataset.value = t;
            menu.appendChild(it);
          });
        }

        closeDropdown = function () {
          dd.classList.remove("open");
        };

        ddSel.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          e.stopPropagation();
          buildMenu();
          dd.classList.toggle("open");
          ddSel.focus();
        });

        menu.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var item = e.target.closest(".zc-dd-item");
          if (!item) return;

          var from = filterState.type;
          var to = item.dataset.value || "__all__";
          filterState.type = to;

          emit("onFiltersChange", {
            type: filterState.type,
            q: filterState.q,
            from: from,
            to: to,
            source: "type",
          });

          closeDropdown();
          renderBody();
        });

        dd.appendChild(ddSel);
        dd.appendChild(menu);
        wrap.appendChild(dd);
      } else {
        filterState.type = "__all__";
      }

      // ---- Search + AC + Export
      if (features.search || features.exportExcel) {
        var searchWrap = createEl("div", "zc-search");

        if (features.search) {
          searchWrap.appendChild(createEl("div", "zc-search-label", "جستجو"));
          var searchBox = createEl("div", "zc-search-box");

          var input = createEl("input", "zc-search-input");
          input.type = "text";
          input.placeholder = "عنوان رویداد…";
          input.autocomplete = "off";
          searchBox.appendChild(input);

          var ac = null;

          if (features.autocomplete) {
            ac = createEl("div", "zc-ac zc-hidden");
            searchBox.appendChild(ac);

            showAC = function (list) {
              if (!ac) return;
              ac.innerHTML = "";
              if (!list.length) return ac.classList.add("zc-hidden");

              list.slice(0, 30).forEach(function (txt) {
                var it = createEl("div", "zc-ac-item");
                it.innerText = txt;
                it.dataset.value = txt;
                ac.appendChild(it);
              });
              ac.classList.remove("zc-hidden");
            };

            hideAC = function () {
              if (ac) ac.classList.add("zc-hidden");
            };

            ac.addEventListener("pointerdown", function (e) {
              e.preventDefault();
              e.stopPropagation();
              var item = e.target.closest(".zc-ac-item");
              if (!item) return;

              input.value = item.dataset.value || "";
              filterState.q = input.value;

              emit("onAutocompleteSelect", { value: input.value });
              emit("onFiltersChange", {
                type: filterState.type,
                q: filterState.q,
                source: "autocomplete",
              });

              hideAC();
              renderBody();
              input.focus();
            });

            input.addEventListener("focus", function () {
              var q = norm(input.value);
              if (!q) return;
              var matches = _acTitles.filter(function (t) {
                return norm(t).includes(q);
              });
              showAC(matches);
            });
          }

          var deb = null;
          input.addEventListener("input", function () {
            var v = input.value || "";
            filterState.q = v;

            if (features.autocomplete) {
              var q = norm(v);
              if (!q) hideAC();
              else {
                var matches = _acTitles.filter(function (t) {
                  return norm(t).includes(q);
                });
                showAC(matches);
              }
            }

            if (deb) clearTimeout(deb);
            deb = setTimeout(function () {
              emit("onFiltersChange", {
                type: filterState.type,
                q: filterState.q,
                source: "search",
              });
              renderBody();
            }, 150);
          });

          searchWrap.addEventListener("pointerdown", function (e) {
            e.stopPropagation();
          });

          searchWrap.appendChild(searchBox);
        } else {
          filterState.q = "";
        }

        if (features.exportExcel) {
          var exportBtn = createEl("button", "zc-export-btn", "خروجی اکسل");
          exportBtn.type = "button";
          exportBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            exportCurrentViewToExcel();
          });
          searchWrap.appendChild(exportBtn);
        }

        wrap.appendChild(searchWrap);
      }

      // outside close
      _docClickFiltersBound = function (e) {
        if (wrap.contains(e.target)) return;
        closeDropdown();
        hideAC();
      };
      document.addEventListener("pointerdown", _docClickFiltersBound, true);

      syncFilterUI(wrap);
    }

    // --------------------------- Excel Export ---------------------------
    function toFaDigits(input) {
      var s = String(input == null ? "" : input);
      var map = {
        0: "۰",
        1: "۱",
        2: "۲",
        3: "۳",
        4: "۴",
        5: "۵",
        6: "۶",
        7: "۷",
        8: "۸",
        9: "۹",
      };
      return s.replace(/[0-9]/g, function (d) {
        return map[d] || d;
      });
    }

    function exportCurrentViewToExcel() {
      if (!features.exportExcel) {
        zWarn("خروجی اکسل غیرفعال است.", { view: view });
        return;
      }

      try {
        if (typeof XLSX === "undefined") {
          var err = new Error("XLSX not loaded");
          emit("onExportError", err);
          zWarn("کتابخانه xlsx لود نشده است.", { view: view });
          alert("کتابخانه xlsx لود نشده است.");
          return;
        }

        var rg = getVisibleRangeG();
        var expanded = expandRecurringForRange(baseEvents, rg.startG, rg.endG);
        var filtered = filterEventsForCurrentView(expanded);

        filtered.sort(function (a, b) {
          return (
            jdtSortKey(a.start) - jdtSortKey(b.start) ||
            norm(a.title).localeCompare(norm(b.title))
          );
        });

        var titleNode = qs(".zc-title", container);
        var titleText =
          titleNode && titleNode.textContent
            ? titleNode.textContent.trim()
            : "";

        var fileName =
          ("رویدادها - " + viewToFa(view) + " - " + titleText)
            .replace(/[\\/:*?"<>|]/g, " ")
            .trim() + ".xlsx";

        emit("onExportStart", { view: view, fileName: fileName });

        var headers = [
          "ردیف",
          "عنوان",
          "نوع",
          "تاریخ شروع",
          "زمان شروع",
          "تاریخ پایان",
          "زمان پایان",
          "تمام‌روز",
          "نمایش",
        ];
        var aoa = [headers];

        filtered.forEach(function (ev, idx) {
          var sParts = String(ev.start || "").split("T");
          var eParts = String(ev.end || ev.start || "").split("T");

          var sDate = toFaDigits(sParts[0] || "");
          var eDate = toFaDigits(eParts[0] || "");

          var sTime = toFaDigits((sParts[1] || "").slice(0, 5));
          var eTime = toFaDigits((eParts[1] || "").slice(0, 5));

          var allDay = isAllDayEvent(ev);

          aoa.push([
            toFaDigits(idx + 1),
            String(ev.title || ""),
            typeToFa(ev.type),
            sDate,
            allDay ? "" : sTime,
            eDate,
            allDay ? "" : eTime,
            allDay ? "بله" : "خیر",
            viewToFa(view),
          ]);
        });

        var ws = XLSX.utils.aoa_to_sheet(aoa);
        ws["!cols"] = [
          { wch: 6 },
          { wch: 32 },
          { wch: 14 },
          { wch: 14 },
          { wch: 10 },
          { wch: 14 },
          { wch: 10 },
          { wch: 10 },
          { wch: 8 },
        ];
        ws["!autofilter"] = { ref: "A1:I1" };

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "رویدادها");
        wb.Workbook = wb.Workbook || {};
        wb.Workbook.Views = [{ RTL: true }];

        XLSX.writeFile(wb, fileName);

        emit("onExportEnd", {
          view: view,
          fileName: fileName,
          count: filtered.length,
        });
      } catch (err) {
        emit("onExportError", err);
        zError(err);
        console.error(err);
      }
    }

    // --------------------------- Event item binding ---------------------------
    function bindEventItem(elm, ev, metaBase) {
      if (!elm || !ev) return;

      if (!elm.hasAttribute("tabindex")) elm.tabIndex = 0;
      elm.setAttribute("role", "button");

      function meta(domEvent) {
        return Object.assign(
          {
            view: view,
            gdate: metaBase && metaBase.gdate ? new Date(metaBase.gdate) : null,
            jdate: metaBase && metaBase.jdate ? metaBase.jdate : null,
            isAllDay:
              metaBase && metaBase.isAllDay != null
                ? metaBase.isAllDay
                : isAllDayEvent(ev),
            domEvent: domEvent || null,
          },
          metaBase || {}
        );
      }

      function fire(name, e) {
        emit(name, ev, null, meta(e));
      }

      var inter = features.interactions || {};

      if (inter.click)
        elm.addEventListener("click", function (e) {
          e.stopPropagation();
          fire("onEventClick", e);
        });
      if (inter.dblClick)
        elm.addEventListener("dblclick", function (e) {
          e.stopPropagation();
          fire("onEventDblClick", e);
        });

      if (inter.hover) {
        if ("onpointerenter" in window) {
          elm.addEventListener("pointerenter", function (e) {
            fire("onEventHover", e);
          });
          elm.addEventListener("pointerleave", function (e) {
            fire("onEventLeave", e);
          });
        } else {
          elm.addEventListener("mouseenter", function (e) {
            fire("onEventHover", e);
          });
          elm.addEventListener("mouseleave", function (e) {
            fire("onEventLeave", e);
          });
        }
      }

      if (inter.contextMenu) {
        elm.addEventListener("contextmenu", function (e) {
          e.preventDefault();
          e.stopPropagation();
          fire("onEventContextMenu", e);
        });
      }

      if (inter.focus) {
        elm.addEventListener("focus", function (e) {
          fire("onEventFocus", e);
        });
        elm.addEventListener("blur", function (e) {
          fire("onEventBlur", e);
        });
      }
    }

    // --------------------------- Overlap focus (week/day) ---------------------------
    function getTimeGridLayout() {
      var v = features.timeGridLayout;
      return v === "columns" ? "columns" : "overlap";
    }

    function overlapsMin(a, b) {
      return a.startMin < b.endMin && b.startMin < a.endMin;
    }

    function attachOverlapMeta(laidOut, dayKey) {
      var adj = Object.create(null);

      for (var i = 0; i < laidOut.length; i++) {
        laidOut[i]._ovId = instanceId + ":" + dayKey + ":" + i;
      }

      for (var a = 0; a < laidOut.length; a++) {
        for (var b = a + 1; b < laidOut.length; b++) {
          if (overlapsMin(laidOut[a], laidOut[b])) {
            var ida = laidOut[a]._ovId;
            var idb = laidOut[b]._ovId;
            (adj[ida] = adj[ida] || []).push(idb);
            (adj[idb] = adj[idb] || []).push(ida);
          }
        }
      }

      for (var k = 0; k < laidOut.length; k++) {
        var id = laidOut[k]._ovId;
        laidOut[k]._ovWith = adj[id] || [];
        laidOut[k]._ovHas = laidOut[k]._ovWith.length > 0;
      }

      return laidOut;
    }

    function clearOverlapFocus(scopeEl) {
      if (!scopeEl) return;
      qsa(".event-item.zc-ov-dim, .event-item.zc-ov-focus", scopeEl).forEach(
        function (x) {
          x.classList.remove("zc-ov-dim");
          x.classList.remove("zc-ov-focus");
        }
      );
    }

    function applyOverlapFocus(scopeEl, targetEl) {
      if (!scopeEl || !targetEl) return;
      clearOverlapFocus(scopeEl);

      if (!targetEl.classList.contains("zc-ov-conflict")) return;
      targetEl.classList.add("zc-ov-focus");

      var withStr = targetEl.dataset.zcOvWith || "";
      var ids = withStr ? withStr.split(",").filter(Boolean) : [];
      ids.forEach(function (id) {
        var other = scopeEl.querySelector(
          '.event-item[data-zc-ov-id="' + id + '"]'
        );
        if (other && other !== targetEl) other.classList.add("zc-ov-dim");
      });
    }

    function wireOverlapHover(elm, scopeEl) {
      if (!elm || elm._zcOvWired) return;
      elm._zcOvWired = true;

      function onEnter() {
        applyOverlapFocus(scopeEl, elm);
      }
      function onLeave() {
        clearOverlapFocus(scopeEl);
      }

      if ("onpointerenter" in window) {
        elm.addEventListener("pointerenter", onEnter);
        elm.addEventListener("pointerleave", onLeave);
      } else {
        elm.addEventListener("mouseenter", onEnter);
        elm.addEventListener("mouseleave", onLeave);
      }
      elm.addEventListener("focus", onEnter);
      elm.addEventListener("blur", onLeave);
    }

    function layoutDayEventsOverlap(dayEvents) {
      var STEP = 14;
      var MIN_W = 42;

      var events = dayEvents.slice().sort(function (a, b) {
        return (
          a.startMin - b.startMin ||
          b.endMin - b.startMin - (a.endMin - a.startMin)
        );
      });

      var stackEnds = [];
      var out = [];

      events.forEach(function (it) {
        var si = -1;
        for (var s = 0; s < stackEnds.length; s++) {
          if (stackEnds[s] <= it.startMin) {
            si = s;
            break;
          }
        }
        if (si === -1) {
          si = stackEnds.length;
          stackEnds.push(it.endMin);
        } else stackEnds[si] = it.endMin;

        var offset = si * STEP;
        var width = 100 - offset;
        if (width < MIN_W) width = MIN_W;

        out.push(
          Object.assign({}, it, {
            stackIndex: si,
            offsetPct: offset,
            widthPct: width,
            colCount: 1,
            colSpan: 1,
            colIndex: 0,
          })
        );
      });

      return out;
    }

    function layoutDayEventsColumns(dayEvents) {
      var events = dayEvents.slice().sort(function (a, b) {
        return a.startMin - b.startMin || a.endMin - b.endMin;
      });

      var clusters = [];
      var cluster = [];
      var clusterMaxEnd = -1;

      events.forEach(function (e) {
        if (!cluster.length) {
          cluster = [e];
          clusterMaxEnd = e.endMin;
          return;
        }
        if (e.startMin < clusterMaxEnd) {
          cluster.push(e);
          clusterMaxEnd = Math.max(clusterMaxEnd, e.endMin);
        } else {
          clusters.push(cluster);
          cluster = [e];
          clusterMaxEnd = e.endMin;
        }
      });
      if (cluster.length) clusters.push(cluster);

      var positioned = [];

      clusters.forEach(function (c) {
        var colEnds = [];
        var columns = [];

        c.forEach(function (e) {
          var col = colEnds.findIndex(function (end) {
            return end <= e.startMin;
          });
          if (col === -1) {
            col = colEnds.length;
            colEnds.push(e.endMin);
            columns[col] = [];
          } else {
            colEnds[col] = e.endMin;
          }

          e.colIndex = col;
          e.colCount = 0;
          e.colSpan = 1;

          columns[col].push(e);
          positioned.push(e);
        });

        var colCount = colEnds.length;
        c.forEach(function (e) {
          e.colCount = colCount;
        });

        function overlaps(a, b) {
          return a.startMin < b.endMin && b.startMin < a.endMin;
        }

        c.forEach(function (e) {
          var span = 1;
          for (var nextCol = e.colIndex + 1; nextCol < colCount; nextCol++) {
            var hasConflict = (columns[nextCol] || []).some(function (x) {
              return overlaps(e, x);
            });
            if (hasConflict) break;
            span++;
          }
          e.colSpan = span;
        });
      });

      return positioned;
    }

    // --------------------------- Modal ---------------------------
    var modalOverlay = null;
    var modalTitleEl = null;
    var modalListEl = null;

    function createModal() {
      modalOverlay = createEl("div", "zc-modal-overlay zc-hidden");
      var modal = createEl("div", "zc-modal");

      var header = createEl("div", "zc-modal-header");
      modalTitleEl = createEl("span", "zc-modal-title");

      var closeBtn = createEl("button", "zc-modal-close", "×");
      closeBtn.addEventListener("click", hideModal);

      header.appendChild(modalTitleEl);
      header.appendChild(closeBtn);

      var body = createEl("div", "zc-modal-body");
      modalListEl = createEl("div", "zc-modal-events");
      body.appendChild(modalListEl);

      modal.appendChild(header);
      modal.appendChild(body);
      modalOverlay.appendChild(modal);

      document.body.appendChild(modalOverlay);

      modalOverlay.addEventListener("click", function (e) {
        if (e.target === modalOverlay) hideModal();
      });
    }

    function showEventsModal(events, dateLabel) {
      if (!features.moreEventsModal) return;
      if (!modalOverlay) createModal();

      emit("onModalOpen", { dateLabel: dateLabel, events: events });

      modalTitleEl.innerText = "رویدادهای " + dateLabel;
      modalListEl.innerHTML = "";

      (events || []).forEach(function (ev) {
        var item = createEl("div", "zc-modal-event-item " + (ev.type || ""));
        var title = createEl("div", "zc-modal-event-title");
        title.innerText = ev.title;

        var time = createEl("div", "zc-modal-event-time");
        if (isAllDayEvent(ev)) time.innerText = "تمام‌روز";
        else {
          var t = getTimeParts(ev);
          time.innerText = t.s && t.e ? t.s + " - " + t.e : "";
        }

        item.appendChild(title);
        if (time.innerText) item.appendChild(time);
        modalListEl.appendChild(item);

        bindEventItem(item, ev, { view: view, isAllDay: isAllDayEvent(ev) });
      });

      modalOverlay.classList.remove("zc-hidden");
    }

    function hideModal() {
      if (modalOverlay) modalOverlay.classList.add("zc-hidden");
      emit("onModalClose", null);
    }

    // --------------------------- Header / Layout ---------------------------
    function toggleSidebar() {
      if (!features.sidebar) return;

      var wasOpen = container.classList.contains("zc-sidebar-open");
      var btn = qs(".zc-menu-btn", container);
      if (btn) btn.setAttribute("aria-expanded", String(!wasOpen));

      if (!wasOpen) {
        container.classList.add("zc-sidebar-open");
        container.classList.remove("zc-sidebar-ready");

        var sb = sidebarEl || qs(".zc-sidebar", container);

        var done = false;
        function finish() {
          if (done) return;
          done = true;
          if (container.classList.contains("zc-sidebar-open"))
            container.classList.add("zc-sidebar-ready");
          emit("onSidebarToggle", true);
        }

        if (sb) {
          sb.addEventListener("transitionend", function onEnd(e) {
            if (e.propertyName !== "width") return;
            sb.removeEventListener("transitionend", onEnd);
            finish();
          });
        }
        setTimeout(finish, 300);
        emit("onSidebarToggle", true, { phase: "start" });
      } else {
        container.classList.remove("zc-sidebar-ready");
        container.classList.remove("zc-sidebar-open");
        emit("onSidebarToggle", false);
      }
    }

    function renderHeader() {
      container.innerHTML = "";

      var header = createEl("div", "zc-header");

      // right side
      var right = createEl("div", "zc-right");

      if (features.sidebar && features.menuButton) {
        var menuBtn = createEl("button", "zc-menu-btn");
        menuBtn.setAttribute("aria-label", "منو");
        menuBtn.innerHTML =
          '<span class="zc-menu-icon" aria-hidden="true"><span></span></span>';
        menuBtn.addEventListener("click", toggleSidebar);
        right.appendChild(menuBtn);
      }

      if (features.viewDropdown) {
        viewDdEl = createViewDropdown();
        right.appendChild(viewDdEl);
      } else {
        viewDdEl = null;
      }

      // center
      var center = createEl("div", "zc-center");
      var title = createEl("span", "zc-title");
      title.innerText = formatTitle(currentJalali.jy, currentJalali.jm);
      center.appendChild(title);

      // left
      var left = createEl("div", "zc-left");

      if (features.navigation) {
        var nav = createEl("div", "zc-nav-group");

        if (features.prevNext) {
          var prev = createEl("button", "zc-prev");
          prev.innerHTML = '<img src="../icons/arrow.svg" alt="قبلی">';
          prev.addEventListener("click", goPrev);

          var next = createEl("button", "zc-next");
          next.innerHTML = '<img src="../icons/arrow.svg" alt="بعدی">';
          next.addEventListener("click", goNext);

          nav.appendChild(next);
        }

        if (features.prevNext) nav.appendChild(prev);

        if (features.todayButton) {
          var today = createEl("button", "zc-today");
          today.innerText = "امروز";
          today.addEventListener("click", goToday);
          nav.appendChild(today);
        }

        left.appendChild(nav);
      }

      header.appendChild(right);
      header.appendChild(center);
      header.appendChild(left);

      container.appendChild(header);

      // layout: content -> sidebar + body
      var content = createEl("div", "zc-content");
      var body = createEl("div", "zc-body");

      if (features.sidebar) {
        sidebarEl = createEl("div", "zc-sidebar");
        var sidebarInner = createEl("div", "zc-sidebar-inner");
        miniWrapEl = createEl("div", "");
        sidebarInner.appendChild(miniWrapEl);
        sidebarEl.appendChild(sidebarInner);

        content.appendChild(sidebarEl);
        content.appendChild(body);
      } else {
        sidebarEl = null;
        miniWrapEl = null;
        content.appendChild(body);
      }

      container.appendChild(content);
      syncViewDropdown();
    }

    // --------------------------- Mini Calendar ---------------------------
    function syncMiniToActiveDate() {
      var base =
        view === "month"
          ? toGDateFromJ(currentJalali.jy, currentJalali.jm, 1)
          : new Date(view === "day" ? currentDayDate : currentWeekDate);

      var j = jalaali.toJalaali(
        base.getFullYear(),
        base.getMonth() + 1,
        base.getDate()
      );
      miniJ = { jy: j.jy, jm: j.jm };
      renderMiniCalendar(miniJ.jy, miniJ.jm);
    }

    function renderMiniCalendar(jy, jm) {
      if (!features.sidebar || !features.miniCalendar || !miniWrapEl) return;

      var host = qs(".zc-mini-host", miniWrapEl);
      if (!host) {
        host = createEl("div", "zc-mini-host");
        miniWrapEl.appendChild(host);
      }
      host.innerHTML = "";

      var mini = createEl("div", "zc-mini");
      host.appendChild(mini);

      var h = createEl("div", "zc-mini-header");
      var title = createEl("div", "zc-mini-title", formatTitle(jy, jm));
      var nav = createEl("div", "zc-mini-nav");

      var prevBtn = createEl("button", "");
      prevBtn.innerHTML = "‹";
      prevBtn.addEventListener("click", function () {
        jm--;
        if (jm < 1) {
          jm = 12;
          jy--;
        }
        miniJ = { jy: jy, jm: jm };
        renderMiniCalendar(jy, jm);
      });

      var nextBtn = createEl("button", "");
      nextBtn.innerHTML = "›";
      nextBtn.addEventListener("click", function () {
        jm++;
        if (jm > 12) {
          jm = 1;
          jy++;
        }
        miniJ = { jy: jy, jm: jm };
        renderMiniCalendar(jy, jm);
      });

      nav.appendChild(prevBtn);
      nav.appendChild(nextBtn);

      h.appendChild(title);
      h.appendChild(nav);
      mini.appendChild(h);

      var wd = createEl("div", "zc-mini-weekdays");
      WEEKDAY_NAMES.forEach(function (n) {
        var short =
          n === "یک‌شنبه" || n === "یکشنبه" ? "ی" : n.trim().charAt(0);
        wd.appendChild(createEl("div", "", short));
      });
      mini.appendChild(wd);

      var grid = createEl("div", "zc-mini-grid");
      mini.appendChild(grid);

      var monthLength = jalaali.jalaaliMonthLength(jy, jm);
      var gFirst = jalaali.toGregorian(jy, jm, 1);
      var firstWeekday = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay();
      firstWeekday = (firstWeekday + 1) % 7;

      var todayJ = jalaali.toJalaali(new Date());
      var selectedJ =
        view === "day"
          ? jalaali.toJalaali(currentDayDate)
          : view === "week"
          ? jalaali.toJalaali(currentWeekDate)
          : currentJalali;

      for (var i = 0; i < firstWeekday; i++)
        grid.appendChild(createEl("div", "zc-mini-day is-empty", ""));

      for (var d = 1; d <= monthLength; d++)
        (function (dayNum) {
          var cell = createEl("div", "zc-mini-day", String(dayNum));

          if (jy === todayJ.jy && jm === todayJ.jm && dayNum === todayJ.jd)
            cell.classList.add("is-today");
          if (
            jy === selectedJ.jy &&
            jm === selectedJ.jm &&
            dayNum === selectedJ.jd
          )
            cell.classList.add("is-selected");

          cell.addEventListener("click", function () {
            var prev = getActiveGDate();

            var gdate = toGDateFromJ(jy, jm, dayNum);
            currentDayDate = new Date(gdate);
            currentWeekDate = new Date(gdate);
            currentJalali = { jy: jy, jm: jm, jd: dayNum };

            emit("onDayNumberClick", {
              gdate: gdate,
              jdate: { jy: jy, jm: jm, jd: dayNum },
              view: "mini",
            });
            emitDateChangeIfNeeded("mini", prev);

            renderBody();
          });

          grid.appendChild(cell);
        })(d);

      var total = firstWeekday + monthLength;
      var remain = 42 - total;
      for (var k = 0; k < remain; k++)
        grid.appendChild(createEl("div", "zc-mini-day is-empty", ""));

      renderSidebarFilters();
    }

    // --------------------------- Views ---------------------------
    function renderBody() {
      emit("onRenderStart", { view: view });
      stopNowTick();

      var body = qs(".zc-body", container);
      body.innerHTML = "";

      if (features.sidebar && features.miniCalendar) syncMiniToActiveDate();

      emitRangeChangeIfNeeded();

      // refresh data
      var rg = getVisibleRangeG();
      var expandedForAC = expandRecurringForRange(
        baseEvents,
        rg.startG,
        rg.endG
      );
      updateAutocompleteTitles(expandedForAC);
      refreshEvents();

      // filters UI (if sidebar)
      if (features.sidebar && features.filters) {
        var existingFilters = miniWrapEl && qs(".zc-filters", miniWrapEl);
        if (!existingFilters) renderSidebarFilters();
        else syncFilterUI(existingFilters);
      }

      // route to view
      if (view === "month") {
        renderMonth(currentJalali.jy, currentJalali.jm);
        qs(".zc-title", container).innerText = formatTitle(
          currentJalali.jy,
          currentJalali.jm
        );
        emit("onViewRender", { view: "month" });
        emit("onRenderEnd", { view: "month" });
        return;
      }

      if (view === "week") {
        var weekStart = getWeekStart(currentWeekDate);
        var weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        var jStart = jalaali.toJalaali(
          weekStart.getFullYear(),
          weekStart.getMonth() + 1,
          weekStart.getDate()
        );
        var jEnd = jalaali.toJalaali(
          weekEnd.getFullYear(),
          weekEnd.getMonth() + 1,
          weekEnd.getDate()
        );

        var titleText =
          jStart.jm === jEnd.jm && jStart.jy === jEnd.jy
            ? formatTitle(jStart.jy, jStart.jm)
            : formatTitle(jStart.jy, jStart.jm) +
              " - " +
              formatTitle(jEnd.jy, jEnd.jm);

        qs(".zc-title", container).innerText = titleText;

        renderWeek(jStart.jy, jStart.jm, jStart.jd);
        emit("onViewRender", { view: "week" });
        emit("onRenderEnd", { view: "week" });
        return;
      }

      if (view === "day") {
        renderDay();
        emit("onViewRender", { view: "day" });
        emit("onRenderEnd", { view: "day" });
        return;
      }

      if (view === "year") {
        renderYear(currentJalali.jy);
        qs(".zc-title", container).innerText = String(currentJalali.jy);
        emit("onViewRender", { view: "year" });
        emit("onRenderEnd", { view: "year" });
        return;
      }

      if (view === "list") {
        renderList(currentJalali.jy, currentJalali.jm);
        qs(".zc-title", container).innerText = formatTitle(
          currentJalali.jy,
          currentJalali.jm
        );
        emit("onViewRender", { view: "list" });
        emit("onRenderEnd", { view: "list" });
        return;
      }

      emit("onRenderEnd", { view: view });
    }

    // ---- Month
    function renderMonth(jy, jm) {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var weekHeader = createEl("div", "month-week-header");
      WEEKDAY_NAMES.forEach(function (name) {
        var c = createEl("div", "month-week-header-cell");
        c.innerText = name;
        weekHeader.appendChild(c);
      });
      body.appendChild(weekHeader);

      var grid = createEl("div", "calendar-grid");
      body.appendChild(grid);

      var todayJ = jalaali.toJalaali(new Date());
      var monthLength = jalaali.jalaaliMonthLength(jy, jm);
      var gFirst = jalaali.toGregorian(jy, jm, 1);

      var firstWeekday = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay();
      firstWeekday = (firstWeekday + 1) % 7;

      for (var i = 0; i < firstWeekday; i++) {
        grid.appendChild(createEl("div", "day-cell empty"));
      }

      for (var day = 1; day <= monthLength; day++) {
        (function (dayLocal) {
          var cell = createEl("div", "day-cell");
          cell.dataset.day = dayLocal;

          var gForDay = toGDateFromJ(jy, jm, dayLocal);
          var jObj = { jy: jy, jm: jm, jd: dayLocal };

          applyDayHighlight(cell, getDayHighlightStyle(gForDay, jObj, "month"));

          var dayNumber = createEl("div", "day-number");
          dayNumber.innerText = dayLocal;

          if (jy === todayJ.jy && jm === todayJ.jm && dayLocal === todayJ.jd) {
            dayNumber.classList.add("today");
          }

          dayNumber.style.cursor = "pointer";
          dayNumber.addEventListener("click", function (e) {
            e.stopPropagation();

            var gdate = toGDateFromJ(jy, jm, dayLocal);
            var jdate = { jy: jy, jm: jm, jd: dayLocal };

            emit("onDayNumberClick", {
              gdate: gdate,
              jdate: jdate,
              view: "month",
            });
            goToDayViewByGDate(gdate);
          });

          cell.appendChild(dayNumber);

          var eventContainer = createEl("div", "events");

          var key = jy + "-" + jm + "-" + dayLocal;
          var dayEvents = (eventsByDay[key] || []).slice();

          var allDays = dayEvents.filter(isAllDayEvent);
          var timed = dayEvents.filter(function (ev) {
            return !isAllDayEvent(ev);
          });

          allDays.sort(function (a, b) {
            return norm(a.title).localeCompare(norm(b.title));
          });
          timed.sort(function (a, b) {
            return jdtSortKey(a.start) - jdtSortKey(b.start);
          });

          var nodes = [];

          allDays.forEach(function (ev) {
            var pill = createEl(
              "div",
              "event-item zc-month-allday-pill " + (ev.type || "")
            );
            pill.innerText = ev.title;
            pill.title = ev.title;

            nodes.push({
              node: pill,
              bind: function () {
                bindEventItem(pill, ev, {
                  view: "month",
                  gdate: gForDay,
                  jdate: jObj,
                  isAllDay: true,
                });
              },
            });
          });

          timed.forEach(function (ev) {
            var row = createEl("div", "zc-month-timed " + (ev.type || ""));
            var dot = createEl("span", "zc-month-dot");
            var time = createEl("span", "zc-month-time");
            var title = createEl("span", "zc-month-title");

            var t = getTimeParts(ev);
            time.innerText = (t.s || "").slice(0, 5);
            title.innerText = ev.title || "";

            row.appendChild(dot);
            row.appendChild(time);
            row.appendChild(title);

            row.title =
              (time.innerText ? time.innerText + " " : "") + (ev.title || "");

            nodes.push({
              node: row,
              bind: function () {
                bindEventItem(row, ev, {
                  view: "month",
                  gdate: gForDay,
                  jdate: jObj,
                  isAllDay: false,
                });
              },
            });
          });

          cell.appendChild(eventContainer);
          grid.appendChild(cell);

          requestAnimationFrame(function () {
            if (!nodes.length) {
              eventContainer.innerHTML = "";
              return;
            }

            fitMonthEvents(eventContainer, nodes, function (hiddenCount) {
              var moreBtn = createEl("div", "more-events-btn");
              moreBtn.innerText = "+" + hiddenCount + " رویداد دیگر";
              moreBtn.addEventListener("click", function (e) {
                e.stopPropagation();

                var label = dayLocal + " " + formatTitle(jy, jm);
                var k = jy + "-" + jm + "-" + dayLocal;

                var g = toGDateFromJ(jy, jm, dayLocal);
                var jObj2 = { jy: jy, jm: jm, jd: dayLocal };
                var evs = eventsByDay[k] || [];

                emit("onMoreEventsClick", {
                  date: { gdate: g, jdate: jObj2 },
                  events: evs,
                  view: "month",
                });
                if (features.moreEventsModal) showEventsModal(evs, label);
              });
              return moreBtn;
            });
          });
        })(day);
      }

      var totalCells = firstWeekday + monthLength;
      var remaining = 7 - (totalCells % 7);
      if (remaining < 7) {
        for (var r = 0; r < remaining; r++) {
          grid.appendChild(createEl("div", "day-cell empty"));
        }
      }
    }

    // ---- Week
    function renderWeek(jy, jm, jd) {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var g = jalaali.toGregorian(jy, jm, jd);
      var date = new Date(g.gy, g.gm - 1, g.gd);
      var weekStart = getWeekStart(date);

      var grid = createEl("div", "week-grid-rtl");
      body.appendChild(grid);

      // Header row
      var headerRow = createEl("div", "week-header-row");
      grid.appendChild(headerRow);
      headerRow.appendChild(createEl("div", "week-header-cell empty"));

      for (var i = 0; i < 7; i++) {
        (function (dayIndex) {
          var d = new Date(weekStart);
          d.setDate(weekStart.getDate() + dayIndex);

          var j = jalaali.toJalaali(
            d.getFullYear(),
            d.getMonth() + 1,
            d.getDate()
          );

          var cell = createEl(
            "div",
            "week-header-cell",
            '<div class="zc-week-header-cell">' +
              '<div class="day-name">' +
              WEEKDAY_NAMES[dayIndex] +
              "</div>" +
              '<div class="day-number">' +
              j.jd +
              "</div>" +
              "</div>"
          );

          applyDayHighlight(cell, getDayHighlightStyle(d, j, "week"));

          if (d.toDateString() === new Date().toDateString()) {
            cell.style.background = "#e8f0fe";
            cell.style.color = "#1a73e8";
          }

          headerRow.appendChild(cell);

          var numEl = cell.querySelector(".day-number");
          if (numEl) {
            numEl.style.cursor = "pointer";
            numEl.addEventListener("click", function (e) {
              e.stopPropagation();
              emit("onWeekHeaderDayClick", {
                gdate: d,
                jdate: j,
                view: "week",
              });
              goToDayViewByGDate(d);
            });
          }
        })(i);
      }

      // All-day row
      if (features.allDayRow) {
        var allDayRow = createEl("div", "zc-allday-row");
        grid.appendChild(allDayRow);

        allDayRow.appendChild(createEl("div", "zc-allday-time", "تمام روز"));

        for (var di = 0; di < 7; di++) {
          (function (dayIndex) {
            var dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + dayIndex);

            var jj = jalaali.toJalaali(
              dayDate.getFullYear(),
              dayDate.getMonth() + 1,
              dayDate.getDate()
            );
            var key = makeDayKey(jj);

            var cell = createEl("div", "zc-allday-cell");
            applyDayHighlight(cell, getDayHighlightStyle(dayDate, jj, "week"));

            var raw = eventsByDay[key] || [];
            var allDays = raw.filter(isAllDayEvent);

            allDays.slice(0, MAX_EVENTS_PER_DAY).forEach(function (ev) {
              var evEl = createEl("div", "event-item " + (ev.type || ""));
              evEl.innerText = ev.title;
              evEl.title = ev.title;

              cell.appendChild(evEl);
              bindEventItem(evEl, ev, {
                view: "week",
                gdate: dayDate,
                jdate: jj,
                isAllDay: true,
              });
            });

            if (allDays.length > MAX_EVENTS_PER_DAY) {
              var more = createEl(
                "div",
                "zc-allday-more",
                "+" + (allDays.length - MAX_EVENTS_PER_DAY) + " رویداد دیگر"
              );
              more.addEventListener("click", function (e) {
                e.stopPropagation();
                var label = jj.jd + " " + formatTitle(jj.jy, jj.jm);
                emit("onMoreEventsClick", {
                  date: { gdate: dayDate, jdate: jj },
                  events: allDays,
                  view: "week",
                });
                if (features.moreEventsModal) showEventsModal(allDays, label);
              });
              cell.appendChild(more);
            }

            allDayRow.appendChild(cell);
          })(di);
        }

        grid.appendChild(createEl("div", "zc-allday-divider"));
      }

      // Main row
      var mainRow = createEl("div", "week-row");
      grid.appendChild(mainRow);

      var timeCol = createEl("div", "week-time-cell");
      timeCol.style.position = "relative";
      timeCol.style.height = "1440px";

      for (var h = 0; h < 24; h++) {
        var t = createEl("div");
        t.style.position = "absolute";
        t.style.right = "35%";
        t.style.top = h * 60 + "px";
        t.style.fontSize = "10px";
        t.innerText = h + ":00";
        timeCol.appendChild(t);
      }
      mainRow.appendChild(timeCol);

      var GAP = 6;
      var MIN_H = 22;

      for (var dayIndex2 = 0; dayIndex2 < 7; dayIndex2++) {
        (function (dayIndex) {
          var dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIndex);

          var jj = jalaali.toJalaali(
            dayDate.getFullYear(),
            dayDate.getMonth() + 1,
            dayDate.getDate()
          );
          var key = makeDayKey(jj);

          var col = createEl("div", "week-day-cell");
          col.style.height = "1440px";

          for (var hh = 0; hh < 24; hh++) {
            var line = createEl("div", "hour-line");
            line.style.top = hh * 60 + "px";
            col.appendChild(line);
          }

          applyDayHighlight(col, getDayHighlightStyle(dayDate, jj, "week"));
          addTimeHighlightsToColumn(col, dayDate, jj, "week");

          if (features.nowLine && isSameYMD(dayDate, new Date())) {
            var nowLine = createEl("div", "zc-now-line");
            nowLine.appendChild(createEl("div", "zc-now-dot"));
            col.appendChild(nowLine);

            function updateNow() {
              var m = clamp(minuteOfDay(new Date()), 0, 1440);
              nowLine.style.top = m + "px";
            }

            updateNow();
            nowTick = setInterval(updateNow, 30000);
          }

          var raw = (eventsByDay[key] || []).filter(function (ev) {
            return !isAllDayEvent(ev);
          });

          var dayEvents = raw.map(function (ev) {
            var times = getTimeParts(ev);
            var startMin = clamp(toMin(times.s), 0, 1440);
            var endMin = clamp(toMin(times.e), 0, 1440);
            if (endMin <= startMin) endMin = startMin + 15;
            return {
              ev: ev,
              startMin: startMin,
              endMin: endMin,
              colCount: 1,
              colSpan: 1,
              colIndex: 0,
            };
          });

          var mode = getTimeGridLayout();
          var laidOut =
            mode === "overlap"
              ? layoutDayEventsOverlap(dayEvents)
              : layoutDayEventsColumns(dayEvents);
          if (mode === "overlap") attachOverlapMeta(laidOut, key);

          laidOut.forEach(function (item) {
            var ev = item.ev;

            var div = createEl("div", "event-item " + (ev.type || ""));
            div.innerText = ev.title;
            div.title = ev.title;

            div.style.top = item.startMin + "px";

            var h = item.endMin - item.startMin;
            if (h < MIN_H) h = MIN_H;
            div.style.height = h + "px";

            if (mode === "overlap" && item._ovHas) {
              div.classList.add("zc-ov-conflict"); // بردر همیشه

              if (overlapFocusEnabled()) {
                div.dataset.zcOvId = item._ovId;
                div.dataset.zcOvWith = (item._ovWith || []).join(",");
                wireOverlapHover(div, col);
              }
            } else {
              var w = 100 / item.colCount;
              var widthPercent = w * item.colSpan;
              div.style.width = "calc(" + widthPercent + "% - " + GAP + "px)";
              div.style.right =
                "calc(" + item.colIndex * w + "% + " + GAP / 2 + "px)";
            }

            if (mode === "overlap" && item._ovHas) {
              div.classList.add("zc-ov-conflict"); // بردر همیشه

              if (overlapFocusEnabled()) {
                div.dataset.zcOvId = item._ovId;
                div.dataset.zcOvWith = (item._ovWith || []).join(",");
                wireOverlapHover(div, col);
              }
            }

            col.appendChild(div);

            bindEventItem(div, ev, {
              view: "week",
              gdate: dayDate,
              jdate: jj,
              isAllDay: false,
            });

            requestAnimationFrame(function () {
              var hpx = div.offsetHeight;
              var wpx = div.offsetWidth;

              if (hpx < 25) div.classList.add("zc-short");
              if (hpx < 17) div.classList.add("zc-tiny");

              if (wpx < 55) div.classList.add("zc-event-compact");
              if (wpx < 38) div.classList.add("zc-event-dot");
            });
          });

          mainRow.appendChild(col);
        })(dayIndex2);
      }
    }

    // ---- Day
    function renderDay() {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var d = new Date(currentDayDate);
      var j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

      var dayName = WEEKDAY_NAMES[weekdayIndexFromGDate(d)];
      var isToday = isSameYMD(d, new Date());

      var titleEl = qs(".zc-title", container);
      if (isToday) {
        titleEl.innerHTML =
          '<span class="zc-day-title-text">' +
          dayName +
          " - " +
          j.jd +
          " " +
          formatTitle(j.jy, j.jm) +
          '</span><span class="zc-day-today-pill">امروز</span>';
      } else {
        titleEl.textContent =
          dayName + " - " + j.jd + " " + formatTitle(j.jy, j.jm);
      }

      var key = makeDayKey(j);

      // All-day bar
      if (features.allDayBar) {
        var allDayBar = createEl("div", "zc-day-allday");
        var allDayLabel = createEl("div", "zc-day-allday-label", "تمام روز");
        var allDayList = createEl("div", "zc-day-allday-list");

        var rawAll = eventsByDay[key] || [];
        var allDays = rawAll.filter(isAllDayEvent);

        allDays.slice(0, MAX_EVENTS_PER_DAY).forEach(function (ev) {
          var item = createEl("div", "event-item " + (ev.type || ""));
          item.innerText = ev.title;
          item.title = ev.title;
          allDayList.appendChild(item);
          bindEventItem(item, ev, {
            view: "day",
            gdate: d,
            jdate: j,
            isAllDay: true,
          });
        });

        if (allDays.length > MAX_EVENTS_PER_DAY) {
          var more = createEl(
            "div",
            "zc-allday-more",
            "+" + (allDays.length - MAX_EVENTS_PER_DAY) + " رویداد دیگر"
          );
          more.addEventListener("click", function (e) {
            e.stopPropagation();
            var label = j.jd + " " + formatTitle(j.jy, j.jm);
            emit("onMoreEventsClick", {
              date: { gdate: d, jdate: j },
              events: allDays,
              view: "day",
            });
            if (features.moreEventsModal) showEventsModal(allDays, label);
          });
          allDayList.appendChild(more);
        }

        allDayBar.appendChild(allDayLabel);
        allDayBar.appendChild(allDayList);
        body.appendChild(allDayBar);
        body.appendChild(createEl("div", "zc-allday-divider"));
      }

      // Grid
      var grid = createEl("div", "day-grid");
      body.appendChild(grid);

      var timeCol = createEl("div", "day-time-col");
      timeCol.style.position = "relative";
      timeCol.style.height = "1440px";

      for (var h = 0; h < 24; h++) {
        var t = createEl("div");
        t.style.position = "absolute";
        t.style.top = h * 60 + "px";
        t.style.fontSize = "10px";
        t.innerText = h + ":00";
        timeCol.appendChild(t);
      }

      var col = createEl("div", "day-main-col");
      col.style.height = "1440px";

      for (var hh = 0; hh < 24; hh++) {
        var line = createEl("div", "hour-line");
        line.style.top = hh * 60 + "px";
        col.appendChild(line);
      }

      applyDayHighlight(col, getDayHighlightStyle(d, j, "day"));
      addTimeHighlightsToColumn(col, d, j, "day");

      if (features.nowLine && isToday) {
        var nowLine = createEl("div", "zc-now-line");
        nowLine.appendChild(createEl("div", "zc-now-dot"));
        col.appendChild(nowLine);

        function updateNow() {
          var m = clamp(minuteOfDay(new Date()), 0, 1440);
          nowLine.style.top = m + "px";
        }

        updateNow();
        nowTick = setInterval(updateNow, 30000);
      }

      var GAP = 6;
      var MIN_H = 22;

      var raw = (eventsByDay[key] || []).filter(function (ev) {
        return !isAllDayEvent(ev);
      });

      var curJ = { jy: j.jy, jm: j.jm, jd: j.jd };

      function parseJDate(dateStr) {
        var p = String(dateStr || "")
          .split("-")
          .map(Number);
        return { jy: p[0], jm: p[1], jd: p[2] };
      }

      var dayEvents = raw.map(function (ev) {
        var times = getTimeParts(ev);
        var startMin = toMin(times.s);
        var endMin = toMin(times.e);

        var sDate = parseJDate(dayPart(ev.start));
        var eDate = parseJDate(dayPart(ev.end || ev.start));

        if (cmpJ(sDate, curJ) < 0) startMin = 0;
        if (cmpJ(eDate, curJ) > 0) endMin = 1440;

        if (endMin <= startMin) endMin = startMin + 15;

        startMin = clamp(startMin, 0, 1440);
        endMin = clamp(endMin, 0, 1440);

        return {
          ev: ev,
          startMin: startMin,
          endMin: endMin,
          colCount: 1,
          colSpan: 1,
          colIndex: 0,
        };
      });

      var mode = getTimeGridLayout();
      var laidOut =
        mode === "overlap"
          ? layoutDayEventsOverlap(dayEvents)
          : layoutDayEventsColumns(dayEvents);
      if (mode === "overlap") attachOverlapMeta(laidOut, key);

      laidOut.forEach(function (item) {
        var ev = item.ev;

        var div = createEl("div", "event-item " + (ev.type || ""));
        div.innerText = ev.title;
        div.title = ev.title;

        div.style.top = item.startMin + "px";

        var h = item.endMin - item.startMin;
        if (h < MIN_H) h = MIN_H;
        div.style.height = h + "px";

        if (mode === "overlap") {
          div.style.width = "calc(" + item.widthPct + "% - " + GAP + "px)";
          div.style.right = "calc(" + item.offsetPct + "% + " + GAP / 2 + "px)";
          div.style.zIndex = 10 + (item.stackIndex || 0);
        } else {
          var w = 100 / item.colCount;
          var widthPercent = w * item.colSpan;
          div.style.width = "calc(" + widthPercent + "% - " + GAP + "px)";
          div.style.right =
            "calc(" + item.colIndex * w + "% + " + GAP / 2 + "px)";
        }

        if (mode === "overlap" && item._ovHas) {
          div.classList.add("zc-ov-conflict");

          if (overlapFocusEnabled()) {
            div.dataset.zcOvId = item._ovId;
            div.dataset.zcOvWith = (item._ovWith || []).join(",");
            wireOverlapHover(div, col);
          }
        }

        col.appendChild(div);
        bindEventItem(div, ev, {
          view: "day",
          gdate: d,
          jdate: j,
          isAllDay: false,
        });

        requestAnimationFrame(function () {
          var hpx = div.offsetHeight;
          var wpx = div.offsetWidth;

          if (hpx < 25) div.classList.add("zc-short");
          if (hpx < 17) div.classList.add("zc-tiny");

          if (wpx < 55) div.classList.add("zc-event-compact");
          if (wpx < 38) div.classList.add("zc-event-dot");
        });
      });

      grid.appendChild(col);
      grid.appendChild(timeCol);

      if (features.autoScrollToNow && isToday) {
        requestAnimationFrame(function () {
          var m = clamp(minuteOfDay(new Date()), 0, 1440);
          var bodyEl = qs(".zc-body", container);
          bodyEl.scrollTop = clamp(m - 240, 0, bodyEl.scrollHeight);
        });
      }
    }

    // ---- Year
    function renderYear(jy) {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var wrap = createEl("div", "zc-year");
      body.appendChild(wrap);

      var grid = createEl("div", "zc-year-grid");
      wrap.appendChild(grid);

      for (var jm = 1; jm <= 12; jm++)
        (function (m) {
          var monthBox = createEl("div", "zc-year-month");
          grid.appendChild(monthBox);

          var mh = createEl("div", "zc-year-month-header");
          var mt = createEl(
            "div",
            "zc-year-month-title",
            MONTH_NAMES[m - 1] + " " + jy
          );
          mh.appendChild(mt);
          monthBox.appendChild(mh);

          if (isViewEnabled("month")) {
            mh.style.cursor = "pointer";
            mh.addEventListener("click", function () {
              currentJalali = { jy: jy, jm: m, jd: 1 };
              setView("month", "yearHeader");
            });
          } else {
            mh.style.cursor = "default";
          }

          var wds = createEl("div", "zc-year-weekdays");
          WEEKDAY_NAMES.forEach(function (n) {
            var short =
              n === "یک‌شنبه" || n === "یکشنبه" ? "ی" : n.trim().charAt(0);
            wds.appendChild(createEl("div", "zc-year-wd", short));
          });
          monthBox.appendChild(wds);

          var daysGrid = createEl("div", "zc-year-days");
          monthBox.appendChild(daysGrid);

          var monthLength = jalaali.jalaaliMonthLength(jy, m);
          var gFirst = jalaali.toGregorian(jy, m, 1);
          var firstWeekday = new Date(
            gFirst.gy,
            gFirst.gm - 1,
            gFirst.gd
          ).getDay();
          firstWeekday = (firstWeekday + 1) % 7;

          for (var i = 0; i < firstWeekday; i++)
            daysGrid.appendChild(createEl("div", "zc-year-day is-empty", ""));

          var todayJ = jalaali.toJalaali(new Date());

          for (var d = 1; d <= monthLength; d++)
            (function (dayNum) {
              var gdate = toGDateFromJ(jy, m, dayNum);
              var jObj = { jy: jy, jm: m, jd: dayNum };
              var key = makeDayKey(jObj);

              var cell = createEl("div", "zc-year-day");
              daysGrid.appendChild(cell);

              applyDayHighlight(
                cell,
                getDayHighlightStyle(gdate, jObj, "year")
              );

              if (jy === todayJ.jy && m === todayJ.jm && dayNum === todayJ.jd)
                cell.classList.add("is-today");

              cell.appendChild(
                createEl("div", "zc-year-day-num", String(dayNum))
              );

              var evs = (eventsByDay[key] || []).slice();
              if (evs.length) {
                var dots = createEl("div", "zc-year-dots");
                cell.appendChild(dots);

                if (evs.length <= 2) {
                  for (var k = 0; k < evs.length; k++) {
                    var t = (evs[k].type || "").trim();
                    dots.appendChild(createEl("span", "zc-year-dot " + t));
                  }
                } else {
                  dots.appendChild(
                    // createEl("span", "zc-year-more", "+" + evs.length)
                    createEl("span", "zc-year-more", "+" + '2')
                  );
                }

                cell.classList.add("has-events");
              }

              cell.style.cursor = "pointer";
              cell.addEventListener("click", function (e) {
                e.stopPropagation();
                emit("onDayNumberClick", {
                  gdate: gdate,
                  jdate: jObj,
                  view: "year",
                });
                goToDayViewByGDate(gdate);
              });
            })(d);

          var total = firstWeekday + monthLength;
          var remain = 42 - total;
          for (var r = 0; r < remain; r++)
            daysGrid.appendChild(createEl("div", "zc-year-day is-empty", ""));
        })(jm);
    }

    // ---- List
    function renderList(jy, jm) {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var wrap = createEl("div", "zc-list");
      body.appendChild(wrap);

      var monthLength = jalaali.jalaaliMonthLength(jy, jm);

      for (let day = 1; day <= monthLength; day++) {
        let key = jy + "-" + jm + "-" + day;
        let dayEvents = (eventsByDay[key] || []).slice();
        if (!dayEvents.length) continue;

        dayEvents.sort(function (a, b) {
          return (
            jdtSortKey(a.start) - jdtSortKey(b.start) ||
            norm(a.title).localeCompare(norm(b.title))
          );
        });

        let gdate = toGDateFromJ(jy, jm, day);
        let jObj = { jy: jy, jm: jm, jd: day };
        let dayName = WEEKDAY_NAMES[weekdayIndexFromGDate(gdate)];
        let dateLabel = day + " " + formatTitle(jy, jm);

        let dayBlock = createEl("div", "zc-list-day");
        wrap.appendChild(dayBlock);

        let head = createEl("div", "zc-list-day-header");
        head.appendChild(createEl("div", "zc-list-day-left", dayName));
        head.appendChild(createEl("div", "zc-list-day-right", dateLabel));

        applyDayHighlight(head, getDayHighlightStyle(gdate, jObj, "list"));

        head.style.cursor = "pointer";
        head.addEventListener("click", function () {
          emit("onDayNumberClick", { gdate: gdate, jdate: jObj, view: "list" });
          goToDayViewByGDate(gdate);
        });

        dayBlock.appendChild(head);

        var list = createEl("div", "zc-list-items");
        dayBlock.appendChild(list);

        dayEvents.forEach(function (ev) {
          var item = createEl("div", "zc-list-item " + (ev.type || ""));
          var time = createEl("div", "zc-list-time");
          var dot = createEl("div", "zc-list-dot");
          var title = createEl("div", "zc-list-title");
          title.innerText = ev.title || "";

          if (isAllDayEvent(ev)) time.innerText = "تمام‌روز";
          else {
            var t = getTimeParts(ev);
            var txt = t.s || "";
            if (t.s && t.e && t.e !== t.s) txt = t.s + " - " + t.e;
            time.innerText = txt;
          }

          item.appendChild(time);
          item.appendChild(dot);
          item.appendChild(title);

          item.style.cursor = "pointer";
          item.addEventListener("click", function (e) {
            e.stopPropagation();
            goToDayViewByGDate(new Date(gdate));
          });

          list.appendChild(item);
          bindEventItem(item, ev, {
            view: "list",
            gdate: gdate,
            jdate: jObj,
            isAllDay: isAllDayEvent(ev),
          });
        });
      }

      if (!wrap.children.length) {
        body.appendChild(
          createEl("div", "zc-list-empty", "رویدادی برای این بازه وجود ندارد.")
        );
      }
    }

    // --------------------------- Navigation ---------------------------
    function setView(newView, source) {
      if (!newView) return;

      if (!isViewEnabled(newView)) {
        zWarn("این ویو غیرفعال است.", { view: newView });
        return;
      }

      var from = view;
      var to = newView;

      if (from === to) {
        syncViewDropdown();
        return;
      }

      view = to;
      syncViewDropdown();

      emit("onViewChange", {
        from: from,
        to: to,
        source: source || "internal",
      });
      renderBody();
    }

    function goToDayViewByGDate(gdate) {
      currentDayDate = new Date(gdate);
      currentWeekDate = new Date(gdate);

      var j = jalaali.toJalaali(
        gdate.getFullYear(),
        gdate.getMonth() + 1,
        gdate.getDate()
      );
      currentJalali = { jy: j.jy, jm: j.jm, jd: j.jd };

      setView("day", "gotoDay");
    }

    function goNext() {
      var prev = getActiveGDate();

      if (view === "month" || view === "list") {
        currentJalali.jm++;
        if (currentJalali.jm > 12) {
          currentJalali.jm = 1;
          currentJalali.jy++;
        }
      } else if (view === "year") {
        currentJalali.jy++;
      } else if (view === "week") {
        currentWeekDate.setDate(currentWeekDate.getDate() + 7);
      } else if (view === "day") {
        currentDayDate.setDate(currentDayDate.getDate() + 1);
      }

      emit("onNext", { view: view });
      emitDateChangeIfNeeded("next", prev);

      renderBody();
    }

    function goPrev() {
      var prev = getActiveGDate();

      if (view === "month" || view === "list") {
        currentJalali.jm--;
        if (currentJalali.jm < 1) {
          currentJalali.jm = 12;
          currentJalali.jy--;
        }
      } else if (view === "year") {
        currentJalali.jy--;
      } else if (view === "week") {
        currentWeekDate.setDate(currentWeekDate.getDate() - 7);
      } else if (view === "day") {
        currentDayDate.setDate(currentDayDate.getDate() - 1);
      }

      emit("onPrev", { view: view });
      emitDateChangeIfNeeded("prev", prev);

      renderBody();
    }

    function goToday() {
      var prev = getActiveGDate();

      currentJalali = jalaali.toJalaali(new Date());
      currentWeekDate = new Date();
      currentDayDate = new Date();

      emit("onToday", null);
      emitDateChangeIfNeeded("today", prev);

      renderBody();
    }

    // --------------------------- Public API ---------------------------
    function setEvents(events) {
      baseEvents = normalizeEvents(Array.isArray(events) ? events : []);
      emit("onEventsSet", baseEvents);
      renderTypeStyles();
      renderBody();
    }

    function setTypeStyles(map) {
      userTypeStyles = map || {};
      renderTypeStyles();
      renderBody();
    }

    function setHighlights(hls) {
      highlights = Array.isArray(hls) ? hls : [];
      renderBody();
    }

    function destroy() {
      emit("onDestroy", { phase: "before" });

      stopNowTick();
      hideModal();

      if (modalOverlay && modalOverlay.parentNode)
        modalOverlay.parentNode.removeChild(modalOverlay);

      if (_docClickFiltersBound) {
        document.removeEventListener(
          "pointerdown",
          _docClickFiltersBound,
          true
        );
        _docClickFiltersBound = null;
      }

      if (_docClickHeaderBound) {
        document.removeEventListener("pointerdown", _docClickHeaderBound, true);
        _docClickHeaderBound = null;
      }

      if (typeStyleTag && typeStyleTag.parentNode)
        typeStyleTag.parentNode.removeChild(typeStyleTag);
      typeStyleTag = null;

      if (ovStyleTag && ovStyleTag.parentNode)
        ovStyleTag.parentNode.removeChild(ovStyleTag);
      ovStyleTag = null;

      container.innerHTML = "";
      container.classList.remove("zc-sidebar-open", "zc-sidebar-ready");

      _listeners = Object.create(null);

      emit("onDestroy", { phase: "after" });
    }

    // --------------------------- Init ---------------------------
    renderHeader();
    if (features.moreEventsModal) createModal();

    renderTypeStyles();
    renderOverlapFocusStyles();

    renderBody();
    emit("onInit", null);

    return {
      destroy: destroy,
      setEvents: setEvents,
      setView: function (v) {
        setView(v, "api");
      },
      goToday: goToday,
      goNext: goNext,
      goPrev: goPrev,
      setTypeStyles: setTypeStyles,
      setHighlights: setHighlights,
      on: on,
      off: off,
      emit: emit,
      getContainer: function () {
        return container;
      },
    };
  }

  return { create: create };
})();
