/* Zarvan / layout/columns - Google-Calendar-style column packing for timed events.
 *
 * Pure: intervals in, positions out. Events are grouped into clusters of transitively overlapping
 * items; within a cluster each event takes the first free column, then widens to span any adjacent
 * columns that have no conflict at its time range. */
(function (Z) {
  "use strict";
  var overlapsMin = Z.layoutOverlap.overlapsMin;

  function layoutDayEventsColumns(dayEvents) {
    var events = dayEvents.slice().sort(function (a, b) {
      return a.startMin - b.startMin || a.endMin - b.endMin;
    });

    var clusters = [];
    var cluster = [];
    var clusterMaxEnd = -1;

    events.forEach(function (e) {
      if (!cluster.length) {
        cluster = [e];
        clusterMaxEnd = e.endMin;
        return;
      }
      if (e.startMin < clusterMaxEnd) {
        cluster.push(e);
        clusterMaxEnd = Math.max(clusterMaxEnd, e.endMin);
      } else {
        clusters.push(cluster);
        cluster = [e];
        clusterMaxEnd = e.endMin;
      }
    });
    if (cluster.length) clusters.push(cluster);

    var positioned = [];

    clusters.forEach(function (c) {
      var colEnds = [];
      var columns = [];

      c.forEach(function (e) {
        var col = colEnds.findIndex(function (end) {
          return end <= e.startMin;
        });
        if (col === -1) {
          col = colEnds.length;
          colEnds.push(e.endMin);
          columns[col] = [];
        } else {
          colEnds[col] = e.endMin;
        }

        e.colIndex = col;
        e.colCount = 0;
        e.colSpan = 1;

        columns[col].push(e);
        positioned.push(e);
      });

      var colCount = colEnds.length;
      c.forEach(function (e) {
        e.colCount = colCount;
      });

      c.forEach(function (e) {
        var span = 1;
        for (var nextCol = e.colIndex + 1; nextCol < colCount; nextCol++) {
          var hasConflict = (columns[nextCol] || []).some(function (x) {
            return overlapsMin(e, x);
          });
          if (hasConflict) break;
          span++;
        }
        e.colSpan = span;
      });
    });

    return positioned;
  }

  Z.layoutColumns = { layoutDayEventsColumns: layoutDayEventsColumns };
})(this.ZarvanInternal = this.ZarvanInternal || {});
