/* Zarvan / layout/columns - Google-Calendar-style column packing for timed events.
 *
 * Pure: intervals in, positions out. Events are grouped into clusters of transitively overlapping
 * items; within a cluster each event takes the first free column, then widens to span any adjacent
 * columns that have no conflict at its time range. */
(function (Z) {
  "use strict";
  var overlapsMin = Z.layoutOverlap.overlapsMin;

  function layoutDayEventsColumns(dayEvents) {
    // Clustering is shared with the cascade rather than kept as a second copy here: both layouts
    // need the same "which events form one pile" answer, and the time-grid asks for it directly so
    // it can choose between them per cluster.
    var clusters = Z.layoutOverlap.clusterByOverlap(dayEvents);

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
