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

  /**
   * @class
   * @param {Object} options - options
   * @param {String|Array} options.directory - directories to be loaded
   * @param {Object} options.target - attach the target object from loaded files
   * @param {String} options.match - match the files when load, support glob, default to all js files
   * @param {Function} options.initializer - custom file exports, receive two parameters, first is the inject object(if not js file, will be content buffer), second is an `options` object that contain `path`
   * @param {Boolean} options.call - determine whether invoke when exports is function
   * @param {Object} options.inject - an object that be the argument when invoke the function
   * @param {String|Function} options.caseStyle - set property's case when converting a filepath to property list.
   */
  constructor(options: FileLoaderOptions) {
    if (!options.directory) {
      throw new Error('options.directory is required');
    }
    this.options = Object.assign({}, defaults, options);
    debugLog('[constructor] options: %o', this.options);
  }

  /**
   * attach items to target object. Mapping the directory to properties.
   * `xxx/group/repository.js` => `target.group.repository`
   * @return {Object} target
   */
  load(): Record<string, unknown> {
    const items = this.options.registry ? this.parseFromRegistry() : this.parse();
    const target: Record<string, unknown> = {};
    for (const item of items) {
      // item { fullpath, properties: [ 'a', 'b', 'c'], exports }
      let current: Record<string, unknown> = target;
      for (let i = 0; i < item.properties.length; i++) {
        const property = item.properties[i];
        if (!property) continue;
        // properties is a path slice, only the last value is the file name
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

  /**
   * Parse files from given directories, then return an items list, each item contains properties and exports.
   * For example, parse `controller/group/repository.js`
   * It returns a item
   * ```
   * {
   *   fullpath: '',
   *   properties: [ 'group', 'repository' ],
   *   exports: { ... },
   * }
   * ```
   * `Properties` is an array that contains the directory of a filepath.
   * `Exports` depends on type, if exports is a function, it will be called. if initializer is specified, it will be called with exports for customizing.
   * @return {Array} items
   */
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
        // get properties
        // controller/foo/bar.js => [ 'foo', 'bar' ]
        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        // debugLog('[parse] properties %o', properties);
        // controller/foo/bar.js => controller.foo.bar
        const dirName = directory.split(/[/\\]/).slice(-1)[0];
        const pathName = dirName + '.' + properties.join('.');
        // debugLog('[parse] pathName %s', pathName);
        // get exports from the file
        let exports = loadFile(fullpath);
        // ignore exports when it's null or false returned by filter function
        if (exports == null) continue;

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
          items.push({ fullpath, properties, exports });
          continue;
        }

        // whether to execute the function
        if (this.options.call && isFunction(exports)) {
          exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
          if (exports != null) {
            items.push({ fullpath, properties, exports });
            continue;
          }
        }

        items.push({ fullpath, properties, exports });
      }
    }

    return items;
  }

  /**
   * Parse from pre-built registry (bundle mode).
   * Replaces globby+require discovery with registry entries generated at build time.
   * The initializer (wrapClass) still runs at runtime because closures cannot be serialized.
   */
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
      if (exports == null) continue;

      const fullpath = entry.fullpath;
      const properties = entry.properties;
      const dirName = fullpath.split(/[/\\]/).slice(-2, -1)[0] || 'controller';
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
        items.push({ fullpath, properties, exports });
        continue;
      }

      // whether to execute the function
      if (this.options.call && isFunction(exports)) {
        exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
        if (exports != null) {
          items.push({ fullpath, properties, exports });
          continue;
        }
      }

      items.push({ fullpath, properties, exports });
    }

    return items;
  }

  /**
   * Async version of load() for ESM controller support.
   * Uses globby (async) + loadFileAsync (dynamic import) instead of sync counterparts.
   */
  async loadAsync(): Promise<Record<string, unknown>> {
    const items = await this.parseAsync();
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

  /**
   * Async version of parse() for ESM controller support.
   */
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
        const stat = fs.statSync(fullpath);
        if (!stat.isFile()) continue;

        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        const dirName = directory.split(/[/\\]/).slice(-1)[0];
        const pathName = dirName + '.' + properties.join('.');

        let exports = await loadFileAsync(fullpath);
        if (exports == null) continue;

        const initializer = this.options.initializer;
        if (initializer) {
          exports = initializer(exports, { pathName, path: fullpath });
        }

        if (isClass(exports) || isBytecodeClass(exports)) {
          (exports as { prototype: Record<string, unknown> }).prototype.pathName = pathName;
          (exports as { prototype: Record<string, unknown> }).prototype.fullPath = fullpath;
        }

        if (isClass(exports) || isGeneratorFunction(exports) || isAsyncFunction(exports) || isBytecodeClass(exports)) {
          items.push({ fullpath, properties, exports });
          continue;
        }

        if (this.options.call && isFunction(exports)) {
          exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
          if (exports != null) {
            items.push({ fullpath, properties, exports });
            continue;
          }
        }

        items.push({ fullpath, properties, exports });
      }
    }

    return items;
  }
}
