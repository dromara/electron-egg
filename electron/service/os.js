'use strict';

const { Service } = require('ee-core');
const { BrowserView, Notification } = require('electron');
const CoreWindow = require('ee-core/electron/window');

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
    const win = CoreWindow.getMainWindow();
    this.myBrowserView = new BrowserView();
    win.setBrowserView(this.myBrowserView);
    this.myBrowserView.setBounds({
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
    // one
    this.myBrowserView.webContents.loadURL('about:blank')

    // two - electron 11 remove destroy()
    // this.myBrowserView.webContents.destroy();

    // three
    // this.myBrowserView.webContents.forcefullyCrashRenderer()

    // fore
    // this.myBrowserView.webContents.close
  }

  /**
   * createNotification
   */
  createNotification(options, event) {
    const channel = 'controller.os.sendNotification';
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

OsService.toString = () => '[class OsService]';
module.exports = OsService;  