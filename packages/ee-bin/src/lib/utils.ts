/**
 * Core Utility Functions — config loading, file I/O, path handling
 *
 * This module is the heart of the ee-bin configuration system. It implements the
 * full configuration loading pipeline:
 *   loadConfig(binFile) → loads user ./cmd/bin.js
 *     → loadFile(binFile) → parses .js/.json/.json5 config files
 *     → extend(true, defaultConfig, userConfig) → deep merges with default config
 *
 * Also provides basic I/O utilities: JSON file read/write, directory deletion,
 * and array normalization.
 */

import { createDebug } from './helpers.js';
import path from 'path';
import fs from 'fs';
import { chalk } from './helpers.js';
import { is } from './helpers.js';
import JsonLib from 'json5';
import defaultConfig from '../config/bin_default.js';
import { extend } from './extend.js';
import type { BinConfig } from '../types/config.js';

const log = createDebug('ee-bin:lib:utils');
const _basePath = process.cwd();
const userBin = './cmd/bin.js';

/**
 * Load and merge ee-bin configuration
 *
 * Two-phase merge strategy:
 *   1. Load user config from ./cmd/bin.js (supports .js/.json/.json5 formats)
 *   2. Deep merge user config on top of default config (user values override defaults)
 *
 * @param binFile - Custom config file path (defaults to './cmd/bin.js')
 * @returns Fully merged BinConfig
 */
export function loadConfig(binFile?: string): BinConfig {
  const binPath = binFile || userBin;
  const userConfig = loadFile(binPath);
  const result = extend(true, { ...defaultConfig } as Record<string, unknown>, userConfig) as unknown as BinConfig;
  log('[loadConfig] bin:%j', result);

  return result;
}

/**
 * Load a configuration file — supports .json5/.json/.js/.cjs formats
 *
 * Format-specific handling:
 *   - .json5/.json: Read text content and parse with the json5 parser
 *     (JSON5 supports comments, trailing commas, and other extended syntax)
 *   - .js/.cjs: Load the module via require() and extract the export value
 *     - If the export is a plain function (not a class), treat it as a config
 *       factory function and call it to obtain the config object
 *     - If the export is a class, use the class directly as config (do not call it)
 *     - If the export is an ESModule (has a default property), extract the .default value
 *
 * @param filepath - Config file path (relative to project root)
 * @returns Config object (Record<string, unknown>)
 * @throws Error with path hint if the file does not exist
 */
export function loadFile(filepath: string): Record<string, unknown> {
  const configFile = path.join(_basePath, filepath);
  if (!fs.existsSync(configFile)) {
    const errorTips = 'file ' + chalk.blue(`${configFile}`) + ' does not exist !';
    throw new Error(errorTips);
  }

  let result: unknown;
  if (configFile.endsWith('.json5') || configFile.endsWith('.json')) {
    const data = fs.readFileSync(configFile, 'utf8');
    return JsonLib.parse(data) as Record<string, unknown>;
  }
  if (configFile.endsWith('.js') || configFile.endsWith('.cjs')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- dynamic user config loading
    const mod = require(configFile);
    // Handle ESM default export: require() on an ESM module returns { default: ... }
    result = mod.default != null ? mod.default : mod;
  }
  // Config factory pattern: if the export is a plain function (not a class),
  // call it to obtain the config object. Classes are used directly because
  // a class export is itself the config class, not a factory function.
  if (is.function(result) && !is.class(result)) {
    result = (result as () => unknown)();
  }
  return (result as Record<string, unknown>) || {};
}

/** Recursively force-delete a directory or file (similar to rm -rf) */
export function rm(name: string): void {
  if (!fs.existsSync(name)) {
    return;
  }
  fs.rmSync(name, { recursive: true, force: true });
}

/**
 * Synchronously read a JSON file and parse it into an object
 * @throws Error if the file does not exist
 */
export function readJsonSync(filepath: string, encoding: BufferEncoding = 'utf8'): Record<string, unknown> {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath, { encoding }));
}

/**
 * Synchronously write a JSON file with auto-created directories and formatted output
 *
 * @param filepath - Target file path
 * @param str - Data to write (objects are auto JSON.stringify'd; other types are converted to string)
 * @param options - Optional parameters: space controls indentation (default 2), replacer controls serialization filtering
 */
export function writeJsonSync(filepath: string, str: unknown, options?: { space?: number; replacer?: (key: string, value: unknown) => unknown }): void {
  const opt = options || {};
  if (!('space' in opt)) {
    opt.space = 2;
  }

  // Auto-create target directory (prevents write failure from missing directory)
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  let data: string;
  if (typeof str === 'object') {
    data = JSON.stringify(str, opt.replacer, opt.space) + '\n';
  } else {
    data = String(str);
  }

  fs.writeFileSync(filepath, data);
}

/**
 * Normalize string | string[] | undefined to string[]
 * Used to handle the "args" config field which accepts different input formats
 */
export function toArray(value?: string[] | string): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value;
  return [];
}
