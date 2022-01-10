'use strict';

const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;
const config = require('../config');
const {app} = require('electron');
const eLogger = require('./eLogger').get();
const helper = require('./helper');

/**
 * 安装模块
 */
exports.setup = function () {
  console.log('[electron-lib-autoUpater] [setup]');
  const version = app.getVersion();
  eLogger.info('[autoUpdater] [setup] current version: ', version);

  // 设置下载服务器地址
  const updateConfig = config.get('autoUpdate');
  let server = updateConfig.options.url;
  let lastChar = server.substring(server.length - 1);
  server = lastChar === '/' ? server : server + "/";
  eLogger.info('[autoUpdater] [setup] server: ', server);
  updateConfig.options.url = server;

  // 是否自动下载
  autoUpdater.autoDownload = updateConfig.force ? true : false;

  try {
    autoUpdater.setFeedURL(updateConfig.options);
  } catch (error) {
    eLogger.error('[autoUpdater] [setup] setFeedURL error : ', error);
  }

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('正在检查更新...');
  })
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('有可用更新');
  })
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('没有可用更新');
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('更新异常： ' + err);
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "下载进度: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - 已下载 ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('下载完成');
    // quit and update
    if (updateConfig.force) {
      helper.appQuit();
      autoUpdater.quitAndInstall();
    }
  });

};

exports.checkUpdate = function () {
  autoUpdater.checkForUpdates();
}

function sendStatusToWindow(text) {
  eLogger.info(text);
  MAIN_WINDOW.webContents.send('public.message', text);
}

exports = module.exports;