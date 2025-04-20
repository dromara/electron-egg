/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

const { logger } = require('ee-core/log');
const { trayService } = require('../service/os/tray');
const { securityService } = require('../service/os/security');
const { autoUpdaterService } = require('../service/os/auto_updater');
const { sqlitedbService } = require('../service/database/sqlitedb');
const { livechatService } = require('../service/livechat');
const { pythonServer } = require('../service/PythonServer');
// liveMonitorService将在应用准备好后再加载

function preload() {
    // 示例功能模块，可选择性使用和修改
    logger.info('[preload] load 5');
    trayService.create();
    securityService.create();
    autoUpdaterService.create();

    // 启动Python服务
    pythonServer.createPythonServer().then(() => {
        logger.info('[preload] 直播录制服务启动成功');
    }).catch(err => {
        logger.error(`[preload] 直播录制服务服务启动失败: ${err.message}`);
    });

    livechatService.createPythonServer().then(() => {
        logger.info('[preload] 直播监控服务启动成功');
    }).catch(err => {
        logger.error(`[preload] 直播监控服务启动失败: ${err.message}`);
    });


    // init sqlite db
    sqlitedbService.init();


}



/**
 * 预加载模块入口
 */
module.exports = {
    preload
}