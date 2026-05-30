/**
 * Local Helper Utilities — replaces unnecessary npm dependencies
 *
 * This module provides lightweight local implementations as alternatives to four npm packages,
 * reducing dependency size and security risk:
 *   - is-type-of → is.function / is.class (only two checks needed)
 *   - chalk → ANSI escape code-based colored output (8 colors suffice)
 *   - fs-extra → copyDirSync recursive directory copy (only this one method needed)
 *   - debug → createDebug environment variable-based debug logging (with cache optimization)
 *
 * Also provides formatCmds for comma-separated command string parsing.
 */

import fs from 'fs';
import path from 'path';

// ─── Type checking (replaces is-type-of) ──────────────────────────

export const is = {
  /** Check whether a value is a function (including async functions and generators) */
  function(val: unknown): boolean {
    return typeof val === 'function';
  },
  /**
   * Check whether a value is an ES6 class.
   * Uses toString() to check if the source code starts with 'class ', and verifies
   * the prototype property exists. This double-check prevents false positives for
   * regular functions (arrow functions and bound functions have no prototype).
   */
  class(val: unknown): boolean {
    return typeof val === 'function' && val.toString().startsWith('class ') && !!val.prototype;
  },
};

// ─── Colored output (replaces chalk, based on ANSI escape codes) ──

const RESET = '\x1b[0m';

/** Wrap text with ANSI escape codes: prefix color code + content + reset code */
function ansi(code: string, text: string): string {
  return code + text + RESET;
}

/** Minimal chalk replacement, providing the 8 colors needed for ee-bin logging */
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

// ─── Recursive directory copy (replaces fs-extra) ─────────────────

/**
 * Synchronously copy a file or directory.
 * Automatically determines src type: files are copied directly, directories are copied recursively.
 */
export function copyDirSync(src: string, dest: string): void {
  if (fs.statSync(src).isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return;
  }
  _copyDirRecursive(src, dest);
}

/** Recursively copy directory contents (internal implementation) */
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

// ─── Debug logging (replaces debug npm package) ───────────────────

/**
 * Create a namespace-scoped debug log function
 *
 * Controlled by the process.env.DEBUG environment variable:
 *   - DEBUG=*        → enable all namespaces
 *   - DEBUG=ee-bin:* → enable all ee-bin sub-namespaces
 *   - DEBUG=ee-bin:serve → enable only the serve namespace
 *
 * Includes cache optimization: the enabled state is only recalculated when
 * the DEBUG environment variable changes, avoiding re-parsing the env string
 * on every log call.
 */
export function createDebug(namespace: string): (...args: unknown[]) => void {
  let cachedDebugEnv: string | undefined;
  let cachedEnabled = false;

  /** Check whether the current DEBUG env enables this namespace (with caching) */
  const checkEnabled = () => {
    const currentEnv = process.env.DEBUG;
    if (currentEnv !== cachedDebugEnv) {
      cachedDebugEnv = currentEnv;
      const dbg = currentEnv || '';
      cachedEnabled = dbg === '*' || dbg.split(',').some((ns) => {
        if (ns.endsWith(':*')) return namespace.startsWith(ns.slice(0, -1));
        return ns === namespace;
      });
    }
    return cachedEnabled;
  };

  return (...args: unknown[]) => {
    if (checkEnabled()) {
      console.log(namespace, ...args);
    }
  };
}

// ─── Command string parsing ───────────────────────────────────────

/**
 * Parse a comma-separated command string into an array of commands
 *
 * Processing rules:
 *   - Empty string → []
 *   - No comma → single-element array
 *   - With comma → split, trim each item, and filter out empty values
 *     Example: "frontend, electron" → ["frontend", "electron"]
 *     Example: "frontend,,electron" → ["frontend", "electron"]
 */
export function formatCmds(command: string): string[] {
  const cmdString = command.trim();
  if (cmdString === '') return [];
  if (cmdString.includes(',')) {
    return cmdString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [cmdString];
}
