/**
 * @module ee-core
 * @description electron-egg 框架核心库入口。
 *
 * 导出框架的所有公共 API，按模块分组：
 * - app：应用启动和生命周期
 * - config：配置加载和获取
 * - const：常量定义
 * - controller：控制器加载
 * - cross：跨进程通信
 * - core：核心工具（文件加载、计时器）
 * - electron：Electron 应用和窗口管理
 * - exception：全局异常处理
 * - html：HTML 文件路径
 * - loader：文件加载工具
 * - log：日志系统
 * - message：子进程消息
 * - socket：通信服务（IPC/HTTP/SocketIO）
 * - storage：数据存储
 * - jobs：后台任务和负载均衡
 * - utils：工具函数集
 * - ps：进程状态和路径
 * - types：TypeScript 类型定义
 */

// ─── app 模块 ───
export { ElectronEgg } from './app/boot.js';
export { eventBus, EventBus, Ready, ElectronAppReady, WindowReady, BeforeClose, Preload } from './app/events.js';
export { Application, app } from './app/application.js';

// ─── config 模块 ───
export { loadConfig, getConfig } from './config/index.js';

// ─── const 常量 ───
export { Processes, SocketIO, Events, Receiver } from './const/channel.js';

// ─── controller 模块 ───
export { ControllerLoader } from './controller/controller_loader.js';
export { loadController, loadControllerAsync, getControllers, getController } from './controller/index.js';

// ─── cross 跨进程通信 ───
export { Cross, cross } from './cross/index.js';

// ─── core 核心工具 ───
export { Timing } from './core/utils/timing.js';
export { loadFile, loadFileAsync, callFn, getResolvedFilename, isBytecodeClass, filePatterns, extensions } from './core/utils/index.js';
export { FileLoader, FULLPATH, EXPORTS } from './core/loader/file_loader.js';

// ─── electron 主进程 ───
export { electronApp, createElectron, getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './electron/index.js';

// ─── exception 异常处理 ───
export { loadException } from './exception/index.js';

// ─── html 文件路径 ───
export { getHtmlFilepath } from './html/index.js';

// ─── loader 文件加载 ───
export { loadFile as loaderLoadFile, requireFile, execFile, resolveModule, getFullpath } from './loader/index.js';

// ─── log 日志系统 ───
export { loadLog, getLoggers, coreLogger } from './log/index.js';

// ─── message 子进程消息 ───
export { ChildMessage, childMessage } from './message/index.js';

// ─── socket 通信服务 ───
export { SocketServer, HttpServer, IpcServer, loadSocket, createSocketServer, createHttpServer, createIpcServer, getSocketServer, getHttpServer, getIpcServer } from './socket/index.js';

// ─── storage 数据存储 ───
export { SqliteStorage } from './storage/index.js';

// ─── jobs 后台任务 ───
export { ChildJob, ChildPoolJob, LoadBalancer, AlgorithmType } from './jobs/index.js';
export { registerJobManager, killAllJobs } from './jobs/registry.js';

// ─── utils 工具函数 ───
export { extend } from './utils/extend.js';
export * as is from './utils/is.js';
export { strictParse, readSync, writeSync, read, write } from './utils/json.js';
export { getPackage, getMAC, isMAC, isFileProtocol, isWebProtocol, isJsProject, machineIdSync, machineId, getPlatform } from './utils/index.js';
export { parseArgv } from './utils/pargv.js';
export { getProperties, defaultCamelize } from './utils/wrap.js';
export { fnDebounce, getRandomString, mkdir, chmodPath, compareVersion, stringify, validValue, checkConfig, sleep, systemSleep, replaceArgsValue, getValueFromArgv, fileIsExist } from './utils/helper.js';
export { getPort, releasePortLocks } from './utils/port/index.js';

// ─── ps 进程状态和路径 ───
export { allEnv, env, isProd, isDev, isRenderer, isMain, isForkedChild, processType, appName, appVersion, getDataDir, getLogDir, getBundleDir, getElectronCodeDir, getFrontendCodeDir, getRootDir, getBaseDir, getElectronDir, getPublicDir, getExtraResourcesDir, getAppUserDataDir, getExecDir, getUserHomeDir, getUserHomeHiddenAppDir, getUserHomeAppDir, getSocketPort, getHttpPort, isPackaged, exit, makeMessage, exitChildJob, isChildJob, isChildPoolJob, getArgumentByName } from './ps/index.js';

// ─── 类型导出 ───
export type {
  ElectronEggOptions,
  RemoteConfig,
  MainServerConfig,
  SocketServerConfig,
  HttpsConfig,
  HttpServerConfig,
  KoaConfig,
  LoggerConfig,
  ExceptionConfig,
  JobsConfig,
  CrossTargetConfig,
  CrossConfig,
  Config,
  JobChildOptions,
  ExtendOptions,
  TimingItem,
  FileLoaderOptions,
  AppInfo,
  MessageData,
  ProcessExitEventData,
} from './types/index.js';

export type {
  LoadBalancerTarget,
  LoadBalancerParams,
  LoadBalancerOptions,
  JobProcessOptions,
  JobMessage,
  ProcessMessage,
  ChildPoolOptions,
} from './jobs/index.js';

export type { PidInfo } from './jobs/load-balancer/types.js';
export type { CrossRunOptions } from './cross/cross.js';
export type { CrossProcessOptions, CrossHost } from './cross/crossProcess.js';
export type { EeLogger } from './log/index.js';
export type { PinoLoggers } from './log/logger.js';
