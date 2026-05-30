/**
 * @module ps
 * @description 进程状态与路径工具模块。提供环境判断、进程类型检测、
 * 路径获取等功能，是框架各模块获取运行环境信息的基础依赖。
 *
 * 所有路径信息来自 boot.ts 中设置的 process.env 环境变量。
 */
import path from 'path';

/** 获取当前进程的所有环境变量 */
export function allEnv(): NodeJS.ProcessEnv {
  return process.env;
}

/** 获取当前运行环境名称（dev / local / prod） */
export function env(): string {
  return process.env.EE_ENV || '';
}

/** 是否为生产环境 */
export function isProd(): boolean {
  return process.env.EE_ENV === 'prod';
}

/** 是否为开发环境（dev 或 local） */
export function isDev(): boolean {
  return process.env.EE_ENV === 'dev' || process.env.EE_ENV === 'local';
}

/** 是否为渲染进程 */
export function isRenderer(): boolean {
  return typeof process === 'undefined' || !process || process.type === 'renderer';
}

/** 是否为主进程（browser） */
export function isMain(): boolean {
  return typeof process !== 'undefined' && process.type === 'browser';
}

/** 是否为 node 子进程（通过 child_process.fork 创建，ELECTRON_RUN_AS_NODE=1） */
export function isForkedChild(): boolean {
  return Number(process.env.ELECTRON_RUN_AS_NODE) === 1;
}

/** 获取当前进程类型（browser / renderer / child） */
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

/** 获取应用名称 */
export function appName(): string {
  return process.env.EE_APP_NAME || '';
}

/** 获取应用版本号 */
export function appVersion(): string {
  return process.env.EE_APP_VERSION || '';
}

/**
 * 获取数据存储路径
 *
 * 开发环境：{baseDir}/data
 * 生产环境：{userHome}/.{appName}/data
 */
export function getDataDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'data');
}

/**
 * 获取日志存储路径
 *
 * 开发环境：{baseDir}/logs
 * 生产环境：{userHome}/.{appName}/logs
 */
export function getLogDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'logs');
}

/**
 * 获取打包输出目录
 *
 * @param basePath - 基础路径，默认为 cwd
 * @returns {basePath}/public/electron
 */
export function getBundleDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'public', 'electron');
}

/**
 * 获取 electron 源码目录
 *
 * @param basePath - 基础路径，默认为 cwd
 * @returns {basePath}/electron
 */
export function getElectronCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'electron');
}

/**
 * 获取 frontend 源码目录
 *
 * @param basePath - 基础路径，默认为 cwd
 * @returns {basePath}/frontend
 */
export function getFrontendCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'frontend');
}

/** 获取项目根目录（baseDir） */
export function getBaseDir(): string {
  return process.env.EE_BASE_DIR || '';
}

/** 获取 electron 目录（业务代码所在目录） */
export function getElectronDir(): string {
  return process.env.EE_ELECTRON_DIR || '';
}

/** 获取 public 静态资源目录 */
export function getPublicDir(): string {
  return path.join(getBaseDir(), 'public');
}

/**
 * 获取额外资源目录
 *
 * 打包后路径因平台不同而不同：
 * - Windows/Linux：{execDir}/resources/extraResources
 * - macOS：{execDir}/../Resources/extraResources
 *
 * 打包前：{execDir}/build/extraResources
 */
export function getExtraResourcesDir(): string {
  const execDir = getExecDir();
  const packaged = isPackaged();

  let dir = '';
  if (packaged) {
    dir = path.join(execDir, 'resources', 'extraResources');
    // macOS 应用包结构：exe 在 Contents/MacOS/，资源在 Contents/Resources/
    if (process.platform === 'darwin') {
      dir = path.join(execDir, '..', 'Resources', 'extraResources');
    }
  } else {
    dir = path.join(execDir, 'build', 'extraResources');
  }
  return dir;
}

/**
 * 获取 root 目录
 *
 * 开发环境：项目根目录（baseDir）
 * 生产环境：app user data 目录
 */
export function getRootDir(): string {
  return isDev() ? getBaseDir() : getAppUserDataDir();
}

/** 获取 Electron appUserData 目录 */
export function getAppUserDataDir(): string {
  return process.env.EE_APP_USER_DATA || '';
}

/** 获取可执行文件所在目录（execDir） */
export function getExecDir(): string {
  return process.env.EE_EXEC_DIR || '';
}

/** 获取操作系统用户主目录 */
export function getUserHomeDir(): string {
  return process.env.EE_USER_HOME || '';
}

/**
 * 获取用户主目录下的隐藏应用目录
 *
 * 路径格式：{userHome}/.{appName}/
 * 用于生产环境下存储数据、日志等持久化文件。
 */
export function getUserHomeHiddenAppDir(): string {
  return path.join(getUserHomeDir(), '.' + appName());
}

/** 获取用户主目录下的应用目录（非隐藏）：{userHome}/{appName}/ */
export function getUserHomeAppDir(): string {
  return path.join(getUserHomeDir(), appName());
}

/** 获取内置 Socket 服务端口号 */
export function getSocketPort(): number {
  return parseInt(process.env.EE_SOCKET_PORT || '0') || 0;
}

/** 获取内置 HTTP 服务端口号 */
export function getHttpPort(): number {
  return parseInt(process.env.EE_HTTP_PORT || '0') || 0;
}

/** 是否已打包（生产环境） */
export function isPackaged(): boolean {
  return process.env.EE_IS_PACKAGED === 'true';
}

/** 退出当前进程 */
export function exit(code = 0): never {
  return process.exit(code);
}

/**
 * 格式化 IPC 消息
 *
 * @param msg - 部分消息字段
 * @returns 完整的消息对象，缺失字段使用默认值填充
 */
export function makeMessage(msg: Partial<{ channel: string; event: string; data: unknown }> = {}): {
  channel: string;
  event: string;
  data: unknown;
} {
  return Object.assign({ channel: '', event: '', data: {} }, msg);
}

/**
 * 退出 ChildJob 类型的子进程
 *
 * 通过检查 argv[2] 中的 type 字段判断是否为 ChildJob 进程。
 * 仅 ChildJob 进程会执行退出，其他类型的子进程不受影响。
 */
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

/**
 * 判断当前进程是否为 ChildJob 类型
 *
 * 通过检查进程启动参数中的 type 字段判断。
 */
export function isChildJob(): boolean {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    return args.type === 'childJob';
  } catch {
    return false;
  }
}

/**
 * 判断当前进程是否为 ChildPoolJob 类型
 */
export function isChildPoolJob(): boolean {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    return args.type === 'childPoolJob';
  } catch {
    return false;
  }
}

/**
 * 从命令行参数中获取指定名称的参数值
 *
 * 查找格式：--name=value
 *
 * @param name - 参数名（不含 -- 前缀）
 * @param args - 参数数组，默认为 process.argv
 * @returns 参数值，未找到返回 undefined
 */
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
