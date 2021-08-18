'use strict';

const path = require('path');
const dayjs = require('dayjs');
const storage = require('./lib/storage');

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
    frame: true,
    //titleBarStyle: 'hidden'
  },
  egg: {
    title: 'electron-egg', // 进程的title属性标识（默认你的应用名称-英文）
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
      url: 'http://kodo.qiniu.com/' // resource dir, end with '/'
    }
  },
  awakeProtocol: {
    protocol: 'electron-egg', // 自定义协议名（默认你的应用名称-英文）
    args: []
  },
  crashReport: {
    submitURL: "",
    productName: "", 
    rateLimit: false,
    uploadToServer: false, 
    ignoreSystemCrashHandler: true,
    compress: false
  },
  remoteUrl: {
    enable: false,
    url: 'https://discuz.chat/' // Any web url
  },
}

exports.get = function (flag = '', env = 'prod') {
  console.log('[config] [get] flag:', flag);

  if (flag === 'egg') {
    const eggConfig = storage.getEggConfig();
    if (env === 'prod' && eggConfig.port) {
      config.egg.port = eggConfig.port;
    }
    return config.egg;
  }

  if (flag in config) {
    return config[flag];
  }

  return {};
};

exports = module.exports;
