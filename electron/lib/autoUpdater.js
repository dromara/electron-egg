'use strict';

const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;
const config = require('../config');
const {app} = require('electron');
const eLogger = require('./eLogger').get();
const helper = require('./helper');

exports.setup = function () {
  const version = app.getVersion();
  eLogger.info('[autoUpdater] [setup] current version: ', version);
  const platformObj = helper.getPlatform();

  const updateConfig = config.get('autoUpdate');
  let server = updateConfig.options.url;
  server = `${server}${platformObj.platform}/${platformObj.arch}`;
  eLogger.info('[autoUpdater] [setup] server: ', server);
  updateConfig.options.url = server;

  try {
    autoUpdater.setFeedURL(updateConfig.options);
  } catch (error) {
    eLogger.error('[autoUpdater] [setup] setFeedURL error : ', error);
  }

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
    helper.appQuit();
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