const {Tray, Menu} = require('electron');
const path = require('path');

/**
 * 托盘插件
 * @class
 */
class TrayAddon {

  constructor(app) {
    this.app = app;
    this.cfg = app.config.addons.tray;
    this.tray = null;
  }

  /**
   * 创建托盘
   */
  create () {
    // 开发环境，代码热更新开启时，会导致托盘中有残影
    if (process.env.EE_SERVER_ENV == 'local' && process.env.HOT_RELOAD == 'true') return;
    
    this.app.console.info('[addon:tray] load');
    const mainWindow = this.app.electron.mainWindow;

    // 托盘图标
    let iconPath = path.join(this.app.config.homeDir, this.cfg.icon);
  
    // 托盘菜单功能列表
    const self = this;
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
          self.app.appQuit();
        }
      }
    ]
  
    // 点击关闭，最小化到托盘
    mainWindow.on('close', (event) => {
      const extraObj = this.app.electron.extra;
      if (extraObj.closeWindow == true) {
        return;
      }
      mainWindow.hide();
      event.preventDefault();
    });
    
    // 实例化托盘
    this.tray = new Tray(iconPath);
    this.tray.setToolTip(this.cfg.title);
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    this.tray.setContextMenu(contextMenu);
  }
}

TrayAddon.toString = () => '[class TrayAddon]';
module.exports = TrayAddon;