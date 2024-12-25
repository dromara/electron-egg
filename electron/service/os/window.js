'use strict';

const path = require('path');
const { app: electronApp } = require('electron');
const { BrowserWindow, BrowserView, Notification } = require('electron');
const { getMainWindow } = require('ee-core/electron/window');
const { isProd, getBaseDir } = require('ee-core/ps');

/**
 * Window
 * @class
 */
class WindowService {

  constructor() {
    this.myBrowserView = null;
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
        if (isFileProtocol(mainServer)) {
          addr = mainServer.protocol + path.join(getBaseDir(), mainServer.indexPath);
        } else {
          addr = mainServer.protocol + mainServer.host + ':' + mainServer.port;
        }
      }

      contentUrl = addr + content;
    } else {
      // some
    }

    console.log('contentUrl: ', contentUrl);
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
    win.webContents.openDevTools();
    this.windows[windowName] = win;

    return winContentsId;
  }
  
  /**
   * 获取窗口contents id
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
      win.webContents.send('controller.os.window2ToWindow1', content);
    } else if (receiver == 'window2') {
      const win = this.windows[receiver];
      win.webContents.send('controller.os.window1ToWindow2', content);
    }
  }  

}

WindowService.toString = () => '[class WindowService]';
module.exports = {
  WindowService,
  windowService: new WindowService()
};  