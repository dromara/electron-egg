'use strict';

const Utils = require('ee-core').Utils;
const logDir = Utils.getLogDir();

/*
 * 日志dir目录，会随开发环境变动，请谨慎修改
 */
exports.logger = {
  dir: logDir,
};



