import is from 'is-type-of';
import fs from 'fs';
import path from 'path';
import { loadFile as coreLoadFile, isBytecodeClass } from '../core/utils/index.js';
import { getElectronDir } from '../ps/index.js';

export function loadFile(filepath: string, ...inject: unknown[]): unknown {
  let fullpath = filepath;
  const isAbsolute = path.isAbsolute(fullpath);
  if (!isAbsolute) {
    fullpath = path.join(getElectronDir(), fullpath);
  }

  fullpath = resolveModule(fullpath) || fullpath;
  if (!fs.existsSync(fullpath)) {
    throw new Error(`[ee-core] [loader/index] loadFile ${filepath} does not exist`);
  }

  let ret = coreLoadFile(fullpath);
  if (is.function_(ret) && !is.class_(ret) && !isBytecodeClass(ret)) {
    ret = (ret as (...args: unknown[]) => unknown)(...inject);
  }
  return ret;
}

export function requireFile(filepath: string): unknown {
  return coreLoadFile(filepath);
}

export function execFile(filepath: string, ...inject: unknown[]): unknown {
  let ret = coreLoadFile(filepath);
  if (is.class_(ret) || isBytecodeClass(ret)) {
    ret = new (ret as new (...args: unknown[]) => unknown)(inject);
  } else if (is.function_(ret)) {
    ret = (ret as (...args: unknown[]) => unknown)(inject);
  }
  return ret;
}

export function resolveModule(filepath: string): string | undefined {
  let fullpath: string | undefined;
  try {
    fullpath = require.resolve(filepath);
  } catch {
    if (filepath && (filepath.endsWith('.defalut') || filepath.endsWith('.prod'))) {
      fullpath = filepath + '.jsc';
    } else if (filepath && filepath.endsWith('.js')) {
      fullpath = filepath + 'c';
    }

    if (!fs.existsSync(filepath) && (!fullpath || !fs.existsSync(fullpath))) {
      console.warn(`[ee-core] [loader] resolveModule unknow filepath: ${JSON.stringify({ filepath, fullpath })}`);
      return undefined;
    }
  }

  return fullpath;
}

export function getFullpath(filepath: string): string {
  let fullpath: string | undefined;
  const isAbsolute = path.isAbsolute(filepath);
  if (!isAbsolute) {
    filepath = path.join(getElectronDir(), filepath);
  }

  fullpath = resolveModule(filepath);
  if (!fullpath || !fs.existsSync(fullpath)) {
    throw new Error(`[ee-core] [loader] getFullpath filepath ${filepath} not exists`);
  }
  return fullpath;
}
