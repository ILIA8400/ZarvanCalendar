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
