// ================== Zarvan - shell / controller ==================
//
// This file holds the parts that are still entangled: instance state, the event bus, the render
// pipeline and the five view renderers. The pure layers it builds on live in core/, calendar/,
// data/, layout/ and highlights/, and are unit-tested independently by test/index.html.
//
// GENERATED OUTPUT: src/js/zarvan.js is this file concatenated with those modules, in the order
// given by build/manifest-js.txt. Edit this file, not the generated one.
var Zarvan = (function () {
  "use strict";

  /* Replaced at build time from package.json by build/build.{mjs,sh,ps1}. A vendored copy of this
     file is often several releases behind whatever a support ticket assumes, so the running build
     says which one it is: Zarvan.version. */
  var VERSION = "__ZARVAN_VERSION__";

  // ------------------------- Internal modules -------------------------
  // Extracted, independently unit-tested layers (see src/js/{core,calendar,data,layout,highlights}/
  // and test/index.html). They are aliased to the names the code below already used, so the render
  // and controller code reads exactly as before.
  var Z = window.ZarvanInternal;

  var isPlainObject = Z.utils.isPlainObject,
    mergeDeep = Z.utils.mergeDeep,
    clamp = Z.utils.clamp,
    pad2 = Z.utils.pad2,
    norm = Z.utils.norm,
    typeClass = Z.utils.typeClass,
    hashStr = Z.utils.hashStr;

  var resolveElement = Z.dom.resolveElement,
    qs = Z.dom.qs,
    qsa = Z.dom.qsa,
    createEl = Z.dom.createEl;

  var dayPart = Z.jdate.dayPart,
    toMin = Z.jdate.toMin,
    parseJDateTime = Z.jdate.parseJDateTime,
    formatJDT = Z.jdate.formatJDT,
    parseJDateOnly = Z.jdate.parseJDateOnly,
    makeDayKey = Z.jdate.makeDayKey,
    cmpJ = Z.jdate.cmpJ,
    jToNum = Z.jdate.jToNum,
    jdtSortKey = Z.jdate.jdtSortKey;

  var gDateStart = Z.gregorian.gDateStart,
    isSameYMD = Z.gregorian.isSameYMD,
    minuteOfDay = Z.gregorian.minuteOfDay,
    weekdayIndexFromGDate = Z.gregorian.weekdayIndexFromGDate,
    getWeekStart = Z.gregorian.getWeekStart;

  var jal = Z.jalali;
  var toGDateFromJ = Z.jalali.toGDate;

  var isMultiDay = Z.dataEvents.isMultiDay,
    isAllDayEvent = Z.dataEvents.isAllDayEvent,
    getTimeParts = Z.dataEvents.getTimeParts,
    evToGRange = Z.dataEvents.evToGRange,
    eventInVisibleRange = Z.dataEvents.eventInVisibleRange;

  var organizeEvents = Z.dataOrganize.organizeEvents,
    expandRecurringForRange = Z.dataRecurrence.expandRecurringForRange;

  var layoutDayEventsOverlap = Z.layoutOverlap.layoutDayEventsOverlap,
    layoutDayEventsColumns = Z.layoutColumns.layoutDayEventsColumns;

  var dayMatchesRule = Z.highlightRules.dayMatchesRule;
  var createDisposableStore = Z.disposable.createDisposableStore;
  var createScheduler = Z.scheduler.createScheduler;
  var createDropdown = Z.uiDropdown.createDropdown;
  var createAutocomplete = Z.uiAutocomplete.createAutocomplete;
  var createUiModal = Z.uiModal.createModal;
  var TimeGrid = Z.viewsTimeGrid;
  var greg = Z.gregorian;
  var createRegistry = Z.registry.createRegistry;
  var Locale = Z.locale;
  var createHooks = Z.hooks.createHooks;
  var Plugins = Z.plugins;
  var Shadow = Z.shadow;

  // --------------------------- Defaults / Constants ---------------------------

  /* Views registered through Zarvan.registerView() before any calendar is created. Each instance
     copies them into its own registry, so registering after construction does not retroactively
     change a live calendar. */
  var EXTRA_VIEWS = Object.create(null);

  function registerView(key, def) {
    if (!key || !def || typeof def.render !== "function") {
      throw new Error("Zarvan.registerView: a view needs a key and a render function.");
    }
    EXTRA_VIEWS[key] = def;
    return def;
  }

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

  /* The header chevron, inlined.
   *
   * This was `<img src="../icons/arrow.svg">`, which resolves against the HOST DOCUMENT rather than
   * against the script. It happened to work for the pages in this repository, which all sit exactly
   * one directory below icons/, and 404'd for every other integration - a bundler, a CDN, or any page
   * served from a different depth. Inlining costs one fewer request, drops the asset from the install
   * instructions, and lets the glyph take its colour from the stylesheet.
   *
   * .zc-next rotates it 180 degrees, so there is still only one shape. */
  var ARROW_SVG =
    '<svg viewBox="0 0 8 12" width="8" height="12" fill="none" aria-hidden="true" ' +
    'focusable="false" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M4.6 6L0 1.4L1.4 0L7.4 6L1.4 12L0 10.6L4.6 6Z" fill="currentColor"/></svg>';

  // --------------------------- Factory ---------------------------
  function create(options) {
    options = options || {};

    var host = resolveElement(options.selector);
    if (!host) throw new Error("Zarvan: container not found.");

    /* In shadow mode the calendar renders into a div inside a shadow root rather than into the host
       itself, so the host keeps whatever layout role the page gave it.
         host      - the element the caller passed
         container - the .zc-calendar element everything renders into
         rootNode  - shadow root or document; where instance-scoped nodes are mounted and looked up */
    var shadowMount = options.shadow ? Shadow.attach(host, options) : null;
    var container = shadowMount ? shadowMount.container : host;
    var rootNode = shadowMount ? shadowMount.root : document;

    if (options.shadow && !shadowMount) {
      console.warn("Zarvan: Shadow DOM is unavailable here; rendering in the light DOM instead.");
    } else if (shadowMount && !shadowMount.styled) {
      console.warn(
        "Zarvan: shadow mode found no stylesheet to adopt. Pass options.styles with the contents of " +
          "zarvan.css, or a CSSStyleSheet, otherwise the calendar renders unstyled."
      );
    }

    var features = mergeDeep(DEFAULT_FEATURES, options.features || {});
    var TYPE_LABELS = options.typeLabels || {};

    // Unknown keys default to enabled, so a registered view does not also need a feature flag.
    function isViewEnabled(v) {
      var m = features.views || {};
      return m[v] !== false;
    }

    function firstEnabledView() {
      // "month" first when it is available, then registry order.
      if (isViewEnabled("month") && views.has("month")) return "month";
      var enabled = views.keys().filter(isViewEnabled);
      return enabled.length ? enabled[0] : "month";
    }

    // Instance id
    var instanceId = "zc" + Math.random().toString(36).slice(2, 9);
    container.dataset.zcId = instanceId;
    container.classList.add("zc-calendar");


    // Declared before anything that can emit. normalizeEvents() warns through the bus during
    // construction, so the bus cannot be initialised after it.
    var _listeners = Object.create(null);
    var _handlers = options.handlers || {};

    // ---- Bindings for the extracted layers that need this instance's state ----
    // Declarations, so they hoist above the state.baseEvents assignment below.

    function normalizeEvents(list) {
      return Z.dataNormalize.normalizeEvents(list, validation, zWarn);
    }

    function filterEventsForCurrentView(events) {
      return Z.dataFilter.filterEvents(events, state.filterState);
    }

    function filterEventsForAutocomplete(events) {
      return Z.dataFilter.filterEventsByTypeOnly(events, state.filterState);
    }

    function attachOverlapMeta(laidOut, dayKey) {
      return Z.layoutOverlap.buildOverlapGraph(laidOut, instanceId + ":" + dayKey);
    }

    // --------------------------- State ---------------------------
    var validation = Object.assign(
      {
        enabled: true,
        requireNumericId: false,
        onInvalid: "drop", // "drop" | "keep"
        autoFix: true, // end<start
      },
      options.validation || {}
    );

    /* One translator per instance. options.locale takes a code, a full locale object, or - the common
       case - a partial one that overrides some of Persian's wording:
         locale: { code: "fa", strings: { today: "همین امروز" } } */
    var locale = Locale.createTranslator(Locale.resolve(options.locale));
    var t = locale.t;
    var WEEKDAY_NAMES = locale.weekdays;
    var MONTH_NAMES = locale.months;

    /* Numerals are the locale's business. `num` shapes a number into the locale's digits, or returns
       it unchanged when the locale sets `digits: null`. Everything the calendar prints as a number
       goes through it: day numbers, hour labels, event times, the year. */
    function num(value) {
      return locale.num(value);
    }

    /* Zarvan is a right-to-left Persian calendar and the stylesheet is written that way throughout, so
       `dir` is stamped rather than derived - there is no direction to decide. `lang` follows the
       locale code so a custom Persian variant ("fa-IR") is announced correctly. */
    function applyLocaleAttributes() {
      container.setAttribute("dir", "rtl");
      container.setAttribute("lang", locale.code || "fa");
    }

    applyLocaleAttributes();

    var todayJalali = jal.toJalaali(new Date());

    /* Everything the render pipeline reads, in one object rather than a dozen free-floating closure
       variables. Collecting it is what makes a view extractable later: a view can be handed this as an
       explicit context instead of reaching into the enclosing scope for whatever it happens to need. */
    var state = {
      view: options.view || "month",

      // Anchor date per view family. Month, year and list read currentJalali; week and day keep their
      // own Date so that switching between them does not lose the day you were looking at.
      currentJalali: todayJalali,
      currentWeekDate: new Date(),
      currentDayDate: new Date(),

      // The mini calendar browses independently of the main view, so it tracks its own month.
      miniJ: { jy: todayJalali.jy, jm: todayJalali.jm },

      baseEvents: [],
      eventsByDay: {},

      highlights: Array.isArray(options.highlights) ? options.highlights : [],
      filterState: { type: "__all__", q: "" },
    };

    if (!isViewEnabled(state.view)) state.view = firstEnabledView();
    state.baseEvents = normalizeEvents(options.events || []);

    // DOM references, re-populated by renderHeader()
    var sidebarEl = null;
    var miniWrapEl = null;
    var viewDd = null;

    // Everything with a lifetime registers on one of these at creation time.
    //   instanceStore - released by destroy()
    //   renderStore   - released at the top of every render, so anything a render sets up (notably
    //                   the week view's seven now-indicator intervals) is always cleaned up
    var filtersOutsideClickDispose = null;
    var hooks = createHooks();
    var instanceStore = createDisposableStore("instance");
    var renderStore = createDisposableStore("render");

    var _lastRange = null;
    var _lastActiveDate = null;

    /* How many all-day pills the week and day strips show before collapsing into "+N more". The
       month view does not use it: it measures what actually fits in a cell. */
    var MAX_EVENTS_PER_DAY = 2;

    // --------------------------- Event Bus ---------------------------

    function buildCtx(extra) {
      return Object.assign(
        {
          instanceId: instanceId,
          container: container,
          view: state.view,
          filterState: state.filterState,
          currentJalali: state.currentJalali,
          currentWeekDate: state.currentWeekDate,
          currentDayDate: state.currentDayDate,
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

      /* One signature for every callback: (payload, meta, ctx).
       *
       * v1 chose the arguments by inspecting fn.length, which meant a two-argument listener silently
       * received (payload, ctx) instead of (payload, meta) - so asking for meta the obvious way gave
       * you the context object and a confusing  where the date should have been. It also
       * broke outright for any function whose length is not what it appears: default parameters and
       * rest arguments both report 0.
       *
       * meta is null for callbacks that have none, rather than absent, so destructuring is safe. */
      function callOne(fn) {
        if (typeof fn !== "function") return;
        return fn(payload, meta === undefined ? null : meta, ctx);
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

    /* Warnings travel as a stable code plus a localised message. Consumers switch on `code`;
       `message` is for display and changes with the locale. */
    function zWarn(code, extra) {
      emit("onWarn", { code: code, message: t(code), extra: extra });
    }
    function zError(err) {
      emit("onError", err);
    }

    // --------------------------- Accessibility helpers ---------------------------

    /* document.activeElement reports the shadow HOST, not the element inside it, so anything that
       cares where focus actually is has to ask the root the calendar rendered into. */
    function rootActiveElement() {
      return (rootNode && rootNode.activeElement) || document.activeElement;
    }

    /* Turns a plain element into something a keyboard can reach and operate.
     *
     * The calendar is full of divs with `cursor: pointer` and a click listener - day numbers, the
     * "+N more" affordances, year cells, list day headers. They looked interactive, and to a mouse
     * they were, but they carried no role, no tab stop and no key handling, so none of them existed
     * for anyone navigating by keyboard. Event pills were worse: bindEventItem already set
     * role="button" and tabindex="0", so they announced themselves as buttons and then ignored every
     * key press.
     *
     * Space is preventDefault-ed on keydown because the browser scrolls the page on the *default*
     * action of Space; the activation itself fires on keyup for Space and keydown for Enter, which is
     * how a native button behaves. */
    function makeActivatable(el, label, onActivate) {
      if (!el) return el;

      if (!el.hasAttribute("role")) el.setAttribute("role", "button");
      if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
      if (label != null && !el.hasAttribute("aria-label")) {
        el.setAttribute("aria-label", label);
      }

      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          onActivate(e);
        } else if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
        }
      });

      el.addEventListener("keyup", function (e) {
        if (e.key !== " " && e.key !== "Spacebar") return;
        e.preventDefault();
        e.stopPropagation();
        onActivate(e);
      });

      return el;
    }

    /* click + keyboard in one call, for the many elements that want both and nothing else. */
    function onActivate(el, label, handler) {
      if (!el) return el;
      el.addEventListener("click", handler);
      return makeActivatable(el, label, handler);
    }

    /* Turns a set of day cells into one composite widget with a single tab stop.
     *
     * Making every clickable day focusable is what a keyboard needs, but doing it naively is its own
     * bug: the mini calendar would be 31 tab stops and the year view 372, so Tab would stop being a
     * way to get past the calendar at all. This is the grid pattern - the grid holds one tab stop,
     * and the arrow keys move within it, exactly like a native date picker.
     *
     * The tab stop starts on the selected day, or today, or the first cell. Left and Right follow the
     * grid's own writing direction, so they always move the way the user sees. */
    function makeRovingGrid(gridEl, itemSelector, columns) {
      if (!gridEl) return;

      var items = qsa(itemSelector, gridEl).filter(function (el) {
        return el.tabIndex === 0;
      });
      if (!items.length) return;

      var start = items.findIndex(function (el) {
        return el.classList.contains("zc-is-selected");
      });
      if (start < 0) {
        start = items.findIndex(function (el) {
          return (
            el.classList.contains("zc-is-today") ||
            (el.querySelector && el.querySelector(".zc-is-today"))
          );
        });
      }
      if (start < 0) start = 0;

      items.forEach(function (el, i) {
        el.tabIndex = i === start ? 0 : -1;
      });

      var rtl =
        typeof getComputedStyle === "function" &&
        getComputedStyle(gridEl).direction === "rtl";
      var forward = rtl ? "ArrowLeft" : "ArrowRight";
      var back = rtl ? "ArrowRight" : "ArrowLeft";

      gridEl.addEventListener("keydown", function (e) {
        var from = items.indexOf(e.target);
        if (from < 0) return;

        var to = from;
        if (e.key === forward) to = from + 1;
        else if (e.key === back) to = from - 1;
        else if (e.key === "ArrowDown") to = from + columns;
        else if (e.key === "ArrowUp") to = from - columns;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = items.length - 1;
        else return;

        if (to < 0 || to >= items.length) return;

        e.preventDefault();
        items[from].tabIndex = -1;
        items[to].tabIndex = 0;
        items[to].focus();
      });
    }

    // --------------------------- Style helpers ---------------------------

    // Injected rules must reach this instance only. The modal lives outside the container (it is
    // appended to <body>), so it carries the same id and is scoped separately.
    // The suffix is distributed across both roots — building one comma-joined prefix and appending
    // the suffix once would attach it to the last root only.
    function scopedSelector(suffix) {
      return (
        '.zc-calendar[data-zc-id="' +
        instanceId +
        '"] ' +
        suffix +
        ',\n.zc-modal-overlay[data-zc-id="' +
        instanceId +
        '"] ' +
        suffix
      );
    }

    function ensureStyleTag(attrName) {
      var sel = "style[" + attrName + '="' + instanceId + '"]';
      // Into the shadow root when there is one - a tag in document.head would not reach inside it.
      var styleHost = rootNode === document ? document.head : rootNode;
      var tag = (rootNode === document ? document : rootNode).querySelector(sel);
      if (!tag) {
        tag = document.createElement("style");
        tag.setAttribute(attrName, instanceId);
        styleHost.appendChild(tag);
        instanceStore.addNode(tag);
      }
      return tag;
    }

    // ---- Type style injection
    var userTypeStyles = options.typeStyles || {};
    var typeStyleTag = null;


    function autoStyleForType(type) {
      var h = hashStr(type);
      var hue = h % 360;
      return { bg: "hsl(" + hue + ", 70%, 45%)", color: "#fff" };
    }

    function getAllTypes() {
      var set = {};
      (state.baseEvents || []).forEach(function (ev) {
        var type = String(ev.type || "").trim();
        if (type) set[type] = true;
      });
      return Object.keys(set);
    }

    function getStyleForType(type) {
      var u = userTypeStyles && userTypeStyles[type];
      if (u && (u.bg || u.color)) return { bg: u.bg, color: u.color };
      return autoStyleForType(type);
    }

    function renderTypeStyles() {
      if (!features.typeStyleInjection) {
        if (typeStyleTag && typeStyleTag.parentNode)
          typeStyleTag.parentNode.removeChild(typeStyleTag);
        typeStyleTag = null;
        return;
      }

      // One declaration per type, setting only custom properties. The stylesheet decides which
      // element consumes them (pill background, month dot, year dot, list dot), so adding a new
      // event-coloured element is a CSS change rather than a change here.
      var css = "";
      getAllTypes().forEach(function (type) {
        var cls = typeClass(type);
        if (!cls) return;

        var st = getStyleForType(type);
        var bg = st.bg || autoStyleForType(type).bg;
        var color = st.color != null ? st.color : "#fff";

        css +=
          "\n" +
          scopedSelector("." + cls) +
          "{ --zc-event-bg:" +
          bg +
          "; --zc-event-fg:" +
          color +
          "; }";
      });

      typeStyleTag = ensureStyleTag("data-zc-type-style");
      typeStyleTag.textContent = css;
    }

    // ---- Overlap focus
    function overlapFocusEnabled() {
      return features.overlapFocus !== false;
    }

    // The conflict border, dim and focus rules now live in the stylesheet and read their timing from
    // custom properties. Toggling the feature is therefore a handful of property writes on the root
    // rather than a second injected stylesheet to build, track and tear down.
    var OV_PROPS = {
      "--zc-ov-duration": "280ms",
      "--zc-ov-delay": "60ms",
      "--zc-ov-easing": "cubic-bezier(.2,.8,.2,1)",
      "--zc-ov-dim-opacity": "0.07",
    };

    function renderOverlapFocusStyles() {
      var on = overlapFocusEnabled();
      Object.keys(OV_PROPS).forEach(function (prop) {
        writeProp(prop, on ? OV_PROPS[prop] : null);
      });
    }

    // --------------------------- Date / Range logic ---------------------------
    function formatTitle(jy, jm) {
      return MONTH_NAMES[jm - 1] + " " + num(jy);
    }

    // "09:00" in the locale's digits. The hour gutter's only formatting rule.
    function formatHour(h) {
      return num(pad2(h) + ":00");
    }

    // "۲ شهریور ۱۴۰۵" - the accessible name every day-sized control uses.
    function formatDayLabel(jy, jm, jd) {
      return num(jd) + " " + formatTitle(jy, jm);
    }


    function getVisibleRangeG() {
      var def = currentViewDef();
      if (!def || !def.range) return { startG: new Date(), endG: new Date() };
      return def.range();
    }

    function getActiveGDate() {
      var def = currentViewDef();
      if (!def || !def.anchor) return new Date();
      return def.anchor();
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
        _lastRange.view !== state.view
      ) {
        emit("onRangeChange", {
          startG: new Date(start),
          endG: new Date(end),
          view: state.view,
        });
        _lastRange = { start: start, end: end, view: state.view };
      }
    }

    // --------------------------- Events / Data ---------------------------


    function refreshEvents() {
      var rg = getVisibleRangeG();
      var expanded = expandRecurringForRange(state.baseEvents, rg.startG, rg.endG);
      var filtered = filterEventsForCurrentView(expanded);

      state.eventsByDay = organizeEvents(filtered);
    }


    /* The one call every view makes when it draws something that stands for a day. What happens next
       is up to whatever is listening - by default the highlights plugin, but a consumer could attach a
       badge, a tooltip or nothing at all. */
    function decorateDay(el, gdate, jdate, viewName) {
      if (!el) return el;
      hooks.run("dayElement", { el: el, gdate: gdate, jdate: jdate, view: viewName });
      return el;
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
        moreBtn.innerText = t("moreEvents", { count: num(hidden) });
      }

      shown.forEach(function (x) {
        x.bind && x.bind();
      });
    }

    /* The parameter must not be named  - that is the translator, and shadowing it here made
       typeToFa throw the moment an untyped event needed its fallback label. */
    function typeToFa(type) {
      var key = String(type || "").trim();
      if (!key) return t("noType");
      return TYPE_LABELS[key] || key;
    }

    /* A view's label may be a string (third-party views) or a function (the built-ins, which read the
       translator). Resolving it on every read is what lets setLocale() relabel a live calendar. */
    function viewLabel(def) {
      if (!def) return "";
      return typeof def.label === "function" ? def.label() : def.label;
    }

    function viewToFa(v) {
      return viewLabel(views.get(v)) || v;
    }

    function syncViewDropdown() {
      if (viewDd) viewDd.setValue(viewToFa(state.view));
    }

    function closeViewDropdown(reason) {
      if (viewDd) viewDd.close(reason);
    }

    function createViewDropdown() {
      if (viewDd) viewDd.dispose();

      viewDd = createDropdown({
        prefix: "zc-view-dd",
        label: t("viewLabel"),
        value: viewToFa(state.view),
        store: instanceStore,
        items: function () {
          return views
            .values()
            .filter(function (def) {
              return isViewEnabled(def.key);
            })
            .map(function (def) {
              return { value: def.key, label: viewLabel(def), active: def.key === state.view };
            });
        },
        onOpen: function () {
          emit("onViewDropdownOpen", null);
        },
        onClose: function (info) {
          emit("onViewDropdownClose", info);
        },
        onSelect: function (value) {
          setView(value, "dropdown");
        },
      });

      return viewDd.el;
    }

    function stopNowTick() {
      renderStore.reset();
    }

    // --------------------------- Sidebar Filters ---------------------------
    var _acTitles = [];

    // Empty query -> no suggestions, rather than "every title". Shared by the focus and input paths,
    // which previously each carried their own copy of this filter.
    function matchingTitles(value) {
      var q = norm(value);
      if (!q) return [];
      return _acTitles.filter(function (title) {
        return norm(title).includes(q);
      });
    }

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
      (state.baseEvents || []).forEach(function (ev) {
        var type = (ev.type || "").trim();
        if (type) set[type] = true;
      });
      return Object.keys(set).sort();
    }

    function syncFilterUI(filtersWrap) {
      var ddValue = qs(".zc-dd-value", filtersWrap);
      if (ddValue)
        ddValue.innerText =
          state.filterState.type === "__all__"
            ? t("allTypes")
            : typeToFa(state.filterState.type);

      var input = qs(".zc-search-input", filtersWrap);
      if (input && input.value !== state.filterState.q)
        input.value = state.filterState.q || "";
    }

    function renderSidebarFilters() {
      if (!features.sidebar || !features.filters || !miniWrapEl) return;

      var hasAny =
        !!features.typeFilter || !!features.search || !!features.exportExcel;
      if (!hasAny) {
        var ex = qs(".zc-filters", miniWrapEl);
        if (ex && ex.parentNode) ex.parentNode.removeChild(ex);
        state.filterState.type = "__all__";
        state.filterState.q = "";
        return;
      }

      var existing = qs(".zc-filters", miniWrapEl);
      if (existing) {
        syncFilterUI(existing);
        return;
      }

      if (filtersOutsideClickDispose) {
        filtersOutsideClickDispose();
        filtersOutsideClickDispose = null;
      }

      var wrap = createEl("div", "zc-filters");
      miniWrapEl.appendChild(wrap);

      var closeDropdown = function () {};
      var showAC = function () {};
      var hideAC = function () {};

      // ---- Type dropdown
      if (features.typeFilter) {
        var typeDd = createDropdown({
          prefix: "zc-dd",
          label: t("typeLabel"),
          store: instanceStore,
          items: function () {
            return [{ value: "__all__", label: t("allTypes") }].concat(
              getAvailableTypes().map(function (type) {
                return { value: type, label: typeToFa(type) };
              })
            );
          },
          onSelect: function (value) {
            var from = state.filterState.type;
            state.filterState.type = value || "__all__";

            emit("onFiltersChange", {
              type: state.filterState.type,
              q: state.filterState.q,
              from: from,
              to: state.filterState.type,
              source: "type",
            });

            requestRender();
          },
        });

        closeDropdown = function () {
          typeDd.close("outside");
        };

        wrap.appendChild(typeDd.el);
      } else {
        state.filterState.type = "__all__";
      }

      // ---- Search + AC + Export
      if (features.search || features.exportExcel) {
        var searchWrap = createEl("div", "zc-search");

        if (features.search) {
          var searchLabel = createEl("label", "zc-search-label", t("searchLabel"));
          searchLabel.htmlFor = instanceId + "-search";
          searchWrap.appendChild(searchLabel);
          var searchBox = createEl("div", "zc-search-box");

          var input = createEl("input", "zc-search-input");
          input.id = instanceId + "-search";
          input.type = "search";
          input.placeholder = t("searchPlaceholder");
          input.autocomplete = "off";
          searchBox.appendChild(input);

          var ac = null;

          if (features.autocomplete) {
            ac = createAutocomplete({
              store: instanceStore,
              anchor: searchBox,
              input: input,
              onSelect: function (value) {
                input.value = value;
                state.filterState.q = value;

                emit("onAutocompleteSelect", { value: value });
                emit("onFiltersChange", {
                  type: state.filterState.type,
                  q: state.filterState.q,
                  source: "autocomplete",
                });

                requestRender();
                input.focus();
              },
            });
            searchBox.appendChild(ac.el);

            showAC = function (list) {
              ac.show(list);
            };
            hideAC = function () {
              ac.hide();
            };

            input.addEventListener("focus", function () {
              showAC(matchingTitles(input.value));
            });

            /* The suggestion list was mouse-only: the popup had no keyboard path in or out, so a
               keyboard user typing in the search box got a list they could see and not use. */
            input.addEventListener("keydown", function (e) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                if (ac.move(e.key === "ArrowDown" ? 1 : -1)) e.preventDefault();
              } else if (e.key === "Enter") {
                if (ac.confirm()) e.preventDefault();
              } else if (e.key === "Escape" && ac.isOpen()) {
                e.preventDefault();
                e.stopPropagation();
                ac.hide();
              }
            });
          }

          var deb = null;
          instanceStore.add(function () {
            if (deb) clearTimeout(deb);
          });
          input.addEventListener("input", function () {
            var v = input.value || "";
            state.filterState.q = v;

            if (features.autocomplete) showAC(matchingTitles(v));

            if (deb) clearTimeout(deb);
            deb = setTimeout(function () {
              emit("onFiltersChange", {
                type: state.filterState.type,
                q: state.filterState.q,
                source: "search",
              });
              requestRender();
            }, 150);
          });

          searchWrap.addEventListener("pointerdown", function (e) {
            e.stopPropagation();
          });

          searchWrap.appendChild(searchBox);
        } else {
          state.filterState.q = "";
        }

        wrap.appendChild(searchWrap);
      }

      // outside close
      hooks.run("sidebar", { el: wrap, ctx: viewContext() });

      filtersOutsideClickDispose = instanceStore.addListener(
        document,
        "pointerdown",
        function (e) {
          if (wrap.contains(e.target)) return;
          closeDropdown();
          hideAC();
        },
        true
      );

      syncFilterUI(wrap);
    }

    // --------------------------- Excel Export ---------------------------


    // --------------------------- Event item binding ---------------------------
    function bindEventItem(elm, ev, metaBase) {
      if (!elm || !ev) return;

      if (!elm.hasAttribute("tabindex")) elm.tabIndex = 0;
      elm.setAttribute("role", "button");
      if (ev.title && !elm.hasAttribute("aria-label")) {
        elm.setAttribute("aria-label", ev.title);
      }

      function meta(domEvent) {
        return Object.assign(
          {
            view: state.view,
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

      if (inter.click) {
        elm.addEventListener("click", function (e) {
          e.stopPropagation();
          fire("onEventClick", e);
        });

        /* Enter and Space, so the role="button" and tabindex="0" set above are not a lie. Without
           this an event pill was a tab stop that did nothing at all. */
        makeActivatable(elm, null, function (e) {
          fire("onEventClick", e);
        });
      }
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


    function clearOverlapFocus(scopeEl) {
      if (!scopeEl) return;
      qsa(".zc-event.zc-ov-dim, .zc-event.zc-ov-focus", scopeEl).forEach(
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
          '.zc-event[data-zc-ov-id="' + id + '"]'
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


    // --------------------------- Modal ---------------------------
    var modal = null;

    function ensureModal() {
      if (modal) return modal;
      modal = createUiModal({
        instanceId: instanceId,
        closeLabel: t("close"),
        mountTo: rootNode === document ? document.body : rootNode,
        store: instanceStore,
        onClose: function (info) {
          emit("onModalClose", info);
        },
      });
      return modal;
    }

    /* Builds one row for the modal. The widget itself takes finished nodes, so everything that knows
       what an event is stays here. */
    /*  is the day the modal was opened for. Without it the rows bound events with no gdate or
       jdate, so onEventClick fired with meta.jdate === null for exactly the events a user reaches by
       clicking "+N more" - a surprising hole in an otherwise consistent payload. */
    function buildModalRow(ev, date) {
      var item = createEl("div", "zc-modal-event-item " + typeClass(ev.type));

      var title = createEl("div", "zc-modal-event-title");
      title.innerText = ev.title;
      item.appendChild(title);

      var allDay = isAllDayEvent(ev);
      var text = "";
      if (allDay) text = t("allDayEvent");
      else {
        var times = getTimeParts(ev);
        text = times.s && times.e ? num(times.s + " - " + times.e) : "";
      }
      if (text) {
        var time = createEl("div", "zc-modal-event-time");
        time.innerText = text;
        item.appendChild(time);
      }

      bindEventItem(item, ev, {
        view: state.view,
        gdate: date ? date.gdate : null,
        jdate: date ? date.jdate : null,
        isAllDay: allDay,
      });
      return item;
    }

    function showEventsModal(events, dateLabel, date) {
      if (!features.moreEventsModal) return;

      emit("onModalOpen", { dateLabel: dateLabel, events: events, date: date || null });
      ensureModal().show(
        t("modalTitle", { date: dateLabel }),
        (events || []).map(function (ev) {
          return buildModalRow(ev, date);
        })
      );
    }

    function hideModal() {
      if (modal) modal.hide("api");
    }

    // --------------------------- Header / Layout ---------------------------
    /* width:0 + overflow:hidden hides the sidebar to the eye only. Its type dropdown, search box,
       autocomplete, export button and 31 mini-calendar days stayed focusable and stayed in the
       accessibility tree, so tabbing through a collapsed calendar walked into a panel nobody could
       see. `inert` covers both; aria-hidden is the fallback for browsers without it (it hides from
       assistive tech but not from Tab, hence both). */
    function syncSidebarHidden() {
      if (!sidebarEl) return;
      var open = container.classList.contains("zc-sidebar-open");
      if (open) {
        sidebarEl.removeAttribute("inert");
        sidebarEl.removeAttribute("aria-hidden");
      } else {
        sidebarEl.setAttribute("inert", "");
        sidebarEl.setAttribute("aria-hidden", "true");
      }
    }

    function toggleSidebar() {
      if (!features.sidebar) return;

      var wasOpen = container.classList.contains("zc-sidebar-open");
      var btn = qs(".zc-menu-btn", container);
      if (btn) btn.setAttribute("aria-expanded", String(!wasOpen));

      if (!wasOpen) {
        container.classList.add("zc-sidebar-open");
        container.classList.remove("zc-sidebar-ready");
        syncSidebarHidden();

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
        instanceStore.addTimeout(finish, 300);
        emit("onSidebarToggle", true, { phase: "start" });
      } else {
        container.classList.remove("zc-sidebar-ready");
        container.classList.remove("zc-sidebar-open");

        /* Focus first, then inert. Inerting an ancestor of the focused element drops focus to
           <body> in some engines, which loses the user's place in the page entirely. */
        if (sidebarEl && sidebarEl.contains(rootActiveElement())) {
          var btnEl = qs(".zc-menu-btn", container);
          if (btnEl) btnEl.focus();
        }
        syncSidebarHidden();

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
        menuBtn.type = "button";
        menuBtn.setAttribute("aria-label", t("menu"));
        // Stated up front rather than only after the first click, and pointed at what it opens.
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-controls", instanceId + "-sidebar");
        menuBtn.innerHTML =
          '<span class="zc-menu-icon" aria-hidden="true"><span></span></span>';
        menuBtn.addEventListener("click", toggleSidebar);
        right.appendChild(menuBtn);
      }

      if (features.viewDropdown) {
        right.appendChild(createViewDropdown());
      } else {
        if (viewDd) viewDd.dispose();
        viewDd = null;
      }

      // center
      var center = createEl("div", "zc-center");
      var title = createEl("span", "zc-title");
      title.innerText = formatTitle(state.currentJalali.jy, state.currentJalali.jm);
      center.appendChild(title);

      // left
      var left = createEl("div", "zc-left");

      if (features.navigation) {
        var nav = createEl("div", "zc-nav-group");

        if (features.prevNext) {
          /* Next before prev: the header reads right-to-left, so this is visual order. Both are
             created and appended together - the second `if (features.prevNext)` that used to append
             `prev` relied on var hoisting to see a variable declared inside the first. */
          var prev = createEl("button", "zc-prev");
          prev.type = "button";
          prev.setAttribute("aria-label", t("prev"));
          prev.innerHTML = ARROW_SVG;
          prev.addEventListener("click", goPrev);

          var next = createEl("button", "zc-next");
          next.type = "button";
          next.setAttribute("aria-label", t("next"));
          next.innerHTML = ARROW_SVG;
          next.addEventListener("click", goNext);

          nav.appendChild(next);
          nav.appendChild(prev);
        }

        if (features.todayButton) {
          var today = createEl("button", "zc-today");
          today.type = "button";
          today.innerText = t("today");
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
        sidebarEl.id = instanceId + "-sidebar";
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
      syncSidebarHidden();
      syncViewDropdown();
    }

    // --------------------------- Mini Calendar ---------------------------
    function syncMiniToActiveDate() {
      /* Which month the mini calendar follows is a property of the view.
         The old conditional only handled "month" explicitly and let everything else fall through to
         currentWeekDate - so in year and list view the mini calendar ignored navigation entirely and
         stayed on whatever week the calendar was constructed in. */
      var def = currentViewDef();
      var base = def && def.focusDate ? def.focusDate() : new Date();

      var j = jal.toJalaali(
        base.getFullYear(),
        base.getMonth() + 1,
        base.getDate()
      );
      state.miniJ = { jy: j.jy, jm: j.jm };
      renderMiniCalendar(state.miniJ.jy, state.miniJ.jm);
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

      /* Same inlined chevron as the main header nav (ARROW_SVG), not the locale's "‹"/"›" glyphs -
         one icon family instead of a font-rendered arrow next to a vector one. */
      var prevBtn = createEl("button", "zc-mini-prev");
      prevBtn.type = "button";
      prevBtn.setAttribute("aria-label", t("prev"));
      prevBtn.innerHTML = ARROW_SVG;
      prevBtn.addEventListener("click", function () {
        jm--;
        if (jm < 1) {
          jm = 12;
          jy--;
        }
        state.miniJ = { jy: jy, jm: jm };
        renderMiniCalendar(jy, jm);
      });

      var nextBtn = createEl("button", "zc-mini-next");
      nextBtn.type = "button";
      nextBtn.setAttribute("aria-label", t("next"));
      nextBtn.innerHTML = ARROW_SVG;
      nextBtn.addEventListener("click", function () {
        jm++;
        if (jm > 12) {
          jm = 1;
          jy++;
        }
        state.miniJ = { jy: jy, jm: jm };
        renderMiniCalendar(jy, jm);
      });

      nav.appendChild(prevBtn);
      nav.appendChild(nextBtn);

      h.appendChild(title);
      h.appendChild(nav);
      mini.appendChild(h);

      var wd = createEl("div", "zc-mini-weekdays");
      wd.setAttribute("aria-hidden", "true");
      WEEKDAY_NAMES.forEach(function (n, i) {
        wd.appendChild(createEl("div", "", locale.weekdaysShort[i]));
      });
      mini.appendChild(wd);

      var grid = createEl("div", "zc-mini-grid");
      mini.appendChild(grid);

      var monthLength = jal.monthLength(jy, jm);
      var gFirst = jal.toGregorian(jy, jm, 1);
      var firstWeekday = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay();
      firstWeekday = (firstWeekday + 1) % 7;

      var todayJ = jal.toJalaali(new Date());
      var selectedDef = currentViewDef();
      var selectedJ =
        selectedDef && selectedDef.selectedJDate
          ? selectedDef.selectedJDate()
          : state.currentJalali;

      for (var i = 0; i < firstWeekday; i++) {
        var lead = createEl("div", "zc-mini-day zc-is-empty", "");
        lead.setAttribute("aria-hidden", "true");
        grid.appendChild(lead);
      }

      for (var d = 1; d <= monthLength; d++)
        (function (dayNum) {
          var cell = createEl("div", "zc-mini-day", num(dayNum));

          if (jy === todayJ.jy && jm === todayJ.jm && dayNum === todayJ.jd)
            cell.classList.add("zc-is-today");
          if (
            jy === selectedJ.jy &&
            jm === selectedJ.jm &&
            dayNum === selectedJ.jd
          )
            cell.classList.add("zc-is-selected");

          onActivate(cell, formatDayLabel(jy, jm, dayNum), function () {
            var prev = getActiveGDate();

            var gdate = toGDateFromJ(jy, jm, dayNum);
            state.currentDayDate = new Date(gdate);
            state.currentWeekDate = new Date(gdate);
            state.currentJalali = { jy: jy, jm: jm, jd: dayNum };

            emit("onDayNumberClick", {
              gdate: gdate,
              jdate: { jy: jy, jm: jm, jd: dayNum },
              view: "mini",
            });
            emitDateChangeIfNeeded("mini", prev);

            requestRender();
          });

          grid.appendChild(cell);
        })(d);

      var total = firstWeekday + monthLength;
      var remain = 42 - total;
      for (var k = 0; k < remain; k++) {
        var trail = createEl("div", "zc-mini-day zc-is-empty", "");
        trail.setAttribute("aria-hidden", "true");
        grid.appendChild(trail);
      }

      makeRovingGrid(grid, ".zc-mini-day", 7);

      renderSidebarFilters();
    }

    /* The context handed to a view. Everything a renderer needs, passed explicitly rather than
       reached for through the closure. This is the seam the time grid already uses and the one a
       registered third-party view would receive. */
    function viewContext() {
      return {
        features: features,
        instanceId: instanceId,
        state: state,
        store: renderStore,
        emit: emit,

        hooks: hooks,
        decorateDay: decorateDay,
        bindEventItem: bindEventItem,
        showEventsModal: showEventsModal,
        goToDayViewByGDate: goToDayViewByGDate,

        getTimeGridLayout: getTimeGridLayout,
        overlapFocusEnabled: overlapFocusEnabled,
        wireOverlapHover: wireOverlapHover,

        eventsFor: function (jday) {
          return state.eventsByDay[makeDayKey(jday)] || [];
        },
        moreLabel: function (n) {
          return t("moreEvents", { count: num(n) });
        },
        dayLabel: function (jday) {
          return formatDayLabel(jday.jy, jday.jm, jday.jd);
        },
        // Handed to the time grid so its "+N more" is reachable by keyboard like every other one.
        onActivate: onActivate,
      };
    }


    // --------------------------- View registry ---------------------------
    /* A view is one object. It knows the date range it covers, which date "anchors" it (used to decide
       whether navigation actually moved), how to step forward and back, what the header should say,
       and how to draw itself.
     *
     * Collecting those into one place replaces 27 `state.view === "..."` comparisons that were spread
     * across nine functions - the dispatcher, the range calculation, the active-date calculation, next,
     * prev, the feature map, the label lookup, the fallback-view search and the dropdown's list.
     * Adding a view used to mean finding all nine. */
    var views = createRegistry("view");

    function monthRange() {
      var jy = state.currentJalali.jy;
      var jm = state.currentJalali.jm;
      var first = jal.toGDate(jy, jm, 1);
      var last = jal.toGDate(jy, jm, jal.monthLength(jy, jm));
      return { startG: first, endG: last };
    }

    function monthAnchor() {
      return jal.toGDate(state.currentJalali.jy, state.currentJalali.jm, 1);
    }

    function stepMonth(dir) {
      state.currentJalali.jm += dir;
      if (state.currentJalali.jm > 12) {
        state.currentJalali.jm = 1;
        state.currentJalali.jy++;
      } else if (state.currentJalali.jm < 1) {
        state.currentJalali.jm = 12;
        state.currentJalali.jy--;
      }
    }

    function monthTitle() {
      return formatTitle(state.currentJalali.jy, state.currentJalali.jm);
    }

    function monthFocus() {
      return jal.toGDate(state.currentJalali.jy, state.currentJalali.jm, 1);
    }

    function monthSelected() {
      return state.currentJalali;
    }

    views.register("day", {
      label: function () {
        return t("view.day");
      },
      order: 10,
      range: function () {
        return { startG: new Date(state.currentDayDate), endG: new Date(state.currentDayDate) };
      },
      anchor: function () {
        return new Date(state.currentDayDate);
      },
      step: function (dir) {
        state.currentDayDate.setDate(state.currentDayDate.getDate() + dir);
      },
      focusDate: function () {
        return new Date(state.currentDayDate);
      },
      selectedJDate: function () {
        return jal.fromGDate(state.currentDayDate);
      },
      // The day view writes its own title, because it also renders the "today" pill.
      title: null,
      render: function () {
        renderDay();
      },
    });

    views.register("week", {
      label: function () {
        return t("view.week");
      },
      order: 20,
      range: function () {
        var ws = getWeekStart(state.currentWeekDate);
        return { startG: new Date(ws), endG: greg.addDays(ws, 6) };
      },
      anchor: function () {
        return getWeekStart(state.currentWeekDate);
      },
      step: function (dir) {
        state.currentWeekDate.setDate(state.currentWeekDate.getDate() + 7 * dir);
      },
      focusDate: function () {
        return new Date(state.currentWeekDate);
      },
      selectedJDate: function () {
        return jal.fromGDate(state.currentWeekDate);
      },
      title: function () {
        var ws = getWeekStart(state.currentWeekDate);
        var a = jal.fromGDate(ws);
        var b = jal.fromGDate(greg.addDays(ws, 6));
        return a.jm === b.jm && a.jy === b.jy
          ? formatTitle(a.jy, a.jm)
          : formatTitle(a.jy, a.jm) + " - " + formatTitle(b.jy, b.jm);
      },
      render: function () {
        var ws = getWeekStart(state.currentWeekDate);
        var j = jal.fromGDate(ws);
        renderWeek(j.jy, j.jm, j.jd);
      },
    });

    views.register("month", {
      label: function () {
        return t("view.month");
      },
      order: 30,
      range: monthRange,
      anchor: monthAnchor,
      step: stepMonth,
      focusDate: monthFocus,
      selectedJDate: monthSelected,
      title: monthTitle,
      render: function () {
        renderMonth(state.currentJalali.jy, state.currentJalali.jm);
      },
    });

    views.register("year", {
      label: function () {
        return t("view.year");
      },
      order: 40,
      range: function () {
        var jy = state.currentJalali.jy;
        return { startG: jal.toGDate(jy, 1, 1), endG: jal.toGDate(jy, 12, jal.monthLength(jy, 12)) };
      },
      anchor: function () {
        return jal.toGDate(state.currentJalali.jy, 1, 1);
      },
      step: function (dir) {
        state.currentJalali.jy += dir;
      },
      focusDate: monthFocus,
      selectedJDate: monthSelected,
      title: function () {
        return num(state.currentJalali.jy);
      },
      render: function () {
        renderYear(state.currentJalali.jy);
      },
    });

    // Same date arithmetic as month - it is a month's events as a list.
    views.register("list", {
      label: function () {
        return t("view.list");
      },
      order: 50,
      range: monthRange,
      anchor: monthAnchor,
      step: stepMonth,
      focusDate: monthFocus,
      selectedJDate: monthSelected,
      title: monthTitle,
      render: function () {
        renderList(state.currentJalali.jy, state.currentJalali.jm);
      },
    });

    // Third-party views registered through Zarvan.registerView() before create() was called.
    Object.keys(EXTRA_VIEWS).forEach(function (key) {
      views.register(key, EXTRA_VIEWS[key]);
    });

    function currentViewDef() {
      return views.get(state.view) || views.get(firstEnabledView());
    }

    // --------------------------- Views ---------------------------
    /* Renders are coalesced into one animation frame, so a caller can change several things in a
       row and pay for a single render. Pass renderMode:"sync" to opt out and render immediately on
       every change, which is how the library behaved before this was introduced. */
    var renderScheduler = createScheduler(function () {
      renderBody();
    }, { sync: options.renderMode === "sync" });

    instanceStore.add(function () {
      renderScheduler.cancel();
    });

    function requestRender() {
      renderScheduler.schedule();
    }

    function flushRender() {
      renderScheduler.flush();
    }

    function renderBody() {
      emit("onRenderStart", { view: state.view });
      stopNowTick();

      var body = qs(".zc-body", container);
      body.innerHTML = "";

      if (features.sidebar && features.miniCalendar) syncMiniToActiveDate();

      emitRangeChangeIfNeeded();

      // refresh data
      var rg = getVisibleRangeG();
      var expandedForAC = expandRecurringForRange(
        state.baseEvents,
        rg.startG,
        rg.endG
      );
      updateAutocompleteTitles(filterEventsForAutocomplete(expandedForAC));
      refreshEvents();

      // filters UI (if sidebar)
      if (features.sidebar && features.filters) {
        var existingFilters = miniWrapEl && qs(".zc-filters", miniWrapEl);
        if (!existingFilters) renderSidebarFilters();
        else syncFilterUI(existingFilters);
      }

      /* One path for every view. Each branch used to repeat the same three steps - set the title,
         call the renderer, emit the pair of events - and adding a view meant adding another copy. */
      var def = currentViewDef();
      if (!def) {
        zWarn("warn.unknownView", { view: state.view });
        emit("onRenderEnd", { view: state.view });
        return;
      }

      if (def.title) {
        var titleEl = qs(".zc-title", container);
        if (titleEl) titleEl.innerText = def.title(viewContext());
      }

      def.render(viewContext());

      emit("onViewRender", { view: def.key });
      emit("onRenderEnd", { view: state.view });
    }

    // ---- Month
    function renderMonth(jy, jm) {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var weekHeader = createEl("div", "zc-month-weekdays");
      WEEKDAY_NAMES.forEach(function (name) {
        var c = createEl("div", "zc-month-weekday");
        c.innerText = name;
        weekHeader.appendChild(c);
      });
      body.appendChild(weekHeader);

      var grid = createEl("div", "zc-month-grid");
      body.appendChild(grid);

      /* How many events fit in a day cell can only be answered by measuring, and measuring needs the
         whole grid laid out. The fits are therefore collected here and run once at the end, rather
         than each cell deferring its own animation frame.
       *
         That also fixes a real failure mode: requestAnimationFrame does not run while the document is
         hidden, so in a background tab - or under a display:none ancestor, or a headless screenshot -
         month view used to render its day cells and then never fill in a single event. Layout still
         computes when hidden; only frames are suspended. */
      var pendingFits = [];

      var todayJ = jal.toJalaali(new Date());
      var monthLength = jal.monthLength(jy, jm);
      var gFirst = jal.toGregorian(jy, jm, 1);

      var firstWeekday = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay();
      firstWeekday = (firstWeekday + 1) % 7;

      for (var i = 0; i < firstWeekday; i++) {
        grid.appendChild(createEl("div", "zc-day-cell zc-is-empty"));
      }

      for (var day = 1; day <= monthLength; day++) {
        (function (dayLocal) {
          var cell = createEl("div", "zc-day-cell");
          cell.dataset.day = dayLocal;

          var gForDay = toGDateFromJ(jy, jm, dayLocal);
          var jObj = { jy: jy, jm: jm, jd: dayLocal };

          decorateDay(cell, gForDay, jObj, "month");

          var dayNumber = createEl("div", "zc-day-num");
          dayNumber.innerText = num(dayLocal);

          if (jy === todayJ.jy && jm === todayJ.jm && dayLocal === todayJ.jd) {
            dayNumber.classList.add("zc-is-today");
          }

          dayNumber.style.cursor = "pointer";
          onActivate(
            dayNumber,
            formatDayLabel(jy, jm, dayLocal),
            function (e) {
              e.stopPropagation();

              var gdate = toGDateFromJ(jy, jm, dayLocal);
              var jdate = { jy: jy, jm: jm, jd: dayLocal };

              emit("onDayNumberClick", {
                gdate: gdate,
                jdate: jdate,
                view: "month",
              });
              goToDayViewByGDate(gdate);
            }
          );

          cell.appendChild(dayNumber);

          var eventContainer = createEl("div", "zc-day-events");

          var key = jy + "-" + jm + "-" + dayLocal;
          var dayEvents = (state.eventsByDay[key] || []).slice();

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
              "zc-event zc-month-allday-pill " + typeClass(ev.type)
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
            var row = createEl("div", "zc-month-timed " + typeClass(ev.type));
            var dot = createEl("span", "zc-month-dot");
            var time = createEl("span", "zc-month-time");
            var title = createEl("span", "zc-month-title");

            var times = getTimeParts(ev);
            time.innerText = num((times.s || "").slice(0, 5));
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

          pendingFits.push(function () {
            if (!nodes.length) {
              eventContainer.innerHTML = "";
              return;
            }

            fitMonthEvents(eventContainer, nodes, function (hiddenCount) {
              var moreBtn = createEl("div", "zc-more-btn");
              moreBtn.innerText = t("moreEvents", { count: num(hiddenCount) });
              onActivate(moreBtn, null, function (e) {
                e.stopPropagation();

                var label = formatDayLabel(jy, jm, dayLocal);
                var k = jy + "-" + jm + "-" + dayLocal;

                var g = toGDateFromJ(jy, jm, dayLocal);
                var jObj2 = { jy: jy, jm: jm, jd: dayLocal };
                var evs = state.eventsByDay[k] || [];

                emit("onMoreEventsClick", {
                  date: { gdate: g, jdate: jObj2 },
                  events: evs,
                  view: "month",
                });
                if (features.moreEventsModal) {
                  showEventsModal(evs, label, { gdate: g, jdate: jObj2 });
                }
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
          grid.appendChild(createEl("div", "zc-day-cell zc-is-empty"));
        }
      }

      makeRovingGrid(grid, ".zc-day-num", 7);

      // The grid is complete, so every cell has a real height to measure against.
      pendingFits.forEach(function (fit) {
        fit();
      });
    }

    // ---- Week
    function renderWeek(jy, jm, jd) {
      var ctx = viewContext();
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      // One computed-style read for all seven columns rather than one per column.
      var metrics = TimeGrid.metrics(body);

      var weekStart = getWeekStart(toGDateFromJ(jy, jm, jd));

      // The seven days this view covers, resolved once and reused by all three rows.
      var days = [];
      for (var i = 0; i < 7; i++) {
        var d = greg.addDays(weekStart, i);
        days.push({ index: i, gdate: d, jdate: jal.fromGDate(d) });
      }

      var grid = createEl("div", "zc-week-grid");
      body.appendChild(grid);

      // ---- header row
      var headerRow = createEl("div", "zc-week-header");
      grid.appendChild(headerRow);
      headerRow.appendChild(createEl("div", "zc-week-col-head zc-is-gutter"));

      days.forEach(function (day) {
        var cell = createEl(
          "div",
          "zc-week-col-head",
          '<div class="zc-week-col-head-inner">' +
            '<div class="zc-day-name">' +
            WEEKDAY_NAMES[day.index] +
            "</div>" +
            '<div class="zc-day-num">' +
            num(day.jdate.jd) +
            "</div>" +
            "</div>"
        );

        decorateDay(cell, day.gdate, day.jdate, "week");
        if (isSameYMD(day.gdate, new Date())) cell.classList.add("zc-is-today");
        headerRow.appendChild(cell);

        var numEl = cell.querySelector(".zc-day-num");
        if (numEl) {
          numEl.style.cursor = "pointer";
          onActivate(
            numEl,
            WEEKDAY_NAMES[day.index] +
              " " +
              formatDayLabel(day.jdate.jy, day.jdate.jm, day.jdate.jd),
            function (e) {
              e.stopPropagation();
              emit("onWeekHeaderDayClick", {
                gdate: day.gdate,
                jdate: day.jdate,
                view: "week",
              });
              goToDayViewByGDate(day.gdate);
            }
          );
        }
      });

      makeRovingGrid(headerRow, ".zc-day-num", 7);

      // ---- all-day row
      if (features.allDayRow) {
        var allDayRow = createEl("div", "zc-allday-row");
        grid.appendChild(allDayRow);
        allDayRow.appendChild(createEl("div", "zc-allday-time", t("allDayRow")));

        days.forEach(function (day) {
          var cell = createEl("div", "zc-allday-cell");
          decorateDay(cell, day.gdate, day.jdate, "week");

          TimeGrid.renderAllDayInto({
            host: cell,
            ctx: ctx,
            gdate: day.gdate,
            jdate: day.jdate,
            viewName: "week",
            events: ctx.eventsFor(day.jdate),
            max: MAX_EVENTS_PER_DAY,
          });

          allDayRow.appendChild(cell);
        });

        grid.appendChild(createEl("div", "zc-allday-divider"));
      }

      // ---- timed row
      var mainRow = createEl("div", "zc-week-row");
      grid.appendChild(mainRow);
      mainRow.appendChild(
        TimeGrid.buildHourGutter("zc-week-gutter", metrics, formatHour)
      );

      days.forEach(function (day) {
        var col = createEl("div", "zc-week-col");
        // Attached first: renderColumn measures the events it places.
        mainRow.appendChild(col);
        TimeGrid.renderColumn({
          col: col,
          ctx: ctx,
          gdate: day.gdate,
          jdate: day.jdate,
          viewName: "week",
          events: ctx.eventsFor(day.jdate),
          metrics: metrics,
        });
      });

      hooks.run("viewRendered", {
        view: "week",
        body: body,
        days: days,
        metrics: metrics,
      });
    }

    // ---- Day
    function renderDay() {
      var ctx = viewContext();
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var metrics = TimeGrid.metrics(body);

      var gdate = new Date(state.currentDayDate);
      var jday = jal.fromGDate(gdate);
      var isToday = isSameYMD(gdate, new Date());

      var dayName = WEEKDAY_NAMES[weekdayIndexFromGDate(gdate)];
      var dateText =
        dayName + " - " + num(jday.jd) + " " + formatTitle(jday.jy, jday.jm);

      var titleEl = qs(".zc-title", container);
      titleEl.innerHTML = "";
      var titleText = createEl("span", "zc-day-title-text");
      titleText.innerText = dateText;
      titleEl.appendChild(titleText);
      if (isToday) {
        titleEl.appendChild(createEl("span", "zc-day-today-pill", t("today")));
      }

      var events = ctx.eventsFor(jday);

      // ---- all-day bar
      if (features.allDayBar) {
        var allDayBar = createEl("div", "zc-day-allday");
        allDayBar.appendChild(createEl("div", "zc-day-allday-label", t("allDayRow")));

        var allDayList = createEl("div", "zc-day-allday-list");
        TimeGrid.renderAllDayInto({
          host: allDayList,
          ctx: ctx,
          gdate: gdate,
          jdate: jday,
          viewName: "day",
          events: events,
          max: MAX_EVENTS_PER_DAY,
        });

        allDayBar.appendChild(allDayList);
        body.appendChild(allDayBar);
        body.appendChild(createEl("div", "zc-allday-divider"));
      }

      // ---- timed grid
      var grid = createEl("div", "zc-day-grid");
      body.appendChild(grid);

      // Column before gutter: .zc-day-grid is "1fr <gutter>", so this order puts the hours on the right.
      var col = createEl("div", "zc-day-col");
      grid.appendChild(col);
      grid.appendChild(
        TimeGrid.buildHourGutter("zc-day-gutter", metrics, formatHour)
      );

      // Rendered after attaching, because renderColumn measures the events it places.
      TimeGrid.renderColumn({
        col: col,
        ctx: ctx,
        gdate: gdate,
        jdate: jday,
        viewName: "day",
        events: events,
        metrics: metrics,
      });

      hooks.run("viewRendered", {
        view: "day",
        body: body,
        days: [{ gdate: gdate, jdate: jday }],
        metrics: metrics,
      });
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
            MONTH_NAMES[m - 1] + " " + num(jy)
          );
          mh.appendChild(mt);
          monthBox.appendChild(mh);

          if (isViewEnabled("month")) {
            mh.style.cursor = "pointer";
            onActivate(mh, null, function () {
              state.currentJalali = { jy: jy, jm: m, jd: 1 };
              setView("month", "yearHeader");
            });
          } else {
            mh.style.cursor = "default";
          }

          var wds = createEl("div", "zc-year-weekdays");
          WEEKDAY_NAMES.forEach(function (n, i) {
            wds.appendChild(createEl("div", "zc-year-wd", locale.weekdaysShort[i]));
          });
          monthBox.appendChild(wds);

          var daysGrid = createEl("div", "zc-year-days");
          monthBox.appendChild(daysGrid);

          var monthLength = jal.monthLength(jy, m);
          var gFirst = jal.toGregorian(jy, m, 1);
          var firstWeekday = new Date(
            gFirst.gy,
            gFirst.gm - 1,
            gFirst.gd
          ).getDay();
          firstWeekday = (firstWeekday + 1) % 7;

          for (var i = 0; i < firstWeekday; i++)
            daysGrid.appendChild(createEl("div", "zc-year-day zc-is-empty", ""));

          var todayJ = jal.toJalaali(new Date());

          for (var d = 1; d <= monthLength; d++)
            (function (dayNum) {
              var gdate = toGDateFromJ(jy, m, dayNum);
              var jObj = { jy: jy, jm: m, jd: dayNum };
              var key = makeDayKey(jObj);

              var cell = createEl("div", "zc-year-day");
              daysGrid.appendChild(cell);

              decorateDay(cell, gdate, jObj, "year");

              if (jy === todayJ.jy && m === todayJ.jm && dayNum === todayJ.jd)
                cell.classList.add("zc-is-today");

              cell.appendChild(
                createEl("div", "zc-year-day-num", num(dayNum))
              );

              var evs = (state.eventsByDay[key] || []).slice();
              if (evs.length) {
                var dots = createEl("div", "zc-year-dots");
                cell.appendChild(dots);

                if (evs.length <= 2) {
                  for (var k = 0; k < evs.length; k++) {
                    var type = (evs[k].type || "").trim();
                    dots.appendChild(createEl("span", "zc-year-dot " + typeClass(type)));
                  }
                } else {
                  // Was hardcoded to "+2" for every day, whatever the real count.
                  dots.appendChild(
                    createEl("span", "zc-year-more", "+" + num(evs.length))
                  );
                }

                cell.classList.add("zc-has-events");
              }

              cell.style.cursor = "pointer";
              onActivate(cell, formatDayLabel(jy, m, dayNum), function (e) {
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
            daysGrid.appendChild(createEl("div", "zc-year-day zc-is-empty", ""));

          makeRovingGrid(daysGrid, ".zc-year-day", 7);
        })(jm);
    }

    // ---- List
    function renderList(jy, jm) {
      var body = qs(".zc-body", container);
      body.innerHTML = "";

      var wrap = createEl("div", "zc-list");
      body.appendChild(wrap);

      var monthLength = jal.monthLength(jy, jm);

      for (let day = 1; day <= monthLength; day++) {
        let key = jy + "-" + jm + "-" + day;
        let dayEvents = (state.eventsByDay[key] || []).slice();
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
        let dateLabel = formatDayLabel(jy, jm, day);

        let dayBlock = createEl("div", "zc-list-day");
        wrap.appendChild(dayBlock);

        let head = createEl("div", "zc-list-day-header");
        head.appendChild(createEl("div", "zc-list-day-left", dayName));
        head.appendChild(createEl("div", "zc-list-day-right", dateLabel));

        decorateDay(head, gdate, jObj, "list");

        head.style.cursor = "pointer";
        onActivate(head, dayName + " " + dateLabel, function () {
          emit("onDayNumberClick", { gdate: gdate, jdate: jObj, view: "list" });
          goToDayViewByGDate(gdate);
        });

        dayBlock.appendChild(head);

        var list = createEl("div", "zc-list-items");
        dayBlock.appendChild(list);

        dayEvents.forEach(function (ev) {
          var item = createEl("div", "zc-list-item " + typeClass(ev.type));
          var time = createEl("div", "zc-list-time");
          var dot = createEl("div", "zc-list-dot");
          var title = createEl("div", "zc-list-title");
          title.innerText = ev.title || "";

          if (isAllDayEvent(ev)) time.innerText = t("allDayEvent");
          else {
            var times = getTimeParts(ev);
            var txt = times.s || "";
            if (times.s && times.e && times.e !== times.s) txt = times.s + " - " + times.e;
            time.innerText = num(txt);
          }

          item.appendChild(time);
          item.appendChild(dot);
          item.appendChild(title);

          item.style.cursor = "pointer";
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
          createEl("div", "zc-list-empty", t("listEmpty"))
        );
      }
    }

    // --------------------------- Navigation ---------------------------
    function setView(newView, source) {
      if (!newView) return;

      if (!isViewEnabled(newView)) {
        zWarn("warn.viewDisabled", { view: newView });
        return;
      }

      var from = state.view;
      var to = newView;

      if (from === to) {
        syncViewDropdown();
        return;
      }

      state.view = to;
      syncViewDropdown();

      emit("onViewChange", {
        from: from,
        to: to,
        source: source || "internal",
      });
      requestRender();
    }

    function goToDayViewByGDate(gdate) {
      state.currentDayDate = new Date(gdate);
      state.currentWeekDate = new Date(gdate);

      var j = jal.toJalaali(
        gdate.getFullYear(),
        gdate.getMonth() + 1,
        gdate.getDate()
      );
      state.currentJalali = { jy: j.jy, jm: j.jm, jd: j.jd };

      setView("day", "gotoDay");
    }

    /* One implementation for both directions: each view knows how to step itself. */
    function navigate(dir, eventName, source) {
      var prev = getActiveGDate();
      var def = currentViewDef();
      if (def && def.step) def.step(dir);

      emit(eventName, { view: state.view });
      emitDateChangeIfNeeded(source, prev);

      requestRender();
    }

    function goNext() {
      navigate(1, "onNext", "next");
    }

    function goPrev() {
      navigate(-1, "onPrev", "prev");
    }

    function goToday() {
      var prev = getActiveGDate();

      state.currentJalali = jal.toJalaali(new Date());
      state.currentWeekDate = new Date();
      state.currentDayDate = new Date();

      emit("onToday", null);
      emitDateChangeIfNeeded("today", prev);

      requestRender();
    }

    // --------------------------- Public API ---------------------------
    function setEvents(events) {
      state.baseEvents = normalizeEvents(Array.isArray(events) ? events : []);
      emit("onEventsSet", state.baseEvents);
      announceEvents("set", null);
      return state.baseEvents;
    }

    /* Every mutation ends here: re-derive the type colours (a new type may have appeared, or the last
       event of a type may have gone), tell listeners what happened, and schedule one render. */
    function announceEvents(kind, event) {
      renderTypeStyles();
      emit("onEventsChange", {
        type: kind,
        event: event || null,
        events: state.baseEvents,
      });
      requestRender();
    }

    function indexOfEvent(id) {
      for (var i = 0; i < state.baseEvents.length; i++) {
        if (state.baseEvents[i].id === id) return i;
      }
      return -1;
    }

    function getEventById(id) {
      var i = indexOfEvent(id);
      return i < 0 ? null : state.baseEvents[i];
    }

    /* Returns the stored event, which is the NORMALISED copy - not the object that was passed in.
       Returns null if validation rejected it, which is the same rule setEvents() follows. */
    function addEvent(event) {
      var normalised = normalizeEvents([event]);
      if (!normalised.length) return null;

      state.baseEvents = state.baseEvents.concat(normalised);
      announceEvents("add", normalised[0]);
      return normalised[0];
    }

    /* Merges a patch into an existing event and re-validates the result, so an update cannot sneak
       past the rules that setEvents() applies. A rejected patch leaves the event untouched. */
    function updateEvent(id, patch) {
      var i = indexOfEvent(id);
      if (i < 0) return null;

      var merged = Object.assign({}, state.baseEvents[i], patch || {});
      var normalised = normalizeEvents([merged]);
      if (!normalised.length) return null;

      state.baseEvents = state.baseEvents.slice();
      state.baseEvents[i] = normalised[0];
      announceEvents("update", normalised[0]);
      return normalised[0];
    }

    function removeEvent(id) {
      var i = indexOfEvent(id);
      if (i < 0) return null;

      var removed = state.baseEvents[i];
      state.baseEvents = state.baseEvents.slice();
      state.baseEvents.splice(i, 1);
      announceEvents("remove", removed);
      return removed;
    }

    function setTypeStyles(map) {
      userTypeStyles = map || {};
      renderTypeStyles();
      requestRender();
    }

    /* Moves the calendar to a date without changing which view is showing. Every anchor is updated,
       not just the one the active view reads, so switching views afterwards lands on the same date
       rather than wherever that view was last left. */
    function gotoDate(date) {
      var gdate = date instanceof Date ? new Date(date) : toGDateFromJ(date.jy, date.jm, date.jd);
      if (isNaN(gdate.getTime())) return null;

      var prev = getActiveGDate();
      var j = jal.fromGDate(gdate);

      state.currentDayDate = new Date(gdate);
      state.currentWeekDate = new Date(gdate);
      state.currentJalali = { jy: j.jy, jm: j.jm, jd: j.jd };

      emitDateChangeIfNeeded("gotoDate", prev);
      requestRender();
      return new Date(gdate);
    }

    /* Theme tokens. Bare names are namespaced, so setTheme({ "color-accent": "#e11d48" }) and
       setTheme({ "--zc-color-accent": "#e11d48" }) mean the same thing. A null value clears an
       override and lets the stylesheet's value apply again. */
    /* Inline custom properties this instance has written, so destroy() can remove its own and only
       its own. The host may have set --zc-* properties on the same element before create() ran - that
       is a documented way to theme - and clearing those would be taking away something we never set. */
    var ownedProps = Object.create(null);

    function writeProp(prop, value) {
      if (value == null) {
        container.style.removeProperty(prop);
        delete ownedProps[prop];
      } else {
        container.style.setProperty(prop, value);
        ownedProps[prop] = true;
      }
    }

    function setTheme(tokens) {
      Object.keys(tokens || {}).forEach(function (key) {
        var prop = key.indexOf("--") === 0 ? key : "--zc-" + key;
        writeProp(prop, tokens[key]);
      });
      return container.style.cssText;
    }

    /* A deliberately narrow setter. Feature flags are hot; anything structural is not, because it was
       consumed while the instance was being built. Unknown keys warn rather than failing silently. */
    var HOT_OPTIONS = ["view", "locale", "typeLabels", "typeStyles", "highlights", "events"];

    function setOption(key, value) {
      if (key === "features" || key.indexOf("features.") === 0) {
        var patch = key === "features" ? value : null;
        if (!patch) {
          patch = {};
          var path = key.slice("features.".length).split(".");
          var node = patch;
          for (var i = 0; i < path.length - 1; i++) node = node[path[i]] = {};
          node[path[path.length - 1]] = value;
        }
        /* Merged INTO the existing object rather than replacing it. Plugins and view contexts hold a
           reference to this object from construction; swapping it out would leave every one of them
           reading a stale copy, which is exactly what a feature toggle must not do. */
        var merged = mergeDeep(features, patch);
        Object.keys(merged).forEach(function (k) {
          features[k] = merged[k];
        });

        renderHeader();
        flushRender();
        return features;
      }

      switch (key) {
        case "view":
          setView(value, "api");
          return value;
        case "locale":
          api.setLocale(value);
          return value;
        case "typeLabels":
          TYPE_LABELS = value || {};
          requestRender();
          return value;
        case "typeStyles":
          setTypeStyles(value);
          return value;
        case "highlights":
          setHighlights(value);
          return value;
        case "events":
          setEvents(value);
          return value;
        default:
          zWarn("warn.optionNotHot", { key: key, hot: HOT_OPTIONS });
          return null;
      }
    }

    function setHighlights(hls) {
      state.highlights = Array.isArray(hls) ? hls : [];
      requestRender();
    }

    function destroy() {
      emit("onDestroy", { phase: "before" });

      hideModal();

      // Listeners, intervals, timers, the modal overlay and the injected <style> tags were all
      // registered when they were created, so there is no checklist to keep in sync here.
      renderStore.dispose();
      instanceStore.dispose();

      typeStyleTag = null;
      modal = null;

      container.innerHTML = "";
      container.classList.remove("zc-sidebar-open", "zc-sidebar-ready", "zc-calendar");
      container.removeAttribute("dir");
      container.removeAttribute("lang");
      delete container.dataset.zcId;

      // Only the inline custom properties this instance wrote; the host's own are left alone.
      Object.keys(ownedProps).forEach(function (prop) {
        container.style.removeProperty(prop);
      });

      // A shadow root cannot be detached once attached, so the rendering div is removed instead.
      if (shadowMount && container.parentNode) container.parentNode.removeChild(container);

      // Emitted before the table is cleared, so on("onDestroy") subscribers actually receive it.
      emit("onDestroy", { phase: "after" });

      _listeners = Object.create(null);
    }

    /* What a plugin is handed. Deliberately a curated surface rather than the whole closure: the
       hooks it attaches to, the configuration it needs to respect, and a few narrow operations. `api`
       is the object create() returns, so a plugin can add public methods to it. */
    var api = {};

    var pluginCtx = {
      hooks: hooks,
      options: options,
      features: features,
      state: state,
      store: instanceStore,
      api: api,

      emit: emit,
      on: on,
      off: off,
      warn: zWarn,
      error: zError,

      t: t,
      num: function (v) {
        return locale.num(v);
      },
      typeLabel: typeToFa,
      viewLabel: function () {
        return viewToFa(state.view);
      },
      headerTitle: function () {
        var node = qs(".zc-title", container);
        return node && node.textContent ? node.textContent.trim() : "";
      },

      getContainer: function () {
        return container;
      },
      getEvents: function () {
        return state.baseEvents;
      },
      getHighlights: function () {
        return state.highlights;
      },
      getVisibleRange: getVisibleRangeG,
      expandRecurring: expandRecurringForRange,
      applyFilters: filterEventsForCurrentView,
      requestRender: requestRender,
      refresh: flushRender,
    };

    /* Installed before the first render, so a plugin's hooks are attached by the time anything draws.
       options.plugins replaces the registered set entirely; that is the escape hatch for a consumer who
       wants none of the bundled ones. */
    var uninstallPlugins = Plugins.installAll(
      Array.isArray(options.plugins) ? options.plugins : Plugins.all(),
      pluginCtx
    );
    instanceStore.add(uninstallPlugins);

    // --------------------------- Init ---------------------------
    renderHeader();
    if (features.moreEventsModal) ensureModal();

    renderTypeStyles();
    renderOverlapFocusStyles();

    // Synchronous on purpose: create() must return a calendar that is already in the document.
    flushRender();
    emit("onInit", null);

    return Object.assign(api, {
      // ---- lifecycle ----
      destroy: destroy,

      // Renders any pending change immediately rather than waiting for the next frame.
      refresh: flushRender,

      // ---- events ----
      /* A copy, so callers cannot reorder or splice the live list behind the calendar's back. The
         event objects themselves are shared; treat them as read-only and go through updateEvent(). */
      getEvents: function () {
        return state.baseEvents.slice();
      },
      getEventById: getEventById,
      setEvents: setEvents,
      addEvent: addEvent,
      updateEvent: updateEvent,
      removeEvent: removeEvent,

      // ---- navigation ----
      getView: function () {
        return state.view;
      },
      setView: function (v) {
        setView(v, "api");
      },
      getViews: function () {
        return views.keys().filter(isViewEnabled);
      },
      getDate: function () {
        return getActiveGDate();
      },
      getJDate: function () {
        return jal.fromGDate(getActiveGDate());
      },
      gotoDate: gotoDate,
      getVisibleRange: function () {
        var r = getVisibleRangeG();
        return { startG: new Date(r.startG), endG: new Date(r.endG) };
      },

      next: goNext,
      prev: goPrev,
      today: goToday,
      // Kept from the original API; next/prev/today are the names to prefer.
      goToday: goToday,
      goNext: goNext,
      goPrev: goPrev,

      getLocale: function () {
        return locale.code;
      },

      setLocale: function (next) {
        locale = Locale.createTranslator(Locale.resolve(next));
        t = locale.t;
        WEEKDAY_NAMES = locale.weekdays;
        MONTH_NAMES = locale.months;
        applyLocaleAttributes();
        // The header is built once at construction, so it has to be rebuilt for the new language.
        renderHeader();
        flushRender();
        emit("onLocaleChange", { code: locale.code });
      },
      // ---- configuration ----
      setOption: setOption,
      setTheme: setTheme,
      setTypeStyles: setTypeStyles,
      getHighlights: function () {
        return (state.highlights || []).slice();
      },
      setHighlights: setHighlights,

      // ---- events bus ----
      on: on,
      off: off,
      emit: emit,

      // ---- dom ----
      /* The element passed to create(). In shadow mode this is the host, NOT the element the calendar
         renders into - use getRoot() for that. */
      getContainer: function () {
        return host;
      },

      // The .zc-calendar element. Identical to getContainer() unless shadow mode is on.
      getRoot: function () {
        return container;
      },

      // The shadow root, or null in the light DOM.
      getShadowRoot: function () {
        return shadowMount ? shadowMount.root : null;
      },

      // Names of the plugins installed into this instance.
      plugins: function () {
        return (Array.isArray(options.plugins) ? options.plugins : Plugins.all()).map(function (p) {
          return p.name;
        });
      },
    });
  }

  return {
    version: VERSION,

    create: create,

    /* Registers an additional view. Call before create().
     *
     *   Zarvan.registerView("agenda", {
     *     label: "دستور کار",
     *     order: 60,
     *     range:  function () { return { startG, endG }; },
     *     anchor: function () { return aDate; },
     *     step:   function (dir) { ... },
     *     title:  function (ctx) { return "..."; },   // or null to set it yourself
     *     render: function (ctx) { ... },
     *   });
     *
     * The view then appears in the switcher, participates in next/prev, and is reachable through
     * setView() - without touching library internals. */
    registerView: registerView,

    /* Registers a plugin for every calendar created afterwards.
     *
     *   Zarvan.use({
     *     name: "my-plugin",
     *     install: function (cal) {
     *       var off = cal.hooks.on("dayElement", function (e) { ... });
     *       cal.api.myMethod = function () { ... };
     *       return function uninstall() { off(); };
     *     },
     *   });
     *
     * Registering a name that already exists replaces it, so a bundled plugin can be substituted.
     * Pass options.plugins to create() to install a specific set instead. */
    use: function (plugin) {
      return Z.plugins.use(plugin);
    },

    unuse: function (name) {
      return Z.plugins.remove(name);
    },

    // Removes a view registered with registerView(). Built-in views are per-instance and unaffected.
    unregisterView: function (key) {
      var had = !!EXTRA_VIEWS[key];
      delete EXTRA_VIEWS[key];
      return had;
    },

    registeredViews: function () {
      return Object.keys(EXTRA_VIEWS);
    },

    plugins: function () {
      return Z.plugins.names();
    },

    /* Adds or replaces a locale. Pass a full locale object; see src/js/locale/fa.js for the shape.
     * Instances pick it up by code through options.locale. */
    registerLocale: function (def) {
      return Z.locale.register(def);
    },

    locales: function () {
      return Z.locale.codes();
    },

    // Unstable, and not part of the public API. Exposed so test/index.html can exercise the pure
    // layers directly. Do not depend on it.
    _internal: Z,
  };
})();

// The registry has been captured by the closure above and re-exported as Zarvan._internal, so it does
// not need to stay on the global. Leaving it there would imply it is a supported entry point.
try {
  delete window.ZarvanInternal;
} catch (e) {
  window.ZarvanInternal = undefined;
}
