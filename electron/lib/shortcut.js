'use strict';

const { globalShortcut } = require('electron');
const storage = require('./storage');

const shortcutList = {
  'CommandOrControl+Shift+s': 'showWindow',
  'CommandOrControl+Shift+h': 'hideWindow',
}

exports.setup = function () {
  // default
  //const preferences = storage.getPreferences();
  // const shortcuts = preferences.hasOwnProperty('shortcuts') ? preferences.shortcuts : {};
  // storage.setShortcuts(shortcuts);

  // for (let key in shortcuts) {
  //   const fn = this.shortcuts[key]();
  //   console.log(fn.toString());
  //   this.register(key, fn);
  // }
}

exports.register = function (cmd, fn, force = true) {
  const isRegistered = this.isRegistered(cmd);
  console.log('[shortcut] [register] cmd:', [cmd, isRegistered]);
  if (isRegistered && !force) {
    return;
  }
  globalShortcut.register(cmd, fn)
}

exports.isRegistered = function (cmd) {
  return globalShortcut.isRegistered(cmd)
}

exports.unregister = function (cmd) {
  globalShortcut.unregister(cmd)
}

// function showWindow () {
//   MAIN_WINDOW.show()
// }

// function hideWindow () {
//   MAIN_WINDOW.hide()
// }

exports = module.exports;