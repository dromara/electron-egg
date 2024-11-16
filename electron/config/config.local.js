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

<<<<<<< HEAD
=======
  /**
   * Cross-language service
   * 跨语言服务
   * 如果有cmd参数，则执行该命令且需要指定 directory
   */
  config.cross = {
    go: {
      // 应用运行时启动
      enable: false,
      // 程序名
      name: 'goapp',
      // 可执行程序
      cmd: 'go',
      // 程序目录
      directory: './go',
      args: ['run', './main.go', '--env=dev','--basedir=../', '--port=7073'],
      appExit: true,
    },
    python: {
      enable: false,
      name: 'pyapp',
      cmd: 'python',
      directory: './python',
      args: ['./main.py', '--port=7074'],
      stdio: "ignore",
      appExit: true,
    },
  };   

>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
  return {
    ...config
  };
};
