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
