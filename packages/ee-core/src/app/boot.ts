/**
 * @module app/boot
 * @description ElectronEgg framework boot module. Responsible for initializing the runtime environment,
 * collecting application configuration, setting global environment variables, and sequentially
 * loading framework foundational features (exception handling, configuration, directories, logging).
 * This is the entry class of the entire framework, instantiated and started via run() from electron/main.js.
 */
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

/**
 * ElectronEgg framework main class
 *
 * Responsibilities:
 * 1. Collect Electron runtime environment info (app name, version, paths, etc.)
 * 2. Set global environment variables (EE_ENV, EE_BASE_DIR, etc.)
 * 3. Initialize framework foundational features (exception handling -> config -> directories -> logging)
 * 4. Provide register() for lifecycle hooks, run()/runAsync() to start the application
 *
 * Usage:
 * ```ts
 * const electronEgg = new ElectronEgg();
 * electronEgg.register('ready', () => { ... });
 * await electronEgg.run();
 * ```
 */
export class ElectronEgg {
  options: ElectronEggOptions;

  /**
   * Constructor — Collects environment info and initializes the framework
   *
   * Execution flow:
   * 1. Get Electron app path as baseDir
   * 2. Parse command-line arguments: env (environment) and debugger (debug source flag)
   * 3. Based on debugger flag, decide whether electronDir points to bundle output or source directory
   * 4. Collect application info (name, version, paths, etc.) to build options
   * 5. In production + packaged mode, execDir points to the executable's directory
   * 6. Write key info to process.env for other modules to read
   * 7. Call init() to load foundational features
   */
  constructor() {
    const baseDir = electronApp.getAppPath();
    const environment = getArgumentByName('env') || 'prod';
    const debugging = getArgumentByName('debugger') === 'true';

    // In debug mode, point to source directory; otherwise point to bundle output directory
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

    // In production and packaged mode, execDir is the directory of the executable (same level as exe/dmg)
    if (environment === 'prod' && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath('exe'));
    }

    // Write runtime environment info to global variables for use by config loading, logging, and other modules
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

  /**
   * Initialize framework foundational features
   *
   * Loading order (must not be changed):
   * 1. loadException — Register global exception handling to ensure subsequent exceptions are caught
   * 2. loadConfig — Load configuration files; subsequent modules depend on configuration
   * 3. loadDir — Create necessary directories for data/logs
   * 4. loadLog — Initialize logging system; depends on configuration and directories
   */
  init(): void {
    loadException();
    loadConfig();
    loadDir();
    loadLog();
  }

  /**
   * Register a lifecycle event handler
   * @param eventName - Lifecycle event name (e.g. 'ready', 'electron-app-ready')
   * @param handler - Event handler function
   */
  register(eventName: string, handler: (...args: unknown[]) => void): void {
    app.register(eventName, handler);
  }

  /**
   * Start the application synchronously
   *
   * Execution flow: loadController -> loadSocket -> emitLifecycle(ready) -> loadElectron
   * Controllers are loaded using synchronous require(), suitable for CJS projects
   */
  async run(): Promise<void> {
    await app.run();
  }

  /**
   * Start the application asynchronously
   *
   * Execution flow: loadControllerAsync -> loadSocket -> emitLifecycle(ready) -> loadElectron
   * Controllers are loaded using dynamic import(), suitable for ESM projects
   */
  async runAsync(): Promise<void> {
    await app.runAsync();
  }
}
