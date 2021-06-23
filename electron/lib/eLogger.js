const eLog = require('electron-log');
const config = require('../config');

class Log {
  constructor () {
    if (typeof Log.instance === 'object') {
      return Log.instance;
    }

    let logConfig = config.get('log');
    for (let transport in logConfig) {
      const configInfo = logConfig[transport];
      if (transport === 'file') {
        eLog.transports.file.level = configInfo.level;
        eLog.transports.file.file = configInfo.fileName;
        eLog.transports.file.fileName = configInfo.fileName;
        eLog.transports.file.format = configInfo.format;
        eLog.transports.file.maxSize = configInfo.maxSize;
      }  
    }
    Log.instance = eLog;

    return Log.instance;
  }
}

exports.setup = function () {
  return new Log();
}

exports.get = function () {
  return new Log();
}

exports = module.exports;