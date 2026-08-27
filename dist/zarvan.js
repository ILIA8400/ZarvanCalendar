/*!
 * Zarvan Calendar v3.0.3 - a Jalali (Persian) calendar for the web.
 *
 * GENERATED FILE - do not edit. Built by build/build.ps1 (or build.sh, or build.mjs).
 *
 * This is the drop-in build. It contains the jalaali date library followed by Zarvan itself, so there
 * is one script to load and no order to get wrong:
 *
 *   <link rel="stylesheet" href="zarvan.css">
 *   <script src="zarvan.js"></script>
 *   <div id="calendar"></div>
 *   <script>Zarvan.create({ selector: "#calendar", events: [] });</script>
 *
 * Optional, in the same folder:
 *   zarvan-theme-fa.css  registers the bundled Vazir face (core CSS forces no font)
 *   zarvan.d.ts          TypeScript definitions for the Zarvan global
 *
 * Excel export additionally needs SheetJS, resolved when the button is pressed - from
 * options.deps.xlsx or window.XLSX. Without it the button warns and nothing breaks.
 *
 * Zarvan renders right-to-left and uses the Jalali calendar. Neither is configurable.
 *
 * Docs: docs/API.md      Licence: MIT
 * Bundled: jalaali-js (MIT, https://github.com/jalaali/jalaali-js)
 */

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).jalaali=e()}}((function(){return function e(n,r,t){function a(i,u){if(!r[i]){if(!n[i]){var f="function"==typeof require&&require;if(!u&&f)return f(i,!0);if(o)return o(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var c=r[i]={exports:{}};n[i][0].call(c.exports,(function(e){return a(n[i][1][e]||e)}),c,c.exports,e,n,r,t)}return r[i].exports}for(var o="function"==typeof require&&require,i=0;i<t.length;i++)a(t[i]);return a}({1:[function(e,n,r){n.exports={toJalaali:function(e,n,r){"[object Date]"===Object.prototype.toString.call(e)&&(r=e.getDate(),n=e.getMonth()+1,e=e.getFullYear());return l(c(e,n,r))},toGregorian:a,isValidJalaaliDate:function(e,n,r){return e>=-61&&e<=3177&&n>=1&&n<=12&&r>=1&&r<=i(e,n)},isLeapJalaaliYear:o,jalaaliMonthLength:i,jalCal:u,j2d:f,d2j:l,g2d:c,d2g:d,jalaaliToDateObject:g,jalaaliWeek:function(e,n,r){var t=g(e,n,r).getDay(),a=6==t?0:-(t+1),o=6+a;return{saturday:l(f(e,n,r+a)),friday:l(f(e,n,r+o))}}};var t=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];function a(e,n,r){return d(f(e,n,r))}function o(e){return 0===function(e){var n,r,a,o,i,u=t.length,f=t[0];if(e<f||e>=t[u-1])throw new Error("Invalid Jalaali year "+e);for(i=1;i<u&&(r=(n=t[i])-f,!(e<n));i+=1)f=n;o=e-f,r-o<6&&(o=o-r+33*y(r+4,33));-1===(a=p(p(o+1,33)-1,4))&&(a=4);return a}(e)}function i(e,n){return n<=6?31:n<=11||o(e)?30:29}function u(e,n){var r,a,o,i,u,f,l=t.length,c=e+621,d=-14,g=t[0];if(e<g||e>=t[l-1])throw new Error("Invalid Jalaali year "+e);for(f=1;f<l&&(a=(r=t[f])-g,!(e<r));f+=1)d=d+8*y(a,33)+y(p(a,33),4),g=r;return d=d+8*y(u=e-g,33)+y(p(u,33)+3,4),4===p(a,33)&&a-u==4&&(d+=1),i=20+d-(y(c,4)-y(3*(y(c,100)+1),4)-150),n?{gy:c,march:i}:(a-u<6&&(u=u-a+33*y(a+4,33)),-1===(o=p(p(u+1,33)-1,4))&&(o=4),{leap:o,gy:c,march:i})}function f(e,n,r){var t=u(e,!0);return c(t.gy,3,t.march)+31*(n-1)-y(n,7)*(n-7)+r-1}function l(e){var n,r=d(e).gy,t=r-621,a=u(t,!1);if((n=e-c(r,3,a.march))>=0){if(n<=185)return{jy:t,jm:1+y(n,31),jd:p(n,31)+1};n-=186}else t-=1,n+=179,1===a.leap&&(n+=1);return{jy:t,jm:7+y(n,30),jd:p(n,30)+1}}function c(e,n,r){var t=y(1461*(e+y(n-8,6)+100100),4)+y(153*p(n+9,12)+2,5)+r-34840408;return t=t-y(3*y(e+100100+y(n-8,6),100),4)+752}function d(e){var n,r,t,a;return n=(n=4*e+139361631)+4*y(3*y(4*e+183187720,146097),4)-3908,r=5*y(p(n,1461),4)+308,t=y(p(r,153),5)+1,a=p(y(r,153),12)+1,{gy:y(n,1461)-100100+y(8-a,6),gm:a,gd:t}}function g(e,n,r,t,o,i,u){var f=a(e,n,r);return new Date(f.gy,f.gm-1,f.gd,t||0,o||0,i||0,u||0)}function y(e,n){return~~(e/n)}function p(e,n){return e-~~(e/n)*n}},{}],2:[function(e,n,r){n.exports=e("./index.js")},{"./index.js":1}]},{},[2])(2)}));

/*!
 * Zarvan Calendar
 *
 * GENERATED FILE - do not edit.
 * Edit src/js/main.js or the modules under src/js/{core,calendar,data,layout,highlights}/
 * and re-run build/build.ps1 (or build.sh, or build.mjs).
 * Order is defined by build/manifest-js.txt.
 *
 * This is the INTERMEDIATE build, and it is gitignored. It needs the jalaali library loaded ahead of
 * it. What consumers use is dist/zarvan.js, which is this file with jalaali already concatenated in.
 *
 * Optional: SheetJS, for the Excel export only, resolved when the button is pressed.
 */

/* Zarvan / locale - translation lookup and the locale registry.
 *
 * A locale is a plain object:
 *
 *   {
 *     code:          "fa",
 *     weekdays:      [7 names, starting Saturday],
 *     weekdaysShort: [7 short names],
 *     months:        [12 Jalali month names],
 *     digits:        ["۰".."۹"] or null to leave numerals alone,
 *     strings:       { key: "text with {placeholders}" }
 *   }
 *
 * Missing keys fall back to the default locale, then to the key itself, so a partial locale is usable
 * and a typo is visible rather than silently blank.
 *
 * There is no `direction`. Zarvan renders right-to-left, always - that is a property of the
 * stylesheet, not of the locale, and it is not configurable. */
(function (Z) {
  "use strict";

  var locales = Object.create(null);
  var defaultCode = null;

  function register(locale) {
    if (!locale || !locale.code) throw new Error("Zarvan: a locale needs a code.");
    locales[locale.code] = locale;
    if (!defaultCode) defaultCode = locale.code;
    return locale;
  }

  function get(code) {
    return locales[code] || null;
  }

  function has(code) {
    return !!locales[code];
  }

  function codes() {
    return Object.keys(locales);
  }

  /* Accepts a code, a locale object, or a partial object with a `code` naming the one to extend:
       "fa"                                  -> the bundled Persian locale
       { code: "fa", strings: { today: … } } -> Persian with one string overridden
       { code: "xx", weekdays: [...], … }    -> a whole locale, defaults filled from the fallback

     The middle form is the one most consumers want: it is how you change the calendar's wording to
     match your own product vocabulary without shipping a locale file. */
  function resolve(input) {
    var base = locales[defaultCode] || {};
    if (!input) return base;

    if (typeof input === "string") return locales[input] || base;

    var parent = (input.code && locales[input.code]) || base;
    return {
      code: input.code || parent.code,
      weekdays: input.weekdays || parent.weekdays,
      weekdaysShort: input.weekdaysShort || parent.weekdaysShort,
      months: input.months || parent.months,
      digits: input.digits !== undefined ? input.digits : parent.digits,
      strings: Object.assign({}, parent.strings, input.strings || {}),
    };
  }

  function interpolate(template, params) {
    if (!params) return template;
    return String(template).replace(/\{(\w+)\}/g, function (whole, name) {
      return params[name] == null ? whole : params[name];
    });
  }

  /* Builds the per-instance translator. `t(key, params)` is the only thing render code needs. */
  function createTranslator(locale) {
    var fallback = locales[defaultCode] || {};

    function t(key, params) {
      var table = locale.strings || {};
      var text = table[key];
      if (text == null) text = (fallback.strings || {})[key];
      if (text == null) text = key; // visible, rather than an empty label
      return interpolate(text, params);
    }

    /* Numeral shaping. Locales without a `digits` array leave numbers as they are. */
    function num(value) {
      var s = String(value == null ? "" : value);
      var d = locale.digits;
      if (!d || !d.length) return s;
      return s.replace(/[0-9]/g, function (ch) {
        return d[Number(ch)] || ch;
      });
    }

    return {
      code: locale.code,
      weekdays: locale.weekdays || fallback.weekdays || [],
      weekdaysShort: locale.weekdaysShort || fallback.weekdaysShort || [],
      months: locale.months || fallback.months || [],
      t: t,
      num: num,
      raw: locale,
    };
  }

  Z.locale = {
    register: register,
    get: get,
    has: has,
    codes: codes,
    resolve: resolve,
    interpolate: interpolate,
    createTranslator: createTranslator,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / locale/fa - Persian. The only bundled locale, and the fallback every other one inherits
 * from.
 *
 * Zarvan is a Persian calendar: the calendar system is Jalali, the layout is right-to-left, and this
 * is the vocabulary. To change the wording without replacing the locale, pass
 * `locale: { code: "fa", strings: { … } }` to create(). */
(function (Z) {
  "use strict";

  Z.locale.register({
    code: "fa",

    // The Jalali week starts on Saturday.
    weekdays: ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"],

    /* Listed explicitly rather than derived by taking the first character: "یک‌شنبه" begins with a
       zero-width-joined "ی" and slicing it produced the wrong glyph, which the old code worked around
       with a special case for that one name. */
    weekdaysShort: ["ش", "ی", "د", "س", "چ", "پ", "ج"],

    months: [
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
    ],

    digits: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],

    strings: {
      // --- header ---
      today: "امروز",
      menu: "منو",
      prev: "قبلی",
      next: "بعدی",
      viewLabel: "نمایش",

      // --- view names ---
      "view.day": "روز",
      "view.week": "هفته",
      "view.month": "ماه",
      "view.year": "سال",
      "view.list": "لیست",

      // --- sidebar ---
      typeLabel: "نوع",
      allTypes: "همه",
      noType: "بدون نوع",
      searchLabel: "جستجو",
      searchPlaceholder: "عنوان رویداد…",
      exportExcel: "خروجی اکسل",

      // --- grid ---
      allDayRow: "تمام روز",
      allDayEvent: "تمام‌روز",
      moreEvents: "+{count} رویداد دیگر",
      listEmpty: "رویدادی برای این بازه وجود ندارد.",

      // --- modal ---
      modalTitle: "رویدادهای {date}",
      close: "بستن",

      // --- Excel export ---
      "export.sheet": "رویدادها",
      "export.fileName": "رویدادها - {view} - {title}",
      "export.row": "ردیف",
      "export.title": "عنوان",
      "export.type": "نوع",
      "export.startDate": "تاریخ شروع",
      "export.startTime": "زمان شروع",
      "export.endDate": "تاریخ پایان",
      "export.endTime": "زمان پایان",
      "export.allDay": "تمام‌روز",
      "export.view": "نمایش",
      "export.yes": "بله",
      "export.no": "خیر",

      // --- warnings, keyed by the code emitted alongside them ---
      "warn.viewDisabled": "این ویو غیرفعال است.",
      "warn.unknownView": "ویو ناشناخته است.",
      "warn.unknownColorScheme": "حالت رنگی ناشناخته است؛ روشن در نظر گرفته شد.",
      "warn.exportDisabled": "خروجی اکسل غیرفعال است.",
      "warn.xlsxMissing": "کتابخانه xlsx لود نشده است.",
      "warn.optionNotHot": "این تنظیم پس از ساخت تقویم قابل تغییر نیست.",
      "warn.invalidStart": "رویداد نامعتبر: start مشکل دارد.",
      "warn.invalidEnd": "رویداد نامعتبر: end مشکل دارد.",
      "warn.endFixed": "رویداد: end نامعتبر بود، end=start شد.",
    },
  });
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/utils - generic helpers. No DOM, no calendar knowledge, no state. */
(function (Z) {
  "use strict";

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
      if (isPlainObject(bv)) out[k] = mergeDeep(isPlainObject(av) ? av : {}, bv);
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

  // Event types come from user data, so they can never be written into a class attribute or a CSS
  // selector as-is. Strip everything outside [A-Za-z0-9_-] and namespace the result.
  function typeClass(type) {
    var t = String(type == null ? "" : type)
      .trim()
      .replace(/[^A-Za-z0-9_-]/g, "");
    return t ? "zc-type-" + t : "";
  }

  // FNV-1a. Used to derive a stable colour hue, and a stable numeric id, from a string.
  function hashStr(str) {
    str = String(str || "");
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  Z.utils = {
    isPlainObject: isPlainObject,
    mergeDeep: mergeDeep,
    clamp: clamp,
    pad2: pad2,
    norm: norm,
    typeClass: typeClass,
    hashStr: hashStr,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/dom - thin DOM helpers. No calendar knowledge. */
(function (Z) {
  "use strict";

  function resolveElement(selOrEl) {
    if (!selOrEl) return null;
    if (typeof selOrEl === "string") return document.querySelector(selOrEl);
    return selOrEl; // HTMLElement
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

  /* Did this event happen inside `el`?
   *
   * e.target is not enough once a shadow root is involved: an event from inside a shadow tree is
   * retargeted to the host as it crosses the boundary, so el.contains(e.target) reports false for a
   * click that visibly landed inside the element. composedPath() is the un-retargeted path and is what
   * every outside-click handler in the library tests against. */
  function eventHitsElement(e, el) {
    if (!el) return false;
    if (typeof e.composedPath === "function") {
      var path = e.composedPath();
      for (var i = 0; i < path.length; i++) {
        if (path[i] === el) return true;
      }
      return false;
    }
    return el.contains(e.target);
  }

  Z.dom = {
    resolveElement: resolveElement,
    eventHitsElement: eventHitsElement,
    qs: qs,
    qsa: qsa,
    createEl: createEl,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/disposable - a bag of teardown callbacks.
 *
 * Everything with a lifetime - a document-level listener, an interval, a node parked outside the
 * container, an injected <style> tag - registers here at the moment it is created. Teardown is then a
 * single dispose() call rather than a hand-maintained checklist that has to be kept in sync.
 *
 * Two stores are used per calendar instance:
 *   instance store - lives until destroy()
 *   render store   - disposed at the top of every render, so anything a render creates is released
 *                    even if the next render creates several of them
 *
 * That second store is what makes the week view's now-indicator safe: it sets up one interval per day
 * column, and the old single `nowTick` variable could only ever remember the last of the seven. */
(function (Z) {
  "use strict";

  function noop() {}

  function createDisposableStore(name) {
    var items = [];
    var disposed = false;

    /* Register a teardown function. Returns a handle that runs it early and un-registers it.
       If the store is already disposed the callback runs immediately, so a late registration can
       never outlive the store. */
    function add(fn) {
      if (typeof fn !== "function") return noop;
      if (disposed) {
        fn();
        return noop;
      }
      items.push(fn);
      return function disposeOne() {
        var i = items.indexOf(fn);
        if (i >= 0) {
          items.splice(i, 1);
          fn();
        }
      };
    }

    function addListener(target, type, handler, opts) {
      target.addEventListener(type, handler, opts);
      return add(function () {
        target.removeEventListener(type, handler, opts);
      });
    }

    function addInterval(fn, ms) {
      var id = setInterval(fn, ms);
      add(function () {
        clearInterval(id);
      });
      return id;
    }

    function addTimeout(fn, ms) {
      var id = setTimeout(fn, ms);
      add(function () {
        clearTimeout(id);
      });
      return id;
    }

    function addFrame(fn) {
      var id = requestAnimationFrame(fn);
      add(function () {
        cancelAnimationFrame(id);
      });
      return id;
    }

    /* For nodes that live outside the container (the modal overlay, injected <style> tags). Nodes
       inside the container are released when the container is emptied, so they need no registration. */
    function addNode(node) {
      return add(function () {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
    }

    /* Disposes in reverse registration order, so teardown unwinds the way setup wound up.
       One failing callback must not strand the rest, so each is isolated. */
    function dispose() {
      disposed = true;
      var errors = [];
      for (var i = items.length - 1; i >= 0; i--) {
        try {
          items[i]();
        } catch (e) {
          errors.push(e);
        }
      }
      items = [];
      if (errors.length) {
        console.error("Zarvan: " + errors.length + " error(s) while disposing " + (name || "store"), errors);
      }
    }

    /* Disposes everything but keeps the store usable. Used by the render store, which is emptied at
       the start of each render and immediately refilled by it. */
    function reset() {
      dispose();
      disposed = false;
    }

    return {
      add: add,
      addListener: addListener,
      addInterval: addInterval,
      addTimeout: addTimeout,
      addFrame: addFrame,
      addNode: addNode,
      dispose: dispose,
      reset: reset,
      get size() {
        return items.length;
      },
      get disposed() {
        return disposed;
      },
    };
  }

  Z.disposable = { createDisposableStore: createDisposableStore };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/scheduler - coalesces render requests into a single animation frame.
 *
 * Without this, a caller doing
 *
 *   cal.setEvents(list);
 *   cal.setView("week");
 *
 * pays for two complete renders and the browser paints an intermediate state nobody asked for. With
 * it, both requests collapse into one render on the next frame.
 *
 * flush() runs any pending work immediately and is what makes the batching safe to adopt: the initial
 * render during create() goes through it, so a calendar is fully in the DOM by the time create()
 * returns, and callers who need a synchronous render can reach it through cal.refresh().
 *
 * Hidden documents fall back to a timeout. requestAnimationFrame does not fire while the document is
 * hidden - a background tab, a display:none ancestor, a headless capture - so a frame-scheduled render
 * would sit there indefinitely and every change made in that state would be invisible until the page
 * became visible. A timeout still runs, so the work happens either way. */
(function (Z) {
  "use strict";

  function createScheduler(run, opts) {
    opts = opts || {};
    var sync = opts.sync === true;

    var frame = 0;
    var timer = 0;
    var running = false;
    var again = false;

    // rAF is throttled to nothing while hidden; setTimeout keeps running.
    function documentHidden() {
      return typeof document !== "undefined" && document.hidden;
    }

    function invoke() {
      // A render that triggers another render must not recurse; the second request is folded into a
      // follow-up pass instead of nesting.
      if (running) {
        again = true;
        return;
      }
      running = true;
      try {
        do {
          again = false;
          run();
        } while (again);
      } finally {
        running = false;
      }
    }

    function schedule() {
      if (sync) return invoke();
      if (frame || timer) return;

      if (documentHidden()) {
        timer = setTimeout(function () {
          timer = 0;
          invoke();
        }, 0);
        return;
      }

      frame = requestAnimationFrame(function () {
        frame = 0;
        invoke();
      });
    }

    function cancel() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      if (timer) {
        clearTimeout(timer);
        timer = 0;
      }
    }

    function flush() {
      cancel();
      invoke();
    }

    return {
      schedule: schedule,
      flush: flush,
      cancel: cancel,
      get pending() {
        return frame !== 0 || timer !== 0;
      },
    };
  }

  Z.scheduler = { createScheduler: createScheduler };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/registry - an ordered, named collection.
 *
 * Used for views today; the same shape suits locales, exporters and plugins later.
 *
 * Entries carry an `order` so a caller can present them in a stable sequence that is independent of
 * registration order - a third-party view registered at runtime should still be able to sit between
 * two built-ins. */
(function (Z) {
  "use strict";

  function createRegistry(name) {
    var entries = Object.create(null);

    function register(key, def) {
      if (!key) throw new Error("Zarvan: a " + name + " needs a key.");
      entries[key] = Object.assign({}, def, { key: key });
      return entries[key];
    }

    function get(key) {
      return entries[key] || null;
    }

    function has(key) {
      return !!entries[key];
    }

    function remove(key) {
      var had = !!entries[key];
      delete entries[key];
      return had;
    }

    function keys() {
      return values().map(function (d) {
        return d.key;
      });
    }

    function values() {
      return Object.keys(entries)
        .map(function (k) {
          return entries[k];
        })
        .sort(function (a, b) {
          var ao = a.order == null ? 100 : a.order;
          var bo = b.order == null ? 100 : b.order;
          return ao - bo || String(a.key).localeCompare(String(b.key));
        });
    }

    return {
      register: register,
      get: get,
      has: has,
      remove: remove,
      keys: keys,
      values: values,
      get size() {
        return Object.keys(entries).length;
      },
    };
  }

  Z.registry = { createRegistry: createRegistry };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/hooks - named extension points.
 *
 * Core renders the calendar and announces the moments a plugin might care about; plugins attach to
 * those moments. Nothing in core knows what is listening.
 *
 * The names below are the contract. They are few on purpose - each one is somewhere a plugin has a
 * genuine reason to decorate, and adding a hook is a deliberate decision rather than a reflex.
 *
 *   "dayElement"  { el, gdate, jdate, view }
 *       An element standing for a single day: a month cell, a week header cell, an all-day cell, a
 *       year day, a list day header, a time column. Highlighting attaches here.
 *
 *   "timeColumn"  { el, gdate, jdate, view, store }
 *       A 24-hour column in the week or day view. The now indicator and time bands attach here.
 *       `store` is the render store: anything registered on it is released at the next render.
 *
 *   "sidebar"     { el, ctx }
 *       The sidebar filter panel, once built. Extra controls attach here.
 *
 *   "viewRendered" { view, body }
 *       After a view has finished drawing. Scroll positioning attaches here.
 *
 * A throwing handler is reported and skipped; one bad plugin must not take the calendar down. */
(function (Z) {
  "use strict";

  function createHooks() {
    var map = Object.create(null);

    function on(name, fn) {
      if (typeof fn !== "function") return function () {};
      (map[name] = map[name] || []).push(fn);
      return function off() {
        var list = map[name];
        if (!list) return;
        var i = list.indexOf(fn);
        if (i >= 0) list.splice(i, 1);
      };
    }

    function run(name, payload) {
      var list = map[name];
      if (!list || !list.length) return payload;

      // Copied, so a handler that detaches itself mid-run cannot corrupt the iteration.
      list.slice().forEach(function (fn) {
        try {
          fn(payload);
        } catch (e) {
          console.error('Zarvan: hook "' + name + '" handler failed', e);
        }
      });
      return payload;
    }

    function count(name) {
      return (map[name] || []).length;
    }

    function clear() {
      map = Object.create(null);
    }

    return { on: on, run: run, count: count, clear: clear };
  }

  Z.hooks = { createHooks: createHooks };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/plugins - the plugin registry.
 *
 * A plugin is an object with a name and an install function:
 *
 *   { name: "now-indicator", install: function (cal) { ...; return function uninstall() {...}; } }
 *
 * install() receives the plugin context (hooks, features, state, translator, render store, the public
 * API object it may extend) and may return a teardown function, which runs on destroy().
 *
 * Plugins registered here are installed into every calendar created afterwards, in registration order.
 * That is what lets the bundled features - highlighting, the now indicator, Excel export - live outside
 * core without changing what a consumer gets by default: their files register themselves, and dropping
 * a file from build/manifest-js.txt drops the feature and its cost. */
(function (Z) {
  "use strict";

  var registered = [];

  function use(plugin) {
    if (!plugin || !plugin.name || typeof plugin.install !== "function") {
      throw new Error("Zarvan.use: a plugin needs a name and an install function.");
    }
    // Re-registering by name replaces, so a consumer can substitute a bundled plugin with their own.
    var i = indexOf(plugin.name);
    if (i >= 0) registered[i] = plugin;
    else registered.push(plugin);
    return plugin;
  }

  function indexOf(name) {
    for (var i = 0; i < registered.length; i++) {
      if (registered[i].name === name) return i;
    }
    return -1;
  }

  function remove(name) {
    var i = indexOf(name);
    if (i < 0) return false;
    registered.splice(i, 1);
    return true;
  }

  function all() {
    return registered.slice();
  }

  function names() {
    return registered.map(function (p) {
      return p.name;
    });
  }

  /* Installs a list of plugins into one calendar. Returns the teardown for all of them.
     An install that throws is reported and skipped rather than aborting construction. */
  function installAll(plugins, pluginCtx) {
    var teardowns = [];

    plugins.forEach(function (plugin) {
      try {
        var off = plugin.install(pluginCtx);
        if (typeof off === "function") teardowns.push(off);
      } catch (e) {
        console.error('Zarvan: plugin "' + plugin.name + '" failed to install', e);
      }
    });

    return function uninstallAll() {
      teardowns.slice().reverse().forEach(function (off) {
        try {
          off();
        } catch (e) {
          console.error("Zarvan: plugin teardown failed", e);
        }
      });
      teardowns.length = 0;
    };
  }

  Z.plugins = {
    use: use,
    remove: remove,
    all: all,
    names: names,
    installAll: installAll,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / core/shadow - optional Shadow DOM mounting.
 *
 * The default prefixed-and-scoped stylesheet already survives a hostile host (see docs/CLASS-MAP.md).
 * The one thing it cannot defend against is a host rule written with the universal selector -
 * `* { box-sizing: content-box }` beats any scoped reset, because it matches our elements directly.
 * A shadow root closes that last gap: host rules do not cross the boundary at all.
 *
 * The cost is that the host can no longer restyle internals with plain CSS. Design tokens still work,
 * because custom properties DO inherit through a shadow boundary - which is why the whole theming
 * surface was built out of them.
 *
 * Styles must be supplied, since a <link> in the document does not reach inside a shadow root:
 *   1. options.styles - CSS text, a CSSStyleSheet, or an array of either
 *   2. otherwise, the library's own stylesheet is looked up in the document and copied
 *   3. if neither works, the calendar renders unstyled and says so */
(function (Z) {
  "use strict";

  function supported() {
    return typeof Element !== "undefined" && !!Element.prototype.attachShadow;
  }

  /* Reads the library stylesheet back out of the document. cssRules throws for a cross-origin sheet
     (a CDN without CORS headers), which is exactly when a caller has to pass options.styles instead. */
  function findLibraryStyles() {
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      var node = sheet.ownerNode;
      var href = sheet.href || (node && node.getAttribute && node.getAttribute("href")) || "";
      var isOurs =
        /zarvan[^/]*\.css/i.test(href) ||
        (node && node.hasAttribute && node.hasAttribute("data-zarvan-styles"));
      if (!isOurs) continue;

      try {
        var text = "";
        for (var r = 0; r < sheet.cssRules.length; r++) text += sheet.cssRules[r].cssText + "\n";
        if (text) return text;
      } catch (e) {
        return null; // cross-origin: unreadable by design
      }
    }
    return null;
  }

  function toList(styles) {
    if (!styles) return [];
    return Array.isArray(styles) ? styles : [styles];
  }

  /* Prefers adoptedStyleSheets - one shared sheet across every instance rather than a copy of the CSS
     per calendar - and falls back to a <style> element where that is unavailable. */
  function adoptStyles(root, styles) {
    var list = toList(styles);
    if (!list.length) return false;

    var constructable = [];
    var text = "";

    list.forEach(function (item) {
      if (typeof item === "string") text += item + "\n";
      else if (item && item.cssRules) constructable.push(item);
    });

    var applied = false;

    if (constructable.length && "adoptedStyleSheets" in root) {
      root.adoptedStyleSheets = root.adoptedStyleSheets.concat(constructable);
      applied = true;
    }

    if (text) {
      if (typeof CSSStyleSheet !== "undefined" && "adoptedStyleSheets" in root) {
        try {
          var sheet = new CSSStyleSheet();
          sheet.replaceSync(text);
          root.adoptedStyleSheets = root.adoptedStyleSheets.concat([sheet]);
          return true;
        } catch (e) {
          /* replaceSync is unavailable or the text was rejected; fall through to a <style> */
        }
      }
      var el = document.createElement("style");
      el.textContent = text;
      root.appendChild(el);
      applied = true;
    }

    return applied;
  }

  /* Mounts a rendering root inside `host`. Returns the shadow root and the element the calendar should
     treat as its container - never the host itself, so the host keeps whatever layout role it had. */
  function attach(host, opts) {
    opts = opts || {};
    if (!supported()) return null;

    var root = host.shadowRoot || host.attachShadow({ mode: opts.mode || "open" });

    var styles = opts.styles;
    if (!styles) styles = findLibraryStyles();
    var styled = adoptStyles(root, styles);

    var container = document.createElement("div");
    root.appendChild(container);

    return { root: root, container: container, styled: !!styled };
  }

  Z.shadow = {
    supported: supported,
    attach: attach,
    adoptStyles: adoptStyles,
    findLibraryStyles: findLibraryStyles,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / calendar/jdate - parsing, formatting and comparison of Jalali date strings.
 *
 * Wire format: "YYYY-M-D" or "YYYY-M-DT HH:MM" (no space; e.g. "1404-09-20T09:30").
 * Pure string/number work - no Date objects, no jalaali conversion. */
(function (Z) {
  "use strict";
  var pad2 = Z.utils.pad2;

  function dayPart(str) {
    return String(str || "").split("T")[0];
  }

  function toMin(timeStr) {
    if (!timeStr) return 0;
    var p = String(timeStr).split(":").map(Number);
    return (p[0] || 0) * 60 + (p[1] || 0);
  }

  function parseJDateTime(str) {
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

  function parseJDateOnly(jStr) {
    var p = String(jStr || "")
      .split("T")[0]
      .split("-")
      .map(Number);
    return { jy: p[0] || 0, jm: p[1] || 0, jd: p[2] || 0 };
  }

  function makeDayKey(j) {
    return j.jy + "-" + j.jm + "-" + j.jd;
  }

  function cmpJ(a, b) {
    if (a.jy !== b.jy) return a.jy - b.jy;
    if (a.jm !== b.jm) return a.jm - b.jm;
    return a.jd - b.jd;
  }

  function jToNum(j) {
    return (j.jy || 0) * 10000 + (j.jm || 0) * 100 + (j.jd || 0);
  }

  // Sortable integer for a full datetime string. Wide enough that no field can carry into the next.
  function jdtSortKey(str) {
    var p = parseJDateTime(str);
    return p.jy * 100000000 + p.jm * 1000000 + p.jd * 10000 + p.hh * 100 + p.mm;
  }

  Z.jdate = {
    dayPart: dayPart,
    toMin: toMin,
    parseJDateTime: parseJDateTime,
    formatJDT: formatJDT,
    parseDayKey: parseDayKey,
    parseJDateOnly: parseJDateOnly,
    makeDayKey: makeDayKey,
    cmpJ: cmpJ,
    jToNum: jToNum,
    jdtSortKey: jdtSortKey,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / calendar/gregorian - plain Date helpers, independent of any calendar system. */
(function (Z) {
  "use strict";

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

  // Saturday = 0 ... Friday = 6. The Jalali week starts on Saturday; JS getDay() starts on Sunday.
  function weekdayIndexFromGDate(gdate) {
    return (gdate.getDay() + 1) % 7;
  }

  function getWeekStart(date) {
    var temp = new Date(date);
    var dayOfWeek = weekdayIndexFromGDate(temp);
    var weekStart = new Date(temp);
    weekStart.setDate(temp.getDate() - dayOfWeek);
    return weekStart;
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function diffDays(a, b) {
    return Math.floor((gDateStart(a) - gDateStart(b)) / 86400000);
  }

  Z.gregorian = {
    gDateStart: gDateStart,
    isSameYMD: isSameYMD,
    minuteOfDay: minuteOfDay,
    weekdayIndexFromGDate: weekdayIndexFromGDate,
    getWeekStart: getWeekStart,
    addDays: addDays,
    diffDays: diffDays,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / calendar/jalali - THE ONLY module that talks to the jalaali library.
 *
 * Everything else in the codebase goes through here. Swapping in another calendar system means
 * providing another module with this same shape; nothing above this layer names `jalaali`. */
(function (Z) {
  "use strict";

  function lib() {
    if (typeof jalaali === "undefined") {
      throw new Error("Zarvan: the jalaali library is not loaded.");
    }
    return jalaali;
  }

  function toJalaali(gy, gm, gd) {
    return gd === undefined ? lib().toJalaali(gy) : lib().toJalaali(gy, gm, gd);
  }

  function fromGDate(g) {
    return lib().toJalaali(g.getFullYear(), g.getMonth() + 1, g.getDate());
  }

  function toGregorian(jy, jm, jd) {
    return lib().toGregorian(jy, jm, jd);
  }

  function toGDate(jy, jm, jd) {
    var g = lib().toGregorian(jy, jm, jd);
    return new Date(g.gy, g.gm - 1, g.gd);
  }

  function monthLength(jy, jm) {
    return lib().jalaaliMonthLength(jy, jm);
  }

  function isValidJDateOnly(jy, jm, jd) {
    if (!jy || jm < 1 || jm > 12) return false;
    var ml;
    try {
      ml = monthLength(jy, jm);
    } catch (e) {
      return false;
    }
    return jd >= 1 && jd <= ml;
  }

  function isValidTime(hh, mm) {
    return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
  }

  // Accepts "YYYY-M-D" or "YYYY-M-DTHH:MM". Returns {ok, allDay, reason?}.
  function isValidJDTString(str) {
    str = String(str || "").trim();
    if (!str) return { ok: false, reason: "empty" };

    var parts = str.split("T");
    var d = (parts[0] || "").split("-").map(Number);
    var jy = d[0],
      jm = d[1],
      jd = d[2];

    if (!isValidJDateOnly(jy, jm, jd))
      return { ok: false, reason: "bad_date", jy: jy, jm: jm, jd: jd };

    if (parts.length === 1) return { ok: true, allDay: true };

    var t = (parts[1] || "").slice(0, 5).split(":").map(Number);
    var hh = t[0],
      mm = t[1];

    if (!isValidTime(hh, mm)) return { ok: false, reason: "bad_time", hh: hh, mm: mm };

    return { ok: true, allDay: false, hh: hh, mm: mm };
  }

  Z.jalali = {
    toJalaali: toJalaali,
    fromGDate: fromGDate,
    toGregorian: toGregorian,
    toGDate: toGDate,
    monthLength: monthLength,
    isValidJDateOnly: isValidJDateOnly,
    isValidTime: isValidTime,
    isValidJDTString: isValidJDTString,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / layout/overlap - "cascade" layout for timed events, plus the conflict graph.
 *
 * Pure: intervals in, positions out. No DOM, no instance state.
 * Input items:  { startMin, endMin, ... }
 * Output items: the same objects plus { stackIndex, offsetPct, widthPct, colCount, colSpan, colIndex } */
(function (Z) {
  "use strict";

  function overlapsMin(a, b) {
    return a.startMin < b.endMin && b.startMin < a.endMin;
  }

  /* Split a day into clusters of transitively overlapping events.
   *
   * A cluster is the granularity at which a layout decision has to be made: clusters never overlap
   * each other in time, so each one can be positioned independently without the choice leaking into
   * the rest of the day. Sorting by start means a running max-end is enough to find the boundaries. */
  function clusterByOverlap(dayEvents) {
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

    return clusters;
  }

  /* How many events are live at the busiest instant.
   *
   * For intervals this is exactly the number of stack levels the cascade will use and the number of
   * columns a column layout will produce, so it is what a caller needs in order to decide between
   * them BEFORE laying anything out. */
  function peakConcurrency(events) {
    var edges = [];
    events.forEach(function (e) {
      edges.push({ at: e.startMin, delta: 1 });
      edges.push({ at: e.endMin, delta: -1 });
    });

    // An end sorts before a start at the same instant: back-to-back events do not conflict, which is
    // the same boundary rule overlapsMin uses.
    edges.sort(function (a, b) {
      return a.at - b.at || a.delta - b.delta;
    });

    var live = 0;
    var peak = 0;
    edges.forEach(function (e) {
      live += e.delta;
      if (live > peak) peak = live;
    });
    return peak;
  }

  function layoutDayEventsOverlap(dayEvents, opts) {
    opts = opts || {};
    var STEP = opts.step == null ? 14 : opts.step;
    var MIN_W = opts.minWidth == null ? 42 : opts.minWidth;

    var events = dayEvents.slice().sort(function (a, b) {
      return (
        a.startMin - b.startMin || b.endMin - b.startMin - (a.endMin - a.startMin)
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

  /* Annotates each item with the set of items it collides with, so the renderer can dim the rest of a
   * cluster on hover. `idPrefix` scopes the generated ids to one instance and one day. */
  function buildOverlapGraph(laidOut, idPrefix) {
    var adj = Object.create(null);

    for (var i = 0; i < laidOut.length; i++) {
      laidOut[i]._ovId = idPrefix + ":" + i;
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

  Z.layoutOverlap = {
    overlapsMin: overlapsMin,
    clusterByOverlap: clusterByOverlap,
    peakConcurrency: peakConcurrency,
    layoutDayEventsOverlap: layoutDayEventsOverlap,
    buildOverlapGraph: buildOverlapGraph,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / layout/columns - Google-Calendar-style column packing for timed events.
 *
 * Pure: intervals in, positions out. Events are grouped into clusters of transitively overlapping
 * items; within a cluster each event takes the first free column, then widens to span any adjacent
 * columns that have no conflict at its time range. */
(function (Z) {
  "use strict";
  var overlapsMin = Z.layoutOverlap.overlapsMin;

  function layoutDayEventsColumns(dayEvents) {
    // Clustering is shared with the cascade rather than kept as a second copy here: both layouts
    // need the same "which events form one pile" answer, and the time-grid asks for it directly so
    // it can choose between them per cluster.
    var clusters = Z.layoutOverlap.clusterByOverlap(dayEvents);

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

      c.forEach(function (e) {
        var span = 1;
        for (var nextCol = e.colIndex + 1; nextCol < colCount; nextCol++) {
          var hasConflict = (columns[nextCol] || []).some(function (x) {
            return overlapsMin(e, x);
          });
          if (hasConflict) break;
          span++;
        }
        e.colSpan = span;
      });
    });

    return positioned;
  }

  Z.layoutColumns = { layoutDayEventsColumns: layoutDayEventsColumns };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / data/events - questions you can ask about a single event. Pure. */
(function (Z) {
  "use strict";
  var jd = Z.jdate;
  var jal = Z.jalali;
  var g = Z.gregorian;
  var clamp = Z.utils.clamp;

  function isMultiDay(ev) {
    var s = jd.dayPart(ev.start);
    var e = jd.dayPart(ev.end || ev.start);
    return !!(s && e && s !== e);
  }

  function isAllDayEvent(ev) {
    if (ev.allDay) return true;
    if (ev.start && ev.start.indexOf("T") === -1) return true;
    if (isMultiDay(ev) && !ev.forceTimed) return true;
    return false;
  }

  function getTimeParts(ev) {
    var s = (String(ev.start).split("T")[1] || "00:00").slice(0, 5);
    var e = (String(ev.end || ev.start).split("T")[1] || "00:00").slice(0, 5);
    return { s: s, e: e };
  }

  /* Absolute Gregorian span of an event. All-day events collapse to midnight boundaries; timed events
   * get a minimum 15-minute duration so a zero-length event still has a clickable box. */
  function evToGRange(ev) {
    var s = jd.parseJDateTime(ev.start);
    var e = jd.parseJDateTime(ev.end || ev.start);

    var sG = jal.toGDate(s.jy, s.jm, s.jd);
    var eG = jal.toGDate(e.jy, e.jm, e.jd);

    if (isAllDayEvent(ev)) {
      return { start: g.gDateStart(sG), end: g.gDateStart(eG), allDay: true };
    }

    sG.setHours(s.hh || 0, s.mm || 0, 0, 0);
    eG.setHours(e.hh || 0, e.mm || 0, 0, 0);

    if (eG <= sG) eG = new Date(sG.getTime() + 15 * 60 * 1000);

    return { start: sG, end: eG, allDay: false };
  }

  function eventInVisibleRange(ev, rangeStartG, rangeEndG) {
    var r = evToGRange(ev);

    var rs = g.gDateStart(rangeStartG).getTime();
    var reExclusive = g.gDateStart(rangeEndG).getTime() + 86400000;

    if (r.allDay) {
      var rEndExclusive = r.end.getTime() + 86400000;
      return r.start.getTime() < reExclusive && rEndExclusive > rs;
    }

    return r.start.getTime() < reExclusive && r.end.getTime() > rs;
  }

  /* Minute span an event occupies *within one given day*, clipping at midnight on either side so a
   * multi-day event renders as a full bar on its interior days. */
  function getTimedIntervalForDay(ev, dayJ) {
    var s = jd.parseJDateTime(ev.start);
    var e = jd.parseJDateTime(ev.end || ev.start);

    var startMin = s.hh * 60 + s.mm;
    var endMin = e.hh * 60 + e.mm;

    if (jd.cmpJ({ jy: s.jy, jm: s.jm, jd: s.jd }, dayJ) < 0) startMin = 0;
    if (jd.cmpJ({ jy: e.jy, jm: e.jm, jd: e.jd }, dayJ) > 0) endMin = 1440;

    if (endMin <= startMin) endMin = startMin + 15;

    return {
      startMin: clamp(startMin, 0, 1440),
      endMin: clamp(endMin, 0, 1440),
    };
  }

  Z.dataEvents = {
    isMultiDay: isMultiDay,
    isAllDayEvent: isAllDayEvent,
    getTimeParts: getTimeParts,
    evToGRange: evToGRange,
    eventInVisibleRange: eventInVisibleRange,
    getTimedIntervalForDay: getTimedIntervalForDay,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / data/normalize - validate and canonicalise incoming event objects.
 *
 * Pure apart from the `onWarn` callback, which is how invalid input is reported outward.
 *
 * onWarn receives a stable CODE, not a sentence. Turning that code into text is the caller's job, so
 * this module carries no language and a consumer can switch on the code rather than matching prose. */
(function (Z) {
  "use strict";
  var jd = Z.jdate;
  var jal = Z.jalali;
  var g = Z.gregorian;
  var ev_ = Z.dataEvents;

  var DEFAULTS = {
    enabled: true,
    requireNumericId: false,
    onInvalid: "drop", // "drop" | "keep"
    autoFix: true, // repair end < start rather than rejecting
  };

  function withDefaults(validation) {
    return Object.assign({}, DEFAULTS, validation || {});
  }

  /* Rewrites ev.end when it lands at or before ev.start.
   *
   * This compares the raw authored values rather than going through evToGRange(). evToGRange applies
   * its own 15-minute floor for rendering purposes, so a backwards end came back already "fixed" and
   * the comparison here could never fire -- autoFix silently did nothing, and the bad end string
   * survived into getEvents() and the Excel export. */
  function ensureEndNotBeforeStart(ev) {
    try {
      var s = jd.parseJDateTime(ev.start);
      var e = jd.parseJDateTime(ev.end || ev.start);

      var sG = jal.toGDate(s.jy, s.jm, s.jd);
      var eG = jal.toGDate(e.jy, e.jm, e.jd);

      if (ev_.isAllDayEvent(ev)) {
        if (g.gDateStart(eG).getTime() < g.gDateStart(sG).getTime()) ev.end = ev.start;
        return ev;
      }

      sG.setHours(s.hh || 0, s.mm || 0, 0, 0);
      eG.setHours(e.hh || 0, e.mm || 0, 0, 0);

      // Strictly before, not "at or before". An event whose end equals its start is a legitimate
      // point in time, not malformed - the renderer already gives it a 15-minute box. Rewriting the
      // authored value there would surprise callers and change every exported row for such events.
      if (eG.getTime() >= sG.getTime()) return ev;

      var fixed = new Date(sG.getTime() + 15 * 60 * 1000);
      var j2 = jal.fromGDate(fixed);
      ev.end = jd.formatJDT(j2.jy, j2.jm, j2.jd, fixed.getHours(), fixed.getMinutes(), false);
    } catch (err) {
      /* leave the event as authored; validation has already flagged what it can */
    }
    return ev;
  }

  function coerceId(ev, validation) {
    if (!validation.requireNumericId) return ev;

    var id = ev.id;
    if (typeof id === "number" && isFinite(id)) return ev;

    if (typeof id === "string" && /^\d+$/.test(id.trim())) {
      ev.id = Number(id.trim());
      return ev;
    }

    var s = String(id != null ? id : (ev.title || "") + "|" + (ev.start || ""));
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    ev.id = h;
    return ev;
  }

  function validateAndNormalizeEvent(ev, idx, validation, onWarn) {
    var warn = onWarn || function () {};
    ev = Object.assign({}, ev);

    var vs = jal.isValidJDTString(ev.start);
    if (!vs.ok) {
      warn("warn.invalidStart", { index: idx, ev: ev, reason: vs.reason });
      return { ok: false, reason: vs.reason };
    }

    if (!ev.end) ev.end = ev.start;
    var ve = jal.isValidJDTString(ev.end);
    if (!ve.ok) {
      if (validation.autoFix) {
        warn("warn.endFixed", { index: idx, ev: ev, reason: ve.reason });
        ev.end = ev.start;
      } else {
        warn("warn.invalidEnd", { index: idx, ev: ev, reason: ve.reason });
        return { ok: false, reason: ve.reason };
      }
    }

    if (vs.allDay && ev.allDay == null) ev.allDay = true;
    if (validation.autoFix) ensureEndNotBeforeStart(ev);
    coerceId(ev, validation);
    if (ev.title == null) ev.title = "";

    return { ok: true, ev: ev };
  }

  /* onInvalid:
   *   "drop" - the event is discarded (default)
   *   "keep" - the event is passed through as authored, with only the safe end=start defaulting
   *
   * The previous implementation filtered nulls twice, so "keep" silently behaved like "drop".
   * Rejected events are now carried through explicitly rather than being resurrected from a null. */
  function normalizeEvents(list, validation, onWarn) {
    var v = withDefaults(validation);
    var out = [];

    (Array.isArray(list) ? list : []).forEach(function (ev, idx) {
      if (!v.enabled) {
        var raw = Object.assign({}, ev);
        if (!raw.end) raw.end = raw.start;
        out.push(raw);
        return;
      }

      var res = validateAndNormalizeEvent(ev, idx, v, onWarn);
      if (res.ok) {
        out.push(res.ev);
        return;
      }

      if (v.onInvalid === "keep") {
        var kept = Object.assign({}, ev);
        if (!kept.end) kept.end = kept.start;
        kept._invalid = res.reason || true;
        out.push(kept);
      }
    });

    return out;
  }

  Z.dataNormalize = {
    DEFAULTS: DEFAULTS,
    withDefaults: withDefaults,
    ensureEndNotBeforeStart: ensureEndNotBeforeStart,
    coerceId: coerceId,
    validateAndNormalizeEvent: validateAndNormalizeEvent,
    normalizeEvents: normalizeEvents,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / data/recurrence - expand repeating events into concrete occurrences for a date range.
 *
 * ev.repeat = {
 *   freq:      "daily" | "weekly" | "monthly"
 *   interval:  every N days/weeks/months (default 1)
 *   until:     Jalali date string, inclusive
 *   count:     max occurrences produced *within the queried range*
 *   byWeekday: [0..6], Saturday = 0 (weekly only)
 * }
 *
 * Pure. Non-repeating events are passed through when they intersect the range. */
(function (Z) {
  "use strict";
  var jd = Z.jdate;
  var jal = Z.jalali;
  var g = Z.gregorian;
  var ev_ = Z.dataEvents;

  function occursOn(cur, gStart, s, r, freq, interval) {
    if (freq === "daily") {
      return g.diffDays(cur, gStart) % interval === 0;
    }

    if (freq === "weekly") {
      var dayIndex = g.weekdayIndexFromGDate(cur);
      var by = Array.isArray(r.byWeekday) && r.byWeekday.length
        ? r.byWeekday
        : [g.weekdayIndexFromGDate(gStart)];
      if (by.indexOf(dayIndex) === -1) return false;
      return Math.floor(g.diffDays(cur, gStart) / 7) % interval === 0;
    }

    if (freq === "monthly") {
      var jCur = jal.fromGDate(cur);
      if (jCur.jd !== s.jd) return false;
      var monthsA = s.jy * 12 + (s.jm - 1);
      var monthsB = jCur.jy * 12 + (jCur.jm - 1);
      return (monthsB - monthsA) % interval === 0;
    }

    return false;
  }

  function expandRecurringForRange(events, rangeStartG, rangeEndG) {
    var out = [];
    var rangeStart = g.gDateStart(rangeStartG);
    var rangeEnd = g.gDateStart(rangeEndG);

    (events || []).forEach(function (ev) {
      if (!ev.repeat) {
        if (ev_.eventInVisibleRange(ev, rangeStartG, rangeEndG)) out.push(ev);
        return;
      }

      var r = ev.repeat || {};
      var freq = r.freq || "daily";
      var interval = Math.max(1, Number(r.interval || 1));

      var s = jd.parseJDateTime(ev.start);
      var e = jd.parseJDateTime(ev.end || ev.start);

      var gStart = jal.toGDate(s.jy, s.jm, s.jd);
      gStart.setHours(s.hh || 0, s.mm || 0, 0, 0);

      var gEnd = jal.toGDate(e.jy, e.jm, e.jd);
      gEnd.setHours(e.hh || 0, e.mm || 0, 0, 0);

      var isAllDay = ev_.isAllDayEvent(ev);
      var durMs = isAllDay ? 0 : Math.max(15 * 60 * 1000, gEnd - gStart);

      var untilG = null;
      if (r.until) {
        var u = jd.parseJDateTime(r.until);
        untilG = g.gDateStart(jal.toGDate(u.jy, u.jm, u.jd));
      }

      var maxCount = r.count ? Number(r.count) : null;

      var cur = new Date(rangeStart);
      var produced = 0;

      while (cur <= rangeEnd) {
        if (g.gDateStart(cur) < g.gDateStart(gStart)) {
          cur.setDate(cur.getDate() + 1);
          continue;
        }
        if (untilG && g.gDateStart(cur) > untilG) break;

        if (occursOn(cur, gStart, s, r, freq, interval)) {
          var jOcc = jal.fromGDate(cur);
          var occStartStr = jd.formatJDT(jOcc.jy, jOcc.jm, jOcc.jd, s.hh, s.mm, isAllDay);
          var occEndStr;

          if (isAllDay) {
            occEndStr = jd.formatJDT(jOcc.jy, jOcc.jm, jOcc.jd, 0, 0, true);
          } else {
            var gOccStart = new Date(cur);
            gOccStart.setHours(s.hh, s.mm, 0, 0);
            var gOccEnd = new Date(gOccStart.getTime() + durMs);
            var jEndOcc = jal.fromGDate(gOccEnd);
            occEndStr = jd.formatJDT(
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

  Z.dataRecurrence = {
    occursOn: occursOn,
    expandRecurringForRange: expandRecurringForRange,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / data/organize - bucket events into a { "jy-jm-jd": [event, ...] } map.
 *
 * A multi-day event appears under every day it spans. Pure. */
(function (Z) {
  "use strict";
  var jd = Z.jdate;
  var jal = Z.jalali;

  function organizeEvents(events) {
    var map = {};

    (events || []).forEach(function (ev) {
      var sD = jd.dayPart(ev.start).split("-").map(Number);
      var eD = jd.dayPart(ev.end || ev.start).split("-").map(Number);

      var startG = jal.toGregorian(sD[0], sD[1], sD[2]);
      var endG = jal.toGregorian(eD[0], eD[1], eD[2]);

      var cur = new Date(startG.gy, startG.gm - 1, startG.gd);
      var end = new Date(endG.gy, endG.gm - 1, endG.gd);

      while (cur <= end) {
        var key = jd.makeDayKey(jal.fromGDate(cur));
        if (!map[key]) map[key] = [];
        map[key].push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });

    return map;
  }

  Z.dataOrganize = { organizeEvents: organizeEvents };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / data/filter - type and free-text filtering. Pure. */
(function (Z) {
  "use strict";
  var norm = Z.utils.norm;

  function matchesType(ev, type) {
    if (!type || type === "__all__") return true;
    return (ev.type || "") === type;
  }

  function filterEvents(events, filterState) {
    var fs = filterState || {};
    var q = norm(fs.q);

    return (events || []).filter(function (ev) {
      if (!matchesType(ev, fs.type)) return false;
      if (q && !norm(ev.title).includes(q)) return false;
      return true;
    });
  }

  /* The autocomplete list is filtered by type only: it should still suggest titles that the current
   * search text has not matched yet, otherwise it can only ever confirm what you already typed. */
  function filterEventsByTypeOnly(events, filterState) {
    var fs = filterState || {};
    return (events || []).filter(function (ev) {
      return matchesType(ev, fs.type);
    });
  }

  Z.dataFilter = {
    matchesType: matchesType,
    filterEvents: filterEvents,
    filterEventsByTypeOnly: filterEventsByTypeOnly,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / data/source - the event source: an array, or a function asked for one range at a time.
 *
 * `events: [...]` keeps every event in memory forever, which is fine for a few hundred and hopeless
 * for a few years of history. `events: fn` inverts that: the calendar says which range it is showing
 * and the consumer returns just those events.
 *
 *   events: async ({ startG, endG }) => fetchFromServer(startG, endG)
 *
 * No DOM in here, and no calendar knowledge beyond a Gregorian range. What this module owns is the
 * three things that make an async source correct rather than merely working:
 *
 *   1. Ordering. Navigating quickly fires several loads; they can come back in any order. Every
 *      request carries a generation, and a result whose generation is no longer current is dropped.
 *      Without it, paging forward twice quickly can leave the first page's events on screen.
 *   2. Duplication. Two requests for the same range - a re-render, a view that shares a range -
 *      share one promise rather than hitting the network twice.
 *   3. Repetition. Ranges already fetched are remembered, so paging back and forth does not refetch.
 *      The cache is capped, because a user paging through a year should not accumulate one.
 *
 * The cache is keyed on the exact range, deliberately: it answers "have I asked this before", not
 * "do I have these events somewhere", which would mean interval-union bookkeeping and a merge whose
 * de-duplication rules nobody could predict. A miss costs one request; a wrong merge costs trust. */
(function (Z) {
  "use strict";
  var g = Z.gregorian;

  var DEFAULT_CACHE_LIMIT = 12;

  function rangeKey(startG, endG) {
    return g.gDateStart(startG).getTime() + ":" + g.gDateStart(endG).getTime();
  }

  function createEventSource(opts) {
    opts = opts || {};

    var loader = null; // the consumer's function, or null while the source is a plain array
    var limit = opts.cacheLimit > 0 ? opts.cacheLimit : DEFAULT_CACHE_LIMIT;

    /* Bumped by every request. A result carrying an older generation lost the race and is thrown
       away - which is the whole reason a fast click through three months cannot end up showing the
       events of whichever request happened to be slowest. */
    var generation = 0;
    var appliedKey = null; // the range whose events are currently applied
    var inflight = {}; // key -> promise, so concurrent asks for one range share a fetch
    var cache = []; // [{ key, events }], oldest first
    var disposed = false;
    var busy = 0;

    function cacheGet(key) {
      for (var i = 0; i < cache.length; i++) {
        if (cache[i].key === key) return cache[i];
      }
      return null;
    }

    function cachePut(key, events) {
      var hit = cacheGet(key);
      if (hit) {
        hit.events = events;
        return;
      }
      cache.push({ key: key, events: events });
      while (cache.length > limit) cache.shift();
    }

    function apply(events, range, key, fromCache) {
      appliedKey = key;
      if (opts.onApply) opts.onApply(events, range, { cached: !!fromCache });
    }

    function settle(range) {
      busy = Math.max(0, busy - 1);
      if (busy === 0 && opts.onIdle) opts.onIdle(range);
    }

    /* Ask for a range.
     *
     * Returns true when something was applied or a load was started, false when the answer was
     * already on screen. `force` skips the cache, which is what refetch() and every local mutation
     * need - the cache remembers answers, and a mutation makes the old answer wrong. */
    function request(range, force) {
      if (disposed || !loader) return false;
      if (!range || !range.startG || !range.endG) return false;

      var key = rangeKey(range.startG, range.endG);

      // Already showing this range and nothing has invalidated it.
      if (!force && key === appliedKey) return false;

      var mine = ++generation;

      if (!force) {
        var hit = cacheGet(key);
        if (hit) {
          apply(hit.events, range, key, true);
          return true;
        }
      }

      if (opts.onStart) opts.onStart(range);
      busy++;

      var pending = inflight[key];

      if (!pending || force) {
        /* Promise.resolve wraps whatever came back, so a function that returns a plain array is
           handled by the same path as one that returns a promise - and always asynchronously, so a
           source can never re-enter a render that is still running. */
        pending = Promise.resolve()
          .then(function () {
            return loader(range);
          })
          .then(function (events) {
            return Array.isArray(events) ? events : [];
          });
        inflight[key] = pending;
      }

      pending.then(
        function (events) {
          delete inflight[key];
          if (disposed) return;

          // Cache even a superseded result: it was a real answer for a real range.
          cachePut(key, events);

          if (mine !== generation) {
            settle(range);
            return; // a newer request has taken over; this one is history
          }

          apply(events, range, key, false);
          if (opts.onLoad) opts.onLoad(events, range);
          settle(range);
        },
        function (err) {
          delete inflight[key];
          if (disposed) return;

          // A failed range is not cached, so the next visit tries again.
          if (mine === generation && opts.onError) opts.onError(err, range);
          settle(range);
        }
      );

      return true;
    }

    return {
      /** Swap the source. A function turns lazy loading on; anything else turns it off. */
      setLoader: function (fn) {
        loader = typeof fn === "function" ? fn : null;
        cache.length = 0;
        appliedKey = null;
        inflight = {};
        generation++;
        return !!loader;
      },

      isLazy: function () {
        return !!loader;
      },

      request: request,

      /* Forget remembered answers WITHOUT re-asking for the one on screen.
       *
       * This is what a local add, update or remove needs. Those edits make every cached answer
       * wrong, so the cache has to go - but clearing `appliedKey` too would make the very next
       * render reload the current range, and the range that comes back is the server's, which does
       * not have the edit in it yet. The edit would appear to undo itself a frame after it was made.
       *
       * So: future navigation gets fresh data, the visible range keeps the edit, and a consumer who
       * wants the server's version now asks for it with refetchEvents(). */
      invalidate: function () {
        cache.length = 0;
      },

      /** True while at least one load is outstanding. */
      isBusy: function () {
        return busy > 0;
      },

      dispose: function () {
        disposed = true;
        cache.length = 0;
        inflight = {};
        loader = null;
      },
    };
  }

  Z.dataSource = {
    rangeKey: rangeKey,
    createEventSource: createEventSource,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});

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

  /* ---- Choosing a layout per cluster ----
   *
   * The cascade fans a pile of events sideways: each one is inset a little further from the right and
   * drawn over the one below, so a covered event shows only the strip that sticks out. That strip is
   * doing two jobs at once - it is the whole click target AND everything the reader can see of the
   * title - and it was a flat 14% of the column, which in week view is about 17px. Four events deep,
   * every one of them but the last was a sliver of one glyph that had to be hit exactly.
   *
   * Two changes. The step is now chosen in PIXELS from the measured column, so the strip does not
   * shrink just because the window did. And when a cluster is so deep that the strips would stop
   * being usable targets, that cluster drops out of the cascade and is laid out in columns instead -
   * side by side, nothing covered, nothing to hunt for. Shallow piles keep the compact cascade.
   *
   * The decision is per cluster, not per day: one crowded morning does not flatten the rest of the
   * day, because clusters never overlap each other in time. */
  var CASCADE_STEP_PX = 26; // the strip each covered event aims to leave exposed
  var CASCADE_MIN_PEEK_PX = 22; // narrower than this and a strip stops being worth aiming at
  var CASCADE_MIN_TOP_PX = 56; // whatever happens, the topmost card stays this readable

  function cascadeStepPx(depth, columnWidth) {
    if (depth < 2) return CASCADE_STEP_PX;
    return Math.min(
      CASCADE_STEP_PX,
      (columnWidth - CASCADE_MIN_TOP_PX) / (depth - 1)
    );
  }

  function layoutCluster(cluster, columnWidth) {
    var depth = overlap.peakConcurrency(cluster);
    var step = cascadeStepPx(depth, columnWidth);

    if (depth > 1 && step < CASCADE_MIN_PEEK_PX) {
      return columns.layoutDayEventsColumns(cluster).map(function (it) {
        it.layout = "columns";
        return it;
      });
    }

    /* The cascade still works in percentages - that is what keeps it fluid when the column resizes
       between renders - so the pixel budget is converted on the way in. */
    return overlap
      .layoutDayEventsOverlap(cluster, {
        step: (step / columnWidth) * 100,
        minWidth: (CASCADE_MIN_TOP_PX / columnWidth) * 100,
      })
      .map(function (it) {
        it.layout = "cascade";
        return it;
      });
  }

  function layoutIntervals(items, mode, idPrefix, columnWidth) {
    if (mode !== "overlap") return columns.layoutDayEventsColumns(items);

    var laid = [];
    if (columnWidth > 0) {
      overlap.clusterByOverlap(items).forEach(function (cluster) {
        laid = laid.concat(layoutCluster(cluster, columnWidth));
      });
    } else {
      /* No usable measurement - a detached or display:none render, or a caller that never had a
         column. Fall back to the original whole-day cascade rather than dividing by zero. */
      laid = overlap.layoutDayEventsOverlap(items);
    }

    overlap.buildOverlapGraph(laid, idPrefix);
    return laid;
  }

  function placeEvent(div, item, mode, m, columnWidth) {
    m = m || metrics(null);
    div.style.top = item.startMin * m.pxPerMin + "px";
    div.style.height =
      Math.max(MIN_HEIGHT, (item.endMin - item.startMin) * m.pxPerMin) + "px";

    // The cluster's own choice wins over the view's mode, because in overlap mode a cluster too deep
    // to cascade fairly is laid out in columns instead.
    var lay = item.layout || (mode === "overlap" ? "cascade" : "columns");

    if (lay === "cascade") {
      div.style.width = "calc(" + item.widthPct + "% - " + GAP + "px)";
      div.style.right = "calc(" + item.offsetPct + "% + " + GAP / 2 + "px)";
      div.style.zIndex = 10 + (item.stackIndex || 0);
    } else {
      var unit = 100 / item.colCount;
      div.style.width = "calc(" + unit * item.colSpan + "% - " + GAP + "px)";
      div.style.right = "calc(" + item.colIndex * unit + "% + " + GAP / 2 + "px)";

      /* Side by side keeps every event visible and easy to hit, but four of them in a week column is
         about 23px each - wide enough to click, nowhere near wide enough to read. So each card
         carries the geometry of the whole column, and the stylesheet floats the focused card's title
         across all of it: pulled back out to the column's right edge, and as wide as the column.
         It can safely cover the cards beside it because the label takes no pointer events - they
         stay hoverable underneath, which is what lets the pointer walk along the row. */
      if (columnWidth > 0) {
        div.classList.add("zc-ov-fanned");
        div.style.setProperty("--zc-ov-label-w", columnWidth - GAP + "px");
        div.style.setProperty(
          "--zc-ov-label-r",
          -((columnWidth * item.colIndex * unit) / 100) + "px"
        );
      }
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

    /* Measured, not assumed: how wide the column actually is decides whether a pile of events can
       cascade with strips worth aiming at or has to go side by side. One forced layout per column
       (seven per week render), in the same class of cost as the density pass below. */
    var colWidth = col.offsetWidth;
    var laid = layoutIntervals(
      toIntervals(timed, jday),
      mode,
      ctx.instanceId + ":" + jdate.makeDayKey(jday),
      colWidth
    );

    var divs = [];

    laid.forEach(function (item) {
      var ev = item.ev;
      var div = createEl("div", "zc-event " + typeClass(ev.type));
      div.innerText = ev.title;
      div.title = ev.title;
      // Read back by the focused card's floating label, which cannot use the text node itself
      // because the card clips it.
      div.dataset.zcLabel = ev.title;

      placeEvent(div, item, mode, m, colWidth);

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

/* Zarvan / ui/dropdown - the select-like control used by both the header view switcher and the
 * sidebar type filter.
 *
 * These shipped as two near-identical implementations that differed only in a class prefix, a data
 * attribute, whether they marked an active item, and whether they emitted events. Every behavioural
 * fix therefore had to be made twice, and in practice was not.
 *
 * Knows nothing about calendars: it renders a labelled box, opens a menu of items on demand, and
 * reports the chosen value.
 *
 * It is a listbox, not a <select>: the box carries role="button" with aria-expanded, the menu carries
 * role="listbox" and the items role="option". The box was already a tab stop (tabIndex = 0) but had no
 * key handling at all, so keyboard users could focus the view switcher and then do nothing with it. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var eventHitsElement = Z.dom.eventHitsElement;

  /* Inlined so the caret works offline and takes its colour from the stylesheet, same reasoning as
   * the header chevron in main.js. Built as the same chevron shape rotated 90deg, so the two glyphs
   * read as one icon family instead of a triangle next to an arrow. */
  var CARET_SVG =
    '<svg viewBox="0 0 12 8" width="12" height="8" fill="none" aria-hidden="true" ' +
    'focusable="false" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M6 4.6L1.4 0L0 1.4L6 7.4L12 1.4L10.6 0L6 4.6Z" fill="currentColor"/></svg>';

  function createDropdown(opts) {
    var prefix = opts.prefix;
    var onSelect = opts.onSelect || function () {};
    var onOpen = opts.onOpen || function () {};
    var onClose = opts.onClose || function () {};

    var el = createEl("div", prefix);
    var selected = createEl("div", prefix + "-selected");
    selected.tabIndex = 0;
    selected.setAttribute("role", "button");
    selected.setAttribute("aria-haspopup", "listbox");
    selected.setAttribute("aria-expanded", "false");
    if (opts.label != null) selected.setAttribute("aria-label", opts.label);

    if (opts.label != null) {
      selected.appendChild(createEl("div", prefix + "-label", opts.label));
    }
    var valueEl = createEl("div", prefix + "-value", opts.value || "");
    selected.appendChild(valueEl);
    selected.appendChild(createEl("div", prefix + "-caret", opts.caret || CARET_SVG));

    var menu = createEl("div", prefix + "-menu");
    menu.setAttribute("role", "listbox");

    /* Rebuilt on every open rather than kept in sync: both callers derive their items from state that
       changes underneath (available event types, enabled views), and an open is rare enough that
       rebuilding is cheaper than tracking. */
    function buildMenu() {
      menu.innerHTML = "";
      (opts.items ? opts.items() : []).forEach(function (it) {
        var node = createEl("div", prefix + "-item", it.label);
        node.dataset.value = it.value;
        node.setAttribute("role", "option");
        node.setAttribute("aria-selected", it.active ? "true" : "false");
        node.tabIndex = -1;
        if (it.active) node.classList.add("zc-is-active");
        menu.appendChild(node);
      });
    }

    function itemNodes() {
      return Array.prototype.slice.call(
        menu.querySelectorAll("." + prefix + "-item")
      );
    }

    /* Roving focus inside the open menu.
     *
     * The first move is an entry, not a step: opening with Enter or ArrowDown lands ON the current
     * selection rather than one past it. Only once something inside the menu already has focus does
     * `step` apply. Both ends wrap. */
    function moveFocus(step) {
      var items = itemNodes();
      if (!items.length) return;

      var current = items.indexOf(document.activeElement);

      if (current < 0) {
        var active = items.findIndex(function (n) {
          return n.classList.contains("zc-is-active");
        });
        items[active < 0 ? (step > 0 ? 0 : items.length - 1) : active].focus();
        return;
      }

      var next = current + step;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      items[next].focus();
    }

    function choose(item) {
      if (!item) return;
      close("select");
      selected.focus();
      onSelect(item.dataset.value, item);
    }

    function isOpen() {
      return el.classList.contains("zc-is-open");
    }

    function open() {
      if (isOpen()) return;
      buildMenu();
      el.classList.add("zc-is-open");
      selected.setAttribute("aria-expanded", "true");
      onOpen();
    }

    function close(reason) {
      if (!isOpen()) return;
      el.classList.remove("zc-is-open");
      selected.setAttribute("aria-expanded", "false");
      onClose({ reason: reason || "outside" });
    }

    function toggle() {
      if (isOpen()) close("toggle");
      else open();
    }

    /* Focus moved by script counts as keyboard focus to :focus-visible. Because pointerdown calls
       preventDefault - which is what stops the browser doing its own, pointer-flavoured focus - the
       focus() below inherited the previous modality and lit the keyboard ring on a plain mouse
       click. The attribute records that this focus came from a pointer; the stylesheet skips the
       ring while it is set, and the first key press clears it so keyboard users still get one. */
    function markPointerFocus() {
      selected.setAttribute("data-zc-pointer-focus", "");
    }

    function clearPointerFocus() {
      selected.removeAttribute("data-zc-pointer-focus");
    }

    // pointerdown rather than click: the menu has to win the race against the outside-click handler,
    // and preventDefault keeps focus from moving off the control on mousedown.
    selected.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
      markPointerFocus();
      selected.focus();
    });

    selected.addEventListener("keydown", clearPointerFocus);
    selected.addEventListener("blur", clearPointerFocus);

    menu.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = e.target.closest("." + prefix + "-item");
      if (!item) return;
      close("select");
      onSelect(item.dataset.value, item);
    });

    selected.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle();
        if (isOpen()) moveFocus(1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen()) open();
        moveFocus(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        close("escape");
      }
    });

    menu.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        moveFocus(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        choose(e.target.closest("." + prefix + "-item"));
      } else if (e.key === "Escape" || e.key === "Tab") {
        // Tab closes rather than trapping: the menu is a convenience, not a mode.
        if (e.key === "Escape") e.preventDefault();
        close(e.key === "Escape" ? "escape" : "tab");
        if (e.key === "Escape") selected.focus();
      }
    });

    el.appendChild(selected);
    el.appendChild(menu);

    /* Each dropdown owns its outside-click listener and closes over its own element. The previous
       code shared one listener behind a flag and captured the first element it ever saw, so once the
       header was re-rendered the handler was testing a node no longer in the document. */
    var disposeOutside = function () {};
    if (opts.store) {
      disposeOutside = opts.store.addListener(
        document,
        "pointerdown",
        function (e) {
          if (eventHitsElement(e, el)) return;
          close("outside");
        },
        true
      );
    }

    return {
      el: el,
      valueEl: valueEl,
      setValue: function (text) {
        valueEl.innerText = text == null ? "" : text;
      },
      getValue: function () {
        return valueEl.innerText;
      },
      open: open,
      close: close,
      toggle: toggle,
      isOpen: isOpen,
      dispose: function () {
        disposeOutside();
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  Z.uiDropdown = { createDropdown: createDropdown };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / ui/autocomplete - the suggestion list attached to the search box.
 *
 * Owns only the popup. The caller decides what the candidate list is and what selecting one means.
 *
 * The popup is a listbox owned by the caller's input, so the items are never focused themselves: the
 * input keeps focus and `aria-activedescendant` points at the highlighted row. `move()` and
 * `confirm()` are what the caller wires its arrow and Enter keys to - without them the suggestions
 * could only ever be reached with a mouse. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var eventHitsElement = Z.dom.eventHitsElement;

  var seq = 0;

  function createAutocomplete(opts) {
    var onSelect = opts.onSelect || function () {};
    var max = opts.max == null ? 30 : opts.max;

    var el = createEl("div", "zc-ac zc-hidden");
    var idBase = "zc-ac-" + ++seq + "-";
    el.id = idBase + "list";
    el.setAttribute("role", "listbox");

    // Index of the highlighted row, or -1 for "none"; the input keeps focus throughout.
    var active = -1;

    function items() {
      return Array.prototype.slice.call(el.querySelectorAll(".zc-ac-item"));
    }

    function isOpen() {
      return !el.classList.contains("zc-hidden");
    }

    function syncActive() {
      var list = items();
      list.forEach(function (node, i) {
        var on = i === active;
        node.classList.toggle("zc-is-active", on);
        node.setAttribute("aria-selected", on ? "true" : "false");
      });

      if (opts.input) {
        var current = active >= 0 && list[active];
        if (current) opts.input.setAttribute("aria-activedescendant", current.id);
        else opts.input.removeAttribute("aria-activedescendant");
      }

      var node = list[active];
      if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
    }

    function hide() {
      el.classList.add("zc-hidden");
      active = -1;
      if (opts.input) {
        opts.input.setAttribute("aria-expanded", "false");
        opts.input.removeAttribute("aria-activedescendant");
      }
    }

    function show(list) {
      el.innerHTML = "";
      active = -1;
      list = list || [];
      if (!list.length) return hide();

      list.slice(0, max).forEach(function (text, i) {
        var item = createEl("div", "zc-ac-item");
        item.innerText = text;
        item.dataset.value = text;
        item.id = idBase + i;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        el.appendChild(item);
      });
      el.classList.remove("zc-hidden");
      if (opts.input) opts.input.setAttribute("aria-expanded", "true");
    }

    /* Wraps at both ends, and steps off the list back to "nothing highlighted" so the user can get
       their own typed text back without closing the popup. */
    function move(step) {
      if (!isOpen()) return false;
      var count = items().length;
      if (!count) return false;

      active += step;
      if (active < -1) active = count - 1;
      if (active >= count) active = -1;
      syncActive();
      return true;
    }

    // Reports the highlighted suggestion, if there is one. Returns whether it handled the key.
    function confirm() {
      var node = items()[active];
      if (!isOpen() || !node) return false;
      hide();
      onSelect(node.dataset.value || "");
      return true;
    }

    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = e.target.closest(".zc-ac-item");
      if (!item) return;
      hide();
      onSelect(item.dataset.value || "");
    });

    var disposeOutside = function () {};
    if (opts.store) {
      disposeOutside = opts.store.addListener(
        document,
        "pointerdown",
        function (e) {
          if (eventHitsElement(e, el)) return;
          if (opts.anchor && eventHitsElement(e, opts.anchor)) return;
          hide();
        },
        true
      );
    }

    if (opts.input) {
      opts.input.setAttribute("role", "combobox");
      opts.input.setAttribute("aria-autocomplete", "list");
      opts.input.setAttribute("aria-expanded", "false");
      opts.input.setAttribute("aria-controls", el.id);
    }

    return {
      el: el,
      show: show,
      hide: hide,
      move: move,
      confirm: confirm,
      isOpen: isOpen,
      dispose: function () {
        disposeOutside();
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  Z.uiAutocomplete = { createAutocomplete: createAutocomplete };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / ui/modal - the overlay used by the "+N more" affordance.
 *
 * Owns the overlay, the header with its close button, and the scrolling body. What goes *in* the body
 * is the caller's business: the modal takes finished nodes, so it carries no knowledge of events.
 *
 * The overlay is appended to <body> rather than to the calendar, so that a host with `overflow:hidden`
 * or a transformed ancestor cannot clip it. That is also why it is registered with a disposable store
 * and stamped with the instance id.
 *
 * It behaves as a modal dialog rather than just looking like one: role="dialog" with aria-modal, focus
 * moves into it on open and back to the opener on close, Tab cycles inside it, and Escape closes it.
 * Without any of that it was a visual overlay the keyboard walked straight past. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;

  function createModal(opts) {
    opts = opts || {};
    var onClose = opts.onClose || function () {};

    var overlay = createEl("div", "zc-modal-overlay zc-hidden");
    if (opts.instanceId) overlay.dataset.zcId = opts.instanceId;

    // Unique per instance so two calendars on one page do not both claim the same labelledby target.
    var titleId = "zc-modal-title-" + (opts.instanceId || "x");

    var modal = createEl("div", "zc-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", titleId);
    modal.tabIndex = -1;

    var header = createEl("div", "zc-modal-header");
    var titleEl = createEl("span", "zc-modal-title");
    titleEl.id = titleId;
    var closeBtn = createEl("button", "zc-modal-close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", opts.closeLabel || "Close");

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    var body = createEl("div", "zc-modal-body");
    var list = createEl("div", "zc-modal-events");
    body.appendChild(list);

    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);

    function isOpen() {
      return !overlay.classList.contains("zc-hidden");
    }

    var FOCUSABLE =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
      'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    function focusables() {
      return Array.prototype.slice.call(modal.querySelectorAll(FOCUSABLE)).filter(
        function (el) {
          return el.offsetWidth > 0 || el.offsetHeight > 0;
        }
      );
    }

    // Whatever had focus when the modal opened, so it can be handed back on close.
    var opener = null;

    /* Only reports a close when something was actually open. The old code emitted onModalClose on
       every destroy() and on every close attempt, so listeners saw closes for a modal that had never
       been shown. */
    function hide(reason) {
      if (!isOpen()) return;
      overlay.classList.add("zc-hidden");

      /* Focus goes back to the control that opened the modal. Guarded because that control may have
         been re-rendered - or removed - while the modal was up. */
      if (opener && opener.isConnected && typeof opener.focus === "function") {
        opener.focus();
      }
      opener = null;

      onClose({ reason: reason || "close" });
    }

    function show(title, nodes) {
      opener = document.activeElement;

      titleEl.innerText = title == null ? "" : title;
      list.innerHTML = "";
      (nodes || []).forEach(function (n) {
        list.appendChild(n);
      });
      overlay.classList.remove("zc-hidden");

      // The first row if there is one, otherwise the dialog itself, which is why it takes tabindex.
      var first = focusables()[0];
      (first || modal).focus();
    }

    closeBtn.addEventListener("click", function () {
      hide("button");
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hide("backdrop");
    });

    /* Escape closes, Tab cycles. Bound on the overlay rather than the document: the listener then
       lives and dies with the node, and it cannot fire for a modal belonging to another instance. */
    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        hide("escape");
        return;
      }
      if (e.key !== "Tab") return;

      var items = focusables();
      if (!items.length) {
        e.preventDefault();
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;

      if (e.shiftKey && (active === first || active === modal)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* <body> by default, so a host with overflow:hidden or a transformed ancestor cannot clip it.
       In shadow mode the caller passes the shadow root instead, because a node in the light DOM would
       not be reached by the stylesheet adopted inside the shadow tree. */
    (opts.mountTo || document.body).appendChild(overlay);
    if (opts.store) opts.store.addNode(overlay);

    return {
      el: overlay,
      body: list,
      show: show,
      hide: hide,
      isOpen: isOpen,
    };
  }

  Z.uiModal = { createModal: createModal };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / highlights/rules - does a highlight rule apply to a given day? Pure.
 *
 * rule = {
 *   views: ["month","week",...]            restrict to these views
 *   when:  { weekday:[0..6], jDates:[...], jRange:{start,end} }   (also accepted at the top level)
 *   day:   { bg, className }               full-day background
 *   time:  { start:"09:00", end:"17:00", bg, className }          time band (week/day only)
 * } */
(function (Z) {
  "use strict";
  var jd = Z.jdate;
  var g = Z.gregorian;
  var pad2 = Z.utils.pad2;

  function dayMatchesRule(rule, gdate, jdateObj, viewName) {
    if (!rule) return false;

    var views = rule.views;
    if (Array.isArray(views) && views.length && views.indexOf(viewName) === -1) return false;

    var when = rule.when || rule;

    var w = when.weekday || when.weekdays;
    if (Array.isArray(w) && w.length) {
      if (w.indexOf(g.weekdayIndexFromGDate(gdate)) === -1) return false;
    }

    var jDates = when.jDates || when.dates;
    if (Array.isArray(jDates) && jDates.length) {
      var key = jdateObj.jy + "-" + pad2(jdateObj.jm) + "-" + pad2(jdateObj.jd);
      var hit = jDates.some(function (x) {
        var jj = jd.parseJDateOnly(x);
        return jj.jy + "-" + pad2(jj.jm) + "-" + pad2(jj.jd) === key;
      });
      if (!hit) return false;
    }

    var r = when.jRange || when.range;
    if (r && (r.start || r.end)) {
      var a = r.start ? jd.jToNum(jd.parseJDateOnly(r.start)) : -Infinity;
      var b = r.end ? jd.jToNum(jd.parseJDateOnly(r.end)) : Infinity;
      var x = jd.jToNum(jdateObj);
      if (x < a || x > b) return false;
    }

    return true;
  }

  Z.highlightRules = { dayMatchesRule: dayMatchesRule };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / plugins/highlights - paints day backgrounds and time bands from a list of rules.
 *
 * Attaches to "dayElement" (any element standing for a day) and "timeColumn" (a 24-hour column).
 * Core has no idea it exists: it announces those two moments and this draws into them.
 *
 * Rule shape is documented in highlights/rules.js. Rules come from options.highlights and can be
 * replaced at runtime with cal.setHighlights(). */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var clamp = Z.utils.clamp;
  var toMin = Z.jdate.toMin;
  var matches = Z.highlightRules.dayMatchesRule;

  var DAY_MINUTES = 24 * 60;

  function dayStyleFor(rules, gdate, jdate, view) {
    var style = null;
    // Last matching rule wins, so a later, more specific rule can override an earlier blanket one.
    (rules || []).forEach(function (rule) {
      if (!matches(rule, gdate, jdate, view)) return;
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

  function paintDay(el, style) {
    if (!el || !style) return;
    el.classList.add("zc-has-day-hl");
    if (style.bg) el.style.setProperty("--zc-hl-bg", style.bg);
    if (style.className) el.classList.add(style.className);
  }

  function paintBands(rules, col, gdate, jdate, view, metrics) {
    // Minutes map to pixels through --zc-hour-height, the same scale the grid itself is drawn on.
    var scale = metrics && metrics.pxPerMin > 0 ? metrics.pxPerMin : 1;

    (rules || []).forEach(function (rule) {
      if (!matches(rule, gdate, jdate, view)) return;

      var band = rule.time;
      if (!band && (rule.timeStart || rule.timeEnd)) {
        band = { start: rule.timeStart, end: rule.timeEnd, bg: rule.bg };
      }
      if (!band || !band.start || !band.end) return;

      var startMin = clamp(toMin(band.start), 0, DAY_MINUTES);
      var endMin = clamp(toMin(band.end), 0, DAY_MINUTES);
      if (endMin <= startMin) return;

      var block = createEl("div", "zc-time-highlight " + (band.className || ""));
      block.style.top = startMin * scale + "px";
      block.style.height = (endMin - startMin) * scale + "px";
      block.style.background = band.bg || "rgba(26,115,232,0.08)";
      col.appendChild(block);
    });
  }

  Z.plugins.use({
    name: "highlights",

    install: function (cal) {
      var offDay = cal.hooks.on("dayElement", function (e) {
        if (!cal.features.dayHighlights) return;
        paintDay(e.el, dayStyleFor(cal.getHighlights(), e.gdate, e.jdate, e.view));
      });

      var offBands = cal.hooks.on("timeColumn", function (e) {
        if (!cal.features.timeHighlights) return;
        paintBands(cal.getHighlights(), e.el, e.gdate, e.jdate, e.view, e.metrics);
      });

      return function uninstall() {
        offDay();
        offBands();
      };
    },
  });

  Z.pluginHighlights = { dayStyleFor: dayStyleFor, paintDay: paintDay, paintBands: paintBands };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / plugins/nowIndicator - the red "current time" line, and optional auto-scroll to it.
 *
 * Attaches to "timeColumn" (draw the line on today's column) and "viewRendered" (scroll to it).
 *
 * The interval is registered on the RENDER store, not the instance store: the week view mounts one of
 * these per day column, and the old code kept the id in a single variable inside that seven-iteration
 * loop, so six of the seven leaked on every re-render. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var clamp = Z.utils.clamp;
  var greg = Z.gregorian;

  var DAY_MINUTES = 24 * 60;
  var TICK_MS = 30000;

  // Falls back to one pixel a minute, which is what --zc-hour-height defaults to.
  function pxPerMin(metrics) {
    return metrics && metrics.pxPerMin > 0 ? metrics.pxPerMin : 1;
  }

  function mount(col, store, metrics) {
    var scale = pxPerMin(metrics);
    var line = createEl("div", "zc-now-line");
    line.appendChild(createEl("div", "zc-now-dot"));
    col.appendChild(line);

    function update() {
      line.style.top =
        clamp(greg.minuteOfDay(new Date()), 0, DAY_MINUTES) * scale + "px";
    }

    update();
    store.addInterval(update, TICK_MS);
    return line;
  }

  function scrollTo(scroller, metrics) {
    var scale = pxPerMin(metrics);
    var top = clamp(greg.minuteOfDay(new Date()), 0, DAY_MINUTES) * scale;
    // Two hours of context above the line rather than pinning it to the very top.
    scroller.scrollTop = clamp(top - 120 * scale, 0, scroller.scrollHeight);
  }

  Z.plugins.use({
    name: "now-indicator",

    install: function (cal) {
      var offColumn = cal.hooks.on("timeColumn", function (e) {
        if (!cal.features.nowLine) return;
        if (!greg.isSameYMD(e.gdate, new Date())) return;
        mount(e.el, e.store, e.metrics);
      });

      var offRendered = cal.hooks.on("viewRendered", function (e) {
        if (!cal.features.autoScrollToNow) return;
        if (!e.body || !e.days) return;

        var showsToday = e.days.some(function (day) {
          return greg.isSameYMD(day.gdate, new Date());
        });
        if (showsToday) scrollTo(e.body, e.metrics);
      });

      return function uninstall() {
        offColumn();
        offRendered();
      };
    },
  });

  Z.pluginNowIndicator = { mount: mount, scrollTo: scrollTo };
})(this.ZarvanInternal = this.ZarvanInternal || {});

/* Zarvan / plugins/excelExport - "Export to Excel" for the visible range.
 *
 * Attaches to "sidebar" to add its button, and adds cal.exportToExcel() to the public API.
 *
 * SheetJS is not a dependency of this library. It is looked up when the button is pressed, not when
 * the page loads, and it can be supplied three ways:
 *
 *   1. options.deps.xlsx  - an explicit reference, which is what a bundler user should pass
 *   2. window.XLSX        - the global, for the <script> tag case
 *   3. not at all         - the button reports warn.xlsxMissing and nothing breaks
 *
 * That is the whole reason this is a plugin: an 881 KB dependency for one optional button should not be
 * something every consumer pays for. Dropping this file from build/manifest-js.txt removes the button,
 * the API method and the dependency together. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var norm = Z.utils.norm;
  var jdtSortKey = Z.jdate.jdtSortKey;
  var evUtil = Z.dataEvents;

  var COLUMN_KEYS = [
    "export.row",
    "export.title",
    "export.type",
    "export.startDate",
    "export.startTime",
    "export.endDate",
    "export.endTime",
    "export.allDay",
    "export.view",
  ];

  var COLUMN_WIDTHS = [6, 32, 14, 14, 10, 14, 10, 10, 8];

  function resolveXlsx(cal) {
    var injected = cal.options && cal.options.deps && cal.options.deps.xlsx;
    if (injected) return injected;
    return typeof XLSX !== "undefined" ? XLSX : null;
  }

  /* Events intersecting the visible range, recurrences expanded, current filters applied, in the order
     a reader would expect: chronological, then by title. */
  function collectRows(cal) {
    var range = cal.getVisibleRange();
    var events = cal
      .expandRecurring(cal.getEvents(), range.startG, range.endG)
      .filter(function (ev) {
        return evUtil.eventInVisibleRange(ev, range.startG, range.endG);
      });

    events = cal.applyFilters(events);

    events.sort(function (a, b) {
      return (
        jdtSortKey(a.start) - jdtSortKey(b.start) ||
        norm(a.title).localeCompare(norm(b.title))
      );
    });

    return events;
  }

  function buildSheetData(cal, events) {
    var t = cal.t;
    var num = cal.num;
    var viewName = cal.viewLabel();

    var aoa = [
      COLUMN_KEYS.map(function (key) {
        return t(key);
      }),
    ];

    events.forEach(function (ev, idx) {
      var startParts = String(ev.start || "").split("T");
      var endParts = String(ev.end || ev.start || "").split("T");
      var allDay = evUtil.isAllDayEvent(ev);

      aoa.push([
        num(idx + 1),
        String(ev.title || ""),
        cal.typeLabel(ev.type),
        num(startParts[0] || ""),
        allDay ? "" : num((startParts[1] || "").slice(0, 5)),
        num(endParts[0] || ""),
        allDay ? "" : num((endParts[1] || "").slice(0, 5)),
        allDay ? t("export.yes") : t("export.no"),
        viewName,
      ]);
    });

    return aoa;
  }

  function run(cal) {
    if (!cal.features.exportExcel) {
      cal.warn("warn.exportDisabled", { view: cal.state.view });
      return;
    }

    var xlsx = resolveXlsx(cal);
    if (!xlsx) {
      cal.emit("onExportError", new Error("XLSX not loaded"));
      cal.warn("warn.xlsxMissing", { view: cal.state.view });
      return;
    }

    try {
      var events = collectRows(cal);

      // Characters Windows forbids in a filename, replaced rather than dropped so words stay separated.
      var fileName =
        cal
          .t("export.fileName", { view: cal.viewLabel(), title: cal.headerTitle() })
          .replace(/[\\/:*?"<>|]/g, " ")
          .trim() + ".xlsx";

      cal.emit("onExportStart", { view: cal.state.view, fileName: fileName });

      var sheet = xlsx.utils.aoa_to_sheet(buildSheetData(cal, events));
      sheet["!cols"] = COLUMN_WIDTHS.map(function (w) {
        return { wch: w };
      });
      sheet["!autofilter"] = { ref: "A1:I1" };

      var book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, cal.t("export.sheet"));
      book.Workbook = book.Workbook || {};
      book.Workbook.Views = [{ RTL: true }];

      xlsx.writeFile(book, fileName);

      cal.emit("onExportEnd", {
        view: cal.state.view,
        fileName: fileName,
        count: events.length,
      });
    } catch (err) {
      cal.emit("onExportError", err);
      cal.error(err);
      console.error(err);
    }
  }

  Z.plugins.use({
    name: "excel-export",

    install: function (cal) {
      // Public API method, available whether or not the sidebar button is rendered.
      cal.api.exportToExcel = function () {
        run(cal);
      };

      var offSidebar = cal.hooks.on("sidebar", function (e) {
        if (!cal.features.exportExcel) return;

        // Sits with the search box when there is one, so the panel keeps its existing shape.
        var host = e.el.querySelector(".zc-search") || e.el;
        var button = createEl("button", "zc-export-btn", cal.t("exportExcel"));
        button.type = "button";
        button.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          run(cal);
        });
        host.appendChild(button);
      });

      return function uninstall() {
        offSidebar();
        delete cal.api.exportToExcel;
      };
    },
  });

  Z.pluginExcelExport = { collectRows: collectRows, buildSheetData: buildSheetData, run: run };
})(this.ZarvanInternal = this.ZarvanInternal || {});

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
  var VERSION = "3.0.3";

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
    expandRecurringForRange = Z.dataRecurrence.expandRecurringForRange,
    createEventSource = Z.dataSource.createEventSource;

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

    /* A function means lazy loading, and there is nothing to normalise yet: the first load is fired
       by the first render, which is the first moment there is a visible range to ask about. */
    state.baseEvents =
      typeof options.events === "function"
        ? []
        : normalizeEvents(options.events || []);

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

    /* ---- Colour scheme ----
     *
     * `colorScheme: "light" | "dark" | "auto"`, defaulting to light so an existing calendar looks
     * exactly as it did. Dark is a re-valuing of the colour tokens under one class - see
     * src/css/parts/theme-dark.css - so nothing here knows what any of the colours are.
     *
     * "auto" is resolved in JS rather than by a `@media (prefers-color-scheme: dark)` block in the
     * stylesheet. Either would work; this way the dark palette is written once and the media block
     * cannot drift out of step with the class it duplicates.
     *
     * The class is stamped on the container and, separately, on the modal overlay, because the
     * overlay is appended to <body> rather than to the calendar: it is not a descendant, so it
     * inherits none of the container's custom properties. */
    var COLOR_SCHEMES = ["light", "dark", "auto"];
    var DARK_CLASS = "zc-scheme-dark";

    var darkQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    var colorScheme = normalizeColorScheme(options.colorScheme);
    var schemeWatch = null;

    function normalizeColorScheme(value) {
      if (value == null) return "light";
      var s = String(value).toLowerCase();
      if (COLOR_SCHEMES.indexOf(s) < 0) {
        zWarn("warn.unknownColorScheme", { value: value, allowed: COLOR_SCHEMES });
        return "light";
      }
      return s;
    }

    /* What is actually on screen: "auto" collapses to whatever the system is asking for right now.
       With no matchMedia to ask - an old browser, or a JSDOM-style test environment - "auto" reads
       as light rather than throwing. */
    function resolvedColorScheme() {
      if (colorScheme !== "auto") return colorScheme;
      return darkQuery && darkQuery.matches ? "dark" : "light";
    }

    function stampColorScheme() {
      var dark = resolvedColorScheme() === "dark";
      container.classList.toggle(DARK_CLASS, dark);
      if (modal && modal.el) modal.el.classList.toggle(DARK_CLASS, dark);
    }

    /* Attached only while "auto" is in force. Outside it the system preference is not a question the
       calendar is asking, and a listener left behind would keep answering it. */
    function watchSystemColorScheme() {
      if (schemeWatch) {
        schemeWatch();
        schemeWatch = null;
      }
      if (colorScheme !== "auto" || !darkQuery) return;

      function onSystemChange() {
        stampColorScheme();
        emitColorSchemeChange("system");
      }

      // The modern spelling; Safari before 14 has only the deprecated addListener/removeListener.
      if (typeof darkQuery.addEventListener === "function") {
        schemeWatch = instanceStore.addListener(darkQuery, "change", onSystemChange);
      } else if (typeof darkQuery.addListener === "function") {
        darkQuery.addListener(onSystemChange);
        schemeWatch = instanceStore.add(function () {
          darkQuery.removeListener(onSystemChange);
        });
      }
    }

    function emitColorSchemeChange(source) {
      emit("onColorSchemeChange", {
        scheme: colorScheme,
        resolved: resolvedColorScheme(),
        source: source,
      });
    }

    /* No render: the scheme is entirely a matter of which custom properties apply, and the DOM the
       calendar has already drawn is the same DOM either way. */
    function setColorScheme(next) {
      var normalized = normalizeColorScheme(next);
      if (normalized === colorScheme) return colorScheme;

      colorScheme = normalized;
      stampColorScheme();
      watchSystemColorScheme();
      emitColorSchemeChange("api");
      return colorScheme;
    }

    stampColorScheme();
    watchSystemColorScheme();

    /* ---- The event source ----
     *
     * data/source owns the awkward parts - which result is still current, which range has already
     * been asked for, which fetches are in flight. What is left here is only what to DO with an
     * answer, and how the calendar shows that it is waiting for one. */
    var eventSource = createEventSource({
      cacheLimit: options.eventCacheLimit,

      onStart: function (range) {
        syncLoadingState();
        emit("onEventsLoadStart", {
          startG: new Date(range.startG),
          endG: new Date(range.endG),
          view: state.view,
        });
      },

      /* A fetched range REPLACES what was loaded rather than merging into it.
         A lazy source is the authority for the range it was asked about, and merging would quietly
         accumulate events from months the reader has long since navigated away from - in memory, in
         getEvents(), and in the Excel export. Replacing keeps "what is loaded" equal to "what is on
         screen", which is the only rule that stays true as the calendar is used. */
      onApply: function (events) {
        state.baseEvents = normalizeEvents(events);
        renderTypeStyles();
        emit("onEventsChange", {
          type: "load",
          event: null,
          events: state.baseEvents,
        });
        requestRender();
      },

      onLoad: function (events, range) {
        emit("onEventsLoadEnd", {
          events: state.baseEvents,
          startG: new Date(range.startG),
          endG: new Date(range.endG),
          view: state.view,
        });
      },

      /* A failed range leaves whatever was on screen alone. Blanking the calendar because one
         request timed out is a worse answer than showing slightly stale events, and the range is not
         cached, so simply navigating back to it tries again. */
      onError: function (err, range) {
        emit("onEventsLoadError", {
          error: err,
          startG: new Date(range.startG),
          endG: new Date(range.endG),
          view: state.view,
        });
        zError(err);
      },

      onIdle: function () {
        syncLoadingState();
      },
    });

    function syncLoadingState() {
      if (!container || !container.classList) return;
      container.classList.toggle("zc-is-loading", eventSource.isBusy());
    }

    /* Called by every render. The manager decides whether that means a fetch, a cache hit or
       nothing at all, so this can stay unconditional - a filter change re-renders without the range
       moving, and asking for a range already applied is free. */
    function syncEventSource(force) {
      if (!eventSource.isLazy()) return false;
      return eventSource.request(lazyRange(), force);
    }

    /* What the consumer's function is handed. Gregorian for the boundary - that is what a backend
       speaks - plus the Jalali equivalents, because this is a Jalali calendar and converting them
       back by hand would be the first thing every consumer wrote. */
    function lazyRange() {
      var rg = getVisibleRangeG();
      if (!rg || !rg.startG || !rg.endG) return null;

      var startG = gDateStart(rg.startG);
      var endG = gDateStart(rg.endG);

      return {
        startG: startG,
        endG: endG,
        startJ: jal.fromGDate(startG),
        endJ: jal.fromGDate(endG),
        view: state.view,
      };
    }

    if (typeof options.events === "function") eventSource.setLoader(options.events);

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

      /* The one class that means "this node stands for an event", on every one of them.
       *
       * `.zc-event` cannot do this job: it carries the pill's colours, so putting it on a list row, a
       * month timed row or a modal row would restyle them. Those three are exactly the nodes that
       * lacked a common class, which left `closest(".zc-event")` returning null in list view and in
       * the month grid's timed rows - a selector that worked everywhere the author happened to test.
       *
       * This one is a marker and nothing else: no rule in the stylesheet targets it. Added here
       * rather than at the six call sites because every event node in the library goes through this
       * function - that is what makes the guarantee hold for views added later, too. */
      elm.classList.add("zc-event-node");

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
            /* The element this event was drawn as. `domEvent.currentTarget` is the same node, but
               only while the event is being dispatched - read it from a later tick and it is null.
               This survives, which is what a consumer anchoring a popover to the event needs. */
            element: elm,
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
      // The overlay lives outside the container, so it needs the scheme class of its own.
      stampColorScheme();
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
      var open = container.classList.contains("zc-sidebar-open");

      /* Announced on the button as well as on the panel. renderHeader() builds the button from
         scratch - on setLocale(), on a feature change - so this cannot be written once at
         construction: it would say "false" for an open sidebar the first time the header was
         rebuilt, and again for a calendar that starts open. */
      var menuBtn = qs(".zc-menu-btn", container);
      if (menuBtn) menuBtn.setAttribute("aria-expanded", String(open));

      if (!sidebarEl) return;
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

      // aria-expanded is written by syncSidebarHidden(), which both branches below call.
      var wasOpen = container.classList.contains("zc-sidebar-open");

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
        // Pointed at what it opens. aria-expanded is set from the real state by the
        // syncSidebarHidden() call at the end of this function.
        menuBtn.setAttribute("aria-controls", instanceId + "-sidebar");
        /* Inlined SVG rather than the old div/pseudo-element bars: crisp rounded caps at any size,
           and the same currentColor family as the other icons. The three <line>s keep the classes
           the sidebar-open state hooks rotate/fade into an X. */
        menuBtn.innerHTML =
          '<svg class="zc-menu-icon" viewBox="0 0 18 18" width="18" height="18" ' +
          'aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
          '<line class="zc-menu-bar zc-menu-bar-top" x1="2" y1="4" x2="16" y2="4"/>' +
          '<line class="zc-menu-bar zc-menu-bar-mid" x1="2" y1="9" x2="16" y2="9"/>' +
          '<line class="zc-menu-bar zc-menu-bar-bottom" x1="2" y1="14" x2="16" y2="14"/>' +
          "</svg>";
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

      /* Ask the source for whatever range this render is about to draw. Nothing is awaited: the
         render proceeds with what is already loaded, and a result arriving later schedules its own
         render. That is what keeps navigation responsive instead of blocking on the network. */
      syncEventSource();

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

      /* Every column is attached BEFORE any of them is filled.
         renderColumn measures the column to decide how a pile of overlapping events is laid out, and
         the density pass measures each event box. Rendering a column the moment it was appended meant
         measuring it while it was still the row's only flex child, so the first day reported the full
         width of the week and every measurement taken from it was wrong. */
      var cols = days.map(function () {
        var col = createEl("div", "zc-week-col");
        mainRow.appendChild(col);
        return col;
      });

      days.forEach(function (day, i) {
        TimeGrid.renderColumn({
          col: cols[i],
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
                  // Was hardcoded to "+2" for every day, whatever the real count. The "+" stays -
                  // a bare number here reads as a second day number stacked under the first.
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
    /* Takes an array, as it always has, or a function - which swaps the calendar over to loading one
       range at a time. Passing an array again turns lazy loading back off. */
    function setEvents(events) {
      if (typeof events === "function") {
        /* setLoader forgets which range is applied, so the render that announceEvents schedules asks
           the new source for the visible range. Requesting here as well would be a second, duplicate
           load in sync render mode, where that render has already happened by the time we return. */
        eventSource.setLoader(events);
        state.baseEvents = [];
        emit("onEventsSet", state.baseEvents);
        announceEvents("set", null);
        return state.baseEvents;
      }

      eventSource.setLoader(null);
      state.baseEvents = normalizeEvents(Array.isArray(events) ? events : []);
      emit("onEventsSet", state.baseEvents);
      announceEvents("set", null);
      return state.baseEvents;
    }

    /* Load the visible range again, cache and all. For when something changed on the server that the
       calendar has no way of knowing about. */
    function refetchEvents() {
      if (!eventSource.isLazy()) return false;
      eventSource.invalidate();
      return syncEventSource(true);
    }

    /* Every mutation ends here: re-derive the type colours (a new type may have appeared, or the last
       event of a type may have gone), tell listeners what happened, and schedule one render.
     *
     * It also drops the range cache. The cache remembers what the source answered, and a local add,
     * update or remove makes that answer wrong - without this, navigating away and back would serve
     * the stale answer from before the edit and the edit would appear to have been undone. */
    function announceEvents(kind, event) {
      if (kind !== "set") eventSource.invalidate();
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
    var HOT_OPTIONS = [
      "view",
      "locale",
      "colorScheme",
      "typeLabels",
      "typeStyles",
      "highlights",
      "events",
    ];

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
        case "colorScheme":
          return setColorScheme(value);
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

      /* A load already on its way cannot be recalled, so the source is told to ignore whatever comes
         back. Without this, a fetch outstanding at the moment of destroy() would resolve into a
         calendar that no longer has a container to render into. */
      eventSource.dispose();

      typeStyleTag = null;
      modal = null;

      container.innerHTML = "";
      container.classList.remove("zc-sidebar-open", "zc-sidebar-ready", "zc-calendar", DARK_CLASS);
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
      // "light" or "dark" - resolved, never "auto", so a plugin can pick a colour without asking twice.
      getColorScheme: resolvedColorScheme,
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

    /* The sidebar is collapsed unless the caller asks for it open. Default-closed is the whole
       point of the option: a calendar that says nothing looks exactly as it always has.
     *
     * Both classes go on together, before the first paint. `zc-sidebar-ready` is normally added
     * when the width transition finishes, and there is no transition to wait for here - the panel
     * is simply open in the first frame, rather than sliding open in front of the reader on load.
     *
     * No onSidebarToggle is emitted: nothing toggled. This is the state the calendar was built in,
     * and onInit is the callback that reports construction. */
    if (features.sidebar && options.sidebarOpen) {
      container.classList.add("zc-sidebar-open", "zc-sidebar-ready");
      syncSidebarHidden();
    }

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

      // ---- lazy loading ----
      /** Load the visible range again, ignoring the cache. False when the source is a plain array. */
      refetchEvents: refetchEvents,
      /** Whether events come from a function rather than an array. */
      isLazy: function () {
        return eventSource.isLazy();
      },
      /** Whether a load is outstanding right now. */
      isLoading: function () {
        return eventSource.isBusy();
      },

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

      /* The setting, which may be "auto"; getResolvedColorScheme() is what is actually on screen.
         setTheme() is the other half of theming and stays independent of this: token overrides written
         there are inline, so they win in both schemes. Pass a token twice - once per scheme - or set
         it from an onColorSchemeChange listener if it needs to differ between them. */
      getColorScheme: function () {
        return colorScheme;
      },
      getResolvedColorScheme: resolvedColorScheme,
      setColorScheme: setColorScheme,
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
