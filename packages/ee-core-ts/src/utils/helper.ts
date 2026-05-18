import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import convert from 'koa-convert';
import is from 'is-type-of';
import chalk from 'chalk';
import { parseArgv } from './pargv.js';

const _basePath = process.cwd();

export function fnDebounce(): (
  fn: (args?: unknown) => void,
  delayTime?: number,
  isImediate?: boolean,
  args?: unknown
) => void {
  const fnObject: Record<string, { delayTime: number; timer: NodeJS.Timeout }> = {};
  let timer: NodeJS.Timeout;

  return (fn, delayTime, isImediate, args) => {
    const setTimer = () => {
      timer = setTimeout(() => {
        fn(args);
        clearTimeout(timer);
        delete fnObject[fn as unknown as string];
      }, delayTime);

      fnObject[fn as unknown as string] = { delayTime: delayTime || 0, timer };
    };

    if (!delayTime || isImediate) return fn(args);

    if (fnObject[fn as unknown as string]) {
      clearTimeout(timer);
      setTimer();
    } else {
      setTimer();
    }
  };
}

export function getRandomString(): string {
  return Math.random().toString(36).substring(2);
}

export function mkdir(filepath: string, opt: { mode?: number } = {}): void {
  mkdirp.sync(filepath, opt);
}

export function chmodPath(filepath: string, mode: number): void {
  if (fs.existsSync(filepath)) {
    const files = fs.readdirSync(filepath);
    files.forEach((file) => {
      const curPath = path.join(filepath, file);
      if (fs.statSync(curPath).isDirectory()) {
        chmodPath(curPath, mode);
      } else {
        fs.chmodSync(curPath, mode);
      }
    });
    fs.chmodSync(filepath, mode);
  }
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
    const num1 = parseInt(s1[i] || '0');
    const num2 = parseInt(s2[i] || '0');

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

export function middleware(fn: unknown): unknown {
  return is.generatorFunction(fn) ? convert(fn as GeneratorFunction) : fn;
}

export function stringify(obj: Record<string, unknown>, ignore: string[] = []): string {
  const result: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    if (!ignore.includes(key)) {
      result[key] = obj[key];
    }
  });
  return JSON.stringify(result);
}

export function validValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

export function checkConfig(prop: string): boolean {
  const filepath = path.join(_basePath, prop);
  return fs.existsSync(filepath);
}

export function loadConfig(prop: string): unknown {
  const filepath = path.join(_basePath, prop);
  if (!fs.existsSync(filepath)) {
    const errorTips = 'config file ' + chalk.blue(`${filepath}`) + ' does not exist !';
    throw new Error(errorTips);
  }
  const obj = require(filepath);
  if (!obj) return obj;

  let ret = obj;
  if (is.function_(obj) && !is.class_(obj)) {
    ret = (obj as (...args: unknown[]) => unknown)();
  }

  return ret || {};
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function replaceArgsValue(argv: string[], key: string, value: string): string[] {
  const searchKey = key + '=';
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item) continue;
    const pos = item.indexOf(searchKey);
    if (pos !== -1) {
      argv[i] = item.substring(0, pos + searchKey.length) + value;
      break;
    }
  }
  return argv;
}

export function getValueFromArgv(argv: string[], key: string): unknown {
  const argvObj = parseArgv(argv);
  if (Object.prototype.hasOwnProperty.call(argvObj, key)) {
    return argvObj[key];
  }

  const searchKey = key + '=';
  let value: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item) continue;
    const pos = item.indexOf(searchKey);
    if (pos !== -1) {
      value = item.substring(pos + searchKey.length);
      break;
    }
  }

  return value;
}

export function fileIsExist(filepath: string): boolean {
  return fs.existsSync(filepath) && fs.statSync(filepath).isFile();
}
