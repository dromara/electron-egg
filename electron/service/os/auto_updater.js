const { app: electronApp } = require('electron');
const { autoUpdater } = require("electron-updater");
const { is } = require('ee-core/utils');
const { logger } = require('ee-core/log');
const { getMainWindow, setCloseAndQuit } = require('ee-core/electron');

/**
 * 自动升级
 * @class
 */
class AutoUpdaterService {
    constructor() {
        // 基础配置
        this.config = {
            windows: true, // 启用Windows更新
            macOS: false, // 禁用macOS更新
            linux: false, // 禁用Linux更新
            options: {
                provider: 'generic',
                url: 'https://douyin-tool-1342151814.cos.ap-guangzhou.myqcloud.com/', // 硬编码更新服务器地址
                headers: {
                    'Authorization': process.env.TENCENT_CLOUD_SECRET_ID || '' // 从环境变量读取密钥
                }
            },
        }
    }

    /**
     * 创建自动更新服务
     */
    create() {
        logger.info('[autoUpdater] load');
        const cfg = this.config;

        // 检查当前系统是否启用了更新
        if ((is.windows() && cfg.windows) || (is.macOS() && cfg.macOS) || (is.linux() && cfg.linux)) {
            // 继续执行更新逻辑
        } else {
            return;
        }

        const status = {
            error: -1,
            available: 1,
            noAvailable: 2,
            downloading: 3,
            downloaded: 4,
        }

        const version = electronApp.getVersion();
        logger.info('[autoUpdater] current version: ', version);

        try {
            // 设置允许在开发环境检查更新
            autoUpdater.forceDevUpdateConfig = true;
            autoUpdater.allowDowngrade = true;
            autoUpdater.allowPrerelease = true;

            autoUpdater.setFeedURL(cfg.options);
        } catch (error) {
            logger.error('[autoUpdater] setFeedURL error : ', error);
        }

        // 检查更新事件
        autoUpdater.on('checking-for-update', () => {
            logger.info('[autoUpdater] checking for update...');
        });

        // 有可用更新
        autoUpdater.on('update-available', () => {
            const data = {
                status: status.available,
                desc: '有可用更新'
            }
            this.sendStatusToWindow(data);
        });

        // 没有可用更新
        autoUpdater.on('update-not-available', () => {
            const data = {
                status: status.noAvailable,
                desc: '没有可用更新'
            }
            this.sendStatusToWindow(data);
        });

        // 更新错误
        autoUpdater.on('error', (err) => {
            const data = {
                status: status.error,
                desc: err
            }
            this.sendStatusToWindow(data);
        });

        // 更新下载进度
        autoUpdater.on('download-progress', (progressObj) => {
            const percentNumber = parseInt(progressObj.percent);
            const totalSize = this.bytesChange(progressObj.total);
            const transferredSize = this.bytesChange(progressObj.transferred);
            let text = '已下载 ' + percentNumber + '%';
            text = text + ' (' + transferredSize + "/" + totalSize + ')';

            const data = {
                status: status.downloading,
                desc: text,
                percentNumber,
                totalSize,
                transferredSize
            }
            logger.info('[autoUpdater] progress: ', text);
            this.sendStatusToWindow(data);
        });

        // 更新下载完成
        autoUpdater.on('update-downloaded', () => {
            const data = {
                status: status.downloaded,
                desc: '下载完成'
            }
            this.sendStatusToWindow(data);

            setCloseAndQuit(true);
            autoUpdater.quitAndInstall();
        });
    }

    /**
     * 检查更新
     */
    checkUpdate() {
        try {
            // 在调用checkForUpdates之前设置forceDevUpdateConfig属性
            if (!electronApp.isPackaged) {
                logger.info('[autoUpdater] 开发环境检查更新');
                autoUpdater.forceDevUpdateConfig = true;
            }

            logger.info('[autoUpdater] 正在检查更新...');
            autoUpdater.checkForUpdates();
        } catch (error) {
            logger.error('[autoUpdater] 检查更新出错:', error);
            // 发送错误状态
            const errorData = {
                status: -1,
                desc: `检查更新出错: ${error.message || '未知错误'}`
            };
            this.sendStatusToWindow(errorData);
        }
    }

    /**
     * 下载更新
     */
    download() {
        try {
            logger.info('[autoUpdater] 正在下载更新...');
            autoUpdater.downloadUpdate();
        } catch (error) {
            logger.error('[autoUpdater] 下载更新出错:', error);
            // 发送错误状态
            const errorData = {
                status: -1,
                desc: `下载更新出错: ${error.message || '未知错误'}`
            };
            this.sendStatusToWindow(errorData);
        }
    }

    /**
     * 向前端发送状态消息
     */
    sendStatusToWindow(content = {}) {
        const textJson = JSON.stringify(content);
        const channel = 'custom/app/updater';
        const win = getMainWindow();
        win.webContents.send(channel, textJson);
    }

    /**
     * 文件大小单位转换
     */
    bytesChange(limit) {
        let size = "";
        if (limit < 0.1 * 1024) {
            size = limit.toFixed(2) + "B";
        } else if (limit < 0.1 * 1024 * 1024) {
            size = (limit / 1024).toFixed(2) + "KB";
        } else if (limit < 0.1 * 1024 * 1024 * 1024) {
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        } else {
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }

        let sizeStr = size + "";
        let index = sizeStr.indexOf(".");
        let dou = sizeStr.substring(index + 1, index + 3);
        if (dou == "00") {
            return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5);
        }
        return size;
    }
}

AutoUpdaterService.toString = () => '[class AutoUpdaterService]';
module.exports = {
    autoUpdaterService: new AutoUpdaterService()
};