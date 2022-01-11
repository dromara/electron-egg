'use strict';

const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;
const config = require('../config');
const {app} = require('electron');
const eLogger = require('./eLogger').get();
const helper = require('./helper');
const constant = require('./constant');
const path = require('path');

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

  // 是否后台自动下载
  autoUpdater.autoDownload = updateConfig.force ? true : false;
  if (process.env.EE_SERVER_ENV == 'local') {
    autoUpdater.updateConfigPath = path.join(__dirname, '../../out/dev-app-update.yml')
  }

  try {
    autoUpdater.setFeedURL(updateConfig.options);
  } catch (error) {
    eLogger.error('[autoUpdater] [setup] setFeedURL error : ', error);
  }

  autoUpdater.on('checking-for-update', () => {
    //sendStatusToWindow('正在检查更新...');
  })
  autoUpdater.on('update-available', (info) => {
    info.status = constant.appUpdaterStatus.available;
    info.desc = '有可用更新';
    sendStatusToWindow(info);
  })
  autoUpdater.on('update-not-available', (info) => {
    info.status = constant.appUpdaterStatus.noAvailable;
    info.desc = '没有可用更新';
    sendStatusToWindow(info);
  })
  autoUpdater.on('error', (err) => {
    let info = {
      status: constant.appUpdaterStatus.error,
      desc: err
    }
    sendStatusToWindow(info);
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let percentNumber = parseInt(progressObj.percent);
    let totalSize = bytesChange(progressObj.total);
    let transferredSize = bytesChange(progressObj.transferred);
    let text = '已下载 ' + percentNumber + '%';
    text = text + ' (' + transferredSize + "/" + totalSize + ')';

    let info = {
      status: constant.appUpdaterStatus.downloading,
      desc: text,
      percentNumber: percentNumber,
      totalSize: totalSize,
      transferredSize: transferredSize
    }
    sendStatusToWindow(info);
  })
  autoUpdater.on('update-downloaded', (info) => {
    info.status = constant.appUpdaterStatus.downloaded;
    info.desc = '下载完成';
    sendStatusToWindow(info);
    // quit and update
    helper.appQuit();
    autoUpdater.quitAndInstall();
  });
};

exports.checkUpdate = function () {
  autoUpdater.checkForUpdates();
}

exports.download = function () {
  autoUpdater.downloadUpdate();
}

function sendStatusToWindow(content = {}) {
  const textJson = JSON.stringify(content);
  eLogger.info(textJson);
  MAIN_WINDOW.webContents.send(constant.ipcChannels.appUpdater, textJson);
}


function bytesChange (limit) {
  let size = "";
  if(limit < 0.1 * 1024){                            
    size = limit.toFixed(2) + "B"
  }else if(limit < 0.1 * 1024 * 1024){            
    size = (limit/1024).toFixed(2) + "KB"
  }else if(limit < 0.1 * 1024 * 1024 * 1024){        
    size = (limit/(1024 * 1024)).toFixed(2) + "MB"
  }else{                                            
    size = (limit/(1024 * 1024 * 1024)).toFixed(2) + "GB"
  }

  let sizeStr = size + "";                        
  let index = sizeStr.indexOf(".");                    
  let dou = sizeStr.substring(index + 1 , index + 3)            
  if(dou == "00"){
      return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5)
  }

  return size;
}

exports = module.exports;