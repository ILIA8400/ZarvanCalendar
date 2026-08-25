/* Zarvan / locale/fa - Persian. The only bundled locale, and the fallback every other one inherits
 * from.
 *
 * Zarvan is a Persian calendar: the calendar system is Jalali, the layout is right-to-left, and this
 * is the vocabulary. To change the wording without replacing the locale, pass
 * `locale: { code: "fa", strings: { … } }` to create(). */
(function (Z) {
  "use strict";

  Z.locale.register({
    code: "fa",

    // The Jalali week starts on Saturday.
    weekdays: ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"],

    /* Listed explicitly rather than derived by taking the first character: "یک‌شنبه" begins with a
       zero-width-joined "ی" and slicing it produced the wrong glyph, which the old code worked around
       with a special case for that one name. */
    weekdaysShort: ["ش", "ی", "د", "س", "چ", "پ", "ج"],

    months: [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ],

    digits: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],

    strings: {
      // --- header ---
      today: "امروز",
      menu: "منو",
      prev: "قبلی",
      next: "بعدی",
      viewLabel: "نمایش",

      // --- view names ---
      "view.day": "روز",
      "view.week": "هفته",
      "view.month": "ماه",
      "view.year": "سال",
      "view.list": "لیست",

      // --- sidebar ---
      typeLabel: "نوع",
      allTypes: "همه",
      noType: "بدون نوع",
      searchLabel: "جستجو",
      searchPlaceholder: "عنوان رویداد…",
      exportExcel: "خروجی اکسل",
      miniPrev: "‹",
      miniNext: "›",

      // --- grid ---
      allDayRow: "تمام روز",
      allDayEvent: "تمام‌روز",
      moreEvents: "+{count} رویداد دیگر",
      listEmpty: "رویدادی برای این بازه وجود ندارد.",

      // --- modal ---
      modalTitle: "رویدادهای {date}",
      close: "بستن",

      // --- Excel export ---
      "export.sheet": "رویدادها",
      "export.fileName": "رویدادها - {view} - {title}",
      "export.row": "ردیف",
      "export.title": "عنوان",
      "export.type": "نوع",
      "export.startDate": "تاریخ شروع",
      "export.startTime": "زمان شروع",
      "export.endDate": "تاریخ پایان",
      "export.endTime": "زمان پایان",
      "export.allDay": "تمام‌روز",
      "export.view": "نمایش",
      "export.yes": "بله",
      "export.no": "خیر",

      // --- warnings, keyed by the code emitted alongside them ---
      "warn.viewDisabled": "این ویو غیرفعال است.",
      "warn.unknownView": "ویو ناشناخته است.",
      "warn.exportDisabled": "خروجی اکسل غیرفعال است.",
      "warn.xlsxMissing": "کتابخانه xlsx لود نشده است.",
      "warn.optionNotHot": "این تنظیم پس از ساخت تقویم قابل تغییر نیست.",
      "warn.invalidStart": "رویداد نامعتبر: start مشکل دارد.",
      "warn.invalidEnd": "رویداد نامعتبر: end مشکل دارد.",
      "warn.endFixed": "رویداد: end نامعتبر بود، end=start شد.",
    },
  });
})(this.ZarvanInternal = this.ZarvanInternal || {});
