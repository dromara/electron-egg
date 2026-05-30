/**
 * @module controller/controller_loader
 * @description Controller loader. Scans all files under the electron/controller/ directory,
 * converts exported classes to method mapping objects, and registers exported functions directly.
 *
 * Loading modes:
 * - Bundle mode (registry): Reads pre-registered controller modules from globalThis.__EE_CONTROLLER_REGISTRY__
 * - Dev mode (globby): Scans the filesystem, using globby to match files
 *
 * Class controller processing flow:
 * 1. The class is wrapped by wrapClass(), which traverses all methods on the prototype chain
 * 2. Each method is converted to a middleware function by methodToMiddleware()
 * 3. Each middleware invocation creates a new controller instance, ensuring concurrency safety
 * 4. Method properties have pathName and fullPath attached for IPC channel routing
 *
 * Export structure example:
 * ```
 * controller/
 *   user.js          -> { controller: { user: { add: fn, delete: fn } } }
 *   admin/login.js   -> { controller: { admin: { login: { auth: fn } } } }
 * ```
 */
import debug from 'debug';
import path from 'path';
import { isClass, isFunction } from '../utils/type_check.js';
import { getElectronDir } from '../ps/index.js';
import { Timing } from '../core/utils/timing.js';
import { FileLoader, FULLPATH } from '../core/loader/file_loader.js';
import { isBytecodeClass, callFn } from '../core/utils/index.js';
import type { RegistryEntry } from '../types/index.js';

const debugLog = debug('ee-core:controller:controller_loader');

/**
 * ControllerLoader — Controller loader
 *
 * Responsible for loading all controller files under the electron/controller/ directory
 * and wrapping class methods into callable middleware functions.
 */
export class ControllerLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load controllers synchronously
   *
   * Uses registry first (bundle mode), otherwise falls back to globby file scanning (dev mode).
   *
   * @returns Controller method mapping object, structured as { controller: { module: { method: fn } } }
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
   * Load controllers asynchronously (ESM support)
   *
   * Uses dynamic import() instead of require(), supporting ESM format controller files.
   * Same flow as load(), but file loading and parsing are asynchronous operations.
   *
   * @returns Controller method mapping object
   */
  async loadAsync(): Promise<Record<string, unknown>> {
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
    const target = await new FileLoader(opt).loadAsync();
    debugLog('[loadAsync] controllers (%s): %o', registry ? 'registry' : 'globby', target);
    this.timing.end('Load Controller');
    return target;
  }
}

/**
 * Wrap a controller class, extracting all methods from the prototype chain
 *
 * Traverses the class prototype chain, mapping each method name to a middleware function.
 * Subclass methods are not overridden by parent class methods of the same name (hasOwnProperty guard).
 * Getters/setters and non-function properties are skipped.
 *
 * @param Controller - Controller class constructor
 * @returns Mapping of method names to middleware functions
 */
function wrapClass(Controller: new (...args: unknown[]) => unknown): Record<string, unknown> {
  let proto = (Controller as unknown as { prototype: Record<string, unknown> }).prototype;
  const ret: Record<string, unknown> = {};

  // Trace the prototype chain, collecting methods from all levels
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    for (const key of keys) {
      // Skip constructor
      if (key === 'constructor') continue;
      const d = Object.getOwnPropertyDescriptor(proto, key);
      // Skip getter/setter and non-function properties; methods already defined in subclass are not overridden by parent
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

/**
 * Convert a controller method to a middleware function
 *
 * Key design: a new controller instance is created on each invocation.
 * This is done to ensure concurrency safety — when multiple requests arrive simultaneously,
 * each request has its own controller instance, avoiding race conditions caused by shared state.
 *
 * @param Controller - Controller class constructor
 * @param key - Method name
 * @returns Middleware function that creates a new instance and executes the corresponding method on invocation
 */
function methodToMiddleware(Controller: new (...args: unknown[]) => unknown, key: string) {
  return function classControllerMiddleware(...args: unknown[]): unknown {
    const controller = new Controller();
    const fn = (controller as Record<string, (...args: unknown[]) => unknown>)[key];
    if (!fn) return undefined;
    return callFn(fn, args, controller);
  };
}
