/**
 * @module ps
 * @description Process state and path utility module. Provides environment detection, process type checking,
 * and path retrieval functions, serving as the foundational dependency for other modules to obtain runtime environment information.
 *
 * All path information comes from process.env environment variables set in boot.ts.
 */
import path from 'path';

/** Get all environment variables of the current process */
export function allEnv(): NodeJS.ProcessEnv {
  return process.env;
}

/** Get the current environment name (dev / local / prod) */
export function env(): string {
  return process.env.EE_ENV || '';
}

/** Whether this is a production environment */
export function isProd(): boolean {
  return process.env.EE_ENV === 'prod';
}

/** Whether this is a development environment (dev or local) */
export function isDev(): boolean {
  return process.env.EE_ENV === 'dev' || process.env.EE_ENV === 'local';
}

/** Whether this is a renderer process */
export function isRenderer(): boolean {
  return typeof process === 'undefined' || !process || process.type === 'renderer';
}

/** Whether this is the main process (browser) */
export function isMain(): boolean {
  return typeof process !== 'undefined' && process.type === 'browser';
}

/** Whether this is a Node child process (created via child_process.fork, ELECTRON_RUN_AS_NODE=1) */
export function isForkedChild(): boolean {
  return Number(process.env.ELECTRON_RUN_AS_NODE) === 1;
}

/** Get the current process type (browser / renderer / child) */
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

/** Get the application name */
export function appName(): string {
  return process.env.EE_APP_NAME || '';
}

/** Get the application version */
export function appVersion(): string {
  return process.env.EE_APP_VERSION || '';
}

/**
 * Get the data storage path
 *
 * Development: {baseDir}/data
 * Production: {userHome}/.{appName}/data
 */
export function getDataDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'data');
}

/**
 * Get the log storage path
 *
 * Development: {baseDir}/logs
 * Production: {userHome}/.{appName}/logs
 */
export function getLogDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'logs');
}

/**
 * Get the build output directory
 *
 * @param basePath - Base path, defaults to cwd
 * @returns {basePath}/public/electron
 */
export function getBundleDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'public', 'electron');
}

/**
 * Get the electron source directory
 *
 * @param basePath - Base path, defaults to cwd
 * @returns {basePath}/electron
 */
export function getElectronCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'electron');
}

/**
 * Get the frontend source directory
 *
 * @param basePath - Base path, defaults to cwd
 * @returns {basePath}/frontend
 */
export function getFrontendCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'frontend');
}

/** Get the project root directory (baseDir) */
export function getBaseDir(): string {
  return process.env.EE_BASE_DIR || '';
}

/** Get the electron directory (where business code resides) */
export function getElectronDir(): string {
  return process.env.EE_ELECTRON_DIR || '';
}

/** Get the public static assets directory */
export function getPublicDir(): string {
  return path.join(getBaseDir(), 'public');
}

/**
 * Get the extra resources directory
 *
 * Path differs by platform after packaging:
 * - Windows/Linux: {execDir}/resources/extraResources
 * - macOS: {execDir}/../Resources/extraResources
 *
 * Before packaging: {execDir}/build/extraResources
 */
export function getExtraResourcesDir(): string {
  const execDir = getExecDir();
  const packaged = isPackaged();

  let dir = '';
  if (packaged) {
    dir = path.join(execDir, 'resources', 'extraResources');
    // macOS app bundle structure: exe is in Contents/MacOS/, resources are in Contents/Resources/
    if (process.platform === 'darwin') {
      dir = path.join(execDir, '..', 'Resources', 'extraResources');
    }
  } else {
    dir = path.join(execDir, 'build', 'extraResources');
  }
  return dir;
}

/**
 * Get the root directory
 *
 * Development: Project root directory (baseDir)
 * Production: App user data directory
 */
export function getRootDir(): string {
  return isDev() ? getBaseDir() : getAppUserDataDir();
}

/** Get the Electron appUserData directory */
export function getAppUserDataDir(): string {
  return process.env.EE_APP_USER_DATA || '';
}

/** Get the executable directory (execDir) */
export function getExecDir(): string {
  return process.env.EE_EXEC_DIR || '';
}

/** Get the OS user home directory */
export function getUserHomeDir(): string {
  return process.env.EE_USER_HOME || '';
}

/**
 * Get the hidden app directory under the user home directory
 *
 * Path format: {userHome}/.{appName}/
 * Used for storing data, logs, and other persistent files in production.
 */
export function getUserHomeHiddenAppDir(): string {
  return path.join(getUserHomeDir(), '.' + appName());
}

/** Get the app directory under the user home directory (not hidden): {userHome}/{appName}/ */
export function getUserHomeAppDir(): string {
  return path.join(getUserHomeDir(), appName());
}

/** Get the built-in Socket server port number */
export function getSocketPort(): number {
  return parseInt(process.env.EE_SOCKET_PORT || '0') || 0;
}

/** Get the built-in HTTP server port number */
export function getHttpPort(): number {
  return parseInt(process.env.EE_HTTP_PORT || '0') || 0;
}

/** Whether the app is packaged (production environment) */
export function isPackaged(): boolean {
  return process.env.EE_IS_PACKAGED === 'true';
}

/** Exit the current process */
export function exit(code = 0): never {
  return process.exit(code);
}

/**
 * Format an IPC message
 *
 * @param msg - Partial message fields
 * @returns Complete message object, with missing fields filled using default values
 */
export function makeMessage(msg: Partial<{ channel: string; event: string; data: unknown }> = {}): {
  channel: string;
  event: string;
  data: unknown;
} {
  return Object.assign({ channel: '', event: '', data: {} }, msg);
}

/**
 * Exit a ChildJob-type child process
 *
 * Checks the type field in argv[2] to determine if this is a ChildJob process.
 * Only ChildJob processes will exit; other types of child processes are not affected.
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
 * Determine whether the current process is of ChildJob type
 *
 * Checks the type field in the process startup arguments.
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
 * Determine whether the current process is of ChildPoolJob type
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
 * Get the value of a named argument from command line arguments
 *
 * Search format: --name=value
 *
 * @param name - Argument name (without the -- prefix)
 * @param args - Arguments array, defaults to process.argv
 * @returns Argument value, or undefined if not found
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
