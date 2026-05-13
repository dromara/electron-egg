'use strict';

const debug = require('debug')('ee-core:app:boot');
const path = require('path');
const { loadException } = require('../exception');
const { electronApp } = require('../electron/app');
const { getArgumentByName, getBundleDir, getElectronCodeDir } = require('../ps');
const { loadConfig } = require('../config');
const { loadLog } = require('../log');
const { app } = require('./application');
const { loadDir } = require('./dir');

class ElectronEgg {
  constructor() {
    const baseDir = electronApp.getAppPath();
    const { env } = process;
    const environmet = getArgumentByName('env') || 'prod';
    const debugging = getArgumentByName('debuger') == 'true'? true : false;
    
    // Debugging source code
    let electronDir = getBundleDir(baseDir);
    if (debugging) {
      electronDir = getElectronCodeDir(baseDir);
    }

    const options = {
      env: environmet,
      baseDir,
      electronDir,
      appName: electronApp.getName(),
      userHome: electronApp.getPath('home'),
      appData: electronApp.getPath('appData'),
      appUserData: electronApp.getPath('userData'),
      appVersion: electronApp.getVersion(),
      isPackaged: electronApp.isPackaged,
      execDir: baseDir,
    }

    // exec directory (exe dmg dep) for prod
    if (environmet == 'prod' && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath('exe'));
    }

    // normalize env
    env.EE_ENV = environmet;
    env.EE_APP_NAME = options.appName;
    env.EE_APP_VERSION = options.appVersion;
    env.EE_BASE_DIR = options.baseDir;
    env.EE_ELECTRON_DIR = options.electronDir;
    env.EE_USER_HOME = options.userHome;
    env.EE_APP_DATA = options.appData;
    env.EE_APP_USER_DATA = options.appUserData;
    env.EE_EXEC_DIR = options.execDir;
    env.EE_IS_PACKAGED = options.isPackaged;
    env.EE_SOCKET_PORT = null;
    env.EE_HTTP_PORT = null;
    debug('[constructor] options:%j', options)

    this.init();
  }

  init() {
    // basic functions
    loadException();
    loadConfig();
    loadDir();
    loadLog();
  }

  register(eventName, handler) {
    return app.register(eventName, handler);
  }

  run() {
    app.run();
  }
}

module.exports = {
  ElectronEgg,
};