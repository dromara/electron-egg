import { createDebug } from './helpers.js';
import path from 'path';
import fs from 'fs';
import { chalk } from './helpers.js';
import { is } from './helpers.js';
import JsonLib from 'json5';
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

export function rm(name: string): void {
  if (!fs.existsSync(name)) {
    return;
  }
  fs.rmSync(name, { recursive: true, force: true });
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

  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  let data: string;
  if (typeof str === 'object') {
    data = JSON.stringify(str, opt.replacer, opt.space) + '\n';
  } else {
    data = String(str);
  }

  fs.writeFileSync(filepath, data);
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

export function getPlatform(delimiter = '_', isDiffArch = false): string {
  if (process.platform === 'win32') {
    let os = 'windows';
    if (isDiffArch) {
      os += delimiter + (process.arch === 'x64' ? '64' : '32');
    }
    return os;
  }
  if (process.platform === 'darwin') {
    const core = process.arch === 'arm64' ? 'apple' : 'intel';
    return 'macos' + delimiter + core;
  }
  return 'linux';
}