'use strict';
// 本地环境-配置文件

// const path = require('path');
// const os = require('os');
// const pkg = require('../package.json');
// const storageDir = path.normalize(os.userInfo().homedir + '/' + pkg.name + '/');
const storageDir = require('../electron/storage').getStorageDir();

/*
 * 远程调用
 */
exports.outApi = {
  login: 'http://local.com/api/login',
};
exports.logger = {
  dir: storageDir + 'logs/local',
};
