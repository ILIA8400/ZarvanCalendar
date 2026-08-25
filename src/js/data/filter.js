/* Zarvan / data/filter - type and free-text filtering. Pure. */
(function (Z) {
  "use strict";
  var norm = Z.utils.norm;

  function matchesType(ev, type) {
    if (!type || type === "__all__") return true;
    return (ev.type || "") === type;
  }

  function filterEvents(events, filterState) {
    var fs = filterState || {};
    var q = norm(fs.q);

    return (events || []).filter(function (ev) {
      if (!matchesType(ev, fs.type)) return false;
      if (q && !norm(ev.title).includes(q)) return false;
      return true;
    });
  }

  /* The autocomplete list is filtered by type only: it should still suggest titles that the current
   * search text has not matched yet, otherwise it can only ever confirm what you already typed. */
  function filterEventsByTypeOnly(events, filterState) {
    var fs = filterState || {};
    return (events || []).filter(function (ev) {
      return matchesType(ev, fs.type);
    });
  }

  Z.dataFilter = {
    matchesType: matchesType,
    filterEvents: filterEvents,
    filterEventsByTypeOnly: filterEventsByTypeOnly,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
