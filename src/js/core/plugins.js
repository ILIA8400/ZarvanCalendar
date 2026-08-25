/* Zarvan / core/plugins - the plugin registry.
 *
 * A plugin is an object with a name and an install function:
 *
 *   { name: "now-indicator", install: function (cal) { ...; return function uninstall() {...}; } }
 *
 * install() receives the plugin context (hooks, features, state, translator, render store, the public
 * API object it may extend) and may return a teardown function, which runs on destroy().
 *
 * Plugins registered here are installed into every calendar created afterwards, in registration order.
 * That is what lets the bundled features - highlighting, the now indicator, Excel export - live outside
 * core without changing what a consumer gets by default: their files register themselves, and dropping
 * a file from build/manifest-js.txt drops the feature and its cost. */
(function (Z) {
  "use strict";

  var registered = [];

  function use(plugin) {
    if (!plugin || !plugin.name || typeof plugin.install !== "function") {
      throw new Error("Zarvan.use: a plugin needs a name and an install function.");
    }
    // Re-registering by name replaces, so a consumer can substitute a bundled plugin with their own.
    var i = indexOf(plugin.name);
    if (i >= 0) registered[i] = plugin;
    else registered.push(plugin);
    return plugin;
  }

  function indexOf(name) {
    for (var i = 0; i < registered.length; i++) {
      if (registered[i].name === name) return i;
    }
    return -1;
  }

  function remove(name) {
    var i = indexOf(name);
    if (i < 0) return false;
    registered.splice(i, 1);
    return true;
  }

  function all() {
    return registered.slice();
  }

  function names() {
    return registered.map(function (p) {
      return p.name;
    });
  }

  /* Installs a list of plugins into one calendar. Returns the teardown for all of them.
     An install that throws is reported and skipped rather than aborting construction. */
  function installAll(plugins, pluginCtx) {
    var teardowns = [];

    plugins.forEach(function (plugin) {
      try {
        var off = plugin.install(pluginCtx);
        if (typeof off === "function") teardowns.push(off);
      } catch (e) {
        console.error('Zarvan: plugin "' + plugin.name + '" failed to install', e);
      }
    });

    return function uninstallAll() {
      teardowns.slice().reverse().forEach(function (off) {
        try {
          off();
        } catch (e) {
          console.error("Zarvan: plugin teardown failed", e);
        }
      });
      teardowns.length = 0;
    };
  }

  Z.plugins = {
    use: use,
    remove: remove,
    all: all,
    names: names,
    installAll: installAll,
  };
})(this.ZarvanInternal = this.ZarvanInternal || {});
