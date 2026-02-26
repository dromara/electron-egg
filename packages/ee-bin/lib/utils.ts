

import debug from 'debug';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import is from 'is-type-of';
import { loadTsConfig } from 'config-file-ts';
import JsonLib from 'json5';
import mkdirp from 'mkdirp';
import OS from 'os';
import defaultConfig from '../config/bin_default';
import { extend } from './extend';

const debugLog = debug('ee-bin:lib:utils');
const _basePath = process.cwd();
const userBin = './cmd/bin.js';

function loadConfig(binFile?: string) {
  const binPath = binFile ? binFile : userBin;
  const userConfig = loadFile(binPath);
  const result = extend(true, defaultConfig, userConfig);
  debugLog('[loadConfig] bin:%j', result);

  return result;
}

function loadFile(filepath: string): any {
  const configFile = path.join(_basePath, filepath);
  if (!fs.existsSync(configFile)) {
    const errorTips = 'file ' + chalk.blue(`${configFile}`) + ' does not exist !';
    throw new Error(errorTips);
  }

  let result: any;
  if (configFile.endsWith(".json5") || configFile.endsWith(".json")) {
    const data = fs.readFileSync(configFile, 'utf8');
    return JsonLib.parse(data);
  }
  if (configFile.endsWith(".js") || configFile.endsWith(".cjs")) {
    result = require(configFile);
    if (result.default != null) {
      result = result.default;
    }
  } else if (configFile.endsWith(".ts")) {
    result = loadTsConfig(configFile);
  }
  if (is.function(result) && !is.class(result)) {
    result = result();
  }
  return result || {};
}

/**
 * get electron program
 */
function getElectronProgram(): string {
  let electronPath: string;
  const electronModulePath = path.dirname(require.resolve('electron'));
  const pathFile = path.join(electronModulePath, 'path.txt');
  const executablePath = fs.readFileSync(pathFile, 'utf-8');
  if (executablePath) {
    electronPath = path.join(electronModulePath, 'dist', executablePath);
  } else {
    throw new Error('Check that electron is installed!');
  }
  return electronPath;
}

/**
 * 版本号比较
 */
function compareVersion(v1: string, v2: string): number {
  const arr1 = v1.split('.');
  const arr2 = v2.split('.');
  const len = Math.max(arr1.length, arr2.length);

  while (arr1.length < len) {
    arr1.push('0');
  }
  while (arr2.length < len) {
    arr2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(arr1[i]);
    const num2 = parseInt(arr2[i]);

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

function isWindows(): boolean {
  return process.platform === 'win32';
}

function isOSX(): boolean {
  return process.platform === 'darwin';
}

function isMacOS(): boolean {
  return isOSX();
}

function isLinux(): boolean {
  return process.platform === 'linux';
}

function isx86(): boolean {
  return process.arch === 'ia32';
}

function isx64(): boolean {
  return process.arch === 'x64';
}

/**
 * Delete a file or folder
 */
function rm(name: string): void {
  // check
  if (!fs.existsSync(name)) {
    return;
  }

  const nodeVersion = (process.versions && process.versions.node) || null;
  if (nodeVersion && compareVersion(nodeVersion, '14.14.0') === 1) {
    fs.rmSync(name, { recursive: true });
  } else {
    fs.rmdirSync(name, { recursive: true });
  }
}

/**
 * 获取项目根目录package.json
 */
function getPackage() {
  const content = readJsonSync(path.join(_basePath, 'package.json'));
  return content;
}

function readJsonSync(filepath: string, encoding: BufferEncoding = 'utf8') {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, { encoding }));
}

interface WriteJsonOptions {
  space?: number;
  replacer?: (key: string, value: any) => any;
}

function writeJsonSync(filepath: string, str: any, options: WriteJsonOptions = {}) {
  if (!('space' in options)) {
    options.space = 2;
  }

  mkdirp.sync(path.dirname(filepath));
  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  fs.writeFileSync(filepath, str);
}

function getPlatform(delimiter: string = "_", isDiffArch: boolean = false): string {
  let os = "";
  if (isWindows()) {
    os = "windows";
    if (isDiffArch) {
      const arch = isx64() ? "64" : "32";
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
    const core = isAppleSilicon ? "apple" : "intel";
    os = "macos" + delimiter + core;
  } else if (isLinux()) {
    os = "linux";
  }

  return os;
}

// Get cmd parameter by name
function getArgumentByName(name: string, args: string[] = process.argv): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const item = args[i];
    const prefixKey = `--${name}=`;
    if (item.indexOf(prefixKey) !== -1) {
      return item.substring(prefixKey.length);
    }
  }
}

function getExtraResourcesDir(): string {
  const dir = path.join(_basePath, "build", "extraResources");
  return dir;
}

function getModuleNameFromPath(modulePath: string): string | null {
  // 分割路径段（处理不同系统的分隔符）
  const segments = path.normalize(modulePath).split(path.sep);
  
  // 从后往前查找 node_modules
  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i] === 'node_modules') {
      // 普通模块：node_modules/dayjs
      if (i + 1 < segments.length) {
        return segments[i + 1];
      }
      
      // 作用域模块：node_modules/@scope/module
      if (i + 2 < segments.length && segments[i + 1].startsWith('@')) {
        return `${segments[i + 1]}/${segments[i + 2]}`;
      }
      
      break; // 找到 node_modules 但后面没有模块名
    }
  }
  
  return null;
}

export {
  loadConfig,
  loadFile,
  getElectronProgram,
  compareVersion,
  isWindows,
  isOSX,
  isMacOS,
  isLinux,
  isx86,
  isx64,
  getPlatform,
  rm,
  getPackage,
  readJsonSync,
  writeJsonSync,
  getArgumentByName,
  getExtraResourcesDir,
  getModuleNameFromPath
};