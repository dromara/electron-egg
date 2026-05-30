/**
 * @module types
 * @description 框架核心类型定义。集中定义 ee-core 所有公共接口和配置类型，
 * 供框架各模块及业务代码引用，确保类型安全和接口一致性。
 *
 * 包含：
 * - ElectronEggOptions：框架启动参数
 * - Config 系列：运行时配置（主服务、Socket、HTTP、日志、异常、任务、跨进程）
 * - JobChildOptions：子进程任务参数
 * - FileLoaderOptions：文件加载器配置
 * - AppInfo：应用元信息
 * - MessageData：IPC 消息结构
 * - TimingItem：性能计时条目
 * - RegistryEntry：打包模式注册表条目
 */
import type { BrowserWindowConstructorOptions, OpenDevToolsOptions } from 'electron';

/**
 * ElectronEgg 启动选项
 *
 * 框架初始化时由 boot 模块构造，包含应用运行环境的基础信息。
 * 这些值一旦确定，在应用生命周期内不会改变。
 */
export interface ElectronEggOptions {
  /** 运行环境标识，如 'dev'、'prod'、'test' */
  env: string;
  /** 项目根目录（package.json 所在目录） */
  baseDir: string;
  /** Electron 主进程源码目录（如 electron/） */
  electronDir: string;
  /** 应用名称，取自 package.json 的 name 字段 */
  appName: string;
  /** 用户主目录（os.homedir()） */
  userHome: string;
  /** 系统级应用数据目录（macOS: ~/Library/Application Support，Windows: %APPDATA%） */
  appData: string;
  /** Electron 用户数据目录（appData/appName） */
  appUserData: string;
  /** 应用版本号，取自 package.json 的 version 字段 */
  appVersion: string;
  /** 是否已打包为安装包（app.isPackaged） */
  isPackaged: boolean;
  /** 可执行文件所在目录（打包后为 exe 路径，开发时为 node_modules/electron 路径） */
  execDir: string;
}

/**
 * 远程服务配置
 *
 * 用于配置远程调试或远程控制服务地址。
 * 启用后，主进程可通过 WebSocket 连接到远程服务。
 */
export interface RemoteConfig {
  /** 是否启用远程服务 */
  enable: boolean;
  /** 远程服务地址（如 ws://remote-host:port） */
  url: string;
}

/**
 * 主窗口服务配置
 *
 * 定义主窗口加载内容的方式（本地文件或远程 URL）及加载行为。
 */
export interface MainServerConfig {
  /** 协议类型：'file://' 加载本地文件，'http://'/'https://' 加载远程页面 */
  protocol: string;
  /** 入口文件路径（file 协议时为 HTML 文件路径，http 协议时为 URL 路径） */
  indexPath: string;
  /** 传递给 protocol.handle 或 loadURL 的额外选项 */
  options?: Record<string, unknown>;
  /** 加载策略：'start'（启动时加载）或 'ready'（app ready 后加载），默认 'start' */
  takeover?: string;
  /** 预加载页面路径。在主页面加载前先展示此页面，用于显示启动画面 */
  loadingPage?: string;
  /** IPC 通道分隔符，默认 '/'。如 'controller/user/info' 中的 '/' */
  channelSeparator?: string;
}

/**
 * Socket.IO 服务配置
 *
 * 定义主进程与渲染进程之间的 WebSocket 通信参数。
 * 使用 socket.io 实现，支持轮询和 WebSocket 两种传输方式。
 */
export interface SocketServerConfig {
  /** 是否启用 Socket 服务 */
  enable: boolean;
  /** Socket 服务监听端口 */
  port: number;
  /** Socket.IO 路径（默认 /socket.io） */
  path: string;
  /** 连接超时时间（毫秒），超时后断开连接 */
  connectTimeout: number;
  /** 心跳超时时间（毫秒），未收到 pong 则断开 */
  pingTimeout: number;
  /** 心跳发送间隔（毫秒） */
  pingInterval: number;
  /** 单次 HTTP 消息体最大字节数，防止过大消息导致内存问题 */
  maxHttpBufferSize: number;
  /** 传输方式列表，支持 'polling'（长轮询）和 'websocket' */
  transports: ('polling' | 'websocket')[];
  /** 跨域配置，遵循 socket.io CORS 规则 */
  cors: {
    origin: boolean | string | RegExp | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  };
  /** 自定义通信频道名称，用于区分不同的 socket 通信组 */
  channel: string;
}

