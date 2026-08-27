/* ============================================================================
   Zarvan Calendar - documentation site engine
   ----------------------------------------------------------------------------
   Routing, navigation, in-page search, syntax highlighting, copy buttons, the
   site's own light/dark theme, and the demo lifecycle.

   No dependencies and no network: everything here is hand-written so the site
   opens from a file:// URL with no internet connection.
   ========================================================================= */
(function () {
  "use strict";

  var doc = document;
  var $ = function (sel, root) { return (root || doc).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  };

  /* ==========================================================================
     1. Syntax highlighting

     A deliberately small tokeniser. It is not a parser and does not try to be:
     it recognises comments, strings, numbers, keywords, property names and
     punctuation, which is every distinction a documentation snippet needs.
     Written by hand because the alternative is a CDN, and the site has to work
     with no network at all.
     ====================================================================== */
  var JS_KEYWORDS =
    /^(const|let|var|function|return|if|else|for|while|new|typeof|instanceof|null|undefined|true|false|async|await|class|extends|import|export|from|default|this|try|catch|finally|throw|switch|case|break|continue|delete|in|of|do|yield|void)$/;

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function wrap(cls, text) {
    return '<span class="tok-' + cls + '">' + esc(text) + "</span>";
  }

  /* One pass, longest-match-first. The order of these tests is the whole
     grammar: comments and strings must be tried before anything that could
     appear inside one. */
  function highlightJs(src) {
    var out = "";
    var i = 0;
    var n = src.length;

    while (i < n) {
      var rest = src.slice(i);
      var m;

      // line comment
      if ((m = /^\/\/[^\n]*/.exec(rest))) {
        out += wrap("com", m[0]); i += m[0].length; continue;
      }
      // block comment
      if ((m = /^\/\*[\s\S]*?\*\//.exec(rest))) {
        out += wrap("com", m[0]); i += m[0].length; continue;
      }
      // strings, including templates
      if ((m = /^"(?:[^"\\\n]|\\.)*"|^'(?:[^'\\\n]|\\.)*'|^`(?:[^`\\]|\\.)*`/.exec(rest))) {
        out += wrap("str", m[0]); i += m[0].length; continue;
      }
      // numbers
      if ((m = /^0x[\da-fA-F]+|^\d+(?:\.\d+)?(?:e[+-]?\d+)?/.exec(rest))) {
        out += wrap("num", m[0]); i += m[0].length; continue;
      }
      // identifiers
      if ((m = /^[A-Za-z_$][\w$]*/.exec(rest))) {
        var word = m[0];
        var after = rest.slice(word.length);
        if (JS_KEYWORDS.test(word)) out += wrap("key", word);
        else if (/^\s*:/.test(after)) out += wrap("prop", word);       // object key
        else if (/^\s*\(/.test(after)) out += wrap("fn", word);        // call or definition
        else out += esc(word);
        i += word.length;
        continue;
      }
      // punctuation
      if ((m = /^[{}()[\]<>=+\-*/%!?:;,.&|^~]+/.exec(rest))) {
        out += wrap("punc", m[0]); i += m[0].length; continue;
      }
      out += esc(src[i]);
      i++;
    }
    return out;
  }

  function highlightMarkup(src) {
    var out = "";
    var i = 0;
    var n = src.length;

    while (i < n) {
      var rest = src.slice(i);
      var m;

      if ((m = /^<!--[\s\S]*?-->/.exec(rest))) {
        out += wrap("com", m[0]); i += m[0].length; continue;
      }
      // a whole tag, attributes and all
      if ((m = /^<\/?[A-Za-z][\w-]*/.exec(rest))) {
        out += wrap("tag", m[0]);
        i += m[0].length;

        // attributes up to the closing bracket
        while (i < n && src[i] !== ">") {
          var tail = src.slice(i);
          var a;
          if ((a = /^\s+/.exec(tail))) { out += esc(a[0]); i += a[0].length; continue; }
          if ((a = /^[A-Za-z_:][\w:.-]*/.exec(tail))) { out += wrap("attr", a[0]); i += a[0].length; continue; }
          if ((a = /^"(?:[^"]*)"|^'(?:[^']*)'/.exec(tail))) { out += wrap("str", a[0]); i += a[0].length; continue; }
          out += wrap("punc", src[i]); i++;
        }
        continue;
      }
      if (src[i] === ">") { out += wrap("tag", ">"); i++; continue; }

      out += esc(src[i]);
      i++;
    }
    return out;
  }

  function highlightCss(src) {
    var out = "";
    var i = 0;
    var n = src.length;

    while (i < n) {
      var rest = src.slice(i);
      var m;

      if ((m = /^\/\*[\s\S]*?\*\//.exec(rest))) { out += wrap("com", m[0]); i += m[0].length; continue; }
      if ((m = /^--[\w-]+/.exec(rest))) { out += wrap("prop", m[0]); i += m[0].length; continue; }
      if ((m = /^"(?:[^"]*)"|^'(?:[^']*)'/.exec(rest))) { out += wrap("str", m[0]); i += m[0].length; continue; }
      if ((m = /^#[\da-fA-F]{3,8}\b/.exec(rest))) { out += wrap("num", m[0]); i += m[0].length; continue; }
      if ((m = /^\d+(?:\.\d+)?(?:px|em|rem|%|s|ms|vh|vw|deg)?/.exec(rest))) { out += wrap("num", m[0]); i += m[0].length; continue; }
      if ((m = /^\.[\w-]+|^[.#]?[\w-]+(?=\s*\{)/.exec(rest))) { out += wrap("tag", m[0]); i += m[0].length; continue; }
      if ((m = /^[\w-]+(?=\s*:)/.exec(rest))) { out += wrap("prop", m[0]); i += m[0].length; continue; }
      if ((m = /^[{}();:,]+/.exec(rest))) { out += wrap("punc", m[0]); i += m[0].length; continue; }

      out += esc(src[i]);
      i++;
    }
    return out;
  }

  function highlight(src, lang) {
    if (lang === "html") return highlightMarkup(src);
    if (lang === "css") return highlightCss(src);
    if (lang === "bash" || lang === "text") return esc(src);
    return highlightJs(src);
  }

  /* Snippets are authored inside <pre><code> in the page, which means their
     indentation is the HTML's indentation. Strip the common leading run so the
     rendered block starts at column zero. */
  function dedent(text) {
    var lines = text.replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

    var indent = lines.reduce(function (min, line) {
      if (!line.trim()) return min;
      var lead = line.match(/^ */)[0].length;
      return min === null ? lead : Math.min(min, lead);
    }, null);

    if (!indent) return lines.join("\n");
    return lines
      .map(function (l) { return l.slice(indent); })
      .join("\n");
  }

  var COPY_ICON =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="5.5" y="5.5" width="8" height="9" rx="1.5"/>' +
    '<path d="M10.5 5.5V3a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v7A1.5 1.5 0 0 0 4 11.5h1.5"/></svg>';

  function enhanceCodeBlocks(root) {
    $$(".zd-code", root).forEach(function (block) {
      if (block.dataset.ready) return;
      block.dataset.ready = "1";

      var code = $("code", block);
      if (!code) return;

      var lang = block.dataset.lang || "js";
      var source = dedent(code.textContent);

      code.innerHTML = highlight(source, lang);
      block.dataset.source = source;

      if (block.dataset.copy === "off") return;

      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "zd-copy";
      btn.innerHTML = COPY_ICON + "<span>Copy</span>";
      btn.addEventListener("click", function () { copyText(source, btn); });
      block.appendChild(btn);
    });
  }

  /* navigator.clipboard needs a secure context, which a file:// page is not, so
     the textarea fallback is the path that actually runs for a reader who opened
     the site by double-clicking it. */
  function copyText(text, btn) {
    function done() {
      var label = $("span", btn);
      var previous = label.textContent;
      label.textContent = "Copied";
      btn.classList.add("is-done");
      setTimeout(function () {
        label.textContent = previous;
        btn.classList.remove("is-done");
      }, 1400);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
    } else {
      legacyCopy(text, done);
    }
  }

  function legacyCopy(text, done) {
    var ta = doc.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand("copy"); done(); } catch (e) { /* nothing else to try */ }
    doc.body.removeChild(ta);
  }

  /* ==========================================================================
     2. Theme

     The site's own light/dark, persisted. It also drives every demo calendar:
     `Docs.onTheme` subscribers are how the demos keep in step, which makes the
     whole page a live demonstration of `setColorScheme()`.
     ====================================================================== */
  var themeSubs = [];
  var THEME_KEY = "zarvan-docs-theme";

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  var theme = storedTheme() || systemTheme();

  function applyTheme(next, persist) {
    theme = next;
    doc.documentElement.setAttribute("data-theme", next);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
    }
    var toggle = $("#zd-theme");
    if (toggle) {
      toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
      toggle.setAttribute("title", next === "dark" ? "Light theme" : "Dark theme");
    }
    themeSubs.forEach(function (fn) {
      try { fn(next); } catch (e) { console.error(e); }
    });
  }

  /* ==========================================================================
     3. Demo registry

     A demo is registered by section id. It is built the first time its section
     is opened and torn down when the reader leaves, so at most one or two
     calendars are alive at a time no matter how long the visit is - and every
     teardown exercises the library's own destroy().
     ====================================================================== */
  var demoFactories = Object.create(null);
  var liveDemos = Object.create(null);

  function registerDemo(sectionId, factory) {
    demoFactories[sectionId] = factory;
  }

  function mountDemos(sectionId) {
    var factory = demoFactories[sectionId];
    if (!factory || liveDemos[sectionId]) return;

    var section = doc.getElementById("section-" + sectionId);
    if (!section) return;

    try {
      liveDemos[sectionId] = factory(section) || { destroy: function () {} };
    } catch (e) {
      console.error("Zarvan docs: demo '" + sectionId + "' failed to start", e);
      liveDemos[sectionId] = { destroy: function () {} };
    }
  }

  function unmountDemos(sectionId) {
    var live = liveDemos[sectionId];
    if (!live) return;
    try {
      if (typeof live.destroy === "function") live.destroy();
    } catch (e) {
      console.error("Zarvan docs: demo '" + sectionId + "' failed to stop", e);
    }
    delete liveDemos[sectionId];
  }

  /* ==========================================================================
     4. Routing

     Hash routing over sections that are all present in the document. The site is
     one page: no fetch, so it works from file://, and navigation costs nothing.
     ====================================================================== */
  var sections = [];
  var navLinks = [];
  var current = null;

  function sectionIds() {
    return sections.map(function (s) { return s.id.replace(/^section-/, ""); });
  }

  function go(id, opts) {
    opts = opts || {};
    var target = doc.getElementById("section-" + id);
    if (!target) { id = sectionIds()[0]; target = doc.getElementById("section-" + id); }
    if (!target || current === id) {
      if (current === id && opts.hash) scrollToHeading(opts.hash);
      return;
    }

    if (current) unmountDemos(current);

    sections.forEach(function (s) { s.classList.toggle("is-active", s === target); });
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    current = id;
    doc.title = (target.dataset.title || "Zarvan Calendar") + " — Zarvan Calendar";

    buildToc(target);
    enhanceCodeBlocks(target);
    mountDemos(id);
    updatePager(id);

    if (opts.hash) scrollToHeading(opts.hash);
    else if (!opts.silent) window.scrollTo({ top: 0, behavior: "auto" });

    doc.body.classList.remove("zd-nav-open");

    // Keep the active item visible in a long sidebar.
    var active = $(".zd-nav-link.is-active");
    if (active && active.scrollIntoView) {
      var box = active.getBoundingClientRect();
      if (box.top < 90 || box.bottom > window.innerHeight - 20) {
        active.scrollIntoView({ block: "center" });
      }
    }
  }

  function scrollToHeading(hash) {
    var el = doc.getElementById(hash);
    if (!el) return;
    // Let the section paint before measuring where the heading landed.
    requestAnimationFrame(function () {
      var top = el.getBoundingClientRect().top + window.pageYOffset - 78;
      window.scrollTo({ top: top, behavior: "auto" });
    });
  }

  function readHash() {
    var raw = location.hash.replace(/^#/, "");
    if (!raw) return { id: sectionIds()[0], hash: null };
    var parts = raw.split("/");
    return { id: parts[0], hash: parts[1] || null };
  }

  function route() {
    var r = readHash();
    go(r.id, { hash: r.hash });
  }

  /* ---- "on this page" ---- */
  var tocLinks = [];

  function buildToc(section) {
    var toc = $("#zd-toc");
    if (!toc) return;

    var headings = $$("h2[id], h3[id]", section);
    tocLinks = [];

    if (headings.length < 2) {
      toc.innerHTML = "";
      toc.hidden = true;
      return;
    }
    toc.hidden = false;

    var id = section.id.replace(/^section-/, "");
    var html = '<p class="zd-toc-title">On this page</p>';
    headings.forEach(function (h) {
      var text = h.dataset.toc || h.textContent.replace("#", "").trim();
      var pad = h.tagName === "H3" ? ' style="padding-left:12px"' : "";
      html += '<a href="#' + id + "/" + h.id + '"' + pad + ">" + esc(text) + "</a>";
    });
    toc.innerHTML = html;
    tocLinks = $$("a", toc);
  }

  function syncToc() {
    if (!tocLinks.length) return;
    var best = null;
    tocLinks.forEach(function (a) {
      var target = doc.getElementById(a.getAttribute("href").split("/")[1]);
      if (!target) return;
      if (target.getBoundingClientRect().top - 96 <= 0) best = a;
    });
    if (!best) best = tocLinks[0];
    tocLinks.forEach(function (a) { a.classList.toggle("is-active", a === best); });
  }

  /* ---- previous / next ---- */
  function updatePager(id) {
    var pager = $(".zd-pager", doc.getElementById("section-" + id));
    if (!pager) return;

    var ids = sectionIds();
    var i = ids.indexOf(id);
    var prev = i > 0 ? ids[i - 1] : null;
    var next = i < ids.length - 1 ? ids[i + 1] : null;

    var html = "";
    if (prev) {
      html +=
        '<a class="zd-pager-prev" href="#' + prev + '"><small>Previous</small><span>' +
        esc(titleOf(prev)) + "</span></a>";
    }
    if (next) {
      html +=
        '<a class="zd-pager-next" href="#' + next + '"><small>Next</small><span>' +
        esc(titleOf(next)) + "</span></a>";
    }
    pager.innerHTML = html;
  }

  function titleOf(id) {
    var s = doc.getElementById("section-" + id);
    return (s && s.dataset.title) || id;
  }

  /* ==========================================================================
     5. Search

     Built from the document itself on load: every section, plus every h2/h3
     inside it. No index file to keep in step with the prose.
     ====================================================================== */
  var index = [];
  var resultEls = [];
  var activeResult = -1;

  function buildIndex() {
    index = [];
    sections.forEach(function (section) {
      var id = section.id.replace(/^section-/, "");
      var title = section.dataset.title || id;
      var group = section.dataset.group || "";

      index.push({
        href: "#" + id,
        title: title,
        sub: group,
        text: (title + " " + (section.dataset.keywords || "")).toLowerCase(),
      });

      $$("h2[id], h3[id]", section).forEach(function (h) {
        var text = (h.dataset.toc || h.textContent).replace("#", "").trim();
        index.push({
          href: "#" + id + "/" + h.id,
          title: text,
          sub: title,
          text: (text + " " + title).toLowerCase(),
        });
      });
    });
  }

  function search(q) {
    var needle = q.trim().toLowerCase();
    if (!needle) return [];

    var terms = needle.split(/\s+/);
    return index
      .map(function (entry) {
        var score = 0;
        for (var i = 0; i < terms.length; i++) {
          var at = entry.text.indexOf(terms[i]);
          if (at < 0) return null;
          score += at === 0 ? 3 : 1;
          if (entry.title.toLowerCase().indexOf(terms[i]) === 0) score += 2;
        }
        return { entry: entry, score: score };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 12)
      .map(function (r) { return r.entry; });
  }

  function renderResults(list) {
    var box = $("#zd-results");
    if (!list.length) {
      box.innerHTML = '<p class="zd-result-empty">No matches</p>';
      resultEls = [];
      activeResult = -1;
      box.hidden = false;
      return;
    }
    box.innerHTML = list
      .map(function (e) {
        return (
          '<a class="zd-result" href="' + e.href + '">' + esc(e.title) +
          (e.sub ? "<small>" + esc(e.sub) + "</small>" : "") + "</a>"
        );
      })
      .join("");
    resultEls = $$(".zd-result", box);
    activeResult = -1;
    box.hidden = false;
  }

  function closeResults() {
    var box = $("#zd-results");
    box.hidden = true;
    resultEls = [];
    activeResult = -1;
  }

  function moveResult(delta) {
    if (!resultEls.length) return;
    activeResult = (activeResult + delta + resultEls.length) % resultEls.length;
    resultEls.forEach(function (el, i) { el.classList.toggle("is-active", i === activeResult); });
    resultEls[activeResult].scrollIntoView({ block: "nearest" });
  }

  /* ==========================================================================
     6. Boot
     ====================================================================== */
  function init() {
    applyTheme(theme, false);

    sections = $$(".zd-section");
    navLinks = $$(".zd-nav-link");

    buildIndex();

    // Heading anchors, so any heading can be linked to.
    sections.forEach(function (section) {
      var id = section.id.replace(/^section-/, "");
      $$("h2[id], h3[id]", section).forEach(function (h) {
        var a = doc.createElement("a");
        a.className = "zd-anchor";
        a.href = "#" + id + "/" + h.id;
        a.textContent = "#";
        a.setAttribute("aria-label", "Link to this section");
        h.appendChild(a);
      });
    });

    window.addEventListener("hashchange", route);
    route();

    // ---- theme toggle ----
    $("#zd-theme").addEventListener("click", function () {
      applyTheme(theme === "dark" ? "light" : "dark", true);
    });

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystem = function () { if (!storedTheme()) applyTheme(systemTheme(), false); };
      if (mq.addEventListener) mq.addEventListener("change", onSystem);
      else if (mq.addListener) mq.addListener(onSystem);
    }

    // ---- mobile nav ----
    $("#zd-menu").addEventListener("click", function () {
      doc.body.classList.toggle("zd-nav-open");
    });
    $("#zd-scrim").addEventListener("click", function () {
      doc.body.classList.remove("zd-nav-open");
    });

    // ---- search ----
    var input = $("#zd-search");
    input.addEventListener("input", function () {
      var q = input.value;
      if (!q.trim()) { closeResults(); return; }
      renderResults(search(q));
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); moveResult(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveResult(-1); }
      else if (e.key === "Enter") {
        var pick = resultEls[activeResult] || resultEls[0];
        if (pick) { e.preventDefault(); location.hash = pick.getAttribute("href"); input.blur(); closeResults(); }
      } else if (e.key === "Escape") {
        input.value = ""; closeResults(); input.blur();
      }
    });
    input.addEventListener("focus", function () {
      if (input.value.trim()) renderResults(search(input.value));
    });
    doc.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest(".zd-search-wrap")) closeResults();
    });
    $("#zd-results").addEventListener("click", function (e) {
      if (e.target.closest(".zd-result")) { input.blur(); closeResults(); }
    });

    doc.addEventListener("keydown", function (e) {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) &&
          doc.activeElement !== input &&
          !/^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    window.addEventListener("scroll", syncToc, { passive: true });

    // Anything still hidden gets highlighted the first time it is shown; the
    // active section is done by go(). This covers print and no-JS-route cases.
    enhanceCodeBlocks(doc);
  }

  /* ==========================================================================
     7. Public surface for the demo file
     ====================================================================== */
  window.Docs = {
    registerDemo: registerDemo,
    highlight: highlight,
    dedent: dedent,
    enhanceCodeBlocks: enhanceCodeBlocks,
    $: $,
    $$: $$,
    esc: esc,

    /** The site's current theme, and a subscription to changes. */
    theme: function () { return theme; },
    onTheme: function (fn) {
      themeSubs.push(fn);
      return function off() {
        var i = themeSubs.indexOf(fn);
        if (i >= 0) themeSubs.splice(i, 1);
      };
    },
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
