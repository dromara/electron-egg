'use strict';

const {app} = require('electron');
const updater = require("electron-updater");
const autoUpdater = updater.autoUpdater;
const path = require('path');

/**
 * 自动升级模块
 */
module.exports = {

  /**
   * 安装
   */
  install (eeApp) {
    eeApp.logger.info('[preload] load AutoUpdater module');

    const status = {
      error: -1,
      available: 1,
      noAvailable: 2,
      downloading: 3,
      downloaded: 4,
    }

    const updateConfig = eeApp.config.autoUpdate;
    const mainWindow = eeApp.electron.mainWindow;
    const version = app.getVersion();
    eeApp.logger.info('[preload:autoUpdater] current version: ', version);
  
    // 设置下载服务器地址
    let server = updateConfig.options.url;
    let lastChar = server.substring(server.length - 1);
    server = lastChar === '/' ? server : server + "/";
    eeApp.logger.info('[preload:autoUpdater] server: ', server);
    updateConfig.options.url = server;
  
    // 是否后台自动下载
    autoUpdater.autoDownload = updateConfig.force ? true : false;
    if (process.env.EE_SERVER_ENV == 'local') {
      autoUpdater.updateConfigPath = path.join(__dirname, '../../out/dev-app-update.yml')
    }
  
    try {
      autoUpdater.setFeedURL(updateConfig.options);
    } catch (error) {
      eeApp.logger.error('[preload:autoUpdater] setFeedURL error : ', error);
    }
  
    autoUpdater.on('checking-for-update', () => {
      //sendStatusToWindow('正在检查更新...');
    })
    autoUpdater.on('update-available', (info) => {
      info.status = status.available;
      info.desc = '有可用更新';
      sendStatusToWindow(mainWindow, info);
    })
    autoUpdater.on('update-not-available', (info) => {
      info.status = status.noAvailable;
      info.desc = '没有可用更新';
      sendStatusToWindow(mainWindow, info);
    })
    autoUpdater.on('error', (err) => {
      let info = {
        status: status.error,
        desc: err
      }
      sendStatusToWindow(mainWindow, info);
    })
    autoUpdater.on('download-progress', (progressObj) => {
      let percentNumber = parseInt(progressObj.percent);
      let totalSize = bytesChange(progressObj.total);
      let transferredSize = bytesChange(progressObj.transferred);
      let text = '已下载 ' + percentNumber + '%';
      text = text + ' (' + transferredSize + "/" + totalSize + ')';
  
      let info = {
        status: status.downloading,
        desc: text,
        percentNumber: percentNumber,
        totalSize: totalSize,
        transferredSize: transferredSize
      }
      eeApp.logger.info('[preload:download-progress] progress: ', text);
      sendStatusToWindow(mainWindow, info);
    })
    autoUpdater.on('update-downloaded', (info) => {
      info.status = status.downloaded;
      info.desc = '下载完成';
      sendStatusToWindow(mainWindow, info);
      // quit and update
      eeApp.appQuit();
      autoUpdater.quitAndInstall();
    });
    

  },

  /**
   * 检查更新
   */
  checkUpdate () {
    autoUpdater.checkForUpdates();
  },
  
  /**
   * 下载更新
   */
  download () {
    autoUpdater.downloadUpdate();
  },

}

/**
 * 向前端发消息
 */
function sendStatusToWindow(mainWindow, content = {}) {
  const textJson = JSON.stringify(content);
  const channel = 'app.updater';
  mainWindow.webContents.send(channel, textJson);
}
 
function bytesChange (limit) {
  let size = "";
  if(limit < 0.1 * 1024){                            
    size = limit.toFixed(2) + "B";
  }else if(limit < 0.1 * 1024 * 1024){            
    size = (limit/1024).toFixed(2) + "KB";
  }else if(limit < 0.1 * 1024 * 1024 * 1024){        
    size = (limit/(1024 * 1024)).toFixed(2) + "MB";
  }else{                                            
    size = (limit/(1024 * 1024 * 1024)).toFixed(2) + "GB";
  }

  let sizeStr = size + "";                        
  let index = sizeStr.indexOf(".");                    
  let dou = sizeStr.substring(index + 1 , index + 3);            
  if(dou == "00"){
      return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5);
  }

  return size;
}

  