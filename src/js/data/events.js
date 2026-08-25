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
