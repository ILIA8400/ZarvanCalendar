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
