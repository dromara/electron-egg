import type { BrowserWindowConstructorOptions, OpenDevToolsOptions } from 'electron';

export interface ElectronEggOptions {
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

export interface RemoteConfig {
  enable: boolean;
  url: string;
}

export interface MainServerConfig {
  protocol: string;
  indexPath: string;
  options?: Record<string, unknown>;
  takeover?: string;
  loadingPage?: string;
  channelSeparator?: string;
}

export interface SocketServerConfig {
  enable: boolean;
  port: number;
  path: string;
  connectTimeout: number;
  pingTimeout: number;
  pingInterval: number;
  maxHttpBufferSize: number;
  transports: ('polling' | 'websocket')[];
  cors: {
    origin: boolean | string | RegExp | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
  };
  channel: string;
}

export interface HttpsConfig {
  enable: boolean;
  key: string;
  cert: string;
}

export interface HttpServerConfig {
  enable: boolean;
  https: HttpsConfig;
  protocol: string;
  host: string;
  port: number;
  cors: {
    origin: string;
  };
  body: {
    multipart: boolean;
    formidable: {
      keepExtensions: boolean;
    };
  };
  filterRequest: {
    uris: string[];
    returnData: string;
  };
}

export interface LoggerConfig {
  dir: string;
  level: string;
  prettyPrint?: boolean;
  dateFormat?: string;
  appLogName: string;
  coreLogName: string;
  errorLogName: string;
  rotator: string;
  redact?: string[];
  redactCensor?: string;
  timestamp?: boolean;
  name?: string;
  maxSize?: number | string;
  serializers?: Record<string, (value: unknown) => unknown>;
  customLevels?: Record<string, number>;
  depthLimit?: number;
  safe?: boolean;
  enabled?: boolean;
}

export interface ExceptionConfig {
  mainExit: boolean;
  childExit: boolean;
  rendererExit: boolean;
}

export interface JobsConfig {
  messageLog: boolean;
}

export interface CrossConfig {
  [key: string]: unknown;
}

export interface Config {
  [key: string]: unknown;
  openDevTools: boolean | OpenDevToolsOptions;
  singleLock: boolean;
  windowsOption: BrowserWindowConstructorOptions;
  logger: LoggerConfig;
  socketServer: SocketServerConfig;
  httpServer: HttpServerConfig;
  remote: RemoteConfig;
  mainServer: MainServerConfig;
  exception: ExceptionConfig;
  jobs: JobsConfig;
  cross: CrossConfig;
}

export interface JobChildOptions {
  name: string;
  script: string;
  args?: string[];
  env?: NodeJS.ProcessEnv;
  port?: number;
}

export interface ExtendOptions {
  deep?: boolean;
}

export interface TimingItem {
  name: string;
  start: number;
  end: number | undefined;
  duration: number | undefined;
  pid: number;
  index: number;
}

export interface RegistryEntry {
  fullpath: string;
  properties: string[];
  module: unknown;
}

export interface FileLoaderOptions {
  caseStyle?: 'lower' | 'upper' | 'camel' | ((filepath: string) => string[]);
  directory: string;
  initializer?: ((obj: unknown, options: { pathName: string; path: string }) => unknown) | null;
  call?: boolean;
  override?: boolean;
  inject?: unknown;
  match?: string | string[] | ((name: string) => boolean);
  ignore?: string | string[] | ((name: string) => boolean);
  registry?: RegistryEntry[];
}

export interface AppInfo {
  name: string;
  baseDir: string;
  electronDir: string;
  env: string;
  root: string;
}

export interface MessageData {
  channel: string;
  event: string;
  data: unknown;
}

export interface ProcessExitEventData {
  pid: number | undefined;
}
