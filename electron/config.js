'use strict';

const path = require('path');
const dayjs = require('dayjs');
const storage = require('./storage');

const config = {
  developmentMode: {
    default: 'vue',
    mode: {
      vue: {
        hostname: 'localhost',
        port: 8080
      },
      react: {
        hostname: 'localhost',
        port: 3000
      },
      ejs: {
        hostname: 'localhost',
        port: 7068 // The same as the egg port
      }
    }
  },
  log: {
    file: {
      fileName: path.normalize(storage.getStorageDir() + 'logs/electron-' + dayjs().format('YYYY-MM-DD') + '.log'),
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
      contextIsolation: false, // 设置此项为false后，才可在渲染进程中使用electron api
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
    hostname: 'localhost',
    workers: 1
  },
  autoUpdate: {
    windows: false, // windows可以开启；macOs 需要签名验证
    macOS: false,
    Linux: false,
    options: {
      provider: 'generic', // or github, s3, bintray
      url: 'https://raw.githubusercontent.com/wallace5303/electron-egg/master/' // resource dir
    }
  }
}

exports.get = function (flag = '', env = 'prod') {
  console.log('[config] [get] flag:', flag);
  if (flag === 'developmentMode') {
    return config.developmentMode;
  }

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
    if (env === 'prod' && eggConfig.port) {
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
