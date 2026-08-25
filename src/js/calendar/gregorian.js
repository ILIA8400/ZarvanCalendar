/* Zarvan / calendar/gregorian - plain Date helpers, independent of any calendar system. */
(function (Z) {
  "use strict";

  function gDateStart(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  function isSameYMD(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function minuteOfDay(dt) {
    return dt.getHours() * 60 + dt.getMinutes() + dt.getSeconds() / 60;
  }

  // Saturday = 0 ... Friday = 6. The Jalali week starts on Saturday; JS getDay() starts on Sunday.
  function weekdayIndexFromGDate(gdate) {
    return (gdate.getDay() + 1) % 7;
  }

  function getWeekStart(date) {
    var temp = new Date(date);
    var dayOfWeek = weekdayIndexFromGDate(temp);
    var weekStart = new Date(temp);
    weekStart.setDate(temp.getDate() - dayOfWeek);
    return weekStart;
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function diffDays(a, b) {
    return Math.floor((gDateStart(a) - gDateStart(b)) / 86400000);
  }

  Z.gregorian = {
    gDateStart: gDateStart,
    isSameYMD: isSameYMD,
    minuteOfDay: minuteOfDay,
    weekdayIndexFromGDate: weekdayIndexFromGDate,
    getWeekStart: getWeekStart,
    addDays: addDays,
    diffDays: diffDays,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
