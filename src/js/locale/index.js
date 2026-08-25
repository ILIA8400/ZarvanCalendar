/* Zarvan / locale - translation lookup and the locale registry.
 *
 * A locale is a plain object:
 *
 *   {
 *     code:          "fa",
 *     weekdays:      [7 names, starting Saturday],
 *     weekdaysShort: [7 short names],
 *     months:        [12 Jalali month names],
 *     digits:        ["۰".."۹"] or null to leave numerals alone,
 *     strings:       { key: "text with {placeholders}" }
 *   }
 *
 * Missing keys fall back to the default locale, then to the key itself, so a partial locale is usable
 * and a typo is visible rather than silently blank.
 *
 * There is no `direction`. Zarvan renders right-to-left, always - that is a property of the
 * stylesheet, not of the locale, and it is not configurable. */
(function (Z) {
  "use strict";

  var locales = Object.create(null);
  var defaultCode = null;

  function register(locale) {
    if (!locale || !locale.code) throw new Error("Zarvan: a locale needs a code.");
    locales[locale.code] = locale;
    if (!defaultCode) defaultCode = locale.code;
    return locale;
  }

  function get(code) {
    return locales[code] || null;
  }

  function has(code) {
    return !!locales[code];
  }

  function codes() {
    return Object.keys(locales);
  }

  /* Accepts a code, a locale object, or a partial object with a `code` naming the one to extend:
       "fa"                                  -> the bundled Persian locale
       { code: "fa", strings: { today: … } } -> Persian with one string overridden
       { code: "xx", weekdays: [...], … }    -> a whole locale, defaults filled from the fallback

     The middle form is the one most consumers want: it is how you change the calendar's wording to
     match your own product vocabulary without shipping a locale file. */
  function resolve(input) {
    var base = locales[defaultCode] || {};
    if (!input) return base;

    if (typeof input === "string") return locales[input] || base;

    var parent = (input.code && locales[input.code]) || base;
    return {
      code: input.code || parent.code,
      weekdays: input.weekdays || parent.weekdays,
      weekdaysShort: input.weekdaysShort || parent.weekdaysShort,
      months: input.months || parent.months,
      digits: input.digits !== undefined ? input.digits : parent.digits,
      strings: Object.assign({}, parent.strings, input.strings || {}),
    };
  }

  function interpolate(template, params) {
    if (!params) return template;
    return String(template).replace(/\{(\w+)\}/g, function (whole, name) {
      return params[name] == null ? whole : params[name];
    });
  }

  /* Builds the per-instance translator. `t(key, params)` is the only thing render code needs. */
  function createTranslator(locale) {
    var fallback = locales[defaultCode] || {};

    function t(key, params) {
      var table = locale.strings || {};
      var text = table[key];
      if (text == null) text = (fallback.strings || {})[key];
      if (text == null) text = key; // visible, rather than an empty label
      return interpolate(text, params);
    }

    /* Numeral shaping. Locales without a `digits` array leave numbers as they are. */
    function num(value) {
      var s = String(value == null ? "" : value);
      var d = locale.digits;
      if (!d || !d.length) return s;
      return s.replace(/[0-9]/g, function (ch) {
        return d[Number(ch)] || ch;
      });
    }

    return {
      code: locale.code,
      weekdays: locale.weekdays || fallback.weekdays || [],
      weekdaysShort: locale.weekdaysShort || fallback.weekdaysShort || [],
      months: locale.months || fallback.months || [],
      t: t,
      num: num,
      raw: locale,
    };
  }

  Z.locale = {
    register: register,
    get: get,
    has: has,
    codes: codes,
    resolve: resolve,
    interpolate: interpolate,
    createTranslator: createTranslator,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
