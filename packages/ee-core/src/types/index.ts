/**
 * @module types
 * @description Framework core type definitions. Centralizes all public interface and configuration
 * types for ee-core, referenced by framework modules and business code to ensure type safety
 * and interface consistency.
 *
 * Includes:
 * - ElectronEggOptions: framework startup parameters
 * - Config series: runtime configuration (main service, Socket, HTTP, logging, exception, jobs, cross-process)
 * - JobChildOptions: child process job parameters
 * - FileLoaderOptions: file loader configuration
 * - AppInfo: application metadata
 * - MessageData: IPC message structure
 * - TimingItem: performance timing entry
 * - RegistryEntry: bundle mode registry entry
 */
import type { BrowserWindowConstructorOptions, OpenDevToolsOptions } from 'electron';

/**
 * ElectronEgg startup options
 *
 * Constructed by the boot module during framework initialization, containing basic information
 * about the application runtime environment. These values, once determined, do not change
 * throughout the application lifecycle.
 */
export interface ElectronEggOptions {
  /** Runtime environment identifier, e.g. 'dev', 'prod', 'test' */
  env: string;
  /** Project root directory (where package.json is located) */
  baseDir: string;
  /** Electron main process source directory (e.g. electron/) */
  electronDir: string;
  /** Application name, taken from the name field in package.json */
  appName: string;
  /** User home directory (os.homedir()) */
  userHome: string;
  /** System-level application data directory (macOS: ~/Library/Application Support, Windows: %APPDATA%) */
  appData: string;
  /** Electron user data directory (appData/appName) */
  appUserData: string;
  /** Application version, taken from the version field in package.json */
  appVersion: string;
  /** Whether packaged as an installer (app.isPackaged) */
  isPackaged: boolean;
  /** Executable directory (after packaging: exe path; during development: node_modules/electron path) */
  execDir: string;
}

/**
 * Remote service configuration
 *
 * Used to configure remote debugging or remote control service addresses.
 * When enabled, the main process can connect to the remote service via WebSocket.
 */
export interface RemoteConfig {
  /** Whether to enable remote service */
  enable: boolean;
  /** Remote service address (e.g. ws://remote-host:port) */
  url: string;
}

/**
 * Main window service configuration
 *
 * Defines how the main window loads content (local file or remote URL) and loading behavior.
 */
export interface MainServerConfig {
  /** Protocol type: 'file://' loads local file, 'http://'/'https://' loads remote page */
  protocol: string;
  /** Entry file path (HTML file path for file protocol, URL path for http protocol) */
  indexPath: string;
  /** Extra options passed to protocol.handle or loadURL */
  options?: Record<string, unknown>;
  /** Loading strategy: 'start' (load on startup) or 'ready' (load after app ready), default 'start' */
  takeover?: string;
  /** Preload page path. Displayed before the main page loads, used for splash screens */
  loadingPage?: string;
  /** IPC channel separator, default '/'. E.g. '/' in 'controller/user/info' */
  channelSeparator?: string;
}

/**
 * Socket.IO service configuration
 *
 * Defines WebSocket communication parameters between main process and renderer process.
 * Implemented with socket.io, supporting both polling and WebSocket transports.
 */
export interface SocketServerConfig {
  /** Whether to enable Socket service */
  enable: boolean;
  /** Socket service listening port */
  port: number;
  /** Socket.IO path (default /socket.io) */
  path: string;
  /** Connection timeout (ms), disconnect after timeout */
  connectTimeout: number;
  /** Heartbeat timeout (ms), disconnect if no pong received */
  pingTimeout: number;
  /** Heartbeat send interval (ms) */
  pingInterval: number;
  /** Maximum bytes per HTTP message body, prevents oversized messages causing memory issues */
  maxHttpBufferSize: number;
  /** Transport list, supports 'polling' (long polling) and 'websocket' */
  transports: ('polling' | 'websocket')[];
  /** CORS configuration, follows socket.io CORS rules */
  cors: {
    origin: boolean | string | RegExp | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  };
  /** Custom communication channel name, used to distinguish different socket communication groups */
  channel: string;
}

/**
 * HTTPS certificate configuration
 *
 * Provides SSL/TLS certificates for HTTP service, enabling HTTPS support.
 */
export interface HttpsConfig {
  /** Whether to enable HTTPS */
  enable: boolean;
  /** SSL private key file path */
  key: string;
  /** SSL certificate file path */
  cert: string;
}

/**
 * HTTP service configuration
 *
 * Defines parameters for the built-in Koa HTTP service, providing RESTful API interfaces.
 * Primarily used for renderer process to communicate with main process via HTTP.
 */
