import path from 'path';

export function allEnv(): NodeJS.ProcessEnv {
  return process.env;
}

export function env(): string {
  return process.env.EE_ENV || '';
}

export function isProd(): boolean {
  return process.env.EE_ENV === 'prod';
}

export function isDev(): boolean {
  return process.env.EE_ENV === 'dev' || process.env.EE_ENV === 'local';
}

export function isRenderer(): boolean {
  return typeof process === 'undefined' || !process || process.type === 'renderer';
}

export function isMain(): boolean {
  return typeof process !== 'undefined' && process.type === 'browser';
}

export function isForkedChild(): boolean {
  return Number(process.env.ELECTRON_RUN_AS_NODE) === 1;
}

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

export function appName(): string {
  return process.env.EE_APP_NAME || '';
}

export function appVersion(): string {
  return process.env.EE_APP_VERSION || '';
}

export function getDataDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'data');
}

export function getLogDir(): string {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  return path.join(base, 'logs');
}

export function getBundleDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'public', 'electron');
}

export function getElectronCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'electron');
}

export function getFrontendCodeDir(basePath?: string): string {
  const base = basePath || process.cwd();
  return path.join(base, 'frontend');
}

export function getBaseDir(): string {
  return process.env.EE_BASE_DIR || process.cwd();
}

export function getElectronDir(): string {
  return process.env.EE_ELECTRON_DIR || '';
}

export function getPublicDir(): string {
  return path.join(getBaseDir(), 'public');
}

export function getExtraResourcesDir(): string {
  const execDir = getExecDir();
  const packaged = isPackaged();

  let dir = '';
  if (packaged) {
    dir = path.join(execDir, 'resources', 'extraResources');
    if (process.platform === 'darwin') {
      dir = path.join(execDir, '..', 'Resources', 'extraResources');
    }
  } else {
    dir = path.join(execDir, 'build', 'extraResources');
  }
  return dir;
}

export function getRootDir(): string {
  return isDev() ? getBaseDir() : getAppUserDataDir();
}

export function getAppUserDataDir(): string {
  return process.env.EE_APP_USER_DATA || '';
}

export function getExecDir(): string {
  return process.env.EE_EXEC_DIR || process.cwd();
}

export function getUserHomeDir(): string {
  return process.env.EE_USER_HOME || '';
}

export function getUserHomeHiddenAppDir(): string {
  return path.join(getUserHomeDir(), '.' + appName());
}

export function getUserHomeAppDir(): string {
  return path.join(getUserHomeDir(), appName());
}

export function getSocketPort(): number {
  return parseInt(process.env.EE_SOCKET_PORT || '0') || 0;
}

export function getHttpPort(): number {
  return parseInt(process.env.EE_HTTP_PORT || '0') || 0;
}

export function isPackaged(): boolean {
  return process.env.EE_IS_PACKAGED === 'true';
}

export function exit(code = 0): never {
  return process.exit(code);
}

export function makeMessage(msg: Partial<{ channel: string; event: string; data: unknown }> = {}): {
  channel: string;
  event: string;
  data: unknown;
} {
  return Object.assign({ channel: '', event: '', data: {} }, msg);
}

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

export function isChildJob(): boolean {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    return args.type === 'childJob';
  } catch {
    return false;
  }
}

export function isChildPoolJob(): boolean {
  try {
    const args = JSON.parse(process.argv[2] || '{}');
    return args.type === 'childPoolJob';
  } catch {
    return false;
  }
}

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
