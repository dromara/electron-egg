'use strict';

const path = require('path');
const dayjs = require('dayjs');

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
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      //webSecurity: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
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
  }
}

exports.get = function () {
  return config;
};

exports = module.exports;