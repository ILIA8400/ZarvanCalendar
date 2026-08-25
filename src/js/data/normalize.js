/* Zarvan / data/normalize - validate and canonicalise incoming event objects.
 *
 * Pure apart from the `onWarn` callback, which is how invalid input is reported outward.
 *
 * onWarn receives a stable CODE, not a sentence. Turning that code into text is the caller's job, so
 * this module carries no language and a consumer can switch on the code rather than matching prose. */
(function (Z) {
  "use strict";
  var jd = Z.jdate;
  var jal = Z.jalali;
  var g = Z.gregorian;
  var ev_ = Z.dataEvents;

  var DEFAULTS = {
    enabled: true,
    requireNumericId: false,
    onInvalid: "drop", // "drop" | "keep"
    autoFix: true, // repair end < start rather than rejecting
  };

  function withDefaults(validation) {
    return Object.assign({}, DEFAULTS, validation || {});
  }

  /* Rewrites ev.end when it lands at or before ev.start.
   *
   * This compares the raw authored values rather than going through evToGRange(). evToGRange applies
   * its own 15-minute floor for rendering purposes, so a backwards end came back already "fixed" and
   * the comparison here could never fire -- autoFix silently did nothing, and the bad end string
   * survived into getEvents() and the Excel export. */
  function ensureEndNotBeforeStart(ev) {
    try {
      var s = jd.parseJDateTime(ev.start);
      var e = jd.parseJDateTime(ev.end || ev.start);

      var sG = jal.toGDate(s.jy, s.jm, s.jd);
      var eG = jal.toGDate(e.jy, e.jm, e.jd);

      if (ev_.isAllDayEvent(ev)) {
        if (g.gDateStart(eG).getTime() < g.gDateStart(sG).getTime()) ev.end = ev.start;
        return ev;
      }

      sG.setHours(s.hh || 0, s.mm || 0, 0, 0);
      eG.setHours(e.hh || 0, e.mm || 0, 0, 0);

      // Strictly before, not "at or before". An event whose end equals its start is a legitimate
      // point in time, not malformed - the renderer already gives it a 15-minute box. Rewriting the
      // authored value there would surprise callers and change every exported row for such events.
      if (eG.getTime() >= sG.getTime()) return ev;

      var fixed = new Date(sG.getTime() + 15 * 60 * 1000);
      var j2 = jal.fromGDate(fixed);
      ev.end = jd.formatJDT(j2.jy, j2.jm, j2.jd, fixed.getHours(), fixed.getMinutes(), false);
    } catch (err) {
      /* leave the event as authored; validation has already flagged what it can */
    }
    return ev;
  }

  function coerceId(ev, validation) {
    if (!validation.requireNumericId) return ev;

    var id = ev.id;
    if (typeof id === "number" && isFinite(id)) return ev;

    if (typeof id === "string" && /^\d+$/.test(id.trim())) {
      ev.id = Number(id.trim());
      return ev;
    }

    var s = String(id != null ? id : (ev.title || "") + "|" + (ev.start || ""));
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    ev.id = h;
    return ev;
  }

  function validateAndNormalizeEvent(ev, idx, validation, onWarn) {
    var warn = onWarn || function () {};
    ev = Object.assign({}, ev);

    var vs = jal.isValidJDTString(ev.start);
    if (!vs.ok) {
      warn("warn.invalidStart", { index: idx, ev: ev, reason: vs.reason });
      return { ok: false, reason: vs.reason };
    }

    if (!ev.end) ev.end = ev.start;
    var ve = jal.isValidJDTString(ev.end);
    if (!ve.ok) {
      if (validation.autoFix) {
        warn("warn.endFixed", { index: idx, ev: ev, reason: ve.reason });
        ev.end = ev.start;
      } else {
        warn("warn.invalidEnd", { index: idx, ev: ev, reason: ve.reason });
        return { ok: false, reason: ve.reason };
      }
    }

    if (vs.allDay && ev.allDay == null) ev.allDay = true;
    if (validation.autoFix) ensureEndNotBeforeStart(ev);
    coerceId(ev, validation);
    if (ev.title == null) ev.title = "";

    return { ok: true, ev: ev };
  }

  /* onInvalid:
   *   "drop" - the event is discarded (default)
   *   "keep" - the event is passed through as authored, with only the safe end=start defaulting
   *
   * The previous implementation filtered nulls twice, so "keep" silently behaved like "drop".
   * Rejected events are now carried through explicitly rather than being resurrected from a null. */
  function normalizeEvents(list, validation, onWarn) {
    var v = withDefaults(validation);
    var out = [];

    (Array.isArray(list) ? list : []).forEach(function (ev, idx) {
      if (!v.enabled) {
        var raw = Object.assign({}, ev);
        if (!raw.end) raw.end = raw.start;
        out.push(raw);
        return;
      }

      var res = validateAndNormalizeEvent(ev, idx, v, onWarn);
      if (res.ok) {
        out.push(res.ev);
        return;
      }

      if (v.onInvalid === "keep") {
        var kept = Object.assign({}, ev);
        if (!kept.end) kept.end = kept.start;
        kept._invalid = res.reason || true;
        out.push(kept);
      }
    });

    return out;
  }

  Z.dataNormalize = {
    DEFAULTS: DEFAULTS,
    withDefaults: withDefaults,
    ensureEndNotBeforeStart: ensureEndNotBeforeStart,
    coerceId: coerceId,
    validateAndNormalizeEvent: validateAndNormalizeEvent,
    normalizeEvents: normalizeEvents,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
