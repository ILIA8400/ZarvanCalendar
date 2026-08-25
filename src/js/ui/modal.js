/* Zarvan / ui/modal - the overlay used by the "+N more" affordance.
 *
 * Owns the overlay, the header with its close button, and the scrolling body. What goes *in* the body
 * is the caller's business: the modal takes finished nodes, so it carries no knowledge of events.
 *
 * The overlay is appended to <body> rather than to the calendar, so that a host with `overflow:hidden`
 * or a transformed ancestor cannot clip it. That is also why it is registered with a disposable store
 * and stamped with the instance id.
 *
 * It behaves as a modal dialog rather than just looking like one: role="dialog" with aria-modal, focus
 * moves into it on open and back to the opener on close, Tab cycles inside it, and Escape closes it.
 * Without any of that it was a visual overlay the keyboard walked straight past. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;

  function createModal(opts) {
    opts = opts || {};
    var onClose = opts.onClose || function () {};

    var overlay = createEl("div", "zc-modal-overlay zc-hidden");
    if (opts.instanceId) overlay.dataset.zcId = opts.instanceId;

    // Unique per instance so two calendars on one page do not both claim the same labelledby target.
    var titleId = "zc-modal-title-" + (opts.instanceId || "x");

    var modal = createEl("div", "zc-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", titleId);
    modal.tabIndex = -1;

    var header = createEl("div", "zc-modal-header");
    var titleEl = createEl("span", "zc-modal-title");
    titleEl.id = titleId;
    var closeBtn = createEl("button", "zc-modal-close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", opts.closeLabel || "Close");

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    var body = createEl("div", "zc-modal-body");
    var list = createEl("div", "zc-modal-events");
    body.appendChild(list);

    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);

    function isOpen() {
      return !overlay.classList.contains("zc-hidden");
    }

    var FOCUSABLE =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),' +
      'textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    function focusables() {
      return Array.prototype.slice.call(modal.querySelectorAll(FOCUSABLE)).filter(
        function (el) {
          return el.offsetWidth > 0 || el.offsetHeight > 0;
        }
      );
    }

    // Whatever had focus when the modal opened, so it can be handed back on close.
    var opener = null;

    /* Only reports a close when something was actually open. The old code emitted onModalClose on
       every destroy() and on every close attempt, so listeners saw closes for a modal that had never
       been shown. */
    function hide(reason) {
      if (!isOpen()) return;
      overlay.classList.add("zc-hidden");

      /* Focus goes back to the control that opened the modal. Guarded because that control may have
         been re-rendered - or removed - while the modal was up. */
      if (opener && opener.isConnected && typeof opener.focus === "function") {
        opener.focus();
      }
      opener = null;

      onClose({ reason: reason || "close" });
    }

    function show(title, nodes) {
      opener = document.activeElement;

      titleEl.innerText = title == null ? "" : title;
      list.innerHTML = "";
      (nodes || []).forEach(function (n) {
        list.appendChild(n);
      });
      overlay.classList.remove("zc-hidden");

      // The first row if there is one, otherwise the dialog itself, which is why it takes tabindex.
      var first = focusables()[0];
      (first || modal).focus();
    }

    closeBtn.addEventListener("click", function () {
      hide("button");
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) hide("backdrop");
    });

    /* Escape closes, Tab cycles. Bound on the overlay rather than the document: the listener then
       lives and dies with the node, and it cannot fire for a modal belonging to another instance. */
    overlay.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        hide("escape");
        return;
      }
      if (e.key !== "Tab") return;

      var items = focusables();
      if (!items.length) {
        e.preventDefault();
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];
      var active = document.activeElement;

      if (e.shiftKey && (active === first || active === modal)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* <body> by default, so a host with overflow:hidden or a transformed ancestor cannot clip it.
       In shadow mode the caller passes the shadow root instead, because a node in the light DOM would
       not be reached by the stylesheet adopted inside the shadow tree. */
    (opts.mountTo || document.body).appendChild(overlay);
    if (opts.store) opts.store.addNode(overlay);

    return {
      el: overlay,
      body: list,
      show: show,
      hide: hide,
      isOpen: isOpen,
    };
  }

  Z.uiModal = { createModal: createModal };
})(this.ZarvanInternal = this.ZarvanInternal || {});
