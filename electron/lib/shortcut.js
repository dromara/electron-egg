'use strict';

const { globalShortcut } = require('electron');
const storage = require('./storage');

exports.setup = function () {
  // default
  storage.iniPreferences();
}

exports.register = function (shortcutObj, force = true, fn) {
  if (!shortcutObj['id'] || !shortcutObj['name'] || !shortcutObj['cmd']) {
    return false;
  }
  const isRegistered = this.isRegistered(shortcutObj['cmd']);
  console.log('[shortcut] [register] cmd:', [shortcutObj['cmd'], isRegistered]);
  if (isRegistered && !force) {
    return false;
  }
  storage.setShortcuts(shortcutObj);
  globalShortcut.register(shortcutObj['cmd'], fn)
}

exports.isRegistered = function (cmd) {
  return globalShortcut.isRegistered(cmd)
}

exports.unregister = function (cmd) {
  globalShortcut.unregister(cmd)
}

exports = module.exports;