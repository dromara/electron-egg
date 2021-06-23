'use strict';

const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;
const config = require('../config');
const path = require('path');
const {app} = require('electron');
const eLogger = require('./eLogger').get();

exports.setup = function () {
  const pkgInfo = require(path.join(app.getAppPath(), 'package.json'));
  eLogger.info('[autoUpdater] [setup] current version: ', pkgInfo.version);
  const updateConfig = config.get('autoUpdate');
  autoUpdater.setFeedURL(updateConfig.options);

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  })
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
  })
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    // quit and update
    MAIN_WINDOW.destroy();
    app.quit();
    autoUpdater.quitAndInstall();
  });

};

exports.checkUpdate = function () {
  autoUpdater.checkForUpdatesAndNotify();
}

function sendStatusToWindow(text) {
  eLogger.info(text);
  MAIN_WINDOW.webContents.send('message', text);
}

exports = module.exports;