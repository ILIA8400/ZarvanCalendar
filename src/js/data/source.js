/* Zarvan / data/source - the event source: an array, or a function asked for one range at a time.
 *
 * `events: [...]` keeps every event in memory forever, which is fine for a few hundred and hopeless
 * for a few years of history. `events: fn` inverts that: the calendar says which range it is showing
 * and the consumer returns just those events.
 *
 *   events: async ({ startG, endG }) => fetchFromServer(startG, endG)
 *
 * No DOM in here, and no calendar knowledge beyond a Gregorian range. What this module owns is the
 * three things that make an async source correct rather than merely working:
 *
 *   1. Ordering. Navigating quickly fires several loads; they can come back in any order. Every
 *      request carries a generation, and a result whose generation is no longer current is dropped.
 *      Without it, paging forward twice quickly can leave the first page's events on screen.
 *   2. Duplication. Two requests for the same range - a re-render, a view that shares a range -
 *      share one promise rather than hitting the network twice.
 *   3. Repetition. Ranges already fetched are remembered, so paging back and forth does not refetch.
 *      The cache is capped, because a user paging through a year should not accumulate one.
 *
 * The cache is keyed on the exact range, deliberately: it answers "have I asked this before", not
 * "do I have these events somewhere", which would mean interval-union bookkeeping and a merge whose
 * de-duplication rules nobody could predict. A miss costs one request; a wrong merge costs trust. */
(function (Z) {
  "use strict";
  var g = Z.gregorian;

  var DEFAULT_CACHE_LIMIT = 12;

  function rangeKey(startG, endG) {
    return g.gDateStart(startG).getTime() + ":" + g.gDateStart(endG).getTime();
  }

  function createEventSource(opts) {
    opts = opts || {};

    var loader = null; // the consumer's function, or null while the source is a plain array
    var limit = opts.cacheLimit > 0 ? opts.cacheLimit : DEFAULT_CACHE_LIMIT;

    /* Bumped by every request. A result carrying an older generation lost the race and is thrown
       away - which is the whole reason a fast click through three months cannot end up showing the
       events of whichever request happened to be slowest. */
    var generation = 0;
    var appliedKey = null; // the range whose events are currently applied
    var inflight = {}; // key -> promise, so concurrent asks for one range share a fetch
    var cache = []; // [{ key, events }], oldest first
    var disposed = false;
    var busy = 0;

    function cacheGet(key) {
      for (var i = 0; i < cache.length; i++) {
        if (cache[i].key === key) return cache[i];
      }
      return null;
    }

    function cachePut(key, events) {
      var hit = cacheGet(key);
      if (hit) {
        hit.events = events;
        return;
      }
      cache.push({ key: key, events: events });
      while (cache.length > limit) cache.shift();
    }

    function apply(events, range, key, fromCache) {
      appliedKey = key;
      if (opts.onApply) opts.onApply(events, range, { cached: !!fromCache });
    }

    function settle(range) {
      busy = Math.max(0, busy - 1);
      if (busy === 0 && opts.onIdle) opts.onIdle(range);
    }

    /* Ask for a range.
     *
     * Returns true when something was applied or a load was started, false when the answer was
     * already on screen. `force` skips the cache, which is what refetch() and every local mutation
     * need - the cache remembers answers, and a mutation makes the old answer wrong. */
    function request(range, force) {
      if (disposed || !loader) return false;
      if (!range || !range.startG || !range.endG) return false;

      var key = rangeKey(range.startG, range.endG);

      // Already showing this range and nothing has invalidated it.
      if (!force && key === appliedKey) return false;

      var mine = ++generation;

      if (!force) {
        var hit = cacheGet(key);
        if (hit) {
          apply(hit.events, range, key, true);
          return true;
        }
      }

      if (opts.onStart) opts.onStart(range);
      busy++;

      var pending = inflight[key];

      if (!pending || force) {
        /* Promise.resolve wraps whatever came back, so a function that returns a plain array is
           handled by the same path as one that returns a promise - and always asynchronously, so a
           source can never re-enter a render that is still running. */
        pending = Promise.resolve()
          .then(function () {
            return loader(range);
          })
          .then(function (events) {
            return Array.isArray(events) ? events : [];
          });
        inflight[key] = pending;
      }

      pending.then(
        function (events) {
          delete inflight[key];
          if (disposed) return;

          // Cache even a superseded result: it was a real answer for a real range.
          cachePut(key, events);

          if (mine !== generation) {
            settle(range);
            return; // a newer request has taken over; this one is history
          }

          apply(events, range, key, false);
          if (opts.onLoad) opts.onLoad(events, range);
          settle(range);
        },
        function (err) {
          delete inflight[key];
          if (disposed) return;

          // A failed range is not cached, so the next visit tries again.
          if (mine === generation && opts.onError) opts.onError(err, range);
          settle(range);
        }
      );

      return true;
    }

    return {
      /** Swap the source. A function turns lazy loading on; anything else turns it off. */
      setLoader: function (fn) {
        loader = typeof fn === "function" ? fn : null;
        cache.length = 0;
        appliedKey = null;
        inflight = {};
        generation++;
        return !!loader;
      },

      isLazy: function () {
        return !!loader;
      },

      request: request,

      /* Forget remembered answers WITHOUT re-asking for the one on screen.
       *
       * This is what a local add, update or remove needs. Those edits make every cached answer
       * wrong, so the cache has to go - but clearing `appliedKey` too would make the very next
       * render reload the current range, and the range that comes back is the server's, which does
       * not have the edit in it yet. The edit would appear to undo itself a frame after it was made.
       *
       * So: future navigation gets fresh data, the visible range keeps the edit, and a consumer who
       * wants the server's version now asks for it with refetchEvents(). */
      invalidate: function () {
        cache.length = 0;
      },

      /** True while at least one load is outstanding. */
      isBusy: function () {
        return busy > 0;
      },

      dispose: function () {
        disposed = true;
        cache.length = 0;
        inflight = {};
        loader = null;
      },
    };
  }

  Z.dataSource = {
    rangeKey: rangeKey,
    createEventSource: createEventSource,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
