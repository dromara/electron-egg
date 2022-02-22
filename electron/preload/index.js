'use strict';

/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

const is = require('electron-is');
const tray = require('../library/tray');
const security = require('../library/security');
const awaken = require('../library/awaken');
const chromeExtension = require('../library/chromeExtension');

/**
 * 预加载模块入口
 */
module.exports = async (app) => {

  //已实现的功能模块，可选择性使用和修改

  tray.install(app);

  security.install(app);

  awaken.install(app);

  chromeExtension.install(app);
  
  loadUpdate(app);

}

/**
 * 加载自动升级模块
 */
function loadUpdate (app) {
  const config = app.config.autoUpdate;
  if ( (is.windows() && config.windows) || (is.macOS() && config.macOS) || (is.linux() && config.linux) ) {
    const autoUpdater = require('../library/autoUpdater');
    autoUpdater.install();

    // 是否检查更新
    if (config.force) {
      autoUpdater.checkUpdate();
    }
  }
}