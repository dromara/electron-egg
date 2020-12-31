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
  }
  
  disable () {
    app.setLoginItemSettings({ openAtLogin: false })
    return true;
  }

  isEnabled () {
    const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin;
    console.log('AutoLaunch isEnabled:', enabled);
    return enabled;
  }
}

module.exports = AutoLaunch;