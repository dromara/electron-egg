import debug from 'debug';
import path from 'path';
import is from 'is-type-of';
import { getElectronDir } from '../ps/index.js';
import { Timing } from '../core/utils/timing.js';
import { FileLoader, FULLPATH } from '../core/loader/file_loader.js';
import { isBytecodeClass, callFn } from '../core/utils/index.js';

const log = debug('ee-core:controller:controller_loader');

export class ControllerLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load controller/xxx.js
   */
  load(): Record<string, unknown> {
    this.timing.start('Load Controller');

    const opt = {
      caseStyle: 'lower' as const,
      directory: path.join(getElectronDir(), 'controller'),
      initializer: (obj: unknown, options: { pathName: string; path: string }) => {
        if (is.class_(obj) || isBytecodeClass(obj)) {
          (obj as { prototype: Record<string, unknown> }).prototype.pathName = options.pathName;
          (obj as { prototype: Record<string, unknown> }).prototype.fullPath = options.path;
          return wrapClass(obj as new (...args: unknown[]) => unknown);
        }
        return obj;
      },
    };
    const target = new FileLoader(opt).load();
    log('[load] controllers: %o', target);
    this.timing.end('Load Controller');
    return target;
  }
}

function wrapClass(Controller: new (...args: unknown[]) => unknown): Record<string, unknown> {
  let proto = (Controller as unknown as { prototype: Record<string, unknown> }).prototype;
  const ret: Record<string, unknown> = {};

  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    for (const key of keys) {
      if (key === 'constructor') continue;

      const d = Object.getOwnPropertyDescriptor(proto, key);
      if (is.function_(d?.value) && !Object.prototype.hasOwnProperty.call(ret, key)) {
        ret[key] = methodToMiddleware(Controller, key);
        (ret[key] as Record<symbol, string>)[FULLPATH] =
          (proto as Record<string, string>).fullPath + '#' + (Controller as unknown as { name: string }).name + '.' + key + '()';
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return ret;
}

function methodToMiddleware(Controller: new (...args: unknown[]) => unknown, key: string) {
  return function classControllerMiddleware(...args: unknown[]): unknown {
    const controller = new Controller();
    const fn = (controller as Record<string, (...args: unknown[]) => unknown>)[key];
    if (!fn) return undefined;
    return callFn(fn, args, controller);
  };
}
