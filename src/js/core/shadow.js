/* Zarvan / core/shadow - optional Shadow DOM mounting.
 *
 * The default prefixed-and-scoped stylesheet already survives a hostile host (see docs/CLASS-MAP.md).
 * The one thing it cannot defend against is a host rule written with the universal selector -
 * `* { box-sizing: content-box }` beats any scoped reset, because it matches our elements directly.
 * A shadow root closes that last gap: host rules do not cross the boundary at all.
 *
 * The cost is that the host can no longer restyle internals with plain CSS. Design tokens still work,
 * because custom properties DO inherit through a shadow boundary - which is why the whole theming
 * surface was built out of them.
 *
 * Styles must be supplied, since a <link> in the document does not reach inside a shadow root:
 *   1. options.styles - CSS text, a CSSStyleSheet, or an array of either
 *   2. otherwise, the library's own stylesheet is looked up in the document and copied
 *   3. if neither works, the calendar renders unstyled and says so */
(function (Z) {
  "use strict";

  function supported() {
    return typeof Element !== "undefined" && !!Element.prototype.attachShadow;
  }

  /* Reads the library stylesheet back out of the document. cssRules throws for a cross-origin sheet
     (a CDN without CORS headers), which is exactly when a caller has to pass options.styles instead. */
  function findLibraryStyles() {
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      var node = sheet.ownerNode;
      var href = sheet.href || (node && node.getAttribute && node.getAttribute("href")) || "";
      var isOurs =
        /zarvan[^/]*\.css/i.test(href) ||
        (node && node.hasAttribute && node.hasAttribute("data-zarvan-styles"));
      if (!isOurs) continue;

      try {
        var text = "";
        for (var r = 0; r < sheet.cssRules.length; r++) text += sheet.cssRules[r].cssText + "\n";
        if (text) return text;
      } catch (e) {
        return null; // cross-origin: unreadable by design
      }
    }
    return null;
  }

  function toList(styles) {
    if (!styles) return [];
    return Array.isArray(styles) ? styles : [styles];
  }

  /* Prefers adoptedStyleSheets - one shared sheet across every instance rather than a copy of the CSS
     per calendar - and falls back to a <style> element where that is unavailable. */
  function adoptStyles(root, styles) {
    var list = toList(styles);
    if (!list.length) return false;

    var constructable = [];
    var text = "";

    list.forEach(function (item) {
      if (typeof item === "string") text += item + "\n";
      else if (item && item.cssRules) constructable.push(item);
    });

    var applied = false;

    if (constructable.length && "adoptedStyleSheets" in root) {
      root.adoptedStyleSheets = root.adoptedStyleSheets.concat(constructable);
      applied = true;
    }

    if (text) {
      if (typeof CSSStyleSheet !== "undefined" && "adoptedStyleSheets" in root) {
        try {
          var sheet = new CSSStyleSheet();
          sheet.replaceSync(text);
          root.adoptedStyleSheets = root.adoptedStyleSheets.concat([sheet]);
          return true;
        } catch (e) {
          /* replaceSync is unavailable or the text was rejected; fall through to a <style> */
        }
      }
      var el = document.createElement("style");
      el.textContent = text;
      root.appendChild(el);
      applied = true;
    }

    return applied;
  }

  /* Mounts a rendering root inside `host`. Returns the shadow root and the element the calendar should
     treat as its container - never the host itself, so the host keeps whatever layout role it had. */
  function attach(host, opts) {
    opts = opts || {};
    if (!supported()) return null;

    var root = host.shadowRoot || host.attachShadow({ mode: opts.mode || "open" });

    var styles = opts.styles;
    if (!styles) styles = findLibraryStyles();
    var styled = adoptStyles(root, styles);

    var container = document.createElement("div");
    root.appendChild(container);

    return { root: root, container: container, styled: !!styled };
  }

  Z.shadow = {
    supported: supported,
    attach: attach,
    adoptStyles: adoptStyles,
    findLibraryStyles: findLibraryStyles,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
