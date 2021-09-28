'use strict';

const {app, Tray, Menu} = require('electron');
const path = require('path');
const helper = require('./helper');
const config = require('../config');

exports.setup = function () {
  const cfg = config.get('tray');

  // 托盘图标
  let iconPath = path.join(app.getAppPath(), cfg.icon);

  // 托盘菜单功能列表
  let trayMenuTemplate = [
    {
      label: '显示',
      click: function () {
        MAIN_WINDOW.show();
      }
    },
    {
      label: '退出',
      click: function () {
        helper.appQuit();
      }
    }
  ]

  // 点击关闭，最小化到托盘
  MAIN_WINDOW.on('close', (event) => {
    if (!CAN_QUIT) {
      MAIN_WINDOW.hide();
      MAIN_WINDOW.setSkipTaskbar(true);
      event.preventDefault();
    }
  });
  MAIN_WINDOW.show();

  APP_TRAY = new Tray(iconPath);
  APP_TRAY.setToolTip(cfg.title); // 托盘标题
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  APP_TRAY.setContextMenu(contextMenu);

  // 监听 显示/隐藏
  APP_TRAY.on('click', function(){
    if (MAIN_WINDOW.isVisible()) {
      MAIN_WINDOW.hide();
      MAIN_WINDOW.setSkipTaskbar(false);
    } else {
      MAIN_WINDOW.show();
      MAIN_WINDOW.setSkipTaskbar(true);
    }
  });
  
  return APP_TRAY;
}

exports = module.exports;