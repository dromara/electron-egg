/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

const { logger } = require('ee-core/log');
const { trayService } = require('../service/os/tray');
const { securityService } = require('../service/os/security');
const { autoUpdaterService } = require('../service/os/auto_updater');
const { crossService } = require('../service/cross');
const { sqlitedbService } = require('../service/database/sqlitedb');
const { windowService } = require('../service/os/window');

function preload() {
  // 示例功能模块，可选择性使用和修改
  logger.info('[preload] load 5');
  windowService.init();
  trayService.init();
  securityService.init();
  autoUpdaterService.init();
  // init sqlite db
  sqlitedbService.init();
  // go server
  crossService.createGoServer();
}

/**
* 预加载模块入口
*/
module.exports = {
  preload
}