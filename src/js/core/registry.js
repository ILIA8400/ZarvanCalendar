/* Zarvan / core/registry - an ordered, named collection.
 *
 * Used for views today; the same shape suits locales, exporters and plugins later.
 *
 * Entries carry an `order` so a caller can present them in a stable sequence that is independent of
 * registration order - a third-party view registered at runtime should still be able to sit between
 * two built-ins. */
(function (Z) {
  "use strict";

  function createRegistry(name) {
    var entries = Object.create(null);

    function register(key, def) {
      if (!key) throw new Error("Zarvan: a " + name + " needs a key.");
      entries[key] = Object.assign({}, def, { key: key });
      return entries[key];
    }

    function get(key) {
      return entries[key] || null;
    }

    function has(key) {
      return !!entries[key];
    }

    function remove(key) {
      var had = !!entries[key];
      delete entries[key];
      return had;
    }

    function keys() {
      return values().map(function (d) {
        return d.key;
      });
    }

    function values() {
      return Object.keys(entries)
        .map(function (k) {
          return entries[k];
        })
        .sort(function (a, b) {
          var ao = a.order == null ? 100 : a.order;
          var bo = b.order == null ? 100 : b.order;
          return ao - bo || String(a.key).localeCompare(String(b.key));
        });
    }

    return {
      register: register,
      get: get,
      has: has,
      remove: remove,
      keys: keys,
      values: values,
      get size() {
        return Object.keys(entries).length;
      },
    };
  }

  Z.registry = { createRegistry: createRegistry };
})(this.ZarvanInternal = this.ZarvanInternal || {});
