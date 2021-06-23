'use strict';
// 本地环境-配置文件
const storageDir = require('../electron/lib/storage').getStorageDir();

/*
 * 远程调用
 */
exports.outApi = {
  login: 'http://local.com/api/login',
};
exports.logger = {
  dir: storageDir + 'logs/local',
};