/**
 * HTTPS 证书配置
 *
 * 为 HTTP 服务提供 SSL/TLS 证书，启用 HTTPS 支持。
 */
export interface HttpsConfig {
  /** 是否启用 HTTPS */
  enable: boolean;
  /** SSL 私钥文件路径 */
  key: string;
  /** SSL 证书文件路径 */
  cert: string;
}

/**
 * HTTP 服务配置
 *
 * 定义内置 Koa HTTP 服务的参数，提供 RESTful API 接口。
 * 主要用于渲染进程通过 HTTP 方式与主进程通信。
 */
export interface HttpServerConfig {
  /** 是否启用 HTTP 服务 */
  enable: boolean;
  /** HTTPS 证书配置 */
  https: HttpsConfig;
  /** 协议类型：'http' 或 'https' */
  protocol: string;
  /** 监听主机地址，默认 '127.0.0.1'（仅本地访问） */
  host: string;
  /** 监听端口 */
  port: number;
  /** 跨域配置 */
  cors: {
    /** 允许的来源，如 '*' 或具体域名 */
    origin: string;
  };
  /** 请求体解析配置 */
  body: {
    /** 是否支持 multipart/form-data（文件上传） */
    multipart: boolean;
    /** formidable 文件上传处理配置 */
    formidable: {
      /** 是否保留上传文件的原扩展名 */
      keepExtensions: boolean;
    };
  };
  /** 请求过滤配置，对匹配的 URI 返回固定数据（用于屏蔽或拦截特定请求） */
  filterRequest: {
    /** 需要过滤的 URI 列表 */
    uris: string[];
    /** 对过滤 URI 统一返回的数据 */
    returnData: string;
  };
  /** Koa 中间件扩展配置 */
  koaConfig?: KoaConfig;
}

/**
 * Koa 中间件配置
 *
 * 允许业务代码在 Koa HTTP 服务的中间件链中插入自定义逻辑。
 */
export interface KoaConfig {
  /** 前置中间件列表，在路由处理之前执行（如鉴权、日志） */
  preMiddleware?: ((...args: unknown[]) => unknown)[];
  /** 后置中间件列表，在路由处理之后执行（如错误包装、响应格式化） */
  postMiddleware?: ((...args: unknown[]) => unknown)[];
  /** 自定义错误处理器，替换框架默认的 Koa 错误处理逻辑 */
  errorHandler?: ((err: Error) => void) | null;
}

/**
 * 日志配置
 *
 * 基于 Pino 日志库的完整配置项。框架内置三种日志实例：
 * - appLogName：应用日志，记录业务输出
 * - coreLogName：核心日志，记录框架内部运行
 * - errorLogName：错误日志，仅记录 error/fatal
 */
export interface LoggerConfig {
  /** 日志文件存储目录 */
  dir: string;
  /** 最低日志级别，低于此级别的日志将被忽略 */
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | string;
  /** 是否启用 pino-pretty 美化输出（仅开发环境建议开启） */
  prettyPrint?: boolean;
  /** 时间戳日期格式（如 'yyyy-MM-dd hh:mm:ss'） */
  dateFormat?: string;
  /** 应用日志文件名（如 app.log） */
  appLogName: string;
  /** 核心日志文件名（如 core.log） */
  coreLogName: string;
  /** 错误日志文件名（如 error.log） */
  errorLogName: string;
  /** 日志轮转周期：'daily'（每天）或 'hourly'（每小时） */
  rotator: 'daily' | 'hourly' | string;
  /** 需要脱敏的字段路径列表（Pino redact 功能，如 ['password', 'token']） */
  redact?: string[];
  /** 脱敏替换值，可以是固定字符串或自定义替换函数 */
  redactCensor?: string | ((value: unknown, path: string[]) => unknown);
  /** 日志是否包含时间戳，默认 true */
  timestamp?: boolean;
  /** 日志记录器名称，在日志条目中显示 */
  name?: string;
  /** 单个日志文件最大大小，超过后自动轮转（如 '10m' 表示 10MB） */
  maxSize?: number | string;
  /** 自定义序列化器，用于格式化特定类型的值（如 err、req、res） */
  serializers?: Record<string, (value: unknown) => unknown>;
  /** 自定义日志级别映射（如 { verbose: 30 }） */
  customLevels?: Record<string, number>;
  /** 对象序列化深度限制，防止循环引用或过大对象导致性能问题 */
  depthLimit?: number;
  /** 安全模式：日志写入失败时不抛出异常，而是静默处理 */
  safe?: boolean;
  /** 是否启用日志功能，false 时所有日志输出将被禁用 */
  enabled?: boolean;
}

