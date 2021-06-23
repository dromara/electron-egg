'use strict';

const storage = require('./storage');
const config = require('./config');
const is = require('electron-is');
const api = require('./api');
const ipc = require('./ipc');
const eLogger = require('./lib/eLogger');

module.exports = () => {
  // 存储模块
  storage.setup();
  // 日志
  eLogger.setup();
  // 自动更新
  const updateConfig = config.get('autoUpdate');
  if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    || (is.linux() && updateConfig.linux)) {
    const autoUpdater = require('./autoUpdater');
    autoUpdater.setup();
  }
  // electron业务模块
  api.setup();
  // ipc模块
  ipc.setup();
}
