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
                url: 'https://douyin-tool-1342151814.cos.ap-guangzhou.myqcloud.com', // 硬编码更新服务器地址（不要以斜杠结尾）
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            force: true,  // 是否强制检查更新
            autoCheck: true, // 是否自动检查更新
            checkInterval: 60 * 60 * 1000, // 自动检查间隔时间（默认为1小时）
        }

        // 定时检查器
        this.updateCheckTimer = null;
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
            logger.info('[autoUpdater] 当前系统支持更新');
        } else {
            logger.info('[autoUpdater] 当前系统不支持更新');
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
        logger.info('[autoUpdater] update server URL: ', cfg.options.url);

        try {
            // 设置允许在开发环境检查更新
            autoUpdater.forceDevUpdateConfig = true;
            autoUpdater.allowDowngrade = true;
            autoUpdater.allowPrerelease = true;
            
            // 设置请求选项
            autoUpdater.requestHeaders = cfg.options.headers;
            autoUpdater.autoDownload = false; // 不自动下载，由用户触发
            autoUpdater.autoInstallOnAppQuit = false; // 不在退出时自动安装
            
            // 应用force配置
            if (cfg.force) {
                autoUpdater.forceDevUpdateConfig = true;
            }
            
            autoUpdater.setFeedURL(cfg.options);
            logger.info('[autoUpdater] 更新服务配置成功');
            
            // 设置自动检查更新
            if (cfg.autoCheck) {
                this.startAutoUpdateCheck();
            }
        } catch (error) {
            logger.error('[autoUpdater] setFeedURL error : ', error);
        }

        // 检查更新事件
        autoUpdater.on('checking-for-update', () => {
            logger.info('[autoUpdater] checking for update...');
        });

        // 有可用更新
        autoUpdater.on('update-available', (info) => {
            logger.info('[autoUpdater] 发现新版本:', info.version);
            
            // 使用files数组代替弃用的path
            const filePath = info.files && info.files.length > 0 ? info.files[0].url : null;
            logger.info('[autoUpdater] 安装包路径:', filePath);
            logger.info('[autoUpdater] 完整更新信息:', JSON.stringify(info));
            
            // 保存更新信息，供下载时使用
            this.updateInfo = info;
            
            // 添加自动检查标识 - 从autoUpdater对象中获取，确保传递给前端
            const isAutoCheck = autoUpdater.isAutoCheck === true;
            logger.info('[autoUpdater] isAutoCheck:', isAutoCheck);
            
            const data = {
                status: status.available,
                desc: `发现新版本: ${info.version}`,
                version: info.version,
                releaseDate: info.releaseDate,
                oldVersion: version,
                filePath: filePath,
                isAutoCheck: isAutoCheck
            }
            this.sendStatusToWindow(data);
            
            // 显示系统通知
            if (isAutoCheck) {
                const win = getMainWindow();
                if (win) {
                    win.webContents.send('show-update-notification', {
                        title: '发现新版本',
                        body: `有新版本 ${info.version} 可用，请前往更新页面下载安装。`,
                        version: info.version
                    });
                    logger.info('[autoUpdater] 发送系统通知成功');
                } else {
                    logger.error('[autoUpdater] 获取主窗口失败，无法发送通知');
                }
            }
        });

        // 没有可用更新
        autoUpdater.on('update-not-available', (info) => {
            logger.info('[autoUpdater] 当前已是最新版本:', info.version);
            const data = {
                status: status.noAvailable,
                desc: `当前已是最新版本: ${info.version}`,
                version: info.version,
                oldVersion: version
            }
            this.sendStatusToWindow(data);
        });

        // 更新错误
        autoUpdater.on('error', (err) => {
            logger.error('[autoUpdater] 更新错误:', err);
            const errMsg = err ? (err.message || err.toString()) : '未知错误';
            const data = {
                status: status.error,
                desc: `更新失败: ${errMsg}`,
                oldVersion: version
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
                percentNumber: percentNumber,
                total: totalSize,
                transferred: transferredSize,
                oldVersion: version
            }
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
     * @param {boolean} isAutoCheck 是否为自动检查（默认为false，手动检查）
     */
    checkUpdate(isAutoCheck = false) {
        try {
            // 在调用checkForUpdates之前设置forceDevUpdateConfig属性
            if (!electronApp.isPackaged) {
                logger.info('[autoUpdater] 开发环境检查更新');
                autoUpdater.forceDevUpdateConfig = true;
            }

            logger.info('[autoUpdater] 正在检查更新...', isAutoCheck ? '(自动检查)' : '(手动检查)');
            
            // 如果是自动检查，添加标识，供update-available事件使用
            if (isAutoCheck) {
                autoUpdater.isAutoCheck = true;
            } else {
                autoUpdater.isAutoCheck = false;
                
                // 发送检查更新开始状态（只在手动检查时发送）
                const checkingData = {
                    status: 5, // 自定义的检查中状态
                    desc: '正在检查更新...',
                    oldVersion: electronApp.getVersion()
                };
                this.sendStatusToWindow(checkingData);
            }
            
            // 设置超时处理（只在手动检查时设置）
            let timeout = null;
            if (!isAutoCheck) {
                timeout = setTimeout(() => {
                    logger.error('[autoUpdater] 检查更新超时');
                    const errorData = {
                        status: -1,
                        desc: '检查更新超时，请检查网络或更新服务器',
                        oldVersion: electronApp.getVersion()
                    };
                    this.sendStatusToWindow(errorData);
                }, 30000); // 30秒超时
            }
            
            // 检查更新
            autoUpdater.checkForUpdates().then(() => {
                if (timeout) clearTimeout(timeout);
            }).catch(error => {
                if (timeout) clearTimeout(timeout);
                logger.error('[autoUpdater] 检查更新出错:', error);
                
                // 只在手动检查时发送错误消息
                if (!isAutoCheck) {
                    let errorMsg = error.message || '未知错误';
                    if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('404')) {
                        errorMsg = '找不到更新服务器或latest.yml文件，请检查配置';
                    } else if (errorMsg.includes('dev-app-update.yml')) {
                        errorMsg = '缺少dev-app-update.yml文件，请在项目根目录创建此文件';
                        logger.error('[autoUpdater] 缺少开发环境配置文件，请确保创建了dev-app-update.yml');
                    }
                    
                    const errorData = {
                        status: -1,
                        desc: `检查更新失败: ${errorMsg}`,
                        oldVersion: electronApp.getVersion()
                    };
                    this.sendStatusToWindow(errorData);
                }
            });
        } catch (error) {
            logger.error('[autoUpdater] 检查更新出错:', error);
            
            // 只在手动检查时发送错误消息
            if (!isAutoCheck) {
                const errorData = {
                    status: -1,
                    desc: `检查更新出错: ${error.message || '未知错误'}`,
                    oldVersion: electronApp.getVersion()
                };
                this.sendStatusToWindow(errorData);
            }
        }
    }

    /**
     * 下载更新
     */
    download() {
        try {
            logger.info('[autoUpdater] 正在下载更新...');
            
            // 发送下载开始状态
            const downloadingData = {
                status: 3, 
                desc: '准备下载...',
                percentNumber: 0,
                oldVersion: electronApp.getVersion()
            };
            this.sendStatusToWindow(downloadingData);
            
            // 直接使用autoUpdater的downloadUpdate方法
            // electron-updater会自动处理文件下载
            autoUpdater.downloadUpdate().catch(error => {
                logger.error('[autoUpdater] 下载更新出错:', error);
                const errorData = {
                    status: -1,
                    desc: `下载更新出错: ${error.message || '未知错误'}`,
                    oldVersion: electronApp.getVersion()
                };
                this.sendStatusToWindow(errorData);
            });
        } catch (error) {
            logger.error('[autoUpdater] 下载更新出错:', error);
            const errorData = {
                status: -1,
                desc: `下载更新出错: ${error.message || '未知错误'}`,
                oldVersion: electronApp.getVersion()
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

    /**
     * 启动自动更新检查
     */
    startAutoUpdateCheck() {
        // 清除可能存在的旧定时器
        this.stopAutoUpdateCheck();
        
        // 创建新的定时器
        this.updateCheckTimer = setInterval(() => {
            logger.info('[autoUpdater] 自动检查更新...');
            this.checkUpdate(true); // 传入true表示自动检查
        }, this.config.checkInterval);
        
        // 启动后立即检查一次（延迟10秒，确保应用已完全启动）
        setTimeout(() => {
            logger.info('[autoUpdater] 应用启动后首次检查更新');
            
            this.checkUpdate(true); // 传入true表示自动检查
        }, 10000); // 应用启动10秒后检查
        
        logger.info('[autoUpdater] 已启动自动更新检查, 间隔:', this.config.checkInterval / 1000, '秒');
    }
    
    /**
     * 停止自动更新检查
     */
    stopAutoUpdateCheck() {
        if (this.updateCheckTimer) {
            clearInterval(this.updateCheckTimer);
            this.updateCheckTimer = null;
            logger.info('[autoUpdater] 已停止自动更新检查');
        }
    }
}

AutoUpdaterService.toString = () => '[class AutoUpdaterService]';
module.exports = {
    autoUpdaterService: new AutoUpdaterService()
};