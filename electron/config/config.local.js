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
   * 如果有cmd参数，则执行该命令，directory也是必须的
   */
  config.cross = {
    go: {
      enable: true,
      name: 'goapp',
      cmd: 'go',
      directory: './go',
      args: ['run', './main.go', '--env=dev','--basedir=../', '--port=7073'],
      appExit: true,
    }
  };   

  return {
    ...config
  };
};