export interface HttpServerConfig {
  /** Whether to enable HTTP service */
  enable: boolean;
  /** HTTPS certificate configuration */
  https: HttpsConfig;
  /** Protocol type: 'http' or 'https' */
  protocol: string;
  /** Listening host address, default '127.0.0.1' (local access only) */
  host: string;
  /** Listening port */
  port: number;
  /** CORS configuration */
  cors: {
    /** Allowed origins, e.g. '*' or specific domain */
    origin: string;
  };
  /** Request body parsing configuration */
  body: {
    /** Whether to support multipart/form-data (file upload) */
    multipart: boolean;
    /** formidable file upload handling configuration */
    formidable: {
      /** Whether to keep original file extensions for uploaded files */
      keepExtensions: boolean;
    };
  };
  /** Request filter configuration, returns fixed data for matched URIs (used to block or intercept specific requests) */
  filterRequest: {
    /** List of URIs to filter */
    uris: string[];
    /** Data to return for filtered URIs */
    returnData: string;
  };
  /** Koa middleware extension configuration */
  koaConfig?: KoaConfig;
}

/**
 * Koa middleware configuration
 *
 * Allows business code to insert custom logic into the Koa HTTP service middleware chain.
 */
export interface KoaConfig {
  /** Pre-middleware list, executed before route handling (e.g. auth, logging) */
  preMiddleware?: ((...args: unknown[]) => unknown)[];
  /** Post-middleware list, executed after route handling (e.g. error wrapping, response formatting) */
  postMiddleware?: ((...args: unknown[]) => unknown)[];
  /** Custom error handler, replaces framework's default Koa error handling logic */
  errorHandler?: ((err: Error) => void) | null;
}

/**
 * Logger configuration
 *
 * Complete configuration for the Pino logging library. The framework has three built-in log instances:
 * - appLogName: application log, records business output
 * - coreLogName: core log, records framework internal operations
 * - errorLogName: error log, only records error/fatal
 */
export interface LoggerConfig {
  /** Log file storage directory, defaults to appUserData/logs if not set */
  dir?: string;
  /** Minimum log level, logs below this level will be ignored */
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | string;
  /** Whether to enable pino-pretty output (recommended for development only) */
  prettyPrint?: boolean;
  /** Timestamp date format (e.g. 'yyyy-MM-dd hh:mm:ss') */
  dateFormat?: string;
  /** Application log filename (e.g. app.log) */
  appLogName: string;
  /** Core log filename (e.g. core.log) */
  coreLogName: string;
  /** Error log filename (e.g. error.log) */
  errorLogName: string;
  /** Log rotation period: 'daily' (every day) or 'hourly' (every hour) */
  rotator: 'daily' | 'hourly' | string;
  /** Field paths to redact (Pino redact feature, e.g. ['password', 'token']) */
  redact?: string[];
  /** Redaction replacement value, can be a fixed string or custom replacement function */
  redactCensor?: string | ((value: unknown, path: string[]) => unknown);
  /** Whether logs include timestamps, default true */
  timestamp?: boolean;
  /** IANA timezone for log timestamps (file JSON logs), default 'UTC'. Set e.g. 'Asia/Shanghai' to emit local time with offset */
  timezone?: string;
  /** Logger name, displayed in log entries */
  name?: string;
  /** Maximum size of a single log file, auto-rotates when exceeded (e.g. '10m' for 10MB) */
  maxSize?: number | string;
  /** Custom serializers for formatting specific value types (e.g. err, req, res) */
  serializers?: Record<string, (value: unknown) => unknown>;
  /** Custom log level mapping (e.g. { verbose: 30 }) */
  customLevels?: Record<string, number>;
  /** Object serialization depth limit, prevents circular references or oversized objects from causing performance issues */
  depthLimit?: number;
  /** Safe mode: when log write fails, no exception is thrown but silently handled */
  safe?: boolean;
  /** Whether to enable logging, false disables all log output */
  enabled?: boolean;
}

/**
 * Exception handling configuration
 *
 * Defines handling strategies when processes exit abnormally.
 * Exit behavior: true means process exits, false means only log.
 */
export interface ExceptionConfig {
  /** Whether main process exception exits the application. true: exit on main process crash, false: only log error */
  mainExit: boolean;
  /** Whether child process (Job) abnormal exit terminates the main process */
  childExit: boolean;
  /** Handling strategy for renderer process abnormal exit */
  rendererExit: boolean;
}

/**
 * Background job (Job) configuration
 *
 * Controls global behavior of child process jobs.
 */
