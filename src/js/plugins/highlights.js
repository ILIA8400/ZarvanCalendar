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
