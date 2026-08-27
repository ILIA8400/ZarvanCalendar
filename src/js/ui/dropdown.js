/* Zarvan / ui/dropdown - the select-like control used by both the header view switcher and the
 * sidebar type filter.
 *
 * These shipped as two near-identical implementations that differed only in a class prefix, a data
 * attribute, whether they marked an active item, and whether they emitted events. Every behavioural
 * fix therefore had to be made twice, and in practice was not.
 *
 * Knows nothing about calendars: it renders a labelled box, opens a menu of items on demand, and
 * reports the chosen value.
 *
 * It is a listbox, not a <select>: the box carries role="button" with aria-expanded, the menu carries
 * role="listbox" and the items role="option". The box was already a tab stop (tabIndex = 0) but had no
 * key handling at all, so keyboard users could focus the view switcher and then do nothing with it. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var eventHitsElement = Z.dom.eventHitsElement;

  /* Inlined so the caret works offline and takes its colour from the stylesheet, same reasoning as
   * the header chevron in main.js. Built as the same chevron shape rotated 90deg, so the two glyphs
   * read as one icon family instead of a triangle next to an arrow. */
  var CARET_SVG =
    '<svg viewBox="0 0 12 8" width="12" height="8" fill="none" aria-hidden="true" ' +
    'focusable="false" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M6 4.6L1.4 0L0 1.4L6 7.4L12 1.4L10.6 0L6 4.6Z" fill="currentColor"/></svg>';

  function createDropdown(opts) {
    var prefix = opts.prefix;
    var onSelect = opts.onSelect || function () {};
    var onOpen = opts.onOpen || function () {};
    var onClose = opts.onClose || function () {};

    var el = createEl("div", prefix);
    var selected = createEl("div", prefix + "-selected");
    selected.tabIndex = 0;
    selected.setAttribute("role", "button");
    selected.setAttribute("aria-haspopup", "listbox");
    selected.setAttribute("aria-expanded", "false");
    if (opts.label != null) selected.setAttribute("aria-label", opts.label);

    if (opts.label != null) {
      selected.appendChild(createEl("div", prefix + "-label", opts.label));
    }
    var valueEl = createEl("div", prefix + "-value", opts.value || "");
    selected.appendChild(valueEl);
    selected.appendChild(createEl("div", prefix + "-caret", opts.caret || CARET_SVG));

    var menu = createEl("div", prefix + "-menu");
    menu.setAttribute("role", "listbox");

    /* Rebuilt on every open rather than kept in sync: both callers derive their items from state that
       changes underneath (available event types, enabled views), and an open is rare enough that
       rebuilding is cheaper than tracking. */
    function buildMenu() {
      menu.innerHTML = "";
      (opts.items ? opts.items() : []).forEach(function (it) {
        var node = createEl("div", prefix + "-item", it.label);
        node.dataset.value = it.value;
        node.setAttribute("role", "option");
        node.setAttribute("aria-selected", it.active ? "true" : "false");
        node.tabIndex = -1;
        if (it.active) node.classList.add("zc-is-active");
        menu.appendChild(node);
      });
    }

    function itemNodes() {
      return Array.prototype.slice.call(
        menu.querySelectorAll("." + prefix + "-item")
      );
    }

    /* Roving focus inside the open menu.
     *
     * The first move is an entry, not a step: opening with Enter or ArrowDown lands ON the current
     * selection rather than one past it. Only once something inside the menu already has focus does
     * `step` apply. Both ends wrap. */
    function moveFocus(step) {
      var items = itemNodes();
      if (!items.length) return;

      var current = items.indexOf(document.activeElement);

      if (current < 0) {
        var active = items.findIndex(function (n) {
          return n.classList.contains("zc-is-active");
        });
        items[active < 0 ? (step > 0 ? 0 : items.length - 1) : active].focus();
        return;
      }

      var next = current + step;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      items[next].focus();
    }

    function choose(item) {
      if (!item) return;
      close("select");
      selected.focus();
      onSelect(item.dataset.value, item);
    }

    function isOpen() {
      return el.classList.contains("zc-is-open");
    }

    function open() {
      if (isOpen()) return;
      buildMenu();
      el.classList.add("zc-is-open");
      selected.setAttribute("aria-expanded", "true");
      onOpen();
    }

    function close(reason) {
      if (!isOpen()) return;
      el.classList.remove("zc-is-open");
      selected.setAttribute("aria-expanded", "false");
      onClose({ reason: reason || "outside" });
    }

    function toggle() {
      if (isOpen()) close("toggle");
      else open();
    }

    // pointerdown rather than click: the menu has to win the race against the outside-click handler,
    // and preventDefault keeps focus from moving off the control on mousedown.
    selected.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggle();
      selected.focus();
    });

    menu.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = e.target.closest("." + prefix + "-item");
      if (!item) return;
      close("select");
      onSelect(item.dataset.value, item);
    });

    selected.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggle();
        if (isOpen()) moveFocus(1);
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen()) open();
        moveFocus(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        close("escape");
      }
    });

    menu.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        moveFocus(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        choose(e.target.closest("." + prefix + "-item"));
      } else if (e.key === "Escape" || e.key === "Tab") {
        // Tab closes rather than trapping: the menu is a convenience, not a mode.
        if (e.key === "Escape") e.preventDefault();
        close(e.key === "Escape" ? "escape" : "tab");
        if (e.key === "Escape") selected.focus();
      }
    });

    el.appendChild(selected);
    el.appendChild(menu);

    /* Each dropdown owns its outside-click listener and closes over its own element. The previous
       code shared one listener behind a flag and captured the first element it ever saw, so once the
       header was re-rendered the handler was testing a node no longer in the document. */
    var disposeOutside = function () {};
    if (opts.store) {
      disposeOutside = opts.store.addListener(
        document,
        "pointerdown",
        function (e) {
          if (eventHitsElement(e, el)) return;
          close("outside");
        },
        true
      );
    }

    return {
      el: el,
      valueEl: valueEl,
      setValue: function (text) {
        valueEl.innerText = text == null ? "" : text;
      },
      getValue: function () {
        return valueEl.innerText;
      },
      open: open,
      close: close,
      toggle: toggle,
      isOpen: isOpen,
      dispose: function () {
        disposeOutside();
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  Z.uiDropdown = { createDropdown: createDropdown };
})(this.ZarvanInternal = this.ZarvanInternal || {});
