/* Zarvan / core/utils - generic helpers. No DOM, no calendar knowledge, no state. */
(function (Z) {
  "use strict";

  function isPlainObject(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }

  function mergeDeep(a, b) {
    a = a || {};
    b = b || {};
    var out = Array.isArray(a) ? a.slice() : Object.assign({}, a);

    Object.keys(b).forEach(function (k) {
      var av = out[k];
      var bv = b[k];
      if (isPlainObject(bv)) out[k] = mergeDeep(isPlainObject(av) ? av : {}, bv);
      else out[k] = bv;
    });
    return out;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function pad2(x) {
    return String(x).padStart(2, "0");
  }

  function norm(s) {
    return String(s || "")
      .trim()
      .toLowerCase();
  }

  // Event types come from user data, so they can never be written into a class attribute or a CSS
  // selector as-is. Strip everything outside [A-Za-z0-9_-] and namespace the result.
  function typeClass(type) {
    var t = String(type == null ? "" : type)
      .trim()
      .replace(/[^A-Za-z0-9_-]/g, "");
    return t ? "zc-type-" + t : "";
  }

  // FNV-1a. Used to derive a stable colour hue, and a stable numeric id, from a string.
  function hashStr(str) {
    str = String(str || "");
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  Z.utils = {
    isPlainObject: isPlainObject,
    mergeDeep: mergeDeep,
    clamp: clamp,
    pad2: pad2,
    norm: norm,
    typeClass: typeClass,
    hashStr: hashStr,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
