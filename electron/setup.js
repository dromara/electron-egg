'use strict';

const is = require('electron-is');
const config = require('./config');
const storage = require('./lib/storage');
const api = require('./lib/api');
const ipc = require('./lib/ipcMain');
const eLogger = require('./lib/eLogger');
const crash = require('./lib/crashReport');

module.exports = () => {
  // 存储模块
  storage.setup();

  // 日志
  eLogger.setup();

  // 自动更新
  loadUpdate();

  // electron业务模块
  api.setup();

  // ipc模块
  ipc.setup();

  // 崩溃上报
  crash.setup();
}

function loadUpdate () {
  const updateConfig = config.get('autoUpdate');
  if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    || (is.linux() && updateConfig.linux)) {
    const autoUpdater = require('./lib/autoUpdater');
    autoUpdater.setup();
  }

  return true;
}