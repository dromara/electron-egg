/**
 * @module controller/controller_loader
 * @description 控制器加载器。扫描 electron/controller/ 目录下的所有文件，
 * 将导出的类转为方法映射对象，将导出的函数直接注册。
 *
 * 加载模式：
 * - 打包模式（registry）：从 globalThis.__EE_CONTROLLER_REGISTRY__ 读取预注册的控制器模块
 * - 开发模式（globby）：扫描文件系统，使用 globby 匹配文件
 *
 * 类控制器处理流程：
 * 1. 类被 wrapClass() 包装，遍历原型链上的所有方法
 * 2. 每个方法被 methodToMiddleware() 转为中间件函数
 * 3. 每次调用中间件都会创建新的控制器实例，保证并发安全
 * 4. 方法属性挂载 pathName 和 fullPath，用于 IPC 通道路由
 *
 * 导出结构示例：
 * ```
 * controller/
 *   user.js          → { controller: { user: { add: fn, delete: fn } } }
 *   admin/login.js   → { controller: { admin: { login: { auth: fn } } } }
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
 * ControllerLoader 控制器加载器
 *
 * 负责加载 electron/controller/ 目录下的所有控制器文件，
 * 并将类方法包装为可调用的中间件函数。
 */
export class ControllerLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * 同步加载控制器
   *
   * 优先使用 registry（打包模式），否则使用 globby 文件扫描（开发模式）。
   *
   * @returns 控制器方法映射对象，结构为 { controller: { module: { method: fn } } }
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
   * 异步加载控制器（ESM 支持）
   *
   * 使用动态 import() 替代 require()，支持 ESM 格式的控制器文件。
   * 流程与 load() 相同，但文件加载和解析均为异步操作。
   *
   * @returns 控制器方法映射对象
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
 * 包装控制器类，提取原型链上的所有方法
 *
 * 遍历类的原型链，将每个方法名映射为中间件函数。
 * 子类方法不会被父类同名方法覆盖（hasOwnProperty 保护）。
 * getter/setter 和非函数属性会被跳过。
 *
 * @param Controller - 控制器类构造函数
 * @returns 方法名到中间件函数的映射对象
 */
function wrapClass(Controller: new (...args: unknown[]) => unknown): Record<string, unknown> {
  let proto = (Controller as unknown as { prototype: Record<string, unknown> }).prototype;
  const ret: Record<string, unknown> = {};

  // 追溯原型链，收集所有层级的方法
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    for (const key of keys) {
      // 跳过构造函数
      if (key === 'constructor') continue;
      const d = Object.getOwnPropertyDescriptor(proto, key);
      // 跳过 getter/setter 和非函数属性；子类已定义的方法不被父类覆盖
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
 * 将控制器方法转为中间件函数
 *
 * 关键设计：每次调用都创建新的控制器实例。
 * 这样做的原因是保证并发安全 — 多个请求同时到达时，
 * 每个请求拥有独立的控制器实例，避免状态共享导致的竞态问题。
 *
 * @param Controller - 控制器类构造函数
 * @param key - 方法名
 * @returns 中间件函数，调用时创建新实例并执行对应方法
 */
function methodToMiddleware(Controller: new (...args: unknown[]) => unknown, key: string) {
  return function classControllerMiddleware(...args: unknown[]): unknown {
    const controller = new Controller();
    const fn = (controller as Record<string, (...args: unknown[]) => unknown>)[key];
    if (!fn) return undefined;
    return callFn(fn, args, controller);
  };
}
