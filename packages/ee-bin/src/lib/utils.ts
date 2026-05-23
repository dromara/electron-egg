import { createDebug } from './helpers.js';
import path from 'path';
import fs from 'fs';
import { chalk } from './helpers.js';
import { is } from './helpers.js';
import JsonLib from 'json5';
import { mkdirp } from './helpers.js';
import OS from 'os';
import defaultConfig from '../config/bin_default.js';
import { extend } from './extend.js';

const log = createDebug('ee-bin:lib:utils');
const _basePath = process.cwd();
const userBin = './cmd/bin.js';

export function loadConfig(binFile?: string): Record<string, unknown> {
  const binPath = binFile || userBin;
  const userConfig = loadFile(binPath);
  const result = extend(true, { ...defaultConfig }, userConfig);
  log('[loadConfig] bin:%j', result);

  return result;
}

export function loadFile(filepath: string): Record<string, unknown> {
  const configFile = path.join(_basePath, filepath);
  if (!fs.existsSync(configFile)) {
    const errorTips = 'file ' + chalk.blue(`${configFile}`) + ' does not exist !';
    throw new Error(errorTips);
  }

  let result: unknown;
  if (configFile.endsWith('.json5') || configFile.endsWith('.json')) {
    const data = fs.readFileSync(configFile, 'utf8');
    return JsonLib.parse(data) as Record<string, unknown>;
  }
  if (configFile.endsWith('.js') || configFile.endsWith('.cjs')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic user config loading
    const mod = require(configFile);
    result = mod.default != null ? mod.default : mod;
  }
  if (is.function(result) && !is.class(result)) {
    result = (result as () => unknown)();
  }
  return (result as Record<string, unknown>) || {};
}

export function getElectronProgram(): string {
  let electronPath: string;
  const electronModulePath = path.dirname(require.resolve('electron'));
  const pathFile = path.join(electronModulePath, 'path.txt');
  const executablePath = fs.readFileSync(pathFile, 'utf-8');
  if (executablePath) {
    electronPath = path.join(electronModulePath, 'dist', executablePath.trim());
  } else {
    throw new Error('Check that electron is installed!');
  }
  return electronPath;
}

export function compareVersion(v1: string, v2: string): number {
  const s1 = v1.split('.');
  const s2 = v2.split('.');
  const len = Math.max(s1.length, s2.length);

  while (s1.length < len) {
    s1.push('0');
  }
  while (s2.length < len) {
    s2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(s1[i] || '0', 10);
    const num2 = parseInt(s2[i] || '0', 10);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isOSX(): boolean {
  return process.platform === 'darwin';
}

export function isMacOS(): boolean {
  return isOSX();
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}

export function isx86(): boolean {
  return process.arch === 'ia32';
}

export function isx64(): boolean {
  return process.arch === 'x64';
}

export function rm(name: string): void {
  if (!fs.existsSync(name)) {
    return;
  }
  fs.rmSync(name, { recursive: true, force: true });
}

export function getPackage(): Record<string, unknown> {
  const content = readJsonSync(path.join(_basePath, 'package.json'));
  return content;
}

export function readJsonSync(filepath: string, encoding: BufferEncoding = 'utf8'): Record<string, unknown> {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, { encoding }));
}

export function writeJsonSync(filepath: string, str: unknown, options?: { space?: number; replacer?: (key: string, value: unknown) => unknown }): void {
  const opt = options || {};
  if (!('space' in opt)) {
    opt.space = 2;
  }

  mkdirp.sync(path.dirname(filepath));
  let data: string;
  if (typeof str === 'object') {
    data = JSON.stringify(str, opt.replacer, opt.space) + '\n';
  } else {
    data = String(str);
  }

  fs.writeFileSync(filepath, data);
}

export function getPlatform(delimiter = '_', isDiffArch = false): string {
  let os = '';
  if (isWindows()) {
    os = 'windows';
    if (isDiffArch) {
      const arch = isx64() ? '64' : '32';
      os += delimiter + arch;
    }
  } else if (isMacOS()) {
    let isAppleSilicon = false;
    const cpus = OS.cpus();
    for (const cpu of cpus) {
      if (cpu.model.includes('Apple')) {
        isAppleSilicon = true;
        break;
      }
    }
    const core = isAppleSilicon ? 'apple' : 'intel';
    os = 'macos' + delimiter + core;
  } else if (isLinux()) {
    os = 'linux';
  }

  return os;
}

export function getArgumentByName(name: string, args?: string[]): string | undefined {
  if (!args) {
    args = process.argv;
  }
  for (let i = 0; i < args.length; i++) {
    const item = args[i];
    if (!item) continue;
    const prefixKey = `--${name}=`;
    if (item.indexOf(prefixKey) !== -1) {
      return item.substring(prefixKey.length);
    }
  }
  return undefined;
}

export function getExtraResourcesDir(): string {
  const dir = path.join(_basePath, 'build', 'extraResources');
  return dir;
}

export function getModuleNameFromPath(modulePath: string): string | null {
  const segments = path.normalize(modulePath).split(path.sep);

  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i] === 'node_modules') {
      if (i + 1 < segments.length) {
        const next = segments[i + 1];
        if (next) return next;
      }

      const seg = segments[i + 1];
      if (i + 2 < segments.length && seg && seg.startsWith('@')) {
        const scope = segments[i + 1];
        const name = segments[i + 2];
        if (scope && name) return `${scope}/${name}`;
      }

      break;
    }
  }

  return null;
}
