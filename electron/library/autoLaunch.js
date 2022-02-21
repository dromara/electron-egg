'use strict';

const { app } = require('electron');
const LOGIN_SETTING_OPTIONS = {
  // For Windows
  args: [
    '--opened-at-login=1'
  ]
}

/**
 * 开机启动模块
 */
module.exports = {

  /**
   * 设置为开机启动
   */ 
  enable () {
    const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin;
    if (enabled) {
      return true;
    }
    app.setLoginItemSettings({
      ...LOGIN_SETTING_OPTIONS,
      openAtLogin: true
    })
    return true;
  },
  
  /**
   * 关闭开机启动
   */   
  disable () {
    app.setLoginItemSettings({ openAtLogin: false })
    return true;
  },

  /**
   * 检查是否开启
   */   
  isEnabled () {
    const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin;
    return enabled;
  }
}
