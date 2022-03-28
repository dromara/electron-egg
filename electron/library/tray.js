'use strict';

const {Tray, Menu} = require('electron');
const path = require('path');

/**
 * 托盘模块
 */

module.exports = {

  /**
   * 安装
   */
  install (eeApp) {
    eeApp.logger.info('[preload] load tray module');
    const trayConfig = eeApp.config.tray;
    const mainWindow = eeApp.electron.mainWindow;

    // 托盘图标
    let iconPath = path.join(eeApp.config.homeDir, trayConfig.icon);
  
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
          eeApp.appQuit();
        }
      }
    ]
  
    // 点击关闭，最小化到托盘
    mainWindow.on('close', (event) => {
      mainWindow.hide();
      //mainWindow.setSkipTaskbar(true); 
      event.preventDefault();
    });
    mainWindow.show();

    // 测试发现：创建的Tray对象实例变量和app.whenReady()在同一模块中定义才行
    // 赋值给eeApp.electron.tray，已在框架ee-core包中定义
    // 如果赋值给其它变量，可能出现异常，估计是electron的bug
    
    eeApp.electron.tray = new Tray(iconPath);
    let appTray = eeApp.electron.tray;

    appTray.setToolTip(trayConfig.title); // 托盘标题
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setContextMenu(contextMenu);
  
    // 监听 显示/隐藏
    appTray.on('click', function(){
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        //mainWindow.setSkipTaskbar(true);
      } else {
        mainWindow.show();
        //mainWindow.setSkipTaskbar(false);
      }
    });
  }
}
