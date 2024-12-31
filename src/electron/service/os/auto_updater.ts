import { app as electronApp } from 'electron';
import { autoUpdater } from 'electron-updater';
import { is } from 'ee-core/utils';
import { logger } from 'ee-core/log';
import { getConfig } from 'ee-core/config';
import { getMainWindow, setCloseAndQuit } from 'ee-core/electron/window';

/**
 * AutoUpdater class for automatic updates
 */
class AutoUpdater {
  constructor() {}

  /**
   * Create and configure the auto updater
   */
  create(): void {
    logger.info('[addon:autoUpdater] load');
    const cfg = getConfig().customize.autoUpdater;
    if ((is.windows() && cfg.windows) ||
        (is.macOS() && cfg.macOS) ||
        (is.linux() && cfg.linux)) {
      // continue
    } else {
      return;
    }

    // Check for updates immediately
    if (cfg.force) {
      this.checkUpdate();
    }

    const status = {
      error: -1,
      available: 1,
      noAvailable: 2,
      downloading: 3,
      downloaded: 4,
    } as const;

    const version = electronApp.getVersion();
    logger.info('[addon:autoUpdater] current version: ', version);

    // Set the update server URL
    let server = cfg.options.url;
    let lastChar = server.substring(server.length - 1);
    server = lastChar === '/' ? server : server + "/";
    cfg.options.url = server;

    // Auto download updates in the background
    autoUpdater.autoDownload = cfg.force ? true : false;

    try {
      autoUpdater.setFeedURL(cfg.options);
    } catch (error) {
      logger.error('[addon:autoUpdater] setFeedURL error : ', error);
    }

    autoUpdater.on('checking-for-update', () => {
      // sendStatusToWindow('正在检查更新...');
    });
    autoUpdater.on('update-available', (info) => {
      info.status = status.available;
      info.desc = '有可用更新';
      this.sendStatusToWindow(info);
    });
    autoUpdater.on('update-not-available', (info) => {
      info.status = status.noAvailable;
      info.desc = '没有可用更新';
      this.sendStatusToWindow(info);
    });
    autoUpdater.on('error', (err) => {
      const info = {
        status: status.error,
        desc: err,
      };
      this.sendStatusToWindow(info);
    });
    autoUpdater.on('download-progress', (progressObj) => {
      let percentNumber = parseInt(progressObj.percent);
      let totalSize = this.bytesChange(progressObj.total);
      let transferredSize = this.bytesChange(progressObj.transferred);
      let text = '已下载 ' + percentNumber + '%';
      text = text + ' (' + transferredSize + "/" + totalSize + ')';

      let info = {
        status: status.downloading,
        desc: text,
        percentNumber: percentNumber,
        totalSize: totalSize,
        transferredSize: transferredSize,
      };
      logger.info('[addon:autoUpdater] progress: ', text);
      this.sendStatusToWindow(info);
    });
    autoUpdater.on('update-downloaded', (info) => {
      info.status = status.downloaded;
      info.desc = '下载完成';
      this.sendStatusToWindow(info);

      // Allow the window to close
      setCloseAndQuit(true);

      // Install updates and exit the application
      autoUpdater.quitAndInstall();
    });
  }

  /**
   * Check for updates
   */
  checkUpdate(): void {
    autoUpdater.checkForUpdates();
  }

  /**
   * Download updates
   */
  download(): void {
    autoUpdater.downloadUpdate();
  }

  /**
   * Send status to the frontend
   */
  sendStatusToWindow(content = {}): void {
    const textJson = JSON.stringify(content);
    const channel = 'custom.app.updater';
    const win = getMainWindow();
    win.webContents.send(channel, textJson);
  }

  /**
   * Convert bytes to a more readable format
   */
  bytesChange(limit: number): string {
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

// Setting the class toString method, which is not common in TypeScript
AutoUpdater.toString = () => '[class AutoUpdater]';

export { AutoUpdater, autoUpdater: new AutoUpdater() };