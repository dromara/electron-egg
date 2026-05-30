import 'bytenode';
import { isFunction as isFunctionCheck } from '../../utils/type_check.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const requireMod = createRequire(__filename);
const Module = requireMod('module');

// Module._extensions:
// '.js': [Function (anonymous)],
// '.json': [Function (anonymous)],
// '.node': [Function: func],
// '.jsc': [Function (anonymous)]

const extensions: NodeJS.RequireExtensions = Module._extensions;

export function loadFile(filepath: string): unknown {
  try {
    // if not js module, just return content buffer
    const extname = path.extname(filepath);
    if (extname && !extensions[extname]) {
      return fs.readFileSync(filepath);
    }

    // require js module
    const obj = requireMod(filepath);
    if (!obj) return obj;
    // it's es module
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    const error = err as Error;
    error.message = `[ee-core] load file: ${filepath}, error: ${error.message}`;
    throw error;
  }
}

export async function callFn(fn: (...args: unknown[]) => unknown, args?: unknown[], ctx?: unknown): Promise<unknown> {
  args = args || [];
  if (!isFunctionCheck(fn)) return undefined;
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

export function getResolvedFilename(filepath: string, baseDir: string): string {
  const reg = /[/\\]/g;
  return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
}

/**
 * 字节码类
 */
export function isBytecodeClass(exports: unknown): boolean {
  if (!exports) return false;
  // 标识
  return String(exports).indexOf('[class') !== -1;
}

/**
 * 文件类型
 */
export function filePatterns(): string[] {
  return ['**/*.js', '**/*.jsc'];
}

export { extensions };

/**
 * Async version of loadFile for ESM modules.
 * Uses dynamic import() which is inherently async.
 */
export async function loadFileAsync(filepath: string): Promise<unknown> {
  try {
    const extname = path.extname(filepath);
    // Non-js files: return content buffer
    if (extname && !extensions[extname] && extname !== '.mjs') {
      return fs.promises.readFile(filepath);
    }

    // Dynamic import for ESM/CJS
    const obj = await import(filepath);
    if (!obj) return obj;
    // Handle ESM default export
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    const error = err as Error;
    error.message = `[ee-core] load file async: ${filepath}, error: ${error.message}`;
    throw error;
  }
}
