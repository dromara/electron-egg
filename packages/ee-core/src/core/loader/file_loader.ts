import debug from 'debug';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import { isClass, isFunction, isPrimitive, isGeneratorFunction, isAsyncFunction } from '../../utils/type_check.js';
import { loadFile, loadFileAsync, filePatterns, isBytecodeClass } from '../utils/index.js';
import { getProperties } from '../../utils/wrap.js';
import type { FileLoaderOptions } from '../../types/index.js';

const debugLog = debug('ee-core:core:loader:file_loader');

export const FULLPATH = Symbol('LOADER_ITEM_FULLPATH');
export const EXPORTS = Symbol('LOADER_ITEM_EXPORTS');

interface LoaderItem {
  fullpath: string;
  properties: string[];
  exports: unknown;
}

const defaults = {
  caseStyle: 'camel' as const,
  initializer: null as ((obj: unknown, options: { pathName: string; path: string }) => unknown) | null,
  call: true,
  inject: undefined,
  target: null as Record<string, unknown> | null,
  match: undefined as string[] | undefined,
};

/**
 * Load files from directory to target object.
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
   * Process a single export: run initializer, set class properties,
   * call function if needed, and return the final LoaderItem (or null to skip).
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

    // set properties of class
    if (isClass(exports) || isBytecodeClass(exports)) {
      (exports as { prototype: Record<string, unknown> }).prototype.pathName = pathName;
      (exports as { prototype: Record<string, unknown> }).prototype.fullPath = fullpath;
    }

    // class / generator / async / bytecodeClass → return directly
    if (isClass(exports) || isGeneratorFunction(exports) || isAsyncFunction(exports) || isBytecodeClass(exports)) {
      return { fullpath, properties, exports };
    }

    // whether to execute the function
    if (this.options.call && isFunction(exports)) {
      exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
      if (exports != null) {
        return { fullpath, properties, exports };
      }
    }

    return { fullpath, properties, exports };
  }

  /**
   * Assign items to a target object, mapping directory structure to properties.
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
          if (item.exports && !isPrimitive(item.exports)) {
            (item.exports as Record<symbol, unknown>)[FULLPATH] = item.fullpath;
            (item.exports as Record<symbol, unknown>)[EXPORTS] = true;
          }
        } else {
          current[property] = current[property] || {};
          current = current[property] as Record<string, unknown>;
        }
      }
    }
    return target;
  }

  load(): Record<string, unknown> {
    const items = this.options.registry ? this.parseFromRegistry() : this.parse();
    return this._assignToTarget(items);
  }

  parse(): LoaderItem[] {
    let files: string[] = (this.options.match || filePatterns()) as string[];
    if (!Array.isArray(files)) {
      files = [files];
    }

    let directories: string[];
    if (Array.isArray(this.options.directory)) {
      directories = this.options.directory;
    } else {
      directories = [this.options.directory];
    }

    const items: LoaderItem[] = [];
    debugLog('[parse] directories %o', directories);

    for (const directory of directories) {
      const filepaths = globby.sync(files, { cwd: directory });
      debugLog('[parse] filepaths %o', filepaths);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        if (!fs.statSync(fullpath).isFile()) continue;

        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        const dirName = directory.split(/[/\\]/).slice(-1)[0] || 'unknown';
        const exports = loadFile(fullpath);

        const item = this._processExport(exports, fullpath, properties, dirName);
        if (item) items.push(item);
      }
    }

    return items;
  }

  parseFromRegistry(): LoaderItem[] {
    const registry = this.options.registry;
    if (!registry) return [];

    const items: LoaderItem[] = [];
    debugLog('[parseFromRegistry] entries %d', registry.length);

    for (const entry of registry) {
      let exports = entry.module;
      // ESM interop
      if (exports && (exports as Record<string, unknown>).__esModule) {
        exports = 'default' in (exports as Record<string, unknown>)
          ? (exports as Record<string, unknown>).default
          : exports;
      }

      const fullpath = entry.fullpath;
      const properties = entry.properties;
      const dirName = fullpath.split(/[/\\]/).slice(-2, -1)[0] || 'controller';

      const item = this._processExport(exports, fullpath, properties, dirName);
      if (item) items.push(item);
    }

    return items;
  }

  async loadAsync(): Promise<Record<string, unknown>> {
    const items = await this.parseAsync();
    return this._assignToTarget(items);
  }

  async parseAsync(): Promise<LoaderItem[]> {
    let files: string[] = (this.options.match || filePatterns()) as string[];
    if (!Array.isArray(files)) {
      files = [files];
    }

    let directories: string[];
    if (Array.isArray(this.options.directory)) {
      directories = this.options.directory;
    } else {
      directories = [this.options.directory];
    }

    const items: LoaderItem[] = [];
    debugLog('[parseAsync] directories %o', directories);

    for (const directory of directories) {
      const filepaths = await globby(files, { cwd: directory });
      debugLog('[parseAsync] filepaths %o', filepaths);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        const stat = await fs.promises.stat(fullpath);
        if (!stat.isFile()) continue;

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