export interface JobsConfig {
  /** Whether to log child process communication messages. When true, all IPC messages are logged for debugging */
  messageLog: boolean;
}

/**
 * Cross-process target configuration
 *
 * Defines startup parameters and communication methods for an external process.
 * Supports child process fork, Go/Python backend process startup, and other scenarios.
 */
export interface CrossTargetConfig {
  /** Target process name identifier (e.g. 'go', 'python') */
  name: string;
  /** Whether to enable this cross-process target */
  enable?: boolean;
  /** Command line arguments passed to the child process */
  args?: string[];
  /** Startup command (e.g. 'go', 'python3'), empty means use script for direct fork */
  cmd?: string;
  /** Child process working directory, defaults to project root directory */
  directory?: string;
  /** Whether to automatically add .exe extension on Windows */
  windowsExtname?: boolean;
  /** Child process stdio configuration (same as child_process.fork stdio option) */
  stdio?: ('pipe' | 'ignore' | 'inherit' | 'ipc')[];
  /** Whether to exit the main application when the child process exits */
  appExit?: boolean;
  /** Child process listening port (Go/Python HTTP service port) */
  port?: number;
  /** Child process service URL (e.g. http://localhost:port) */
  url?: string;
}

/**
 * Cross-process configuration collection
 *
 * Key names are target process identifiers, values are startup parameters for each process.
 * Supports configuring multiple external processes simultaneously (Go, Python, custom child processes, etc.).
 */
export interface CrossConfig {
  /** Dynamic key names corresponding to each cross-process target configuration */
  [key: string]: CrossTargetConfig;
}

/**
 * Framework main configuration interface
 *
 * Integrates all sub-module configurations, serves as the type definition for the object
 * exported by config.default.js. Loaded and merged by ConfigLoader at runtime, then
 * provided to each module.
 */
export interface Config {
  /** Dynamic properties, allows user-defined configuration items */
  [key: string]: unknown;
  /** DevTools configuration: true opens DevTools, false closes, or pass OpenDevToolsOptions for fine control */
  openDevTools: boolean | OpenDevToolsOptions;
  /** Single instance lock: true allows only one application instance, subsequent launches activate existing window */
  singleLock: boolean;
  /** BrowserWindow constructor options, passed directly to Electron BrowserWindow */
  windowsOption: BrowserWindowConstructorOptions;
  /** Logger configuration */
  logger: LoggerConfig;
  /** Socket.IO service configuration */
  socketServer: SocketServerConfig;
  /** HTTP service configuration */
  httpServer: HttpServerConfig;
  /** Remote service configuration */
  remote: RemoteConfig;
  /** Main window service configuration */
  mainServer: MainServerConfig;
  /** Exception handling configuration */
  exception: ExceptionConfig;
  /** Background jobs configuration */
  jobs: JobsConfig;
  /** Cross-process configuration */
  cross: CrossConfig;
}

/**
 * Child process job (Job) startup options
 *
 * Defines parameters for ChildJob / ChildPoolJob to create child processes.
 */
export interface JobChildOptions {
  /** Job name identifier, used for logging and IPC routing */
  name: string;
  /** Child process entry script path (first argument of child_process.fork) */
  script: string;
  /** Command line arguments passed to the child process */
  args?: string[];
  /** Child process environment variables, merged with process.env */
  env?: NodeJS.ProcessEnv;
  /** Child process HTTP service port (e.g. Go/Python child process listening port) */
  port?: number;
}

/**
 * extend() merge options
 *
 * Controls whether deep merging is performed during object merging.
 */
export interface ExtendOptions {
  /** Whether to deep merge. When true, nested objects are recursively merged; when false, shallow overwrite */
  deep?: boolean;
}

/**
 * Performance timing entry
 *
 * Records duration information for each stage in the framework startup process, used for performance analysis.
 */
export interface TimingItem {
  /** Stage name (e.g. 'loadConfig', 'loadController') */
  name: string;
  /** Stage start time (ms timestamp) */
  start: number;
  /** Stage end time (ms timestamp), undefined when not finished */
  end: number | undefined;
  /** Stage duration (ms), undefined when not finished */
  duration: number | undefined;
  /** PID of the process executing this stage */
  pid: number;
  /** Entry sequence number, indicating the execution order of startup stages */
  index: number;
}

/**
 * Registry entry
 *
 * In bundle mode, the esbuild plugin pre-registers file information to a global variable.
 * Each entry corresponds to a scanned module file.
 */
export interface RegistryEntry {
  /** Full file path (e.g. 'controller/user.js') */
  fullpath: string;
  /** Property path array, converted from file path (e.g. ['user'] or ['admin', 'login']) */
  properties: string[];
  /** Lazily loaded module: requires only on access, avoiding initialization order issues */
  module: unknown;
}

