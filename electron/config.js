'use strict';

const path = require('path');
const dayjs = require('dayjs');

exports.get = function () {
  const _config = {
    log: {
      file: {
        fileName: path.join(__dirname, '../logs/electron-' + dayjs().format('YYYY-MM-DD') + '.log'),
        level: 'silly', // error, warn, info, verbose, debug, silly
        format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}',
        maxSize: '1048576' // 1048576 (1mb) by default.
      }
    }
  }

  return _config;
};

exports.setup = function () {
  return true;
};

exports = module.exports;