import { app as electronApp } from 'electron';
import { autoUpdater } from 'electron-updater';
import { is } from 'ee-core/utils';
import { logger } from 'ee-core/log';
import { getMainWindow, setCloseAndQuit } from 'ee-core/electron';

/**
 * AutoUpdaterService class for automatic updates
 */
class AutoUpdaterService {
  private config: {
    windows: boolean;
    macOS: boolean;
    linux: boolean;
    options: any;
  };
  constructor() {
    this.config = {
      windows: false, 
      macOS: false, 
      linux: false,
      options: {
        provider: 'generic', 
        url: 'http://kodo.qiniu.com/'
      },
    }
  }

  /**
   * Create and configure the auto updater
   */
  create(): void {
    logger.info('[autoUpdater] load');
    const cfg  = this.config;
    if ((is.windows() && cfg.windows) ||
        (is.macOS() && cfg.macOS) ||
        (is.linux() && cfg.linux)) {
      // continue
    } else {
      return;
    }

    const status = {
      error: -1,
      available: 1,
      noAvailable: 2,
      downloading: 3,
      downloaded: 4,
    };

    const version = electronApp.getVersion();
    logger.info('[autoUpdater] current version: ', version);

    // Set the download server address
    let server = cfg.options.url;
    const lastChar = server.substring(server.length - 1);
    server = lastChar === '/' ? server : server + "/";
    cfg.options.url = server;

    try {
      autoUpdater.setFeedURL(cfg.options);
    } catch (error) {
      logger.error('[autoUpdater] setFeedURL error : ', error);
    }

    autoUpdater.on('checking-for-update', () => {
      // sendStatusToWindow('正在检查更新...');
    });
    autoUpdater.on('update-available', () => {
      const data = {
        status: status.available,
        desc: '有可用更新',
      };
      this.sendStatusToWindow(data);
    });
    autoUpdater.on('update-not-available', () => {
      const data = {
        status: status.noAvailable,
        desc: '没有可用更新',
      };
      this.sendStatusToWindow(data);
    });
    autoUpdater.on('error', (err) => {
      const data = {
        status: status.error,
        desc: err,
      };
      this.sendStatusToWindow(data);
    });
    autoUpdater.on('download-progress', (progressObj) => {
      const percentNumber = progressObj.percent;
      const totalSize = this.bytesChange(progressObj.total);
      const transferredSize = this.bytesChange(progressObj.transferred);
      let text = '已下载 ' + percentNumber + '%';
      text = text + ' (' + transferredSize + "/" + totalSize + ')';

      const data = {
        status: status.downloading,
        desc: text,
        percentNumber,
        totalSize,
        transferredSize,
      };
      logger.info('[addon:autoUpdater] progress: ', text);
      this.sendStatusToWindow(data);
    });
    autoUpdater.on('update-downloaded', () => {
      const data = {
        status: status.downloaded,
        desc: '下载完成',
      };
      this.sendStatusToWindow(data);

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
  sendStatusToWindow(content: any = {}): void {
    const textJson = JSON.stringify(content);
    const channel = 'custom/app/updater';
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
    if (dou === "00") {
      return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5);
    }

    return size;
  }
}
AutoUpdaterService.toString = () => '[class AutoUpdaterService]';
const autoUpdaterService = new AutoUpdaterService();

export { 
  AutoUpdaterService, 
  autoUpdaterService 
};