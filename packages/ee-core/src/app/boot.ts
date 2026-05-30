/**
 * @module app/boot
 * @description ElectronEgg 框架引导模块。负责初始化运行环境、收集应用配置信息、
 * 设置全局环境变量，并依次加载框架基础功能（异常处理、配置、目录、日志）。
 * 这是整个框架的入口类，由 electron/main.js 创建实例并调用 run() 启动应用。
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
 * ElectronEgg 框架主类
 *
 * 职责：
 * 1. 收集 Electron 运行环境信息（应用名、版本、路径等）
 * 2. 设置全局环境变量（EE_ENV、EE_BASE_DIR 等）
 * 3. 初始化框架基础功能（异常处理 → 配置 → 目录 → 日志）
 * 4. 提供 register() 注册生命周期钩子，run()/runAsync() 启动应用
 *
 * 使用方式：
 * ```ts
 * const electronEgg = new ElectronEgg();
 * electronEgg.register('ready', () => { ... });
 * await electronEgg.run();
 * ```
 */
export class ElectronEgg {
  options: ElectronEggOptions;

  /**
   * 构造函数 — 收集环境信息并初始化框架
   *
   * 执行流程：
   * 1. 获取 Electron 应用路径作为 baseDir
   * 2. 解析命令行参数：env（环境）和 debugger（调试源码标记）
   * 3. 根据 debugger 标记决定 electronDir 指向打包目录还是源码目录
   * 4. 收集应用信息（名称、版本、路径等）构建 options
   * 5. 生产环境 + 已打包时，execDir 指向可执行文件所在目录
   * 6. 将关键信息写入 process.env 供其他模块读取
   * 7. 调用 init() 加载基础功能
   */
  constructor() {
    const baseDir = electronApp.getAppPath();
    const environment = getArgumentByName('env') || 'prod';
    const debugging = getArgumentByName('debugger') === 'true';

    // 调试模式下指向源码目录，否则指向打包输出目录
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

    // 生产环境且已打包时，execDir 为可执行文件所在目录（exe/dmg 同级目录）
    if (environment === 'prod' && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath('exe'));
    }

    // 将运行环境信息写入全局变量，供配置加载、日志等模块使用
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
   * 初始化框架基础功能
   *
   * 加载顺序（不可调换）：
   * 1. loadException — 注册全局异常处理，确保后续流程的异常能被捕获
   * 2. loadConfig — 加载配置文件，后续模块依赖配置
   * 3. loadDir — 创建数据/日志等必要目录
   * 4. loadLog — 初始化日志系统，依赖配置和目录
   */
  init(): void {
    loadException();
    loadConfig();
    loadDir();
    loadLog();
  }

  /**
   * 注册生命周期事件处理器
   * @param eventName - 生命周期事件名（如 'ready'、'electron-app-ready'）
   * @param handler - 事件处理函数
   */
  register(eventName: string, handler: (...args: unknown[]) => void): void {
    app.register(eventName, handler);
  }

  /**
   * 同步方式启动应用
   *
   * 执行流程：loadController → loadSocket → emitLifecycle(ready) → loadElectron
   * 控制器使用同步 require() 加载，适用于 CJS 项目
   */
  async run(): Promise<void> {
    await app.run();
  }

  /**
   * 异步方式启动应用
   *
   * 执行流程：loadControllerAsync → loadSocket → emitLifecycle(ready) → loadElectron
   * 控制器使用动态 import() 加载，适用于 ESM 项目
   */
  async runAsync(): Promise<void> {
    await app.runAsync();
  }
}
