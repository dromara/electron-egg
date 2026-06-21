/**
 * @module core/loader/file_loader
 * @description Generic file loader. Scans files in a specified directory and organizes
 * exported content into nested objects based on directory structure, for use by
 * controllers, services, and other modules.
 *
 * Three loading methods:
 * - parse(): Synchronous file scanning + require(), suitable for CJS dev mode
 * - parseFromRegistry(): Load from pre-registered registry, suitable for bundle mode
 * - parseAsync(): Asynchronous file scanning + import(), suitable for ESM dev mode
 *
 * Directory structure to property mapping:
 * ```
 * controller/user.js       -> target.controller.user
 * controller/admin/login.js -> target.controller.admin.login
 * ```
 *
 * Property naming style is controlled by caseStyle:
 * - 'camel': camelCase (default) — user-info -> userInfo
 * - 'lower': all lowercase — User Info -> user info (used by controllers)
 */
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { isClass, isFunction, isPrimitive, isGeneratorFunction, isAsyncFunction } from '../../utils/type_check.js';
import { loadFile, loadFileAsync, isBytecodeClass } from '../utils/index.js';
import { getProperties } from '../../utils/wrap.js';
import type { FileLoaderOptions } from '../../types/index.js';

const debugLog = debug('ee-core:core:loader:file_loader');

/** Symbol marker: records the full path of a file */
export const FULLPATH = Symbol('LOADER_ITEM_FULLPATH');
/** Symbol marker: indicates the export has been processed by the loader */
export const EXPORTS = Symbol('LOADER_ITEM_EXPORTS');

/** Load item: file path, property path, exported content */
interface LoaderItem {
  fullpath: string;
  properties: string[];
  exports: unknown;
}

/** Default configuration */
const defaults = {
  /** Property naming style */
  caseStyle: 'camel' as const,
  /** Custom initializer: performs additional processing on exported content */
  initializer: null as ((obj: unknown, options: { pathName: string; path: string }) => unknown) | null,
  /** Whether to automatically invoke function-type exports */
  call: true,
  /** Injection arguments for function calls */
  inject: undefined,
  /** Target object (deprecated; now created internally by load()) */
  target: null as Record<string, unknown> | null,
  /** File match patterns (overrides default filePatterns) */
  match: undefined as string[] | undefined,
};

/** Script file extensions to scan */
const SCRIPT_EXTENSIONS = ['.js', '.ts', '.mts', '.cts', '.tsx', '.jsx', '.mjs', '.cjs'];

/**
 * Recursively scan directory for script files
 *
 * Replaces globbySync to avoid ESM-only dependency in CJS mode.
 * Returns relative file paths (e.g. 'user.js', 'admin/login.js').
 *
 * @param dir - Absolute directory path to scan
 * @param prefix - Current relative path prefix (used internally for recursion)
 * @returns Array of relative file paths
 */
function scanDirSync(dir: string, prefix = ''): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = prefix ? prefix + '/' + entry.name : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDirSync(fullPath, relPath));
    } else if (entry.isFile() && SCRIPT_EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(relPath);
    }
  }
  return results;
}

/**
 * Recursively scan directory for script files (async)
 *
 * @param dir - Absolute directory path to scan
 * @param prefix - Current relative path prefix (used internally for recursion)
 * @returns Array of relative file paths
 */
async function scanDirAsync(dir: string, prefix = ''): Promise<string[]> {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = prefix ? prefix + '/' + entry.name : entry.name;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await scanDirAsync(fullPath, relPath));
    } else if (entry.isFile() && SCRIPT_EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(relPath);
    }
  }
  return results;
}

/**
 * FileLoader — File loader
 *
 * Organizes exported content from files in a directory into nested property objects
 * based on directory structure. Supports synchronous/asynchronous loading and registry mode.
 */
export class FileLoader {
  options: FileLoaderOptions & typeof defaults;

  constructor(options: FileLoaderOptions) {
    if (!options.directory) {
      throw new Error('options.directory is required');
    }
    this.options = Object.assign({}, defaults, options);
    debugLog('[constructor] options: %o', this.options);
  }

  /**
   * Process a single export
   *
   * Execution flow:
   * 1. Run initializer (if present) for custom processing of the export
   * 2. Set pathName and fullPath properties on classes
   * 3. Class/generator function/async function/bytecode class -> return directly
   * 4. Plain function -> auto-invoke based on the call option
   *
   * @param exports - File exported content
   * @param fullpath - File full path
   * @param properties - Property path (array converted from directory + filename)
   * @param dirName - Directory name (used as property path prefix)
   * @returns LoaderItem or null (skipped when export is null/undefined)
   */
  private _processExport(
    exports: unknown,
    fullpath: string,
    properties: string[],
    dirName: string,
  ): LoaderItem | null {
    if (exports == null) return null;

    const pathName = dirName + '.' + properties.join('.');

    const initializer = this.options.initializer;
    if (initializer) {
      exports = initializer(exports, { pathName, path: fullpath });
    }

    // Set path info on classes for IPC routing and debugging
    if (isClass(exports) || isBytecodeClass(exports)) {
      (exports as { prototype: Record<string, unknown> }).prototype.pathName = pathName;
      (exports as { prototype: Record<string, unknown> }).prototype.fullPath = fullpath;
    }

    // Class/generator/async/bytecode class -> do not auto-invoke, return directly
    if (isClass(exports) || isGeneratorFunction(exports) || isAsyncFunction(exports) || isBytecodeClass(exports)) {
      return { fullpath, properties, exports };
    }

    // Plain function: auto-invoke based on the call option
    if (this.options.call && isFunction(exports)) {
      exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
      if (exports != null) {
        return { fullpath, properties, exports };
      }
    }

    return { fullpath, properties, exports };
  }

