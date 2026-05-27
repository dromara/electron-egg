import debug from 'debug';
import path from 'path';
import { isClass, isFunction } from '../utils/type_check.js';
import { getElectronDir } from '../ps/index.js';
import { Timing } from '../core/utils/timing.js';
import { FileLoader, FULLPATH } from '../core/loader/file_loader.js';
import { isBytecodeClass, callFn } from '../core/utils/index.js';
import type { RegistryEntry } from '../types/index.js';

const debugLog = debug('ee-core:controller:controller_loader');

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

    const registry = (globalThis as Record<string, unknown>).__EE_CONTROLLER_REGISTRY__ as RegistryEntry[] | undefined;
    const opt = {
      caseStyle: 'lower' as const,
      directory: path.join(getElectronDir(), 'controller'),
      ...(registry ? { registry } : {}),
      initializer: (obj: unknown, options: { pathName: string; path: string }) => {
        if (isClass(obj) || isBytecodeClass(obj)) {
          (obj as { prototype: Record<string, unknown> }).prototype.pathName = options.pathName;
          (obj as { prototype: Record<string, unknown> }).prototype.fullPath = options.path;
          return wrapClass(obj as new (...args: unknown[]) => unknown);
        }
        return obj;
      },
    };
    const target = new FileLoader(opt).load();
    debugLog('[load] controllers (%s): %o', registry ? 'registry' : 'globby', target);
    this.timing.end('Load Controller');
    return target;
  }

  /**
   * Async version of load() for ESM controller support.
   * Uses dynamic import() instead of require().
   */
  async loadAsync(): Promise<Record<string, unknown>> {
    this.timing.start('Load Controller');

    const opt = {
      caseStyle: 'lower' as const,
      directory: path.join(getElectronDir(), 'controller'),
      initializer: (obj: unknown, options: { pathName: string; path: string }) => {
        if (isClass(obj) || isBytecodeClass(obj)) {
          (obj as { prototype: Record<string, unknown> }).prototype.pathName = options.pathName;
          (obj as { prototype: Record<string, unknown> }).prototype.fullPath = options.path;
          return wrapClass(obj as new (...args: unknown[]) => unknown);
        }
        return obj;
      },
    };
    const target = await new FileLoader(opt).loadAsync();
    debugLog('[loadAsync] controllers: %o', target);
    this.timing.end('Load Controller');
    return target;
  }
}

// wrap the class, yield a object with middlewares
function wrapClass(Controller: new (...args: unknown[]) => unknown): Record<string, unknown> {
  let proto = (Controller as unknown as { prototype: Record<string, unknown> }).prototype;
  const ret: Record<string, unknown> = {};

  // tracing the prototype chain
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    // debugLog("[wrapClass] keys:", keys);
    for (const key of keys) {
      // getOwnPropertyNames will return constructor
      // that should be ignored
      if (key === 'constructor') continue;
      // skip getter, setter & non-function properties
      const d = Object.getOwnPropertyDescriptor(proto, key);
      // prevent to override sub method
      if (isFunction(d?.value) && !Object.prototype.hasOwnProperty.call(ret, key)) {
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
