/**
 * Local helpers replacing unnecessary npm dependencies.
 */

import fs from 'fs';
import path from 'path';

// ─── type checks (replacing is-type-of) ────────────────────

export const is = {
  function(val: unknown): boolean {
    return typeof val === 'function';
  },
  class(val: unknown): boolean {
    return typeof val === 'function' && val.toString().startsWith('class ');
  },
};

// ─── chalk (ANSI escape codes) ─────────────────────────────

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

// ─── fs-extra ──────────────────────────────────────────────

export function copyDirSync(src: string, dest: string): void {
  if (fs.statSync(src).isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return;
  }
  _copyDirRecursive(src, dest);
}

function _copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      _copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── debug ─────────────────────────────────────────────────

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

// ─── formatCmds ────────────────────────────────────────────

export function formatCmds(command: string): string[] {
  const cmdString = command.trim();
  if (cmdString === '') return [];
  if (cmdString.includes(',')) {
    return cmdString.split(',');
  }
  return [cmdString];
}