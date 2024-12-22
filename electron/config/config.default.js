'use strict';

const path = require('path');

/**
 * 默认配置
 */
module.exports = (appInfo) => {
  return {
    openDevTools: false,
    windowsOption: {
      title: 'electron-egg1',
      width: 980,
      height: 650,
      minWidth: 400,
      minHeight: 300,
      webPreferences: {
        //webSecurity: false,
        contextIsolation: false, // false -> 可在渲染进程中使用electron的api，true->需要bridge.js(contextBridge)
        nodeIntegration: true,
        //preload: path.join(appInfo.electronDir, 'preload', 'bridge.js'),
      },
      frame: true,
      show: false,
      icon: path.join(appInfo.baseDir, 'public', 'images', 'logo-32.png'),
    },
    logger: {
      level: 'INFO',
      outputJSON: false,
      appLogName: 'ee.log',
      coreLogName: 'ee-core.log',
      errorLogName: 'ee-error.log' 
    },
    remoteUrl: {
      enable: false,
      url: 'http://electron-egg.kaka996.com/'
    },
    socketServer: {
      enable: false,
      port: 8080,
      path: "/socket.io/",
      connectTimeout: 45000,
      pingTimeout: 30000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e8,
      transports: ["polling", "websocket"],
      cors: {
        origin: false,
      },
      channel: 'c1'
    },
    httpServer: {
      enable: false,
      https: {
        enable: false, 
        key: '/public/ssl/localhost+1.key',
        cert: '/public/ssl/localhost+1.pem'
      },
      host: '127.0.0.1',
      port: 7071,
      cors: {
        origin: "*"
      }
    },
    mainServer: {
      protocol: 'file://',
      indexPath: '/public/dist/index.html',
    },
  }
}
