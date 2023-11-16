'use strict';

/**
 * 开发环境配置，覆盖 config.default.js
 */
module.exports = (appInfo) => {
  const config = {};

  /**
   * 开发者工具
   */
  config.openDevTools = {
    mode: 'undocked'
  };

  /**
   * 应用程序顶部菜单
   */
  config.openAppMenu = true;

  /**
   * jobs
   */
  config.jobs = {
    messageLog: true
  };   

  /**
   * Cross-language service
   * 跨语言服务
   */
  config.cross = {
    go: {
      auto: true,
      name: 'goapp',
      args: ['--env=dev'],
      port: 7073,
    }
  }; 

  return {
    ...config
  };
};
