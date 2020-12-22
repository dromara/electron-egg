const { app } = require('electron');
const { LOGIN_SETTING_OPTIONS } = require('./Constant').AutoLaunch;

class AutoLaunch {
  enable () {
    return new Promise((resolve, reject) => {
      const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
      if (enabled) {
        resolve()
      }

      app.setLoginItemSettings({
        ...LOGIN_SETTING_OPTIONS,
        openAtLogin: true
      })
      resolve()
    })
  }
  
  disable () {
    return new Promise((resolve, reject) => {
      app.setLoginItemSettings({ openAtLogin: false })
      resolve()
    })
  }

  isEnabled () {
    return new Promise((resolve, reject) => {
      const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
      resolve(enabled)
    })
  }
}

module.exports = AutoLaunch;