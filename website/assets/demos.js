/* ============================================================================
   Zarvan Calendar - documentation site, live demos
   ----------------------------------------------------------------------------
   Every demo on the site is defined here, one factory per section. A factory is
   handed its section element, builds whatever it needs, and returns an object
   with destroy(). The engine calls that when the reader navigates away, so the
   page never holds more than the calendars currently on screen - and every
   navigation exercises the library's own destroy().

   Nothing here reaches into the library. Every demo uses the same public API a
   consumer has, which is the point: if a demo works, the documented API works.
   ========================================================================= */
(function () {
  "use strict";

  var $ = Docs.$;
  var $$ = Docs.$$;

  /* ==========================================================================
     Dates

     Demo events have to sit around *today* or the reader opens the calendar and
     sees an empty month. Everything is built from offsets against today, in
     Jalali, using the jalaali global that ships inside zarvan.js.
     ====================================================================== */
  function pad2(n) { return String(n).padStart(2, "0"); }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  /** Jalali "YYYY-MM-DD" for today + offset days. */
  function J(offset) {
    var d = addDays(new Date(), offset || 0);
    var j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return j.jy + "-" + pad2(j.jm) + "-" + pad2(j.jd);
  }

  /** Jalali "YYYY-MM-DDTHH:MM". */
  function T(offset, time) { return J(offset) + "T" + time; }

  /** Offset from today to the most recent Saturday, the first day of the Jalali week. */
  function weekStartOffset() {
    return -((new Date().getDay() + 1) % 7);
  }

  /** Offset from today to the given weekday of the current week. Saturday = 0. */
  function W(weekday) { return weekStartOffset() + weekday; }

  /* ==========================================================================
     Sample data
     ====================================================================== */
  function sampleEvents() {
    return [
      { id: 1, title: "جلسه طراحی", start: T(W(0), "09:00"), end: T(W(0), "10:30"), type: "meeting" },
      { id: 2, title: "بازبینی کد", start: T(W(0), "10:00"), end: T(W(0), "11:00"), type: "task" },
      { id: 3, title: "تماس با مشتری", start: T(W(1), "13:00"), end: T(W(1), "14:00"), type: "meeting" },
      { id: 4, title: "نوشتن مستندات", start: T(W(1), "09:30"), end: T(W(1), "12:00"), type: "task" },
      { id: 5, title: "اسپرینت", start: J(W(1)), end: J(W(3)), allDay: true, type: "sprint" },
      { id: 6, title: "تعطیل رسمی", start: J(W(6)), allDay: true, type: "holiday" },
      { id: 7, title: "استندآپ روزانه", start: T(W(2), "09:00"), end: T(W(2), "09:15"), type: "meeting" },
      { id: 8, title: "طراحی رابط کاربری", start: T(W(2), "11:00"), end: T(W(2), "13:30"), type: "task" },
      { id: 9, title: "جلسه هفتگی تیم", start: T(W(3), "15:00"), end: T(W(3), "16:00"), type: "meeting" },
      { id: 10, title: "انتشار نسخه", start: T(W(4), "17:00"), end: T(W(4), "18:00"), type: "release" },
      { id: 11, title: "بررسی عملکرد", start: T(W(4), "10:00"), end: T(W(4), "11:30"), type: "task" },
      { id: 12, title: "کارگاه آموزشی", start: T(W(-2), "14:00"), end: T(W(-2), "17:00"), type: "meeting" },
      { id: 13, title: "برنامه‌ریزی ماه", start: T(W(8), "09:00"), end: T(W(8), "11:00"), type: "meeting" },
      { id: 14, title: "مرور نتایج", start: T(W(9), "16:00"), end: T(W(9), "17:00"), type: "task" },
    ];
  }

  var TYPE_LABELS = {
    meeting: "جلسه",
    task: "کار",
    sprint: "اسپرینت",
    holiday: "تعطیل",
    release: "انتشار",
  };

  var TYPE_STYLES = {
    meeting: { bg: "#2563eb", color: "#fff" },
    task: { bg: "#0d9488", color: "#fff" },
    sprint: { bg: "#7c3aed", color: "#fff" },
    holiday: { bg: "#dc2626", color: "#fff" },
    release: { bg: "#ea580c", color: "#fff" },
  };

  /* ==========================================================================
     Demo toolkit

     One object per demo, collecting everything that has to be undone. The
     pattern mirrors the library's own disposable store, for the same reason:
     teardown should not be a checklist somebody has to keep in step.
     ====================================================================== */
  function Demo(section) {
    this.section = section;
    this.cleanups = [];
    this.calendars = [];
  }

  Demo.prototype.el = function (sel) { return $(sel, this.section); };
  Demo.prototype.all = function (sel) { return $$(sel, this.section); };

  Demo.prototype.add = function (fn) { this.cleanups.push(fn); return fn; };

  Demo.prototype.on = function (target, type, handler) {
    if (!target) return;
    target.addEventListener(type, handler);
    this.add(function () { target.removeEventListener(type, handler); });
  };

  /** Delegated listener, for controls the demo re-renders. */
  Demo.prototype.click = function (sel, handler) {
    var self = this;
    this.on(this.section, "click", function (e) {
      var hit = e.target.closest ? e.target.closest(sel) : null;
      if (hit && self.section.contains(hit)) handler(hit, e);
    });
  };

  /**
   * A calendar that follows the site's theme. `colorScheme` is left to the site
   * rather than fixed per demo, so switching the page to dark switches every
   * live calendar with it - which is itself a demonstration of setColorScheme().
   */
  Demo.prototype.calendar = function (mount, options) {
    var host = typeof mount === "string" ? this.el(mount) : mount;
    if (!host) throw new Error("Zarvan docs: demo mount point not found");

    var opts = Object.assign(
      {
        typeLabels: TYPE_LABELS,
        typeStyles: TYPE_STYLES,
        colorScheme: Docs.theme(),
      },
      options || {}
    );
    opts.selector = host;

    var cal = Zarvan.create(opts);
    this.calendars.push(cal);

    if (!options || options.followTheme !== false) {
      var off = Docs.onTheme(function (theme) { cal.setColorScheme(theme); });
      this.add(off);
    }

    this.add(function () { cal.destroy(); });
    return cal;
  };

  /** A rolling log of callback payloads, the way a reader would console.log them. */
  Demo.prototype.logger = function (sel) {
    var node = this.el(sel || "[data-log]");
    if (!node) return { write: function () {}, clear: function () {} };

    var empty = '<div class="zd-log-empty">Interact with the calendar above — callbacks land here.</div>';
    node.innerHTML = empty;
    var count = 0;

    function write(name, detail) {
      if (!count) node.innerHTML = "";
      count++;
      var row = document.createElement("div");
      row.className = "zd-log-row";
      row.innerHTML =
        '<span class="zd-log-name">' + Docs.esc(name) + "</span>" +
        '<span class="zd-log-detail">' + Docs.esc(detail == null ? "" : String(detail)) + "</span>";
      node.insertBefore(row, node.firstChild);
      while (node.children.length > 60) node.removeChild(node.lastChild);
    }

    return {
      write: write,
      clear: function () { count = 0; node.innerHTML = empty; },
    };
  };

  /** Marks one button in a group as chosen. */
  Demo.prototype.selectIn = function (groupSel, attr, value) {
    this.all(groupSel + " [" + attr + "]").forEach(function (btn) {
      btn.classList.toggle("is-on", btn.getAttribute(attr) === String(value));
    });
  };

  /** Rewrites a code block from the demo's live configuration. */
  Demo.prototype.echo = function (sel, source) {
    var block = this.el(sel);
    if (!block) return;
    var code = $("code", block);
    if (!code) return;
    var lang = block.dataset.lang || "js";
    code.innerHTML = Docs.highlight(source, lang);
    block.dataset.source = source;
  };

  Demo.prototype.destroy = function () {
    // Reverse order, so teardown unwinds the way setup wound up.
    for (var i = this.cleanups.length - 1; i >= 0; i--) {
      try { this.cleanups[i](); } catch (e) { console.error(e); }
    }
    this.cleanups = [];
    this.calendars = [];
  };

  /** Registers a factory that gets a ready-made Demo. */
  function demo(id, build) {
    Docs.registerDemo(id, function (section) {
      var d = new Demo(section);
      build(d);
      return d;
    });
  }

  function json(value) {
    return JSON.stringify(value, null, 2).replace(/"([a-zA-Z_$][\w$]*)":/g, "$1:");
  }

  /* ==========================================================================
     Introduction — the calendar, doing everything, with nothing to configure
     ====================================================================== */
  demo("introduction", function (d) {
    d.calendar("[data-mount]", {
      events: sampleEvents(),
      view: "month",
      highlights: [
        { views: ["month", "week", "day"], when: { weekday: [5, 6] }, day: { bg: "rgba(220,38,38,.07)" } },
      ],
    });
  });

  /* ==========================================================================
     Basic usage
     ====================================================================== */
  demo("basic-usage", function (d) {
    d.calendar("[data-mount]", { events: sampleEvents(), view: "month" });
  });

  /* ==========================================================================
     Configuration — every feature flag, live
     ====================================================================== */
  demo("configuration", function (d) {
    var features = {
      sidebar: true,
      miniCalendar: true,
      search: true,
      typeFilter: true,
      exportExcel: true,
      viewDropdown: true,
      prevNext: true,
      todayButton: true,
      nowLine: true,
      moreEventsModal: true,
      allDayRow: true,
    };

    var cal = d.calendar("[data-mount]", { events: sampleEvents(), features: features });

    function echo() {
      d.echo("[data-echo]",
        "Zarvan.create({\n" +
        '  selector: "#calendar",\n' +
        "  events,\n" +
        "  features: " + json(features).replace(/\n/g, "\n  ") + ",\n" +
        "});");
    }
    echo();

    d.all("[data-feature]").forEach(function (input) {
      var key = input.dataset.feature;
      input.checked = features[key];
      d.on(input, "change", function () {
        features[key] = input.checked;
        // Feature flags are hot: setOption merges into the live object and re-renders.
        cal.setOption("features." + key, input.checked);
        echo();
      });
    });

    /* ---- the sidebar's initial state, further down the same page ----
       sidebarOpen is read at construction, so showing it means building a new
       calendar rather than setting anything on the running one. */
    var sidebarMount = d.el("[data-demo=configuration-sidebar] [data-mount]");
    if (!sidebarMount) return;

    var sidebarLog = d.logger("[data-demo=configuration-sidebar] [data-log]");
    var sidebarCal = null;

    function buildSidebarDemo(open) {
      if (sidebarCal) sidebarCal.destroy();

      sidebarCal = Zarvan.create({
        selector: sidebarMount,
        view: "month",
        events: sampleEvents(),
        typeLabels: TYPE_LABELS,
        typeStyles: TYPE_STYLES,
        colorScheme: Docs.theme(),
        sidebarOpen: open,
        handlers: {
          onInit: function () {
            sidebarLog.write("onInit", "constructed with sidebarOpen: " + open);
          },
          onSidebarToggle: function (isOpen) {
            sidebarLog.write("onSidebarToggle", isOpen ? "opened" : "closed");
          },
        },
      });

      d.selectIn("[data-role=sidebar-open]", "data-sidebar-open", String(open));
    }

    // One cleanup for whichever instance is current, however many times it is rebuilt.
    d.add(function () { if (sidebarCal) sidebarCal.destroy(); });
    d.add(Docs.onTheme(function (theme) {
      if (sidebarCal) sidebarCal.setColorScheme(theme);
    }));

    buildSidebarDemo(false);

    d.click("[data-sidebar-open]", function (btn) {
      buildSidebarDemo(btn.dataset.sidebarOpen === "true");
    });

    // The other half: driving the calendar that is already on screen.
    d.click("[data-set-sidebar]", function (btn) {
      var want = btn.dataset.setSidebar === "true";
      sidebarLog.write("setSidebarOpen(" + want + ")", "returned " + sidebarCal.setSidebarOpen(want));
    });

    d.click("[data-role=is-open]", function () {
      sidebarLog.write("isSidebarOpen()", String(sidebarCal.isSidebarOpen()));
    });
  });

  /* ==========================================================================
     Views — the switcher, plus the two time-grid layouts
     ====================================================================== */
  demo("views", function (d) {
    var cal = d.calendar("[data-mount]", { events: sampleEvents(), view: "month" });
    var log = d.logger();

    d.selectIn("[data-role=views]", "data-view", "month");

    cal.on("onViewChange", function (p) {
      d.selectIn("[data-role=views]", "data-view", p.to);
      log.write("onViewChange", p.from + " → " + p.to);
    });

    d.click("[data-view]", function (btn) { cal.setView(btn.dataset.view); });
  });

  demo("views-timegrid", function (d) {
    var cal = d.calendar("[data-mount]", {
      view: "day",
      features: { timeGridLayout: "overlap" },
      events: [
        { id: 1, title: "جلسه طراحی", start: T(0, "09:00"), end: T(0, "11:00"), type: "meeting" },
        { id: 2, title: "بازبینی کد", start: T(0, "09:30"), end: T(0, "10:30"), type: "task" },
        { id: 3, title: "تماس با مشتری", start: T(0, "10:00"), end: T(0, "12:00"), type: "meeting" },
        { id: 4, title: "نوشتن مستندات", start: T(0, "10:15"), end: T(0, "11:15"), type: "task" },
        { id: 5, title: "ناهار", start: T(0, "12:30"), end: T(0, "13:30"), type: "holiday" },
      ],
    });

    d.selectIn("[data-role=layout]", "data-layout", "overlap");
    d.click("[data-layout]", function (btn) {
      cal.setOption("features.timeGridLayout", btn.dataset.layout);
      d.selectIn("[data-role=layout]", "data-layout", btn.dataset.layout);
    });

    d.click("[data-overlap-focus]", function (btn) {
      var on = btn.dataset.overlapFocus === "on";
      cal.setOption("features.overlapFocus", on);
      d.selectIn("[data-role=focus]", "data-overlap-focus", btn.dataset.overlapFocus);
    });
    d.selectIn("[data-role=focus]", "data-overlap-focus", "on");
  });

  /* ==========================================================================
     Events — the data model
     ====================================================================== */
  demo("events-data", function (d) {
    d.calendar("[data-mount]", {
      view: "week",
      events: [
        { id: 1, title: "رویداد ساعت‌دار", start: T(W(1), "09:00"), end: T(W(1), "10:30"), type: "meeting" },
        { id: 2, title: "رویداد تمام‌روز", start: J(W(2)), allDay: true, type: "holiday" },
        { id: 3, title: "رویداد چندروزه", start: J(W(3)), end: J(W(5)), type: "sprint" },
        { id: 4, title: "چندروزه ساعت‌دار", start: T(W(3), "14:00"), end: T(W(4), "16:00"), forceTimed: true, type: "task" },
        { id: 5, title: "بدون نوع", start: T(W(4), "11:00"), end: T(W(4), "12:00") },
      ],
    });
  });

  /* ==========================================================================
     Recurring events — the rule, built by hand
     ====================================================================== */
  demo("events-recurring", function (d) {
    var rule = { freq: "weekly", interval: 1, byWeekday: [0, 2, 4] };

    var cal = d.calendar("[data-mount]", { view: "month", events: build() });

    function build() {
      var ev = {
        id: 1,
        title: "رویداد تکرارشونده",
        start: T(W(0), "10:00"),
        end: T(W(0), "11:00"),
        type: "meeting",
        repeat: Object.assign({}, rule),
      };
      if (rule.freq !== "weekly") delete ev.repeat.byWeekday;
      return [ev];
    }

    function echo() {
      var shown = Object.assign({}, rule);
      if (shown.freq !== "weekly") delete shown.byWeekday;
      d.echo("[data-echo]",
        "{\n" +
        '  title: "رویداد تکرارشونده",\n' +
        '  start: "' + T(W(0), "10:00") + '",\n' +
        '  end:   "' + T(W(0), "11:00") + '",\n' +
        "  repeat: " + json(shown).replace(/\n/g, "\n  ") + ",\n" +
        "}");
    }

    function refresh() {
      cal.setEvents(build());
      echo();
    }
    echo();

    d.selectIn("[data-role=freq]", "data-freq", rule.freq);
    d.click("[data-freq]", function (btn) {
      rule.freq = btn.dataset.freq;
      d.selectIn("[data-role=freq]", "data-freq", rule.freq);
      d.section.querySelector("[data-role=weekdays]").hidden = rule.freq !== "weekly";
      refresh();
    });

    d.all("[data-weekday]").forEach(function (btn) {
      var wd = Number(btn.dataset.weekday);
      btn.classList.toggle("is-on", rule.byWeekday.indexOf(wd) >= 0);
      d.on(btn, "click", function () {
        var at = rule.byWeekday.indexOf(wd);
        if (at >= 0) rule.byWeekday.splice(at, 1);
        else rule.byWeekday.push(wd);
        rule.byWeekday.sort();
        btn.classList.toggle("is-on", at < 0);
        refresh();
      });
    });

    var interval = d.el("[data-role=interval]");
    if (interval) {
      interval.value = rule.interval;
      d.on(interval, "change", function () {
        rule.interval = Math.max(1, Number(interval.value) || 1);
        interval.value = rule.interval;
        refresh();
      });
    }
  });

  /* ==========================================================================
     Event types and colours
     ====================================================================== */
  demo("events-types", function (d) {
    var styles = JSON.parse(JSON.stringify(TYPE_STYLES));
    var cal = d.calendar("[data-mount]", {
      view: "month",
      events: sampleEvents(),
      typeStyles: styles,
    });

    function echo() {
      d.echo("[data-echo]", "cal.setTypeStyles(" + json(styles) + ");");
    }
    echo();

    d.all("[data-type-color]").forEach(function (input) {
      var type = input.dataset.typeColor;
      input.value = styles[type].bg;
      d.on(input, "input", function () {
        styles[type] = { bg: input.value, color: styles[type].color };
        cal.setTypeStyles(styles);
        echo();
      });
    });

    d.click("[data-role=auto-colors]", function () {
      // No entry means the library hashes the type name into a stable hue.
      cal.setTypeStyles({});
      d.echo("[data-echo]", "// No entry for a type? The library derives a stable colour\n// from the type name itself.\ncal.setTypeStyles({});");
    });

    d.click("[data-role=reset-colors]", function () {
      styles = JSON.parse(JSON.stringify(TYPE_STYLES));
      d.all("[data-type-color]").forEach(function (input) {
        input.value = styles[input.dataset.typeColor].bg;
      });
      cal.setTypeStyles(styles);
      echo();
    });
  });

  /* ==========================================================================
     Interaction callbacks — the whole bus, live
     ====================================================================== */
  demo("events-interaction", function (d) {
    var log = d.logger();

    function jd(meta) {
      return meta && meta.jdate ? meta.jdate.jy + "-" + meta.jdate.jm + "-" + meta.jdate.jd : "—";
    }

    var cal = d.calendar("[data-mount]", {
      view: "week",
      events: sampleEvents(),
      handlers: {
        onEventClick: function (ev, meta) {
          log.write("onEventClick", ev.title + "  ·  " + meta.view + "  ·  " + jd(meta) +
            (meta.isAllDay ? "  ·  all-day" : ""));
        },
        onEventDblClick: function (ev) { log.write("onEventDblClick", ev.title); },
        onEventContextMenu: function (ev, meta) {
          if (meta.domEvent) meta.domEvent.preventDefault();
          log.write("onEventContextMenu", ev.title);
        },
        onEventFocus: function (ev) { log.write("onEventFocus", ev.title); },
        onDayNumberClick: function (p) { log.write("onDayNumberClick", jd(p) + "  ·  " + p.view); },
        onWeekHeaderDayClick: function (p) { log.write("onWeekHeaderDayClick", jd(p)); },
        onMoreEventsClick: function (p) { log.write("onMoreEventsClick", p.events.length + " events"); },
        onViewChange: function (p) { log.write("onViewChange", p.from + " → " + p.to); },
        onDateChange: function (p) { log.write("onDateChange", "source=" + p.source); },
        onRangeChange: function () { log.write("onRangeChange", "visible range moved"); },
        onModalOpen: function () { log.write("onModalOpen", ""); },
        onModalClose: function (p) { log.write("onModalClose", "reason=" + p.reason); },
        onSidebarToggle: function (open) { log.write("onSidebarToggle", open ? "open" : "closed"); },
      },
    });

    var hover = d.el("[data-role=hover]");
    if (hover) {
      d.on(hover, "change", function () {
        cal.setOption("features.interactions.hover", hover.checked);
        if (hover.checked) {
          cal.on("onEventHover", onHover);
        } else {
          cal.off("onEventHover", onHover);
        }
      });
    }
    function onHover(ev) { log.write("onEventHover", ev.title); }

    d.click("[data-role=clear-log]", function () { log.clear(); });
  });

  /* ==========================================================================
     Adding, updating and removing events
     ====================================================================== */
  demo("events-crud", function (d) {
    var log = d.logger();
    var seq = 100;
    var last = null;

    var cal = d.calendar("[data-mount]", {
      view: "month",
      events: sampleEvents().slice(0, 6),
      handlers: {
        onEventsChange: function (p) {
          log.write("onEventsChange", p.type + " · now " + p.events.length + " events");
        },
        onWarn: function (p) { log.write("onWarn", p.code + " — " + p.message); },
      },
    });

    d.click("[data-role=add]", function () {
      var id = ++seq;
      last = cal.addEvent({
        id: id,
        title: "رویداد جدید " + (id - 100),
        start: T(W(2), "14:00"),
        end: T(W(2), "15:00"),
        type: "task",
      });
      log.write("addEvent", last ? "stored id=" + last.id : "rejected");
    });

    d.click("[data-role=update]", function () {
      if (!last) return log.write("updateEvent", "add one first");
      var out = cal.updateEvent(last.id, { title: last.title + " ✎", type: "meeting" });
      last = out || last;
      log.write("updateEvent", out ? out.title : "rejected");
    });

    d.click("[data-role=remove]", function () {
      if (!last) return log.write("removeEvent", "add one first");
      var out = cal.removeEvent(last.id);
      log.write("removeEvent", out ? "removed id=" + out.id : "not found");
      last = null;
    });

    d.click("[data-role=invalid]", function () {
      // Validation is on by default: a malformed date is dropped and reported
      // through onWarn rather than throwing or rendering as garbage.
      var out = cal.addEvent({ id: ++seq, title: "تاریخ نامعتبر", start: "not-a-date" });
      log.write("addEvent", out ? "stored" : "rejected — see onWarn above");
    });

    d.click("[data-role=count]", function () {
      log.write("getEvents", cal.getEvents().length + " events in the calendar");
    });
  });

  /* ==========================================================================
     Loading events on demand — a simulated backend
     ====================================================================== */
  demo("events-lazy", function (d) {
    var log = d.logger();
    var latency = 550;
    var calls = 0;
    var timers = [];

    d.add(function () { timers.forEach(clearTimeout); });

    /* Stands in for a server. It answers with events inside whatever range it
       was asked about, after a delay, so the loading bar and the ordering
       guarantees are both visible. */
    function loader(range) {
      calls++;
      var startG = range.startG;
      var days = Math.round((range.endG - range.startG) / 86400000) + 1;
      log.write("loader called", "range " + days + " days · " + range.view + " · call #" + calls);

      return new Promise(function (resolve) {
        var id = setTimeout(function () {
          var out = [];
          for (var i = 0; i < days; i += 2) {
            var day = new Date(startG);
            day.setDate(day.getDate() + i);
            var j = jalaali.toJalaali(day.getFullYear(), day.getMonth() + 1, day.getDate());
            var key = j.jy + "-" + pad2(j.jm) + "-" + pad2(j.jd);
            out.push({
              id: key + "-a",
              title: "از سرور " + (i + 1),
              start: key + "T09:00",
              end: key + "T10:00",
              type: i % 4 ? "task" : "meeting",
            });
          }
          resolve(out);
        }, latency);
        timers.push(id);
      });
    }

    var cal = d.calendar("[data-mount]", {
      view: "month",
      events: loader,
      eventCacheLimit: 12,
      handlers: {
        onEventsLoadStart: function () { log.write("onEventsLoadStart", "fetching…"); },
        onEventsLoadEnd: function (p) { log.write("onEventsLoadEnd", p.events.length + " events applied"); },
        onEventsLoadError: function (p) { log.write("onEventsLoadError", String(p.error && p.error.message)); },
      },
    });

    d.click("[data-role=next]", function () { cal.next(); });
    d.click("[data-role=prev]", function () { cal.prev(); });
    d.click("[data-role=refetch]", function () {
      log.write("refetchEvents()", cal.refetchEvents() ? "reloading, cache ignored" : "not a lazy source");
    });
    d.click("[data-role=state]", function () {
      log.write("state", "isLazy=" + cal.isLazy() + "  isLoading=" + cal.isLoading());
    });

    var slider = d.el("[data-role=latency]");
    if (slider) {
      slider.value = latency;
      d.on(slider, "change", function () {
        latency = Number(slider.value) || 0;
        var out = d.el("[data-role=latency-out]");
        if (out) out.textContent = latency + " ms";
      });
    }
  });

  /* ==========================================================================
     Navigation
     ====================================================================== */
  demo("navigation", function (d) {
    var log = d.logger();

    var cal = d.calendar("[data-mount]", {
      view: "month",
      events: sampleEvents(),
      handlers: {
        onDateChange: function (p) {
          log.write("onDateChange", fmt(p.from) + " → " + fmt(p.to) + "  (source=" + p.source + ")");
        },
        onToday: function () { log.write("onToday", "jumped to today"); },
      },
    });

    function fmt(date) {
      var j = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return j.jy + "-" + pad2(j.jm) + "-" + pad2(j.jd);
    }

    d.click("[data-role=prev]", function () { cal.prev(); });
    d.click("[data-role=next]", function () { cal.next(); });
    d.click("[data-role=today]", function () { cal.today(); });

    d.click("[data-role=goto]", function () {
      var input = d.el("[data-role=goto-input]");
      var parts = String(input.value).split("-").map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return log.write("gotoDate", "expected YYYY-M-D");
      var out = cal.gotoDate({ jy: parts[0], jm: parts[1], jd: parts[2] });
      log.write("gotoDate", out ? "moved to " + fmt(out) : "invalid date — nothing changed");
    });

    d.click("[data-role=range]", function () {
      var r = cal.getVisibleRange();
      log.write("getVisibleRange", fmt(r.startG) + " … " + fmt(r.endG));
    });

    d.click("[data-role=jdate]", function () {
      var j = cal.getJDate();
      log.write("getJDate", j.jy + "-" + j.jm + "-" + j.jd + "   ·   getDate() → " + fmt(cal.getDate()));
    });

    var input = d.el("[data-role=goto-input]");
    if (input) input.value = J(45);
  });

  /* ==========================================================================
     Search and filtering
     ====================================================================== */
  demo("filters", function (d) {
    var log = d.logger();

    var cal = d.calendar("[data-mount]", {
      view: "list",
      events: sampleEvents(),
      handlers: {
        onFiltersChange: function (p) {
          log.write("onFiltersChange", "type=" + p.type + "  q=" + JSON.stringify(p.q) + "  source=" + p.source);
        },
        onAutocompleteSelect: function (p) { log.write("onAutocompleteSelect", p.value); },
      },
    });

    d.click("[data-role=open-sidebar]", function () {
      // The filter UI lives in the sidebar; the menu button is what opens it.
      var btn = cal.getRoot().querySelector(".zc-menu-btn");
      if (btn) btn.click();
    });
  });

  /* ==========================================================================
     Highlights — holidays and working hours
     ====================================================================== */
  demo("highlights", function (d) {
    var on = { weekend: true, hours: false, today: false };

    var cal = d.calendar("[data-mount]", { view: "week", events: sampleEvents() });

    var RULES = {
      weekend: {
        views: ["month", "week", "day", "year"],
        when: { weekday: [5, 6] },
        day: { bg: "rgba(220,38,38,.10)", className: "is-holiday" },
      },
      hours: {
        views: ["week", "day"],
        when: { weekday: [0, 1, 2, 3, 4] },
        time: { start: "09:00", end: "17:00", bg: "rgba(16,185,129,.10)" },
      },
      today: {
        views: ["month", "week", "day"],
        when: { jDates: [J(0)] },
        day: { bg: "rgba(37,99,235,.12)" },
      },
    };

    function apply() {
      var list = Object.keys(on).filter(function (k) { return on[k]; }).map(function (k) { return RULES[k]; });
      cal.setHighlights(list);
      d.echo("[data-echo]", "cal.setHighlights(" + json(list) + ");");
    }
    apply();

    d.all("[data-highlight]").forEach(function (input) {
      var key = input.dataset.highlight;
      input.checked = on[key];
      d.on(input, "change", function () {
        on[key] = input.checked;
        apply();
      });
    });
  });

  /* ==========================================================================
     Theming — a live token editor
     ====================================================================== */
  demo("theming", function (d) {
    var cal = d.calendar("[data-mount]", { view: "month", events: sampleEvents() });
    var applied = {};

    function echo() {
      var keys = Object.keys(applied);
      if (!keys.length) {
        d.echo("[data-echo]", "// Move a control above to write tokens here.\ncal.setTheme({ /* … */ });");
        return;
      }
      d.echo("[data-echo]", "cal.setTheme(" + json(applied) + ");");
    }
    echo();

    d.all("[data-token]").forEach(function (input) {
      var token = input.dataset.token;
      d.on(input, "input", function () {
        var value = input.value + (input.dataset.unit || "");
        applied[token] = value;
        cal.setTheme(applied);
        var out = input.parentNode.querySelector("[data-token-out]");
        if (out) out.textContent = value;
        echo();
      });
    });

    var PRESETS = {
      rose: { "color-accent": "#e11d48", "color-accent-weak": "#ffe4e6", "radius-lg": "14px" },
      forest: { "color-accent": "#047857", "color-accent-weak": "#d1fae5", "radius-lg": "4px" },
      slate: { "color-accent": "#334155", "color-accent-weak": "#e2e8f0", "radius-lg": "2px" },
    };

    d.click("[data-preset]", function (btn) {
      applied = Object.assign({}, PRESETS[btn.dataset.preset]);
      cal.setTheme(applied);
      d.selectIn("[data-role=presets]", "data-preset", btn.dataset.preset);
      echo();
    });

    d.click("[data-role=reset-theme]", function () {
      // null clears an override and lets the stylesheet's value apply again.
      var cleared = {};
      Object.keys(applied).forEach(function (k) { cleared[k] = null; });
      cal.setTheme(cleared);
      applied = {};
      d.all("[data-preset]").forEach(function (b) { b.classList.remove("is-on"); });
      echo();
    });
  });

  /* ==========================================================================
     Dark mode
     ====================================================================== */
  demo("dark-mode", function (d) {
    var log = d.logger();

    // followTheme:false — this demo owns its scheme, so the reader can set it to
    // something other than the page's.
    var cal = d.calendar("[data-mount]", {
      view: "month",
      events: sampleEvents(),
      colorScheme: Docs.theme(),
      followTheme: false,
      handlers: {
        onColorSchemeChange: function (p) {
          log.write("onColorSchemeChange", p.scheme + " → " + p.resolved + "  (source=" + p.source + ")");
          d.selectIn("[data-role=scheme]", "data-scheme", p.scheme);
          var out = d.el("[data-role=resolved]");
          if (out) out.textContent = p.resolved;
        },
      },
    });

    d.selectIn("[data-role=scheme]", "data-scheme", cal.getColorScheme());
    var out = d.el("[data-role=resolved]");
    if (out) out.textContent = cal.getResolvedColorScheme();

    d.click("[data-scheme]", function (btn) { cal.setColorScheme(btn.dataset.scheme); });
  });

  /* ==========================================================================
     Localization — wording and numerals
     ====================================================================== */
  demo("localization", function (d) {
    var cal = d.calendar("[data-mount]", { view: "month", events: sampleEvents() });

    var LOCALES = {
      default: { code: "fa" },
      custom: {
        code: "fa",
        strings: {
          today: "همین امروز",
          viewLabel: "نما",
          searchLabel: "یافتن",
          searchPlaceholder: "دنبال چه می‌گردید؟",
          allDayRow: "تمام‌روز",
          moreEvents: "+{count} مورد دیگر",
        },
      },
      latin: { code: "fa", digits: null },
    };

    d.selectIn("[data-role=locale]", "data-locale", "default");
    d.click("[data-locale]", function (btn) {
      var key = btn.dataset.locale;
      cal.setLocale(LOCALES[key]);
      d.selectIn("[data-role=locale]", "data-locale", key);
      d.echo("[data-echo]", "cal.setLocale(" + json(LOCALES[key]) + ");");
    });

    d.echo("[data-echo]", "cal.setLocale(" + json(LOCALES.default) + ");");
  });

  /* ==========================================================================
     Jalali dates — a live converter, using the bundled jalaali global
     ====================================================================== */
  demo("jalali", function (d) {
    var gIn = d.el("[data-role=g-in]");
    var jOut = d.el("[data-role=j-out]");
    var jIn = d.el("[data-role=j-in]");
    var gOut = d.el("[data-role=g-out]");

    var MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

    function toJalali() {
      var parts = String(gIn.value).split("-").map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) { jOut.textContent = "—"; return; }
      try {
        var j = jalaali.toJalaali(parts[0], parts[1], parts[2]);
        jOut.textContent = j.jy + "-" + pad2(j.jm) + "-" + pad2(j.jd) +
          "   ·   " + j.jd + " " + MONTHS[j.jm - 1] + " " + j.jy +
          "   ·   " + (jalaali.isLeapJalaaliYear(j.jy) ? "leap year" : "common year");
      } catch (e) { jOut.textContent = "invalid date"; }
    }

    function toGregorian() {
      var parts = String(jIn.value).split("-").map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) { gOut.textContent = "—"; return; }
      try {
        var g = jalaali.toGregorian(parts[0], parts[1], parts[2]);
        var d0 = new Date(g.gy, g.gm - 1, g.gd);
        gOut.textContent = g.gy + "-" + pad2(g.gm) + "-" + pad2(g.gd) +
          "   ·   " + d0.toDateString() +
          "   ·   month length " + jalaali.jalaaliMonthLength(parts[0], parts[1]) + " days";
      } catch (e) { gOut.textContent = "invalid date"; }
    }

    var todayG = new Date();
    gIn.value = todayG.getFullYear() + "-" + pad2(todayG.getMonth() + 1) + "-" + pad2(todayG.getDate());
    jIn.value = J(0);

    d.on(gIn, "input", toJalali);
    d.on(jIn, "input", toGregorian);
    toJalali();
    toGregorian();

    d.calendar("[data-mount]", { view: "year", events: sampleEvents() });
  });

  /* ==========================================================================
     Export
     ====================================================================== */
  demo("export", function (d) {
    var log = d.logger();

    var cal = d.calendar("[data-mount]", {
      view: "month",
      events: sampleEvents(),
      handlers: {
        onExportStart: function (p) { log.write("onExportStart", p.fileName); },
        onExportEnd: function (p) { log.write("onExportEnd", p.count + " rows → " + p.fileName); },
        onExportError: function (err) { log.write("onExportError", String(err && err.message)); },
        onWarn: function (p) { log.write("onWarn", p.code + " — " + p.message); },
      },
    });

    d.click("[data-role=export]", function () {
      // The method the plugin adds to the instance. Without SheetJS on the page
      // it reports warn.xlsxMissing and nothing else happens - which is exactly
      // what this documentation site shows, because it loads no CDN.
      cal.exportToExcel();
    });

    d.click("[data-role=export-off]", function () {
      cal.setOption("features.exportExcel", false);
      log.write("setOption", "features.exportExcel = false — the button is gone");
    });
  });

  /* ==========================================================================
     Plugins — one written live
     ====================================================================== */
  demo("plugins", function (d) {
    var log = d.logger();

    /* Counts the events in the visible range and prints the total into the
       sidebar. It uses only the plugin context: a hook to find the sidebar, the
       calendar's own range and filters, and the disposable store for teardown. */
    var eventCounter = {
      name: "docs-event-counter",
      install: function (cal) {
        var badge = null;

        var offSidebar = cal.hooks.on("sidebar", function (p) {
          badge = document.createElement("div");
          badge.className = "zd-plugin-badge";
          badge.style.cssText =
            "margin-top:12px;padding:8px 10px;border-radius:8px;" +
            "background:var(--zc-color-accent-weak);color:var(--zc-color-accent);" +
            "font-size:12px;font-weight:700;text-align:center";
          p.el.appendChild(badge);
          update();
        });

        var offRender = cal.on("onRenderEnd", update);

        function update() {
          if (!badge) return;
          var range = cal.getVisibleRange();
          var list = cal.applyFilters(
            cal.expandRecurring(cal.getEvents(), range.startG, range.endG)
          );
          badge.textContent = cal.num(list.length) + " رویداد در این بازه";
        }

        // A plugin may add public methods to the instance.
        cal.api.countVisibleEvents = function () {
          var range = cal.getVisibleRange();
          return cal.applyFilters(
            cal.expandRecurring(cal.getEvents(), range.startG, range.endG)
          ).length;
        };

        return function uninstall() {
          offSidebar();
          offRender();
          if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
          delete cal.api.countVisibleEvents;
        };
      },
    };

    Zarvan.use(eventCounter);
    d.add(function () { Zarvan.unuse(eventCounter.name); });

    var cal = d.calendar("[data-mount]", { view: "month", events: sampleEvents() });

    log.write("plugins()", cal.plugins().join(", "));

    d.click("[data-role=open-sidebar]", function () {
      var btn = cal.getRoot().querySelector(".zc-menu-btn");
      if (btn) btn.click();
    });

    d.click("[data-role=count]", function () {
      log.write("cal.countVisibleEvents()", cal.countVisibleEvents() + " — added by the plugin");
    });
  });

  /* ==========================================================================
     Custom views — a resource timeline, built with registerView()

     Zarvan bundles five views. This is not a sixth: it is an example of the
     extension point, written entirely against the documented view contract, to
     show that a view the library has never heard of can join the switcher,
     participate in next/prev, drive the mini calendar and receive the same
     event bus as a built-in one.
     ====================================================================== */
  demo("custom-views", function (d) {
    var RESOURCES = [
      { id: "r1", label: "اتاق جلسات ۱" },
      { id: "r2", label: "اتاق جلسات ۲" },
      { id: "r3", label: "استودیو" },
      { id: "r4", label: "آزمایشگاه" },
    ];

    var DAY_START = 8;
    var DAY_END = 19;

    // The day the timeline is anchored to. A view owns its own position.
    var anchor = new Date();

    function dayBounds() {
      var start = new Date(anchor);
      start.setHours(0, 0, 0, 0);
      var end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { startG: start, endG: end };
    }

    function minutesOf(value) {
      var at = String(value).indexOf("T");
      if (at < 0) return null;
      var parts = String(value).slice(at + 1).split(":");
      return Number(parts[0]) * 60 + Number(parts[1] || 0);
    }

    Zarvan.registerView("timeline", {
      label: "خط زمانی",
      order: 60,

      range: dayBounds,
      anchor: function () { return new Date(anchor); },
      step: function (dir) { anchor = addDays(anchor, dir); },
      focusDate: function () { return new Date(anchor); },
      selectedJDate: function () {
        var j = jalaali.toJalaali(anchor.getFullYear(), anchor.getMonth() + 1, anchor.getDate());
        return { jy: j.jy, jm: j.jm, jd: j.jd };
      },
      title: function () {
        var j = jalaali.toJalaali(anchor.getFullYear(), anchor.getMonth() + 1, anchor.getDate());
        return "خط زمانی — " + j.jy + "/" + pad2(j.jm) + "/" + pad2(j.jd);
      },

      /* A view is handed a context, not the DOM. It finds the body the same way
         any renderer does: through the instance id the container is stamped with. */
      render: function (ctx) {
        var root = document.querySelector('[data-zc-id="' + ctx.instanceId + '"]');
        var body = root && root.querySelector(".zc-body");
        if (!body) return;
        body.innerHTML = "";

        var j = jalaali.toJalaali(anchor.getFullYear(), anchor.getMonth() + 1, anchor.getDate());
        var jday = { jy: j.jy, jm: j.jm, jd: j.jd };
        var events = ctx.eventsFor(jday);
        var hours = DAY_END - DAY_START;

        var wrap = document.createElement("div");
        wrap.className = "zd-timeline";

        // Hour ruler
        var ruler = document.createElement("div");
        ruler.className = "zd-timeline-ruler";
        ruler.innerHTML = '<div class="zd-timeline-name"></div>';
        var track = document.createElement("div");
        track.className = "zd-timeline-track";
        for (var h = DAY_START; h < DAY_END; h++) {
          var tick = document.createElement("div");
          tick.className = "zd-timeline-tick";
          tick.style.width = (100 / hours) + "%";
          tick.textContent = h + ":00";
          track.appendChild(tick);
        }
        ruler.appendChild(track);
        wrap.appendChild(ruler);

        RESOURCES.forEach(function (resource) {
          var row = document.createElement("div");
          row.className = "zd-timeline-row";

          var name = document.createElement("div");
          name.className = "zd-timeline-name";
          name.textContent = resource.label;
          row.appendChild(name);

          var lane = document.createElement("div");
          lane.className = "zd-timeline-lane";

          events
            .filter(function (ev) { return (ev.resource || "r1") === resource.id; })
            .forEach(function (ev) {
              var from = minutesOf(ev.start);
              var to = minutesOf(ev.end) || (from + 60);
              if (from == null) return;

              var left = ((from - DAY_START * 60) / (hours * 60)) * 100;
              var width = ((to - from) / (hours * 60)) * 100;
              if (left + width <= 0 || left >= 100) return;

              var pill = document.createElement("div");
              pill.className = "zd-timeline-event zc-event";
              pill.style.right = Math.max(0, left) + "%";
              pill.style.width = Math.min(width, 100 - Math.max(0, left)) + "%";
              pill.textContent = ev.title;

              /* The one call that matters: it gives the node the event bus,
                 keyboard activation, the ARIA role and the zc-event-node marker,
                 exactly as a built-in view's pill gets them. */
              ctx.bindEventItem(pill, ev, { jdate: jday, isAllDay: false });

              lane.appendChild(pill);
            });

          row.appendChild(lane);
          // Lets highlight rules and the day hooks reach this custom view too.
          ctx.decorateDay(lane, new Date(anchor), jday, "timeline");
          wrap.appendChild(row);
        });

        body.appendChild(wrap);
      },
    });

    d.add(function () { Zarvan.unregisterView("timeline"); });

    var log = d.logger();

    var events = [
      { id: 1, title: "جلسه طراحی", start: T(0, "09:00"), end: T(0, "10:30"), type: "meeting", resource: "r1" },
      { id: 2, title: "مصاحبه", start: T(0, "11:00"), end: T(0, "12:00"), type: "task", resource: "r1" },
      { id: 3, title: "ضبط پادکست", start: T(0, "13:00"), end: T(0, "15:30"), type: "release", resource: "r3" },
      { id: 4, title: "تست کاربری", start: T(0, "10:00"), end: T(0, "12:30"), type: "task", resource: "r4" },
      { id: 5, title: "جلسه هفتگی", start: T(0, "15:00"), end: T(0, "16:00"), type: "meeting", resource: "r2" },
      { id: 6, title: "بازبینی معماری", start: T(0, "16:30"), end: T(0, "18:00"), type: "sprint", resource: "r2" },
    ];

    var cal = d.calendar("[data-mount]", {
      view: "timeline",
      events: events,
      handlers: {
        onEventClick: function (ev) {
          log.write("onEventClick", ev.title + "  ·  resource=" + ev.resource + "  ·  view=timeline");
        },
        onViewChange: function (p) { log.write("onViewChange", p.from + " → " + p.to); },
      },
    });

    log.write("getViews()", cal.getViews().join(", "));

    d.click("[data-role=to-timeline]", function () { cal.setView("timeline"); });
    d.click("[data-role=to-week]", function () { cal.setView("week"); });
  });

  /* ==========================================================================
     Shadow DOM
     ====================================================================== */
  demo("shadow-dom", function (d) {
    var log = d.logger();

    /* Shadow mode needs the stylesheet's text, because a <link> in the light DOM
       does not cross the boundary. The sheet is same-origin here, so the library
       can read it from document.styleSheets on its own - but a cross-origin CDN
       could not, which is why options.styles exists. */
    var cal = d.calendar("[data-mount]", {
      shadow: true,
      view: "month",
      events: sampleEvents().slice(0, 8),
      handlers: {
        onWarn: function (p) { log.write("onWarn", p.code + " — " + p.message); },
      },
    });

    var root = cal.getShadowRoot();
    log.write("getShadowRoot()", root ? "attached — the calendar is inside a shadow tree" : "unavailable here");
    log.write("getContainer()", "the host element you passed");
    log.write("getRoot()", "the .zc-calendar element inside the shadow root");

    d.click("[data-role=hostile]", function (btn) {
      var on = btn.classList.toggle("is-on");
      var id = "zd-hostile-css";
      var existing = document.getElementById(id);
      if (!on) {
        if (existing) existing.remove();
        log.write("hostile CSS", "removed");
        return;
      }
      var style = document.createElement("style");
      style.id = id;
      style.textContent =
        "div, span, button { border: 2px dashed #dc2626 !important; " +
        "text-transform: uppercase !important; letter-spacing: 3px !important; }";
      document.head.appendChild(style);
      d.add(function () { var s = document.getElementById(id); if (s) s.remove(); });
      log.write("hostile CSS", "injected — the shadow calendar is untouched");
    });
  });

  /* ==========================================================================
     Accessibility — the same calendar, driven from the keyboard
     ====================================================================== */
  demo("accessibility", function (d) {
    var log = d.logger();

    d.calendar("[data-mount]", {
      view: "month",
      events: sampleEvents(),
      handlers: {
        onEventClick: function (ev, meta) {
          log.write("onEventClick", ev.title + (meta.domEvent && meta.domEvent.type === "keydown"
            ? "  ·  activated from the keyboard" : "  ·  activated by pointer"));
        },
        onEventFocus: function (ev) { log.write("onEventFocus", ev.title); },
        onDayNumberClick: function (p) {
          log.write("onDayNumberClick", p.jdate.jy + "-" + p.jdate.jm + "-" + p.jdate.jd);
        },
      },
    });
  });

  /* ==========================================================================
     API reference — a scratch calendar wired to a method picker
     ====================================================================== */
  demo("api-methods", function (d) {
    var log = d.logger();

    var cal = d.calendar("[data-mount]", { view: "month", events: sampleEvents() });

    var CALLS = {
      getView: function () { return cal.getView(); },
      getViews: function () { return cal.getViews().join(", "); },
      getDate: function () { return cal.getDate().toDateString(); },
      getJDate: function () { var j = cal.getJDate(); return j.jy + "-" + j.jm + "-" + j.jd; },
      getVisibleRange: function () {
        var r = cal.getVisibleRange();
        return r.startG.toDateString() + " … " + r.endG.toDateString();
      },
      getEvents: function () { return cal.getEvents().length + " events"; },
      getEventById: function () { var e = cal.getEventById(1); return e ? e.title : "not found"; },
      getLocale: function () { return cal.getLocale(); },
      getColorScheme: function () { return cal.getColorScheme(); },
      getResolvedColorScheme: function () { return cal.getResolvedColorScheme(); },
      isSidebarOpen: function () { return String(cal.isSidebarOpen()); },
      toggleSidebar: function () {
        // Idempotent, so flipping it is the honest way to demonstrate both directions.
        return "now " + cal.setSidebarOpen(!cal.isSidebarOpen());
      },
      getHighlights: function () { return cal.getHighlights().length + " rules"; },
      isLazy: function () { return String(cal.isLazy()); },
      isLoading: function () { return String(cal.isLoading()); },
      plugins: function () { return cal.plugins().join(", "); },
      next: function () { cal.next(); return "moved forward"; },
      prev: function () { cal.prev(); return "moved back"; },
      today: function () { cal.today(); return "back to today"; },
      refresh: function () { cal.refresh(); return "pending render flushed"; },
    };

    d.click("[data-call]", function (btn) {
      var name = btn.dataset.call;
      try {
        log.write("cal." + name + "()", CALLS[name]());
      } catch (e) {
        log.write("cal." + name + "()", "threw: " + e.message);
      }
    });
  });
})();
