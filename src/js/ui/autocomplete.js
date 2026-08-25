/* Zarvan / ui/autocomplete - the suggestion list attached to the search box.
 *
 * Owns only the popup. The caller decides what the candidate list is and what selecting one means.
 *
 * The popup is a listbox owned by the caller's input, so the items are never focused themselves: the
 * input keeps focus and `aria-activedescendant` points at the highlighted row. `move()` and
 * `confirm()` are what the caller wires its arrow and Enter keys to - without them the suggestions
 * could only ever be reached with a mouse. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var eventHitsElement = Z.dom.eventHitsElement;

  var seq = 0;

  function createAutocomplete(opts) {
    var onSelect = opts.onSelect || function () {};
    var max = opts.max == null ? 30 : opts.max;

    var el = createEl("div", "zc-ac zc-hidden");
    var idBase = "zc-ac-" + ++seq + "-";
    el.id = idBase + "list";
    el.setAttribute("role", "listbox");

    // Index of the highlighted row, or -1 for "none"; the input keeps focus throughout.
    var active = -1;

    function items() {
      return Array.prototype.slice.call(el.querySelectorAll(".zc-ac-item"));
    }

    function isOpen() {
      return !el.classList.contains("zc-hidden");
    }

    function syncActive() {
      var list = items();
      list.forEach(function (node, i) {
        var on = i === active;
        node.classList.toggle("zc-is-active", on);
        node.setAttribute("aria-selected", on ? "true" : "false");
      });

      if (opts.input) {
        var current = active >= 0 && list[active];
        if (current) opts.input.setAttribute("aria-activedescendant", current.id);
        else opts.input.removeAttribute("aria-activedescendant");
      }

      var node = list[active];
      if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
    }

    function hide() {
      el.classList.add("zc-hidden");
      active = -1;
      if (opts.input) {
        opts.input.setAttribute("aria-expanded", "false");
        opts.input.removeAttribute("aria-activedescendant");
      }
    }

    function show(list) {
      el.innerHTML = "";
      active = -1;
      list = list || [];
      if (!list.length) return hide();

      list.slice(0, max).forEach(function (text, i) {
        var item = createEl("div", "zc-ac-item");
        item.innerText = text;
        item.dataset.value = text;
        item.id = idBase + i;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        el.appendChild(item);
      });
      el.classList.remove("zc-hidden");
      if (opts.input) opts.input.setAttribute("aria-expanded", "true");
    }

    /* Wraps at both ends, and steps off the list back to "nothing highlighted" so the user can get
       their own typed text back without closing the popup. */
    function move(step) {
      if (!isOpen()) return false;
      var count = items().length;
      if (!count) return false;

      active += step;
      if (active < -1) active = count - 1;
      if (active >= count) active = -1;
      syncActive();
      return true;
    }

    // Reports the highlighted suggestion, if there is one. Returns whether it handled the key.
    function confirm() {
      var node = items()[active];
      if (!isOpen() || !node) return false;
      hide();
      onSelect(node.dataset.value || "");
      return true;
    }

    el.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var item = e.target.closest(".zc-ac-item");
      if (!item) return;
      hide();
      onSelect(item.dataset.value || "");
    });

    var disposeOutside = function () {};
    if (opts.store) {
      disposeOutside = opts.store.addListener(
        document,
        "pointerdown",
        function (e) {
          if (eventHitsElement(e, el)) return;
          if (opts.anchor && eventHitsElement(e, opts.anchor)) return;
          hide();
        },
        true
      );
    }

    if (opts.input) {
      opts.input.setAttribute("role", "combobox");
      opts.input.setAttribute("aria-autocomplete", "list");
      opts.input.setAttribute("aria-expanded", "false");
      opts.input.setAttribute("aria-controls", el.id);
    }

    return {
      el: el,
      show: show,
      hide: hide,
      move: move,
      confirm: confirm,
      isOpen: isOpen,
      dispose: function () {
        disposeOutside();
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  Z.uiAutocomplete = { createAutocomplete: createAutocomplete };
})(this.ZarvanInternal = this.ZarvanInternal || {});
