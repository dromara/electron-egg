'use strict';

const { globalShortcut } = require('electron');
const storage = require('./storage');

/**
 * 安装模块
 */
exports.setup = function () {
  // default
  console.log('[electron-lib-shortcut] [setup]');
  storage.iniPreferences();
}

/**
 * 快捷键注册
 * @param {Object} shortcutObj - shortcut object
 * @param {Boolean} force - force register
 * @param {Function} fn - callback
 * @return {Boolean}
 */
exports.register = function (shortcutObj, force = true, fn) {
  if (!shortcutObj['id'] || !shortcutObj['name'] || !shortcutObj['cmd']) {
    return false;
  }
  const isRegistered = this.isRegistered(shortcutObj['cmd']);
  if (isRegistered && !force) {
    return false;
  }
  storage.setShortcuts(shortcutObj);
  globalShortcut.register(shortcutObj['cmd'], fn)

  return true;
}

/**
 * 快捷键是否注册成功
 * @param {String} cmd - shortcut string
 * @return {Boolean}
 */
exports.isRegistered = function (cmd) {
  return globalShortcut.isRegistered(cmd)
}

/**
 * 注销全局快捷键
 * @param {String} cmd - shortcut string
 * @return {Boolean}
 */
exports.unregister = function (cmd) {
  globalShortcut.unregister(cmd)
}

exports = module.exports;