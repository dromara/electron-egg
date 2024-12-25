'use strict';

const { BrowserView, Notification } = require('electron');
const { getMainWindow } = require('ee-core/electron/window');

/**
 * Window
 * @class
 */
class WindowService {

  constructor() {
    this.myBrowserView = null;
    this.myNotification = null;
  }

  /**
   * createWindow
   */
  createWindow(args) {
    const { type, content, windowName, windowTitle } = args;
    let contentUrl = null;
    if (type == 'html') {
      contentUrl = path.join('file://', electronApp.getAppPath(), content)
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

    // load page
    win.loadURL(contentUrl);

    return winContentsId;
  }
  
  /**
   * 获取窗口contents id
   */
  getWCid(args) {
    // 主窗口的name默认是main，其它窗口name开发者自己定义
    const name = args;
    const id = Addon.get('window').getWCid(name);

    return id;
  }

}

WindowService.toString = () => '[class WindowService]';
module.exports = {
  WindowService,
  windowService: new WindowService()
};  