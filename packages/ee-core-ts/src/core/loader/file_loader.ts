import debug from 'debug';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import is from 'is-type-of';
import { isBytecodeClass, loadFile, filePatterns } from '../utils/index.js';
import { getProperties } from '../../utils/wrap.js';
import type { FileLoaderOptions } from '../../types/index.js';

const log = debug('ee-core:core:loader:file_loader');

export const FULLPATH = Symbol('LOADER_ITEM_FULLPATH');
export const EXPORTS = Symbol('LOADER_ITEM_EXPORTS');

interface LoaderItem {
  fullpath: string;
  properties: string[];
  exports: unknown;
}

const defaults: Required<Pick<FileLoaderOptions, 'caseStyle' | 'call' | 'inject'>> & {
  target: Record<string, unknown> | null;
  match: string[] | undefined;
} = {
  caseStyle: 'camel',
  call: true,
  inject: undefined,
  target: null,
  match: undefined,
};

export class FileLoader {
  options: FileLoaderOptions & typeof defaults;

  constructor(options: FileLoaderOptions) {
    if (!options.directory) {
      throw new Error('options.directory is required');
    }
    this.options = Object.assign({}, defaults, options);
    log('[constructor] options: %o', this.options);
  }

  load(): Record<string, unknown> {
    const items = this.parse();
    const target: Record<string, unknown> = {};
    for (const item of items) {
      let current: Record<string, unknown> = target;
      for (let i = 0; i < item.properties.length; i++) {
        const property = item.properties[i];
        const isLast = i === item.properties.length - 1;
        if (isLast) {
          current[property] = item.exports;
          if (item.exports && !is.primitive(item.exports)) {
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

  parse(): LoaderItem[] {
    let files = this.options.match;
    if (!files) {
      files = filePatterns();
    } else {
      files = Array.isArray(files) ? files : [files];
    }

    let directories = this.options.directory;
    if (!Array.isArray(directories)) {
      directories = [directories];
    }

    const items: LoaderItem[] = [];
    log('[parse] directories %o', directories);

    for (const directory of directories) {
      const filepaths = globby.sync(files, { cwd: directory });
      log('[parse] filepaths %o', filepaths);
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        if (!fs.statSync(fullpath).isFile()) continue;
        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        const dirName = directory.split(/[/\\]/).slice(-1)[0];
        const pathName = dirName + '.' + properties.join('.');

        let exports = loadFile(fullpath);
        if (exports == null) continue;

        const initializer = this.options.initializer;
        if (initializer) {
          exports = initializer(exports, { pathName, path: fullpath });
        }

        if (is.function_(exports) && !is.class_(exports) && this.options.call) {
          exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
        }

        items.push({ fullpath, properties, exports });
      }
    }

    return items;
  }
}