/**
 * FileLoader loading options
 *
 * Controls how the file loader scans directories, converts property names, and processes exports.
 */
export interface FileLoaderOptions {
  /**
   * Property naming style, determines file path to property name conversion rules:
   * - 'lower': first letter lowercase (used by controllers, e.g. UserController -> userController)
   * - 'upper': first letter uppercase
   * - 'camel': camelCase (default)
   * - function: fully custom conversion logic
   */
  caseStyle?: 'lower' | 'upper' | 'camel' | ((filepath: string) => string[]);
  /** Directory path(s) to scan, can be a single directory or an array of directories */
  directory: string;
  /**
   * Custom initializer for additional processing of file exports.
   * Accepts the export value and path info, returns the processed value.
   */
  initializer?: ((obj: unknown, options: { pathName: string; path: string }) => unknown) | null;
  /** Whether to auto-call function-type exports. When true, plain function exports are executed and the return value is used as the final export */
  call?: boolean;
  /** Whether to override same-name properties. When true, later-loaded modules with the same name override earlier ones */
  override?: boolean;
  /** Injection parameters for auto-called functions */
  inject?: unknown;
  /** File match pattern (globby format), only loads matching files */
  match?: string | string[] | ((name: string) => boolean);
  /** File ignore pattern, matched files will be skipped */
  ignore?: string | string[] | ((name: string) => boolean);
  /**
   * Pre-registry entry array. In bundle mode, provided by global variable __EE_CONTROLLER_REGISTRY__;
   * when present, skips filesystem scanning and loads modules directly from the registry
   */
  registry?: RegistryEntry[];
}

/**
 * Application metadata
 *
 * During configuration file loading, the framework passes this object as a parameter to the
 * configuration function, allowing config files to dynamically return different configurations
 * based on environment information.
 *
 * @example
 * ```js
 * // config.default.js
 * module.exports = (appInfo) => {
 *   const config = {};
 *   config.logger.dir = path.join(appInfo.root, 'logs');
 *   return config;
 * };
 * ```
 */
export interface AppInfo {
  /** Application name */
  name: string;
  /** Project root directory */
  baseDir: string;
  /** Electron source directory */
  electronDir: string;
  /** Runtime environment ('dev' / 'prod' / 'test') */
  env: string;
  /** Log and runtime data root directory (usually appUserData) */
  root: string;
}

/**
 * IPC message data structure
 *
 * Standardized message format for communication between main process and renderer process.
 * Transmitted via socket.io or Electron IPC.
 */
export interface MessageData {
  /** Communication channel identifier (e.g. 'controller/user/info') */
  channel: string;
  /** Event name */
  event: string;
  /** Message payload data */
  data: unknown;
}

/**
 * Process exit event data
 *
 * Process identification information carried when a child process or renderer process exits abnormally.
 */
export interface ProcessExitEventData {
  /** PID of the exited process, undefined if unavailable */
  pid: number | undefined;
}

/**
 * Dev frontend config — mirrors ee-bin's DevFrontendConfig
 *
 * Used by ee-core to type the dev.frontend section loaded from cmd/bin.js.
 */
export interface DevFrontendConfig {
  /** Process working directory (relative to project root) */
  directory: string;
  /** Command to execute */
  cmd: string;
  /** Command argument array */
  args: string[];
  /** Frontend dev server protocol */
  protocol: string;
  /** Frontend dev server hostname */
  hostname: string;
  /** Frontend dev server port */
  port: number;
  /** Frontend index page filename */
  indexPath: string;
  /** Whether to force-refresh the page */
  force: boolean;
  /** Whether to execute synchronously */
  sync: boolean;
}

/**
 * Dev electron config — mirrors ee-bin's DevElectronConfig
 *
 * Used by ee-core to type the dev.electron section loaded from cmd/bin.js.
 */
export interface DevElectronConfig {
  /** Process working directory (relative to project root) */
  directory: string;
  /** Command to execute */
  cmd: string;
  /** Command argument array */
  args: string[];
  /** Electron loading page path */
  loadingPage: string;
  /** Whether to watch for file changes and auto-restart */
  watch: boolean;
  /** Whether to execute synchronously */
  sync: boolean;
  /** Debounce delay in watch mode (milliseconds) */
  delay: number;
}

/**
 * Dev mode config — mirrors ee-bin's DevConfig
 *
 * Used by ee-core to type the dev section loaded from cmd/bin.js.
 */
export interface DevConfig {
  frontend: DevFrontendConfig;
  electron: DevElectronConfig;
}
