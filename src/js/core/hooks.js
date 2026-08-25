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
