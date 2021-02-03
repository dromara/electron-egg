'use strict';

global.ELog = require('electron-log');
const storage = require('./storage');
const config = require('./config');
// const autoUpdater = require('./autoUpdater');
const api = require('./api');

module.exports = () => {
  storage.setup();
  logger();
  // autoUpdater.setup();
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