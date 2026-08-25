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
