/* Zarvan / layout/overlap - "cascade" layout for timed events, plus the conflict graph.
 *
 * Pure: intervals in, positions out. No DOM, no instance state.
 * Input items:  { startMin, endMin, ... }
 * Output items: the same objects plus { stackIndex, offsetPct, widthPct, colCount, colSpan, colIndex } */
(function (Z) {
  "use strict";

  function overlapsMin(a, b) {
    return a.startMin < b.endMin && b.startMin < a.endMin;
  }

  /* Split a day into clusters of transitively overlapping events.
   *
   * A cluster is the granularity at which a layout decision has to be made: clusters never overlap
   * each other in time, so each one can be positioned independently without the choice leaking into
   * the rest of the day. Sorting by start means a running max-end is enough to find the boundaries. */
  function clusterByOverlap(dayEvents) {
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

    return clusters;
  }

  /* How many events are live at the busiest instant.
   *
   * For intervals this is exactly the number of stack levels the cascade will use and the number of
   * columns a column layout will produce, so it is what a caller needs in order to decide between
   * them BEFORE laying anything out. */
  function peakConcurrency(events) {
    var edges = [];
    events.forEach(function (e) {
      edges.push({ at: e.startMin, delta: 1 });
      edges.push({ at: e.endMin, delta: -1 });
    });

    // An end sorts before a start at the same instant: back-to-back events do not conflict, which is
    // the same boundary rule overlapsMin uses.
    edges.sort(function (a, b) {
      return a.at - b.at || a.delta - b.delta;
    });

    var live = 0;
    var peak = 0;
    edges.forEach(function (e) {
      live += e.delta;
      if (live > peak) peak = live;
    });
    return peak;
  }

  function layoutDayEventsOverlap(dayEvents, opts) {
    opts = opts || {};
    var STEP = opts.step == null ? 14 : opts.step;
    var MIN_W = opts.minWidth == null ? 42 : opts.minWidth;

    var events = dayEvents.slice().sort(function (a, b) {
      return (
        a.startMin - b.startMin || b.endMin - b.startMin - (a.endMin - a.startMin)
      );
    });

    var stackEnds = [];
    var out = [];

    events.forEach(function (it) {
      var si = -1;
      for (var s = 0; s < stackEnds.length; s++) {
        if (stackEnds[s] <= it.startMin) {
          si = s;
          break;
        }
      }
      if (si === -1) {
        si = stackEnds.length;
        stackEnds.push(it.endMin);
      } else stackEnds[si] = it.endMin;

      var offset = si * STEP;
      var width = 100 - offset;
      if (width < MIN_W) width = MIN_W;

      out.push(
        Object.assign({}, it, {
          stackIndex: si,
          offsetPct: offset,
          widthPct: width,
          colCount: 1,
          colSpan: 1,
          colIndex: 0,
        })
      );
    });

    return out;
  }

  /* Annotates each item with the set of items it collides with, so the renderer can dim the rest of a
   * cluster on hover. `idPrefix` scopes the generated ids to one instance and one day. */
  function buildOverlapGraph(laidOut, idPrefix) {
    var adj = Object.create(null);

    for (var i = 0; i < laidOut.length; i++) {
      laidOut[i]._ovId = idPrefix + ":" + i;
    }

    for (var a = 0; a < laidOut.length; a++) {
      for (var b = a + 1; b < laidOut.length; b++) {
        if (overlapsMin(laidOut[a], laidOut[b])) {
          var ida = laidOut[a]._ovId;
          var idb = laidOut[b]._ovId;
          (adj[ida] = adj[ida] || []).push(idb);
          (adj[idb] = adj[idb] || []).push(ida);
        }
      }
    }

    for (var k = 0; k < laidOut.length; k++) {
      var id = laidOut[k]._ovId;
      laidOut[k]._ovWith = adj[id] || [];
      laidOut[k]._ovHas = laidOut[k]._ovWith.length > 0;
    }

    return laidOut;
  }

  Z.layoutOverlap = {
    overlapsMin: overlapsMin,
    clusterByOverlap: clusterByOverlap,
    peakConcurrency: peakConcurrency,
    layoutDayEventsOverlap: layoutDayEventsOverlap,
    buildOverlapGraph: buildOverlapGraph,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
