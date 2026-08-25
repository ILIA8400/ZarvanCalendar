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
