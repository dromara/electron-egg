'use strict';
const ELog = require('electron-log')
const config = require('./config')

exports.setup = function () {
  console.log('glogger');
  let logConfig = config.get().log;
  for (let transport in logConfig) {
    const configInfo = logConfig[transport];
    if (transport === 'file') {
      ELog.transports.file.level = configInfo.level;
      ELog.transports.file.file = configInfo.fileName;
      ELog.transports.file.format = configInfo.format;
      ELog.transports.file.maxSize = configInfo.maxSize;
    }
  }
  global.ELog = ELog;
  return true;
};

exports = module.exports;