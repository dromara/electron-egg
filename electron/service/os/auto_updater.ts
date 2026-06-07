import { app as electronApp } from 'electron';
import { autoUpdater } from "electron-updater";
import type { ProgressInfo } from 'electron-updater';
import type { GenericServerOptions } from 'builder-util-runtime';
import { is } from 'ee-core/utils';
import { logger } from 'ee-core/log';
import { getMainWindow, setCloseAndQuit } from 'ee-core/electron';

/**
 * 自动升级
 * @class
 */
interface UpdaterConfig {
  windows: boolean;
  macOS: boolean;
  linux: boolean;
  options: GenericServerOptions;
}

class AutoUpdaterService {
  private config: UpdaterConfig;

  constructor() {
    this.config = {
      windows: false,
      macOS: false,
      linux: false,
      options: {
        provider: 'generic' as const,
        url: 'http://kodo.qiniu.com/'
      },
    }
  }

  /**
   * 创建
   */
  create (): void {
    logger.info('[autoUpdater] load');
    const cfg = this.config;
    if ((is.windows() && cfg.windows) || (is.macOS() && cfg.macOS) || (is.linux() && cfg.linux)) {
      // continue
    } else {
      return
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
  
    // 设置下载服务器地址
    let server = cfg.options.url;
    let lastChar = server.substring(server.length - 1);
    server = lastChar === '/' ? server : server + "/";
    const feedOptions: GenericServerOptions = { ...cfg.options, url: server };

    try {
      autoUpdater.setFeedURL(feedOptions);
    } catch (error) {
      logger.error('[autoUpdater] setFeedURL error : ', error);
    }
  
    autoUpdater.on('checking-for-update', () => {
      //sendStatusToWindow('正在检查更新...');
    })
    autoUpdater.on('update-available', () => {
      const data = {
        status: status.available,
        desc: '有可用更新'
      }
      this.sendStatusToWindow(data);
    })
    autoUpdater.on('update-not-available', () => {
      const data = {
        status: status.noAvailable,
        desc: '没有可用更新'
      }
      this.sendStatusToWindow(data);
    })
    autoUpdater.on('error', (err: Error) => {
      const data = {
        status: status.error,
        desc: err
      }
      this.sendStatusToWindow(data);
    })
    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      const percentNumber = Math.floor(progressObj.percent);
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
    })
    autoUpdater.on('update-downloaded', () => {
      const data = {
        status: status.downloaded,
        desc: '下载完成'
      }
      this.sendStatusToWindow(data);

      // 托盘插件里面设置了阻止窗口关闭，这里设置允许关闭窗口
      setCloseAndQuit(true);
      
      // Install updates and exit the application
      autoUpdater.quitAndInstall();
    });
  }

  /**
   * 检查更新
   */
  checkUpdate (): void {
    autoUpdater.checkForUpdates();
  }
  
  /**
   * 下载更新
   */
  download (): void {
    autoUpdater.downloadUpdate();
  }

  /**
   * 向前端发消息
   */
  sendStatusToWindow(content: Record<string, unknown> = {}): void {
    const textJson = JSON.stringify(content);
    const channel = 'custom/app/updater';
    const win = getMainWindow();
    if (!win) return;
    win.webContents.send(channel, textJson);
  }
  
  /**
   * 单位转换
   */
  bytesChange (limit: number): string {
    let size = "";
    if(limit < 0.1 * 1024){                            
      size = limit.toFixed(2) + "B";
    }else if(limit < 0.1 * 1024 * 1024){            
      size = (limit/1024).toFixed(2) + "KB";
    }else if(limit < 0.1 * 1024 * 1024 * 1024){        
      size = (limit/(1024 * 1024)).toFixed(2) + "MB";
    }else{                                            
      size = (limit/(1024 * 1024 * 1024)).toFixed(2) + "GB";
    }

    let sizeStr = size + "";                        
    let index = sizeStr.indexOf(".");                    
    let dou = sizeStr.substring(index + 1 , index + 3);            
    if(dou == "00"){
        return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5);
    }

    return size;
  }  
}
export const autoUpdaterService = new AutoUpdaterService();
