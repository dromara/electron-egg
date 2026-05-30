/**
 * @module loader
 * @description File loading module. Provides multiple file loading and execution methods,
 * serving as the foundational dependency for controller loading, config loading, and task execution.
 *
 * Core functions:
 * - loadFile: Load a file, automatically execute if the export is a function
 * - requireFile: Load a file without auto-execution
 * - execFile: Load a file, instantiate if class, execute if function
 * - resolveModule: Resolve the absolute path of a module
 * - getFullpath: Get the absolute path of a file under the electron directory
 */
import { isFunction, isClass } from '../utils/type_check.js';
import fs from 'fs';
import path from 'path';
import { loadFile as coreLoadFile, isBytecodeClass } from '../core/utils/index.js';
import { getElectronDir } from '../ps/index.js';

/**
 * Load a file and automatically execute function exports
 *
 * If the file exports a plain function (not a class or bytecode class), automatically calls that function
 * and returns the execution result. Suitable for config files that need to dynamically return content based on appInfo.
 *
 * @param filepath - File path (relative paths are based on electronDir)
 * @param inject - Arguments passed to the function export (spread into the call)
 * @returns File export content or function execution result
 * @throws Throws an error if the file does not exist
 */
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
  // Plain function export: auto-execute, inject arguments (e.g. appInfo)
  if (isFunction(ret) && !isClass(ret) && !isBytecodeClass(ret)) {
    ret = (ret as (...args: unknown[]) => unknown)(...inject);
  }
  return ret;
}

/**
 * Load a file (without auto-execution)
 *
 * Returns the module export content directly, without any processing.
 * Suitable for scenarios where the original module reference is needed (e.g. child process task loading).
 *
 * @param filepath - Absolute file path
 * @returns Module export content
 */
export function requireFile(filepath: string): unknown {
  return coreLoadFile(filepath);
}

/**
 * Load and run a file
 *
 * Determines execution method based on export type:
 * - Class/bytecode class -> Instantiate with new, inject as constructor arguments
 * - Plain function -> Call directly, inject as function arguments
 * - Other -> Return as-is
 *
 * @param filepath - Absolute file path
 * @param inject - Arguments passed to the constructor or function (spread into the call)
 * @returns Instantiated class object or function execution result
 */
export function execFile(filepath: string, ...inject: unknown[]): unknown {
  let ret = coreLoadFile(filepath);
  if (isClass(ret) || isBytecodeClass(ret)) {
    ret = new (ret as new (...args: unknown[]) => unknown)(...inject);
  } else if (isFunction(ret)) {
    ret = (ret as (...args: unknown[]) => unknown)(...inject);
  }
  return ret;
}

/**
 * Resolve the absolute path of a module
 *
 * First tries require.resolve(), then falls back to suffix-based rules:
 * - .default / .prod -> Try .jsc (bytecode version)
 * - .js -> Try .jsc
 * - No suffix -> Try .js and .jsc
 *
 * @param filepath - Module path
 * @returns Absolute path of the module, or undefined if it cannot be resolved
 */
export function resolveModule(filepath: string): string | undefined {
  let fullpath: string | undefined;
  try {
    fullpath = require.resolve(filepath);
  } catch {
    // Special suffix handling: config filenames like config.default, config.prod
    if (filepath && (filepath.endsWith('.default') || filepath.endsWith('.prod'))) {
      fullpath = filepath + '.jsc';
    } else if (filepath && filepath.endsWith('.js')) {
      fullpath = filepath + 'c'; // .js → .jsc
    }

    // In packaged mode, require.resolve may fail; try checking if the file exists directly
    if (!fullpath || !fs.existsSync(fullpath)) {
      if (fs.existsSync(filepath + '.js')) {
        fullpath = filepath + '.js';
      } else if (fs.existsSync(filepath + '.jsc')) {
        fullpath = filepath + '.jsc';
      }
    }

    if (!fs.existsSync(filepath) && (!fullpath || !fs.existsSync(fullpath))) {
      console.warn(`[ee-core] [loader] resolveModule unknow filepath: ${JSON.stringify({ filepath, fullpath })}`);
      return undefined;
    }
  }

  return fullpath;
}

/**
 * Get the absolute path of a file under the electron directory
 *
 * Relative paths are resolved based on electronDir, and resolveModule is also attempted to find the actual file.
 *
 * @param filepath - File path (relative or absolute)
 * @returns Absolute path of the file
 * @throws Throws an error if the file does not exist
 */
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
