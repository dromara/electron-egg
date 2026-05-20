import path from 'path';

// 当前进程的所有env
export function allEnv(): NodeJS.ProcessEnv {
  return process.env;
}

// 当前环境 - local | prod
export function env(): string {
  return process.env.EE_ENV || '';
}

// 是否生产环境
export function isProd(): boolean {
  return process.env.EE_ENV === 'prod';
}

// 是否为开发环境
export function isDev(): boolean {
  return process.env.EE_ENV === 'dev' || process.env.EE_ENV === 'local';
}

// 是否为渲染进程
export function isRenderer(): boolean {
  return typeof process === 'undefined' || !process || process.type === 'renderer';
}

// 是否为主进程
export function isMain(): boolean {
  return typeof process !== 'undefined' && process.type === 'browser';
}

// 是否为node子进程
export function isForkedChild(): boolean {
  return Number(process.env.ELECTRON_RUN_AS_NODE) === 1;
}

// 当前进程类型
export function processType(): string {
  let type = '';
  if (isMain()) {
    type = 'browser';
  } else if (isRenderer()) {
    type = 'renderer';
  } else if (isForkedChild()) {
    type = 'child';
  }
  return type;
}

// app name
export function appName(): string {
  return process.env.EE_APP_NAME || '';
}

// app version
export function appVersion(): string {
  return process.env.EE_APP_VERSION || '';
}

// 获取数据存储路径
export function getDataDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'data');
}

// 获取日志存储路径
export function getLogDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'logs');
}

// 获取bundle文件路径
export function getBundleDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'public', 'electron');
}

// 获取electron 源码文件路径
export function getElectronCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'electron');
}

// 获取frontend 源码文件路径
export function getFrontendCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'frontend');
}

// 获取base目录
export function getBaseDir(): string {
  return process.env.EE_BASE_DIR || '';
}

// 获取electron目录
export function getElectronDir(): string {
  return process.env.EE_ELECTRON_DIR || '';
}

// 获取public目录
export function getPublicDir(): string {
  return path.join(getBaseDir(), 'public');
}

// 获取 额外资源目录
export function getExtraResourcesDir(): string {
  const execDir = getExecDir();
  const packaged = isPackaged();

  // 资源路径不同
  let dir = '';
  if (packaged) {
    // 打包后  execDir为 应用程序 exe\dmg\dep软件所在目录；打包前该值是项目根目录
    // windows和MacOs不一样
    dir = path.join(execDir, 'resources', 'extraResources');
    if (process.platform === 'darwin') {
      dir = path.join(execDir, '..', 'Resources', 'extraResources');
    }
  } else {
    // 打包前
    dir = path.join(execDir, 'build', 'extraResources');
  }
  return dir;
}

// 获取root目录  (dev-项目根目录，pro-app user data目录)
export function getRootDir(): string {
  return isDev() ? getBaseDir() : getAppUserDataDir();
}

// 获取 appUserData目录
export function getAppUserDataDir(): string {
  return process.env.EE_APP_USER_DATA || '';
}

// 获取 exec目录
export function getExecDir(): string {
  return process.env.EE_EXEC_DIR || '';
}

// 获取操作系统用户目录
export function getUserHomeDir(): string {
  return process.env.EE_USER_HOME || '';
}

// 获取用户家目录中的隐藏的app目录
export function getUserHomeHiddenAppDir(): string {
  return path.join(getUserHomeDir(), '.' + appName());
}

// 获取用户家目录中的app目录
export function getUserHomeAppDir(): string {
  return path.join(getUserHomeDir(), appName());
}

// 获取内置socket端口
export function getSocketPort(): number {
  return parseInt(process.env.EE_SOCKET_PORT || '0') || 0;
}

// 获取内置http端口
export function getHttpPort(): number {
  return parseInt(process.env.EE_HTTP_PORT || '0') || 0;
}

// 是否打包
export function isPackaged(): boolean {
  return process.env.EE_IS_PACKAGED === 'true';
}

// 进程退出
export function exit(code = 0): never {
  return process.exit(code);
}

// 格式化message
export function makeMessage(msg: Partial<{ channel: string; event: string; data: unknown }> = {}): {
  channel: string;
  event: string;
  data: unknown;
} {
  return Object.assign({ channel: '', event: '', data: {} }, msg);
}

// 退出ChildJob进程
export function exitChildJob(code = 0): void {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    if (args.type === 'childJob') {
      process.exit(code);
    }
  } catch {
    process.exit(code);
  }
}

// 任务类型 ChildJob
export function isChildJob(): boolean {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    return args.type === 'childJob';
  } catch {
    return false;
  }
}

// 任务类型 ChildPoolJob
export function isChildPoolJob(): boolean {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    return args.type === 'childPoolJob';
  } catch {
    return false;
  }
}

// Get cmd parameter by name
export function getArgumentByName(name: string, args?: string[]): string | undefined {
  const searchArgs = args || process.argv;
  for (const item of searchArgs) {
    const prefixKey = `--${name}=`;
    if (item.indexOf(prefixKey) !== -1) {
      return item.substring(prefixKey.length);
    }
  }
  return undefined;
}
