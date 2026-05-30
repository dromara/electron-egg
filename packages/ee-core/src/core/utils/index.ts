/**
 * @module core/utils
 * @description Core utility functions. Provides file loading, function invocation, bytecode class detection,
 * and other foundational capabilities. Serves as a low-level dependency for FileLoader and other modules.
 */
import 'bytenode';
import { isFunction as isFunctionCheck } from '../../utils/type_check.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

// __filename is available in CJS; in pure ESM without a bundler, use cwd as the base path for createRequire
const requireMod = createRequire(
  typeof __filename !== 'undefined'
    ? __filename
    : path.join(process.cwd(), '__virtual__.js')
);
const Module = requireMod('module');

// File extensions natively supported by Node.js (including .jsc registered by bytenode)
const extensions: NodeJS.RequireExtensions = Module._extensions;

/**
 * Load a file synchronously
 *
 * Execution flow:
 * 1. Non-JS files (extensions not in Module._extensions) -> return file content as Buffer
 * 2. JS/CJS/JSC files -> load module using require()
 * 3. ESM modules (with __esModule marker) -> extract default export
 *
 * @param filepath - Absolute file path
 * @returns File content (Buffer) or module export value
 * @throws Throws an error containing the file path when file loading fails
 */
export function loadFile(filepath: string): unknown {
  try {
    // Non-JS module, return file content directly
    const extname = path.extname(filepath);
    if (extname && !extensions[extname]) {
      return fs.readFileSync(filepath);
    }

    // Load JS module
    const obj = requireMod(filepath);
    if (!obj) return obj;
    // ESM interop: extract default export
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    const error = err as Error;
    error.message = `[ee-core] load file: ${filepath}, error: ${error.message}`;
    throw error;
  }
}

/**
 * Call a function with bound context
 *
 * @param fn - Function to call
 * @param args - Function argument list
 * @param ctx - Function execution context (this binding); if not provided, calls directly
 * @returns Function return value; returns undefined if fn is not a function
 */
export async function callFn(fn: (...args: unknown[]) => unknown, args?: unknown[], ctx?: unknown): Promise<unknown> {
  args = args || [];
  if (!isFunctionCheck(fn)) return undefined;
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

/**
 * Get the relative path name of a file
 *
 * Converts an absolute path to a relative path based on baseDir, using forward slashes as separators.
 *
 * @param filepath - Absolute file path
 * @param baseDir - Base directory
 * @returns Relative path (forward slash separated)
 */
export function getResolvedFilename(filepath: string, baseDir: string): string {
  const reg = /[/\\]/g;
  return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
}

/**
 * Determine if an export is a bytecode class
 *
 * Checks whether the toString() result contains '[class'.
 * Classes from bytenode-compiled .jsc files appear as '[class XXX]' in Node.js.
 *
 * @param exports - Export value to check
 * @returns Whether it is a bytecode class
 */
export function isBytecodeClass(exports: unknown): boolean {
  if (!exports) return false;
  return String(exports).indexOf('[class') !== -1;
}

/**
 * Get supported file match patterns
 *
 * Used for filtering file types when globby scans directories.
 *
 * @returns File pattern list (.js and .jsc)
 */
export function filePatterns(): string[] {
  return ['**/*.js', '**/*.jsc'];
}

export { extensions };

/**
 * Load a file asynchronously (ESM support)
 *
 * Same functionality as loadFile, but uses dynamic import() to load modules,
 * supporting ESM format files. Non-JS files are read using fs.promises.readFile.
 *
 * @param filepath - Absolute file path
 * @returns File content (Buffer) or module export value
 * @throws Throws an error containing the file path when file loading fails
 */
export async function loadFileAsync(filepath: string): Promise<unknown> {
  try {
    const extname = path.extname(filepath);
    // Non-JS/ESM files: return content as Buffer
    if (extname && !extensions[extname] && extname !== '.mjs') {
      return fs.promises.readFile(filepath);
    }

    // Dynamic import, supporting both ESM and CJS
    const obj = await import(filepath);
    if (!obj) return obj;
    // ESM interop: extract default export
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    const error = err as Error;
    error.message = `[ee-core] load file async: ${filepath}, error: ${error.message}`;
    throw error;
  }
}
