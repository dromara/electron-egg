/**
 * Local helpers replacing 5 unnecessary npm dependencies:
 *   is-type-of, mkdirp, chalk, fs-extra, debug
 */

// ─── is-type-of ───────────────────────────────────────────

export const is = {
  function(val: unknown): boolean {
    return typeof val === 'function';
  },
  class(val: unknown): boolean {
    return typeof val === 'function' && val.toString().startsWith('class ');
  },
  string(val: unknown): boolean {
    return typeof val === 'string';
  },
  array(val: unknown): boolean {
    return Array.isArray(val);
  },
  object(val: unknown): boolean {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
  },
  boolean(val: unknown): boolean {
    return typeof val === 'boolean';
  },
  number(val: unknown): boolean {
    return typeof val === 'number';
  },
  null(val: unknown): boolean {
    return val === null;
  },
  undefined(val: unknown): boolean {
    return val === undefined;
  },
  date(val: unknown): boolean {
    return val instanceof Date;
  },
  regexp(val: unknown): boolean {
    return val instanceof RegExp;
  },
  error(val: unknown): boolean {
    return val instanceof Error;
  },
  promise(val: unknown): boolean {
    return val instanceof Promise;
  },
  generatorFunction(val: unknown): boolean {
    return typeof val === 'function' && val.constructor.name === 'GeneratorFunction';
  },
  asyncFunction(val: unknown): boolean {
    return typeof val === 'function' && val.constructor.name === 'AsyncFunction';
  },
};

// ─── mkdirp ───────────────────────────────────────────────

import fs from 'fs';
import path from 'path';

export const mkdirp = {
  sync(dir: string, opts?: { mode?: number }): string | undefined {
    if (fs.existsSync(dir)) return dir;
    fs.mkdirSync(dir, { recursive: true, mode: opts?.mode });
    return dir;
  },
};

// ─── chalk (ANSI escape codes) ────────────────────────────

const RESET = '\x1b[0m';

function ansi(code: string, text: string): string {
  return code + text + RESET;
}

export const chalk = {
  blue: (text: string) => ansi('\x1b[34m', text),
  green: (text: string) => ansi('\x1b[32m', text),
  red: (text: string) => ansi('\x1b[31m', text),
  cyan: (text: string) => ansi('\x1b[36m', text),
  magenta: (text: string) => ansi('\x1b[35m', text),
  yellow: (text: string) => ansi('\x1b[33m', text),
  bgRed: (text: string) => ansi('\x1b[41m', text),
  bgYellow: (text: string) => ansi('\x1b[43m', text),
};

// ─── fs-extra ─────────────────────────────────────────────

export const fsPro = {
  copySync(src: string, dest: string): void {
    if (fs.statSync(src).isDirectory()) {
      _copyDirSync(src, dest);
    } else {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  },
  removeSync(target: string): void {
    fs.rmSync(target, { recursive: true, force: true });
  },
  existsSync(target: string): boolean {
    return fs.existsSync(target);
  },
};

function _copyDirSync(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      _copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── debug ────────────────────────────────────────────────

export function createDebug(namespace: string): (...args: unknown[]) => void {
  const enabled = () => {
    const dbg = process.env.DEBUG || '';
    return dbg === '*' || dbg.split(',').some((ns) => {
      if (ns.endsWith(':*')) return namespace.startsWith(ns.slice(0, -1));
      return ns === namespace;
    });
  };

  return (...args: unknown[]) => {
    if (enabled()) {
      console.log(namespace, ...args);
    }
  };
}