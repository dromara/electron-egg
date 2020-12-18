'use strict';

const path = require('path');
const dayjs = require('dayjs');
const storage = require('./storage');

const config = {
  log: {
    file: {
      fileName: path.normalize('./logs/electron-' + dayjs().format('YYYY-MM-DD') + '.log'),
      level: 'silly', // error, warn, info, verbose, debug, silly
      format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}',
      maxSize: '1048576' // 1048576 (1mb) by default.
    }
  },
  windowsOption: {
    width: 980,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      //webSecurity: false,
      nodeIntegration: true,
      preload: path.join(__dirname, '../preload.js')
    },
    //frame: false,
    //titleBarStyle: 'hidden'
  },
  egg: {
    title: 'electron-egg',
    env: 'prod',
    port: 7068,
    hostname: '0.0.0.0',
    workers: 1
  },
  autoUpdate: {
    enable: false,
    options: {
      provider: 'generic', // or github, s3, bintray
      url: 'https://raw.githubusercontent.com/wallace5303/electron-egg/master/' // resource dir
    }
  }
}

exports.get = function (flag = '') {
  console.log('[config] [get] flag:', flag);
  if (flag === 'log') {
    return config.log;
  }

  if (flag === 'windowsOption') {
    return config.windowsOption;
  }

  if (flag === 'webEgg') {
    return config.egg;
  }
  
  if (flag === 'egg') {
    const eggConfig = storage.getEggConfig();
    if (eggConfig.port) {
      config.egg.port = eggConfig.port;
    }
    return config.egg;
  }

  if (flag === 'autoUpdate') {
    return config.autoUpdate;
  }
  
  return {};
};

exports = module.exports;