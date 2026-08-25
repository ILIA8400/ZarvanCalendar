/* Zarvan / core/disposable - a bag of teardown callbacks.
 *
 * Everything with a lifetime - a document-level listener, an interval, a node parked outside the
 * container, an injected <style> tag - registers here at the moment it is created. Teardown is then a
 * single dispose() call rather than a hand-maintained checklist that has to be kept in sync.
 *
 * Two stores are used per calendar instance:
 *   instance store - lives until destroy()
 *   render store   - disposed at the top of every render, so anything a render creates is released
 *                    even if the next render creates several of them
 *
 * That second store is what makes the week view's now-indicator safe: it sets up one interval per day
 * column, and the old single `nowTick` variable could only ever remember the last of the seven. */
(function (Z) {
  "use strict";

  function noop() {}

  function createDisposableStore(name) {
    var items = [];
    var disposed = false;

    /* Register a teardown function. Returns a handle that runs it early and un-registers it.
       If the store is already disposed the callback runs immediately, so a late registration can
       never outlive the store. */
    function add(fn) {
      if (typeof fn !== "function") return noop;
      if (disposed) {
        fn();
        return noop;
      }
      items.push(fn);
      return function disposeOne() {
        var i = items.indexOf(fn);
        if (i >= 0) {
          items.splice(i, 1);
          fn();
        }
      };
    }

    function addListener(target, type, handler, opts) {
      target.addEventListener(type, handler, opts);
      return add(function () {
        target.removeEventListener(type, handler, opts);
      });
    }

    function addInterval(fn, ms) {
      var id = setInterval(fn, ms);
      add(function () {
        clearInterval(id);
      });
      return id;
    }

    function addTimeout(fn, ms) {
      var id = setTimeout(fn, ms);
      add(function () {
        clearTimeout(id);
      });
      return id;
    }

    function addFrame(fn) {
      var id = requestAnimationFrame(fn);
      add(function () {
        cancelAnimationFrame(id);
      });
      return id;
    }

    /* For nodes that live outside the container (the modal overlay, injected <style> tags). Nodes
       inside the container are released when the container is emptied, so they need no registration. */
    function addNode(node) {
      return add(function () {
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
    }

    /* Disposes in reverse registration order, so teardown unwinds the way setup wound up.
       One failing callback must not strand the rest, so each is isolated. */
    function dispose() {
      disposed = true;
      var errors = [];
      for (var i = items.length - 1; i >= 0; i--) {
        try {
          items[i]();
        } catch (e) {
          errors.push(e);
        }
      }
      items = [];
      if (errors.length) {
        console.error("Zarvan: " + errors.length + " error(s) while disposing " + (name || "store"), errors);
      }
    }

    /* Disposes everything but keeps the store usable. Used by the render store, which is emptied at
       the start of each render and immediately refilled by it. */
    function reset() {
      dispose();
      disposed = false;
    }

    return {
      add: add,
      addListener: addListener,
      addInterval: addInterval,
      addTimeout: addTimeout,
      addFrame: addFrame,
      addNode: addNode,
      dispose: dispose,
      reset: reset,
      get size() {
        return items.length;
      },
      get disposed() {
        return disposed;
      },
    };
  }

  Z.disposable = { createDisposableStore: createDisposableStore };
})(this.ZarvanInternal = this.ZarvanInternal || {});
