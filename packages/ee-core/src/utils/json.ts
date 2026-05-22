import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export interface JsonWriteOptions {
  space?: number;
  replacer?: (key: string, value: unknown) => unknown;
}

export function strictParse(str: string): unknown {
  const obj = JSON.parse(str);
  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON string is not object');
  }
  return obj;
}

export function readSync(filepath: string): unknown {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

export function writeSync(filepath: string, str: unknown, options: JsonWriteOptions = {}): void {
  const opts = { space: 2, ...options };

  mkdirp.sync(path.dirname(filepath));
  let content: string;
  if (typeof str === 'object') {
    content = JSON.stringify(str, opts.replacer as (key: string, value: unknown) => unknown, opts.space) + '\n';
  } else {
    content = String(str);
  }

  fs.writeFileSync(filepath, content);
}

export function read(filepath: string): Promise<unknown> {
  return fs.promises
    .stat(filepath)
    .then((stats) => {
      if (!stats.isFile()) {
        throw new Error(filepath + ' is not found');
      }
      return fs.promises.readFile(filepath, 'utf8');
    })
    .then((buf) => JSON.parse(buf));
}

export function write(filepath: string, str: unknown, options: JsonWriteOptions = {}): Promise<void> {
  const opts = { space: 2, ...options };

  let content: string;
  if (typeof str === 'object') {
    content = JSON.stringify(str, opts.replacer as (key: string, value: unknown) => unknown, opts.space) + '\n';
  } else {
    content = String(str);
  }

  return mkdirp(path.dirname(filepath)).then(() => fs.promises.writeFile(filepath, content));
}