  /**
   * Assign load items to target object
   *
   * Creates nested objects level by level along the property path, ultimately mounting
   * the exported content at the leaf node. Also marks non-primitive exports with
   * FULLPATH and EXPORTS symbols.
   *
   * @param items - Load item list
   * @returns Nested property object
   */
  private _assignToTarget(items: LoaderItem[]): Record<string, unknown> {
    const target: Record<string, unknown> = {};
    for (const item of items) {
      let current: Record<string, unknown> = target;
      for (let i = 0; i < item.properties.length; i++) {
        const property = item.properties[i];
        if (!property) continue;
        const isLast = i === item.properties.length - 1;
        if (isLast) {
          current[property] = item.exports;
          // Mark full path and export identifier for non-primitive types
          if (item.exports && !isPrimitive(item.exports)) {
            (item.exports as Record<symbol, unknown>)[FULLPATH] = item.fullpath;
            (item.exports as Record<symbol, unknown>)[EXPORTS] = true;
          }
        } else {
          // Intermediate level: ensure object exists
          current[property] = current[property] || {};
          current = current[property] as Record<string, unknown>;
        }
      }
    }
    return target;
  }

  /**
   * Load files and build target object
   *
   * Loads from registry when available (bundle mode), otherwise scans filesystem (dev mode).
   *
   * @returns Nested property object organized by directory structure
   */
  load(): Record<string, unknown> {
    const items = this.options.registry ? this.parseFromRegistry() : this.parse();
    return this._assignToTarget(items);
  }

  /**
   * Parse files synchronously from filesystem
   *
   * Uses fs.readdirSync recursive scanning and require() to load files.
   *
   * @returns Load item list
   */
  parse(): LoaderItem[] {
    let directories: string[];
    if (Array.isArray(this.options.directory)) {
      directories = this.options.directory;
    } else {
      directories = [this.options.directory];
    }

    const items: LoaderItem[] = [];
    debugLog('[parse] directories %o', directories);

    for (const directory of directories) {
      const filepaths = scanDirSync(directory);
      debugLog('[parse] filepaths %o', filepaths);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);

        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        // Take the last level of the directory as the property prefix (e.g. 'controller')
        const dirName = directory.split(/[/\\]/).slice(-1)[0] || 'unknown';
        const exports = loadFile(fullpath);

        const item = this._processExport(exports, fullpath, properties, dirName);
        if (item) items.push(item);
      }
    }

    return items;
  }

  /**
   * Parse modules from pre-registered registry
   *
   * In bundle mode, the esbuild plugin pre-registers controller/configuration info
   * into global variables. This method reads the registry directly without filesystem scanning.
   *
   * @returns Load item list
   */
  parseFromRegistry(): LoaderItem[] {
    const registry = this.options.registry;
    if (!registry) return [];

    const items: LoaderItem[] = [];
    debugLog('[parseFromRegistry] entries %d', registry.length);

    for (const entry of registry) {
      let exports = entry.module;
      // ESM interop: handle modules with __esModule marker
      if (exports && (exports as Record<string, unknown>).__esModule) {
        exports = 'default' in (exports as Record<string, unknown>)
          ? (exports as Record<string, unknown>).default
          : exports;
      }

      const fullpath = entry.fullpath;
      const properties = entry.properties;
      // Extract the second-to-last directory name from registry entry path (e.g. 'controller')
      const dirName = fullpath.split(/[/\\]/).slice(-2, -1)[0] || 'controller';

      const item = this._processExport(exports, fullpath, properties, dirName);
      if (item) items.push(item);
    }

    return items;
  }

  /**
   * Load files asynchronously and build target object
   *
   * Uses fs.promises recursive scanning and import() dynamic loading.
   * Suitable for ESM dev mode.
   *
   * @returns Nested property object organized by directory structure
   */
  async loadAsync(): Promise<Record<string, unknown>> {
    const items = await this.parseAsync();
    return this._assignToTarget(items);
  }

  /**
   * Parse files asynchronously from filesystem
   *
   * Uses fs.promises recursive scanning and import() dynamic loading.
   * Suitable for ESM dev mode.
   *
   * @returns Load item list
   */
  async parseAsync(): Promise<LoaderItem[]> {
    let directories: string[];
    if (Array.isArray(this.options.directory)) {
      directories = this.options.directory;
    } else {
      directories = [this.options.directory];
    }

    const items: LoaderItem[] = [];
    debugLog('[parseAsync] directories %o', directories);

    for (const directory of directories) {
      const filepaths = await scanDirAsync(directory);
      debugLog('[parseAsync] filepaths %o', filepaths);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);

        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        const dirName = directory.split(/[/\\]/).slice(-1)[0] || 'unknown';
        const exports = await loadFileAsync(fullpath);

        const item = this._processExport(exports, fullpath, properties, dirName);
        if (item) items.push(item);
      }
    }

    return items;
  }
}
