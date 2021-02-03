'use strict';
// 本地环境-配置文件

const storageDir = require('../electron/storage').getStorageDir();

/*
 * 远程调用
 */
exports.outApi = {
  login: 'http://api.local.com/api/login',
};
exports.logger = {
  dir: storageDir + 'logs/prod',
};

