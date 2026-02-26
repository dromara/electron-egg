

import debug from 'debug';
import path from 'path';
import { loadException } from '../exception';
import { electronApp } from '../electron/app';
import { getArgumentByName, getBundleDir, getElectronCodeDir } from '../ps';
import { loadConfig } from '../config';
import { loadLog } from '../log';
import { app } from './application';
import { loadDir } from './dir';

const debugLog = debug('ee-core:app:boot');

interface ElectronEggOptions {
  env: string;
  baseDir: string;
  electronDir: string;
  appName: string;
  userHome: string;
  appData: string;
  appUserData: string;
  appVersion: string;
  isPackaged: boolean;
  execDir: string;
}

class ElectronEgg {
  constructor() {
    const baseDir = electronApp.getAppPath();
    const { env } = process;
    const environmet = getArgumentByName('env') || 'prod';
    const debugging = getArgumentByName('debuger') === 'true' ? true : false;
    
    // Debugging source code
    let electronDir = getBundleDir(baseDir);
    if (debugging) {
      electronDir = getElectronCodeDir(baseDir);
    }

    const options: ElectronEggOptions = {
      env: environmet,
      baseDir,
      electronDir,
      appName: electronApp.getName(),
      userHome: electronApp.getPath('home'),
      appData: electronApp.getPath('appData'),
      appUserData: electronApp.getPath('userData'),
      appVersion: electronApp.getVersion(),
      isPackaged: (electronApp as any).isPackaged,
      execDir: baseDir,
    };

    // exec directory (exe dmg dep) for prod
    if (environmet === 'prod' && options.isPackaged) {
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
    env.EE_IS_PACKAGED = options.isPackaged.toString();
    env.EE_SOCKET_PORT = undefined;
    env.EE_HTTP_PORT = undefined;
    debugLog('[constructor] options:%j', options);

    this.init();
  }

  init(): void {
    // basic functions
    loadException();
    loadConfig();
    loadDir();
    loadLog();
  }

  register(eventName: string, handler: (...args: any[]) => any): void {
    return app.register(eventName, handler);
  }

  run(): void {
    app.run();
  }
}

export {
  ElectronEgg,
};