'use strict';

const path = require('path');
const { BrowserWindow, Notification } = require('electron');
const { getMainWindow } = require('ee-core/electron');
const { isDev, isProd, getBaseDir } = require('ee-core/ps');
const { getConfig } = require('ee-core/config');
const { isFileProtocol } = require('ee-core/utils');
const { logger } = require('ee-core/log');

/**
 * Window
 * @class
 */
class WindowService {

  constructor() {
    this.myNotification = null;
    this.windows = {}
  }

  /**
   * Create a new window
   */
  createWindow(args) {
    const { type, content, windowName, windowTitle } = args;
    let contentUrl = null;
    if (type == 'html') {
      contentUrl = path.join('file://', getBaseDir(), content)
    } else if (type == 'web') {
      contentUrl = content;
    } else if (type == 'vue') {
      let addr = 'http://localhost:8080'
      if (isProd()) {
        const { mainServer } = getConfig();
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
    const opt = {
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
    win.loadURL(contentUrl);
    if (isDev()) {
      win.webContents.openDevTools();
    }

    this.windows[windowName] = win;

    return winContentsId;
  }
  
  /**
   * Get window contents id
   */
  getWCid(args) {
    const { windowName } = args;
    let win;
    if (windowName == 'main') {
      win = getMainWindow();
    } else {
      win = this.windows[windowName];
    }
    
    return win.webContents.id;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  communicate(args) {
    const { receiver, content } = args;
    if (receiver == 'main') {
      const win = getMainWindow();
      win.webContents.send('controller/os/window2ToWindow1', content);
    } else if (receiver == 'window2') {
      const win = this.windows[receiver];
      win.webContents.send('controller/os/window1ToWindow2', content);
    }
  }  

  /**
   * createNotification
   */
  createNotification(options, event) {
    const channel = 'controller/os/sendNotification';
    this.myNotification = new Notification(options);

    if (options.clickEvent) {
      this.myNotification.on('click', (e) => {
        let data = {
          type: 'click',
          msg: '您点击了通知消息'
        }
        event.reply(`${channel}`, data)
      });
    }

    if (options.closeEvent) {
      this.myNotification.on('close', (e) => {
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
WindowService.toString = () => '[class WindowService]';

module.exports = {
  WindowService,
  windowService: new WindowService()
};  