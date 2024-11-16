const {Tray, Menu} = require('electron');
const path = require('path');
const Ps = require('ee-core/ps');
const Log = require('ee-core/log');
const Electron = require('ee-core/electron');
const Conf = require('ee-core/config');

/**
 * 托盘插件
 * @class
 */
class TrayAddon {

  constructor(app) {
    this.app = app;
    this.tray = null;
  }

  /**
   * 创建托盘
   */
  create () {
    // 开发环境，代码热更新开启时，会导致托盘中有残影
    if (Ps.isDev() && Ps.isHotReload()) return;
    
    Log.info('[addon:tray] load');

    const app = this.app;
    const cfg = Conf.getValue('addons.tray');
    const mainWindow = Electron.mainWindow;

    // 托盘图标
    let iconPath = path.join(Ps.getHomeDir(), cfg.icon);
  
    // 托盘菜单功能列表
    let trayMenuTemplate = [
      {
        label: '显示',
        click: function () {
          mainWindow.show();
        }
      },
      {
        label: '退出',
        click: function () {
          app.appQuit();
        }
      }
    ]
  
    // 点击关闭，最小化到托盘
    mainWindow.on('close', (event) => {
      const extraObj = Electron.extra;
      if (extraObj.closeWindow == true) {
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
  }
}

TrayAddon.toString = () => '[class TrayAddon]';
module.exports = TrayAddon;