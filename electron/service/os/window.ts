import path from 'path';
import { BrowserWindow, Notification } from 'electron';
import { getMainWindow } from 'ee-core/electron';
import { isDev, isProd, getBaseDir } from 'ee-core/ps';
import { getConfig } from 'ee-core/config';
import { isFileProtocol } from 'ee-core/utils';
import { logger } from 'ee-core/log';

/**
 * Window
 * @class
 */
class WindowService {
  private myNotification: Notification | null;
  private windows: Record<string, BrowserWindow>;

  constructor() {
    this.myNotification = null;
    this.windows = {}
  }

  /**
   * Create a new window
   */
  createWindow(args: any): number {
    const { type, content, windowName, windowTitle } = args;
    let contentUrl: string | null = null;
    if (type == 'html') {
      contentUrl = path.join('file://', getBaseDir(), content)
    } else if (type == 'web') {
      contentUrl = content;
    } else if (type == 'vue') {
      let addr = 'http://localhost:8080'
      if (isProd()) {
        const { mainServer } = getConfig() as any;
        if (isFileProtocol(mainServer.protocol)) {
          addr = mainServer.protocol + path.join(getBaseDir(), mainServer.indexPath);
        } else {
          addr = mainServer.protocol + mainServer.host + ':' + mainServer.port;
        }
      }

      contentUrl = addr + content;
    } else {
      // some
    }

    logger.info('[createWindow] url: ', contentUrl);
    const opt: any = {
      title: windowTitle,
      x: 10,
      y: 10,
      width: 980, 
      height: 650,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    }
    const win = new BrowserWindow(opt);
    const winContentsId = win.webContents.id;
    win.loadURL(contentUrl as string);
    if (isDev()) {
      win.webContents.openDevTools();
    }

    this.windows[windowName] = win;

    return winContentsId;
  }
  
  /**
   * Get window contents id
   */
  getWCid(args: { windowName: string }): number | null {
    const { windowName } = args;
    let win: BrowserWindow | null;
    if (windowName == 'main') {
      win = getMainWindow();
    } else {
      win = this.windows[windowName];
    }
    if (!win) return null;
    
    return win.webContents.id;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  communicate(args: { receiver: string; content: any }): void {
    const { receiver, content } = args;
    if (receiver == 'main') {
      const win = getMainWindow();
      if (!win) return;
      win.webContents.send('controller/os/window2ToWindow1', content);
    } else if (receiver == 'window2') {
      const win = this.windows[receiver];
      win.webContents.send('controller/os/window1ToWindow2', content);
    }
  }  

  /**
   * createNotification
   */
  createNotification(options: any, event: any): void {
    const channel = 'controller/os/sendNotification';
    this.myNotification = new Notification(options);

    if (options.clickEvent) {
      this.myNotification.on('click', (e: any) => {
        let data = {
          type: 'click',
          msg: '您点击了通知消息'
        }
        event.reply(`${channel}`, data)
      });
    }

    if (options.closeEvent) {
      this.myNotification.on('close', (e: any) => {
        let data = {
          type: 'close',
          msg: '您关闭了通知消息'
        }
        event.reply(`${channel}`, data)
      });
    }

    this.myNotification.show();
  }

}
(WindowService as any).toString = () => '[class WindowService]';

export const windowService = new WindowService();  
