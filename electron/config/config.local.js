'use strict';

/**
 * 开发环境配置，覆盖 config.default.js
 */
module.exports = () => {
  const config = {};

  /**
   * 开发者工具
   */
  config.openDevTools = {
    mode: 'undocked'
  };

  /**
   * 内置socket服务
   */   
  config.socketServer = {
    enable: false,
    port: 7071,
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
  };

  return {
    ...config
  };
};