/**
 * 异常处理配置
 *
 * 定义各进程异常退出时的处理策略。
 * 退出分为两种行为：true 表示进程退出，false 表示仅记录日志。
 */
export interface ExceptionConfig {
  /** 主进程异常是否退出应用。true：主进程崩溃则退出，false：仅记录错误 */
  mainExit: boolean;
  /** 子进程（Job）异常退出时是否终止主进程 */
  childExit: boolean;
  /** 渲染进程异常退出时的处理策略 */
  rendererExit: boolean;
}

/**
 * 后台任务（Job）配置
 *
 * 控制子进程任务的全局行为。
 */
export interface JobsConfig {
  /** 是否记录子进程通信消息日志。true 时所有 IPC 消息将被记录，便于调试 */
  messageLog: boolean;
}

/**
 * 跨进程目标配置
 *
 * 定义一个外部进程的启动参数和通信方式。
 * 支持子进程 fork、Go/Python 后端进程启动等场景。
 */
export interface CrossTargetConfig {
  /** 目标进程名称标识（如 'go'、'python'） */
  name: string;
  /** 是否启用此跨进程目标 */
  enable?: boolean;
  /** 传递给子进程的命令行参数 */
  args?: string[];
  /** 启动命令（如 'go'、'python3'），为空则使用 script 直接 fork */
  cmd?: string;
  /** 子进程工作目录，默认为项目根目录 */
  directory?: string;
  /** Windows 下是否自动添加 .exe 扩展名 */
  windowsExtname?: boolean;
  /** 子进程标准 IO 配置（同 child_process.fork 的 stdio 选项） */
  stdio?: ('pipe' | 'ignore' | 'inherit' | 'ipc')[];
  /** 子进程退出时是否同时退出主应用 */
  appExit?: boolean;
  /** 子进程监听端口（Go/Python HTTP 服务端口） */
  port?: number;
  /** 子进程服务 URL（如 http://localhost:port） */
  url?: string;
}

/**
 * 跨进程配置集合
 *
 * 键名为目标进程标识，值为此进程的启动参数。
 * 支持同时配置多个外部进程（Go、Python、自定义子进程等）。
 */
export interface CrossConfig {
  /** 动态键名对应各跨进程目标配置 */
  [key: string]: CrossTargetConfig;
}

/**
 * 框架主配置接口
 *
 * 整合所有子模块配置，是 config.default.js 导出对象的类型定义。
 * 运行时由 ConfigLoader 加载并合并后提供给各模块使用。
 */
export interface Config {
  /** 动态属性，允许用户自定义配置项 */
  [key: string]: unknown;
  /** 开发者工具配置：true 打开 DevTools，false 关闭，或传入 OpenDevToolsOptions 精细控制 */
  openDevTools: boolean | OpenDevToolsOptions;
  /** 单实例锁：true 时只允许运行一个应用实例，后续启动会激活已有窗口 */
  singleLock: boolean;
  /** BrowserWindow 构造选项，直接传递给 Electron BrowserWindow */
  windowsOption: BrowserWindowConstructorOptions;
  /** 日志配置 */
  logger: LoggerConfig;
  /** Socket.IO 服务配置 */
  socketServer: SocketServerConfig;
  /** HTTP 服务配置 */
  httpServer: HttpServerConfig;
  /** 远程服务配置 */
  remote: RemoteConfig;
  /** 主窗口服务配置 */
  mainServer: MainServerConfig;
  /** 异常处理配置 */
  exception: ExceptionConfig;
  /** 后台任务配置 */
  jobs: JobsConfig;
  /** 跨进程配置 */
  cross: CrossConfig;
}

/**
 * 子进程任务（Job）启动选项
 *
 * 定义 ChildJob / ChildPoolJob 创建子进程时的参数。
 */
export interface JobChildOptions {
  /** 任务名称标识，用于日志和 IPC 路由 */
  name: string;
  /** 子进程入口脚本路径（child_process.fork 的第一个参数） */
  script: string;
  /** 传递给子进程的命令行参数 */
  args?: string[];
  /** 子进程环境变量，会与 process.env 合并 */
  env?: NodeJS.ProcessEnv;
  /** 子进程 HTTP 服务端口（如 Go/Python 子进程的监听端口） */
  port?: number;
}

