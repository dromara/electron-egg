const { app } = require('electron');
const { LOGIN_SETTING_OPTIONS } = require('./Constant').AutoLaunch;

class AutoLaunch {
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
    // return new Promise((resolve, reject) => {
    //   const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
    //   if (enabled) {
    //     resolve()
    //   }

    //   app.setLoginItemSettings({
    //     ...LOGIN_SETTING_OPTIONS,
    //     openAtLogin: true
    //   })
    //   resolve()
    // })
  }
  
  disable () {
    app.setLoginItemSettings({ openAtLogin: false })
    return true;
    // return new Promise((resolve, reject) => {
    //   app.setLoginItemSettings({ openAtLogin: false })
    //   resolve()
    // })
  }

  isEnabled () {
    const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin;
    console.log('AutoLaunch isEnabled:', enabled);
    return enabled;
    // return new Promise((resolve, reject) => {
    //   const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
    //   resolve(enabled)
    // })
  }
}

module.exports = AutoLaunch;