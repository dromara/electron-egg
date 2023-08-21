'use strict';

/**
 * 生产环境配置，覆盖 config.default.js
 */
module.exports = (appInfo) => {
  const config = {};

  /**
   * 开发者工具
   */
  config.openDevTools = {
    mode: 'bottom'
  };

  /**
   * 应用程序顶部菜单
   */
  config.openAppMenu = false;

  return {
    ...config
  };
};
