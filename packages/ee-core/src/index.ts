/**
 * @module ee-core
 * @description electron-egg framework core library entry point.
 *
 * Exports all public APIs of the framework, grouped by module:
 * - app: application startup and lifecycle
 * - config: configuration loading and retrieval
 * - const: constant definitions
 * - controller: controller loading
 * - cross: cross-process communication
 * - core: core utilities (file loading, timer)
 * - electron: Electron app and window management
 * - exception: global exception handling
 * - loader: file loading utilities
 * - log: logging system
 * - message: child process messages
 * - socket: communication services (IPC/HTTP/SocketIO)
 * - storage: data storage
 * - jobs: background jobs and load balancing
 * - utils: utility function collection
 * - ps: process state and paths
 * - types: TypeScript type definitions
 */

// --- app module ---
export { ElectronEgg } from './app/boot.js';
export { eventBus, EventBus, Ready, ElectronAppReady, WindowReady, BeforeClose, Preload } from './app/events.js';
export { Application, app } from './app/application.js';

// --- config module ---
export { loadConfig, getConfig, setConfig } from './config/index.js';

// --- const constants ---
export { Processes, SocketIO, Events, Receiver } from './const/channel.js';

// --- controller module ---
export { ControllerLoader } from './controller/controller_loader.js';
export { loadController, loadControllerAsync, getControllers, getController } from './controller/index.js';

// --- cross cross-process communication ---
export { Cross, cross } from './cross/index.js';

// --- core utilities ---
export { Timing } from './core/utils/timing.js';
export { loadFile, loadFileAsync, callFn, getResolvedFilename, isBytecodeClass, filePatterns, extensions } from './core/utils/index.js';
export { FileLoader, FULLPATH, EXPORTS } from './core/loader/file_loader.js';

// --- electron main process ---
export { electronApp, createElectron, getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './electron/index.js';

// --- exception handling ---
export { loadException } from './exception/index.js';

// --- loader file loading ---
export { loadFile as loaderLoadFile, requireFile, execFile, resolveModule, getFullpath } from './loader/index.js';

// --- log logging system ---
export { loadLog, getLoggers, coreLogger } from './log/index.js';

// --- message child process messages ---
export { ChildMessage, childMessage } from './message/index.js';

// --- socket communication services ---
export { SocketServer, HttpServer, IpcServer, loadSocket, createSocketServer, createHttpServer, createIpcServer, getSocketServer, getHttpServer, getIpcServer } from './socket/index.js';

// --- storage data storage ---
export { SqliteStorage } from './storage/index.js';

// --- jobs background tasks ---
export { ChildJob, ChildPoolJob, LoadBalancer, AlgorithmType } from './jobs/index.js';
export { registerJobManager, killAllJobs } from './jobs/registry.js';

// --- utils utility functions ---
export { extend } from './utils/extend.js';
export * as is from './utils/is.js';
export { strictParse, readSync, writeSync, read, write } from './utils/json.js';
export { getPackage, getMAC, isMAC, isFileProtocol, isWebProtocol, isJsProject, machineIdSync, machineId, getPlatform } from './utils/index.js';
export { parseArgv } from './utils/pargv.js';
export { getProperties, defaultCamelize } from './utils/wrap.js';
export { fnDebounce, getRandomString, mkdir, chmodPath, compareVersion, stringify, validValue, checkConfig, sleep, systemSleep, replaceArgsValue, getValueFromArgv, fileIsExist } from './utils/helper.js';
export { getPort, releasePortLocks } from './utils/port/index.js';

// --- ps process state and paths ---
export { allEnv, env, isProd, isDev, isRenderer, isMain, isForkedChild, processType, appName, appVersion, getDataDir, getLogDir, getBundleDir, getElectronCodeDir, getFrontendCodeDir, getRootDir, getBaseDir, getElectronDir, getPublicDir, getExtraResourcesDir, getAppUserDataDir, getExecDir, getUserHomeDir, getUserHomeHiddenAppDir, getUserHomeAppDir, getSocketPort, getHttpPort, isPackaged, exit, makeMessage, exitChildJob, isChildJob, isChildPoolJob, getArgumentByName } from './ps/index.js';

// --- type exports ---
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
  DevFrontendConfig,
  DevElectronConfig,
  DevConfig,
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
