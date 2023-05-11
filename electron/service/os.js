'use strict';

const { Service } = require('ee-core');
const { BrowserView, Notification } = require('electron');
const { mainWindow } = require('ee-core/electron');

/**
 * os（service层为单例）
 * @class
 */
class OsService extends Service {

  constructor(ctx) {
    super(ctx);
    this.myBrowserView = null;
    this.myNotification = null;
  }

  /**
   * createBrowserView
   */
  createBrowserView(contentUrl) {

    // electron 实验性功能，慎用
    this.myBrowserView = new BrowserView();
    mainWindow.setBrowserView(this.myBrowserView);
    myBrowserView.setBounds({
      x: 300,
      y: 170,
      width: 650,
      height: 400
    });
    this.myBrowserView.webContents.loadURL(contentUrl);
  }

  /**
   * removeBrowserView
   */
  removeBrowserView() {

    // removeBrowserView移除视图后，进程依然存在，估计是electron bug
    mainWindow.removeBrowserView(this.myBrowserView);
  }

  /**
   * createNotification
   */
  createNotification(clickEvent, closeEvent, event) {
    const channel = 'controller.os.sendNotification';
    this.myNotification = new Notification(options);

    if (clickEvent) {
      this.myNotification.on('click', (e) => {
        let data = {
          type: 'click',
          msg: '您点击了通知消息'
        }
        event.reply(`${channel}`, data)
      });
    }

    if (closeEvent) {
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

OsService.toString = () => '[class OsService]';
module.exports = OsService;  