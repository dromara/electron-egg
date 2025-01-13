const { Tray, Menu } = require('electron');
const path = require('path');
const { getBaseDir } = require('ee-core/ps');
const { logger } = require('ee-core/log');
const { app: electronApp } = require('electron');
const { getMainWindow, getCloseAndQuit, setCloseAndQuit } = require('ee-core/electron');

/**
 * 托盘
 * @class
 */
class TrayService {

  constructor() {
    this.tray = null;
    this.config = {
      title: 'electron-egg',
      icon: '/public/images/tray.png'
    }
  }

  /**
   * 创建托盘
   */
  create () {
    logger.info('[tray] load');

    const cfg = this.config;
    const mainWindow = getMainWindow();

    // tray icon
    const iconPath = path.join(getBaseDir(), cfg.icon);
  
    // 托盘菜单功能列表
    const trayMenuTemplate = [
      {
        label: '显示',
        click: function () {
          mainWindow.show();
        }
      },
      {
        label: '退出',
        click: function () {
          electronApp.quit();
        }
      }
    ]
  
    // 设置一个标识，点击关闭，最小化到托盘
    setCloseAndQuit(false);
    mainWindow.on('close', (event) => {
      if (getCloseAndQuit()) {
        return;
      }
      mainWindow.hide();
      event.preventDefault();
    });
    
    // 实例化托盘
    this.tray = new Tray(iconPath);
    this.tray.setToolTip(cfg.title);
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    this.tray.setContextMenu(contextMenu);
    // 左键单击的时候能够显示主窗口
    this.tray.on('click', () => {
      mainWindow.show()
    })
  }
}
TrayService.toString = () => '[class TrayService]';

module.exports = {
  trayService: new TrayService()
};