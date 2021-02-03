'use strict';

global.ELog = require('electron-log');
const storage = require('./storage');
const config = require('./config');
const is = require('electron-is');
const api = require('./api');

module.exports = () => {
  storage.setup();
  logger();
  const updateConfig = config.get('autoUpdate');
  if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    || (is.linux() && updateConfig.linux)) {
    const autoUpdater = require('./autoUpdater');
    autoUpdater.setup();
  }
  api.setup();
}

function logger () {
  let logConfig = config.get('log');
  for (let transport in logConfig) {
    const configInfo = logConfig[transport];
    if (transport === 'file') {
      ELog.transports.file.level = configInfo.level;
      ELog.transports.file.file = configInfo.fileName;
      ELog.transports.file.fileName = configInfo.fileName;
      ELog.transports.file.format = configInfo.format;
      ELog.transports.file.maxSize = configInfo.maxSize;
    }
  }

  return true;
};