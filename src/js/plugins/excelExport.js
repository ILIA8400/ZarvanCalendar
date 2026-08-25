/* Zarvan / plugins/excelExport - "Export to Excel" for the visible range.
 *
 * Attaches to "sidebar" to add its button, and adds cal.exportToExcel() to the public API.
 *
 * SheetJS is not a dependency of this library. It is looked up when the button is pressed, not when
 * the page loads, and it can be supplied three ways:
 *
 *   1. options.deps.xlsx  - an explicit reference, which is what a bundler user should pass
 *   2. window.XLSX        - the global, for the <script> tag case
 *   3. not at all         - the button reports warn.xlsxMissing and nothing breaks
 *
 * That is the whole reason this is a plugin: an 881 KB dependency for one optional button should not be
 * something every consumer pays for. Dropping this file from build/manifest-js.txt removes the button,
 * the API method and the dependency together. */
(function (Z) {
  "use strict";
  var createEl = Z.dom.createEl;
  var norm = Z.utils.norm;
  var jdtSortKey = Z.jdate.jdtSortKey;
  var evUtil = Z.dataEvents;

  var COLUMN_KEYS = [
    "export.row",
    "export.title",
    "export.type",
    "export.startDate",
    "export.startTime",
    "export.endDate",
    "export.endTime",
    "export.allDay",
    "export.view",
  ];

  var COLUMN_WIDTHS = [6, 32, 14, 14, 10, 14, 10, 10, 8];

  function resolveXlsx(cal) {
    var injected = cal.options && cal.options.deps && cal.options.deps.xlsx;
    if (injected) return injected;
    return typeof XLSX !== "undefined" ? XLSX : null;
  }

  /* Events intersecting the visible range, recurrences expanded, current filters applied, in the order
     a reader would expect: chronological, then by title. */
  function collectRows(cal) {
    var range = cal.getVisibleRange();
    var events = cal
      .expandRecurring(cal.getEvents(), range.startG, range.endG)
      .filter(function (ev) {
        return evUtil.eventInVisibleRange(ev, range.startG, range.endG);
      });

    events = cal.applyFilters(events);

    events.sort(function (a, b) {
      return (
        jdtSortKey(a.start) - jdtSortKey(b.start) ||
        norm(a.title).localeCompare(norm(b.title))
      );
    });

    return events;
  }

  function buildSheetData(cal, events) {
    var t = cal.t;
    var num = cal.num;
    var viewName = cal.viewLabel();

    var aoa = [
      COLUMN_KEYS.map(function (key) {
        return t(key);
      }),
    ];

    events.forEach(function (ev, idx) {
      var startParts = String(ev.start || "").split("T");
      var endParts = String(ev.end || ev.start || "").split("T");
      var allDay = evUtil.isAllDayEvent(ev);

      aoa.push([
        num(idx + 1),
        String(ev.title || ""),
        cal.typeLabel(ev.type),
        num(startParts[0] || ""),
        allDay ? "" : num((startParts[1] || "").slice(0, 5)),
        num(endParts[0] || ""),
        allDay ? "" : num((endParts[1] || "").slice(0, 5)),
        allDay ? t("export.yes") : t("export.no"),
        viewName,
      ]);
    });

    return aoa;
  }

  function run(cal) {
    if (!cal.features.exportExcel) {
      cal.warn("warn.exportDisabled", { view: cal.state.view });
      return;
    }

    var xlsx = resolveXlsx(cal);
    if (!xlsx) {
      cal.emit("onExportError", new Error("XLSX not loaded"));
      cal.warn("warn.xlsxMissing", { view: cal.state.view });
      return;
    }

    try {
      var events = collectRows(cal);

      // Characters Windows forbids in a filename, replaced rather than dropped so words stay separated.
      var fileName =
        cal
          .t("export.fileName", { view: cal.viewLabel(), title: cal.headerTitle() })
          .replace(/[\\/:*?"<>|]/g, " ")
          .trim() + ".xlsx";

      cal.emit("onExportStart", { view: cal.state.view, fileName: fileName });

      var sheet = xlsx.utils.aoa_to_sheet(buildSheetData(cal, events));
      sheet["!cols"] = COLUMN_WIDTHS.map(function (w) {
        return { wch: w };
      });
      sheet["!autofilter"] = { ref: "A1:I1" };

      var book = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(book, sheet, cal.t("export.sheet"));
      book.Workbook = book.Workbook || {};
      book.Workbook.Views = [{ RTL: true }];

      xlsx.writeFile(book, fileName);

      cal.emit("onExportEnd", {
        view: cal.state.view,
        fileName: fileName,
        count: events.length,
      });
    } catch (err) {
      cal.emit("onExportError", err);
      cal.error(err);
      console.error(err);
    }
  }

  Z.plugins.use({
    name: "excel-export",

    install: function (cal) {
      // Public API method, available whether or not the sidebar button is rendered.
      cal.api.exportToExcel = function () {
        run(cal);
      };

      var offSidebar = cal.hooks.on("sidebar", function (e) {
        if (!cal.features.exportExcel) return;

        // Sits with the search box when there is one, so the panel keeps its existing shape.
        var host = e.el.querySelector(".zc-search") || e.el;
        var button = createEl("button", "zc-export-btn", cal.t("exportExcel"));
        button.type = "button";
        button.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          run(cal);
        });
        host.appendChild(button);
      });

      return function uninstall() {
        offSidebar();
        delete cal.api.exportToExcel;
      };
    },
  });

  Z.pluginExcelExport = { collectRows: collectRows, buildSheetData: buildSheetData, run: run };
})(this.ZarvanInternal = this.ZarvanInternal || {});
