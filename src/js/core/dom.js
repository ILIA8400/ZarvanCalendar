/* Zarvan / core/dom - thin DOM helpers. No calendar knowledge. */
(function (Z) {
  "use strict";

  function resolveElement(selOrEl) {
    if (!selOrEl) return null;
    if (typeof selOrEl === "string") return document.querySelector(selOrEl);
    return selOrEl; // HTMLElement
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function createEl(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  /* Did this event happen inside `el`?
   *
   * e.target is not enough once a shadow root is involved: an event from inside a shadow tree is
   * retargeted to the host as it crosses the boundary, so el.contains(e.target) reports false for a
   * click that visibly landed inside the element. composedPath() is the un-retargeted path and is what
   * every outside-click handler in the library tests against. */
  function eventHitsElement(e, el) {
    if (!el) return false;
    if (typeof e.composedPath === "function") {
      var path = e.composedPath();
      for (var i = 0; i < path.length; i++) {
        if (path[i] === el) return true;
      }
      return false;
    }
    return el.contains(e.target);
  }

  Z.dom = {
    resolveElement: resolveElement,
    eventHitsElement: eventHitsElement,
    qs: qs,
    qsa: qsa,
    createEl: createEl,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
