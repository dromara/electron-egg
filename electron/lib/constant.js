module.exports = {
  AutoLaunch: {
    LOGIN_SETTING_OPTIONS: {
      // For Windows
      args: [
        '--opened-at-login=1'
      ]
    }
  },
  ipcChannels: {
    appMessage: 'app.message',
    appUpdater: 'app.updater'
  },
  appUpdaterStatus: {
    error: -1,
    available: 1,
    noAvailable: 2,
    downloading: 3,
    downloaded: 4,
  }
};