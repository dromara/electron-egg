'use strict';

const {app, Tray, Menu} = require('electron');
const path = require('path');
const pkg = require('../../package.json');
const helper = require('./helper');

exports.setup = function () {
  MAIN_WINDOW.on('close', (event) => {
    if (!CAN_QUIT) {
      MAIN_WINDOW.hide();
      MAIN_WINDOW.setSkipTaskbar(true);
      event.preventDefault();
    }
  });
  MAIN_WINDOW.show();
  let trayMenuTemplate = [{
    label: '退出',
    click: function () {
      helper.appQuit();
    }
  }]
  let iconPath = path.join(app.getAppPath(), '/asset/images/tray_logo.png');
  APP_TRAY = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  APP_TRAY.setToolTip(pkg.softName);
  APP_TRAY.setContextMenu(contextMenu);
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