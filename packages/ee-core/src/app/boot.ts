import debug from 'debug';
import path from 'path';
import { loadException } from '../exception/index.js';
import { electronApp } from '../electron/app/index.js';
import { getArgumentByName, getBundleDir, getElectronCodeDir } from '../ps/index.js';
import { loadConfig } from '../config/index.js';
import { loadLog } from '../log/index.js';
import { app } from './application.js';
import { loadDir } from './dir.js';
import type { ElectronEggOptions } from '../types/index.js';

const debugLog = debug('ee-core:app:boot');

export class ElectronEgg {
  options: ElectronEggOptions;

  constructor() {
    const baseDir = electronApp.getAppPath();
    const environment = getArgumentByName('env') || 'prod';
    const debugging = getArgumentByName('debugger') === 'true';

    // Debugging source code
    let electronDir = getBundleDir(baseDir);
    if (debugging) {
      electronDir = getElectronCodeDir(baseDir);
    }

    const options: ElectronEggOptions = {
      env: environment,
      baseDir,
      electronDir,
      appName: electronApp.getName(),
      userHome: electronApp.getPath('home'),
      appData: electronApp.getPath('appData'),
      appUserData: electronApp.getPath('userData'),
      appVersion: electronApp.getVersion(),
      isPackaged: electronApp.isPackaged,
      execDir: baseDir,
    };

    // exec directory (exe dmg dep) for prod
    if (environment === 'prod' && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath('exe'));
    }

    // normalize env
    process.env.EE_ENV = environment;
    process.env.EE_APP_NAME = options.appName;
    process.env.EE_APP_VERSION = options.appVersion;
    process.env.EE_BASE_DIR = options.baseDir;
    process.env.EE_ELECTRON_DIR = options.electronDir;
    process.env.EE_USER_HOME = options.userHome;
    process.env.EE_APP_DATA = options.appData;
    process.env.EE_APP_USER_DATA = options.appUserData;
    process.env.EE_EXEC_DIR = options.execDir;
    process.env.EE_IS_PACKAGED = String(options.isPackaged);
    process.env.EE_SOCKET_PORT = '';
    process.env.EE_HTTP_PORT = '';

    debugLog('[constructor] options:%j', options);
    this.options = options;
    this.init();
  }

  init(): void {
    // basic functions
    loadException();
    loadConfig();
    loadDir();
    loadLog();
  }

  register(eventName: string, handler: (...args: unknown[]) => void): void {
    app.register(eventName, handler);
  }

  async run(): Promise<void> {
    await app.run();
  }

  async runAsync(): Promise<void> {
    await app.runAsync();
  }
}
