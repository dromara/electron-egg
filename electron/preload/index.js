/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

const { logger } = require('ee-core/log');
const { trayService } = require('../service/os/tray');
const { securityService } = require('../service/os/security');
const { autoUpdaterService } = require('../service/os/auto_updater');
//const { crossService } = require('../service/cross');
const { sqlitedbService } = require('../service/database/sqlitedb');
const { app } = require('electron');
// liveMonitorService将在应用准备好后再加载

function preload() {
    // 示例功能模块，可选择性使用和修改
    logger.info('[preload] load 5');
    trayService.create();
    securityService.create();
    autoUpdaterService.create();

    // go server
    //crossService.createGoServer();

    // init sqlite db
    sqlitedbService.init();

    // 延迟加载直播监控服务，确保应用已完全初始化
    logger.info('[preload] 准备启动直播监控服务');

    // 确保app准备好
    if (app.isReady()) {
        initLiveMonitorService();
    } else {
        app.on('ready', () => {
            initLiveMonitorService();
        });
    }
}

/**
 * 初始化直播监控服务
 */
function initLiveMonitorService() {
    try {
        // 动态导入，确保路径已准备好
        const { liveMonitorService } = require('../service/livesave');
        logger.info('[preload] 自动启动直播监控服务');
        liveMonitorService.startWatching();
    } catch (error) {
        logger.error(`[preload] 启动直播监控失败: ${error.message}`);
    }
}

/**
 * 预加载模块入口
 */
module.exports = {
    preload
}