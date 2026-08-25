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