/**
 * extend() 合并选项
 *
 * 控制对象合并时是否执行深度合并。
 */
export interface ExtendOptions {
  /** 是否深度合并。true 时嵌套对象递归合并，false 时浅层覆盖 */
  deep?: boolean;
}

/**
 * 性能计时条目
 *
 * 记录框架启动流程中每个阶段的耗时信息，用于性能分析。
 */
export interface TimingItem {
  /** 阶段名称（如 'loadConfig'、'loadController'） */
  name: string;
  /** 阶段开始时间（毫秒时间戳） */
  start: number;
  /** 阶段结束时间（毫秒时间戳），未结束时为 undefined */
  end: number | undefined;
  /** 阶段耗时（毫秒），未结束时为 undefined */
  duration: number | undefined;
  /** 执行该阶段的进程 PID */
  pid: number;
  /** 条目序号，标识启动阶段的执行顺序 */
  index: number;
}

/**
 * 注册表条目
 *
 * 打包模式下，esbuild 插件将文件信息预注册到全局变量，
 * 每个条目对应一个被扫描到的模块文件。
 */
export interface RegistryEntry {
  /** 文件的完整路径（如 'controller/user.js'） */
  fullpath: string;
  /** 属性路径数组，由文件路径转换而来（如 ['user'] 或 ['admin', 'login']） */
  properties: string[];
  /** 懒加载模块：访问时才 require，避免初始化顺序问题 */
  module: unknown;
}

/**
 * FileLoader 加载选项
 *
 * 控制文件加载器如何扫描目录、转换属性名、处理导出内容。
 */
export interface FileLoaderOptions {
  /**
   * 属性命名风格，决定文件路径到属性名的转换规则：
   * - 'lower'：首字母小写（控制器使用，如 UserController → userController）
   * - 'upper'：首字母大写
   * - 'camel'：驼峰式（默认）
   * - 函数：完全自定义转换逻辑
   */
  caseStyle?: 'lower' | 'upper' | 'camel' | ((filepath: string) => string[]);
  /** 要扫描的目录路径，可以是单个目录或目录数组 */
  directory: string;
  /**
   * 自定义初始化器，对文件导出内容进行额外处理。
   * 接受导出值和路径信息，返回处理后的值。
   */
  initializer?: ((obj: unknown, options: { pathName: string; path: string }) => unknown) | null;
  /** 函数类型导出是否自动调用。true 时普通函数导出会被执行，返回值作为最终导出 */
  call?: boolean;
  /** 是否覆盖同名属性。true 时后加载的同名模块会覆盖先加载的 */
  override?: boolean;
  /** 函数自动调用时的注入参数 */
  inject?: unknown;
  /** 文件匹配模式（globby 格式），仅加载匹配的文件 */
  match?: string | string[] | ((name: string) => boolean);
  /** 文件忽略模式，匹配的文件将被跳过 */
  ignore?: string | string[] | ((name: string) => boolean);
  /**
   * 预注册表条目数组。打包模式下由全局变量 __EE_CONTROLLER_REGISTRY__ 提供，
   * 存在时跳过文件系统扫描，直接从注册表加载模块
   */
  registry?: RegistryEntry[];
}

/**
 * 应用元信息
 *
 * 配置文件加载时，框架将此对象作为参数传入配置函数，
 * 供配置文件根据环境信息动态返回不同配置。
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
  /** 应用名称 */
  name: string;
  /** 项目根目录 */
  baseDir: string;
  /** Electron 源码目录 */
  electronDir: string;
  /** 运行环境（'dev' / 'prod' / 'test'） */
  env: string;
  /** 日志和运行时数据根目录（通常为 appUserData） */
  root: string;
}

/**
 * IPC 消息数据结构
 *
 * 主进程与渲染进程之间通信的标准化消息格式。
 * 通过 socket.io 或 Electron IPC 传输。
 */
export interface MessageData {
  /** 通信频道标识（如 'controller/user/info'） */
  channel: string;
  /** 事件名称 */
  event: string;
  /** 消息负载数据 */
  data: unknown;
}

/**
 * 进程退出事件数据
 *
 * 当子进程或渲染进程异常退出时，携带的进程标识信息。
 */
export interface ProcessExitEventData {
  /** 退出进程的 PID，undefined 表示无法获取 */
  pid: number | undefined;
}
