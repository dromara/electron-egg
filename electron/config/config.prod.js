'use strict';

/**
 * 生产环境配置，覆盖 config.default.js
 */
module.exports = (appInfo) => {
  const config = {};

  /**
   * 开发者工具
   */
<<<<<<< HEAD
  config.openDevTools = false;
=======
  config.openDevTools = {
    mode: 'undocked'
  };
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c

  /**
   * 应用程序顶部菜单
   */
  config.openAppMenu = false;

  /**
   * jobs
   */
  config.jobs = {
    messageLog: false
  }; 

  return {
    ...config
  };
};
