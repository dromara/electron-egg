import 'bytenode';
import is from 'is-type-of';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const requireMod = createRequire(import.meta.url);
const Module = requireMod('module');
const extensions: NodeJS.RequireExtensions = Module._extensions;

export function loadFile(filepath: string): unknown {
  try {
    const extname = path.extname(filepath);
    if (extname && !extensions[extname]) {
      return fs.readFileSync(filepath);
    }

    const obj = requireMod(filepath);
    if (!obj) return obj;
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
  if (!is.function_(fn)) return undefined;
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

export function getResolvedFilename(filepath: string, baseDir: string): string {
  const reg = /[/\\]/g;
  return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
}

export function isBytecodeClass(exports: unknown): boolean {
  if (!exports) return false;
  return String(exports).indexOf('[class') !== -1;
}

export function filePatterns(): string[] {
  return ['**/*.js', '**/*.jsc'];
}

export { extensions };
