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
