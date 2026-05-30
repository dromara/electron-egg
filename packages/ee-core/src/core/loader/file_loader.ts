/**
 * @module core/loader/file_loader
 * @description 通用文件加载器。扫描指定目录下的文件，将导出内容按目录结构
 * 组织为嵌套对象，供控制器、服务等模块使用。
 *
 * 三种加载方式：
 * - parse()：同步文件扫描 + require()，适用于 CJS 开发模式
 * - parseFromRegistry()：从预注册表加载，适用于打包模式
 * - parseAsync()：异步文件扫描 + import()，适用于 ESM 开发模式
 *
 * 目录结构到属性映射：
 * ```
 * controller/user.js       → target.controller.user
 * controller/admin/login.js → target.controller.admin.login
 * ```
 *
 * 属性命名风格由 caseStyle 控制：
 * - 'camel'：驼峰式（默认）— user-info → userInfo
 * - 'lower'：全小写 — User Info → user info（控制器使用）
 */
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import { isClass, isFunction, isPrimitive, isGeneratorFunction, isAsyncFunction } from '../../utils/type_check.js';
import { loadFile, loadFileAsync, filePatterns, isBytecodeClass } from '../utils/index.js';
import { getProperties } from '../../utils/wrap.js';
import type { FileLoaderOptions } from '../../types/index.js';

const debugLog = debug('ee-core:core:loader:file_loader');

/** Symbol 标记：记录文件的完整路径 */
export const FULLPATH = Symbol('LOADER_ITEM_FULLPATH');
/** Symbol 标记：标记该导出已被加载器处理 */
export const EXPORTS = Symbol('LOADER_ITEM_EXPORTS');

/** 加载项：文件路径、属性路径、导出内容 */
interface LoaderItem {
  fullpath: string;
  properties: string[];
  exports: unknown;
}

/** 默认配置 */
const defaults = {
  /** 属性命名风格 */
  caseStyle: 'camel' as const,
  /** 自定义初始化器：对导出内容进行额外处理 */
  initializer: null as ((obj: unknown, options: { pathName: string; path: string }) => unknown) | null,
  /** 函数类型导出是否自动调用 */
  call: true,
  /** 函数调用时的注入参数 */
  inject: undefined,
  /** 目标对象（已弃用，现在由 load() 内部创建） */
  target: null as Record<string, unknown> | null,
  /** 文件匹配模式（覆盖默认的 filePatterns） */
  match: undefined as string[] | undefined,
};

/**
 * FileLoader 文件加载器
 *
 * 将目录下的文件导出内容按目录结构组织为嵌套属性对象。
 * 支持同步/异步加载和注册表模式。
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
   * 处理单个导出内容
   *
   * 执行流程：
   * 1. 运行 initializer（如存在）对导出进行自定义处理
   * 2. 为类设置 pathName 和 fullPath 属性
   * 3. 类/生成器函数/异步函数/字节码类 → 直接返回
   * 4. 普通函数 → 根据 call 选项决定是否自动调用
   *
   * @param exports - 文件导出内容
   * @param fullpath - 文件完整路径
   * @param properties - 属性路径（目录+文件名转换后的数组）
   * @param dirName - 目录名（用作属性路径前缀）
   * @returns LoaderItem 或 null（导出为 null/undefined 时跳过）
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

    // 为类设置路径信息，供 IPC 路由和调试使用
    if (isClass(exports) || isBytecodeClass(exports)) {
      (exports as { prototype: Record<string, unknown> }).prototype.pathName = pathName;
      (exports as { prototype: Record<string, unknown> }).prototype.fullPath = fullpath;
    }

    // 类/生成器/异步/字节码类 → 不自动调用，直接返回
    if (isClass(exports) || isGeneratorFunction(exports) || isAsyncFunction(exports) || isBytecodeClass(exports)) {
      return { fullpath, properties, exports };
    }

    // 普通函数：根据 call 选项决定是否执行
    if (this.options.call && isFunction(exports)) {
      exports = (exports as (...args: unknown[]) => unknown)(this.options.inject);
      if (exports != null) {
        return { fullpath, properties, exports };
      }
    }

    return { fullpath, properties, exports };
  }

  /**
   * 将加载项分配到目标对象
   *
   * 按属性路径逐级创建嵌套对象，最终将导出内容挂载到叶子节点。
   * 同时为非原始类型的导出标记 FULLPATH 和 EXPORTS symbol。
   *
   * @param items - 加载项列表
   * @returns 嵌套属性对象
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
          // 标记非原始类型的完整路径和导出标识
          if (item.exports && !isPrimitive(item.exports)) {
            (item.exports as Record<symbol, unknown>)[FULLPATH] = item.fullpath;
            (item.exports as Record<symbol, unknown>)[EXPORTS] = true;
          }
        } else {
          // 中间层级：确保对象存在
          current[property] = current[property] || {};
          current = current[property] as Record<string, unknown>;
        }
      }
    }
    return target;
  }

  /**
   * 加载文件并构建目标对象
   *
   * 有注册表时从注册表加载（打包模式），否则从文件系统扫描（开发模式）。
   *
   * @returns 按目录结构组织的嵌套属性对象
   */
  load(): Record<string, unknown> {
    const items = this.options.registry ? this.parseFromRegistry() : this.parse();
    return this._assignToTarget(items);
  }

  /**
   * 从文件系统同步解析文件
   *
   * 使用 globby 扫描目录，require() 加载文件。
   * 适用于 CJS 开发模式。
   *
   * @returns 加载项列表
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

        const properties = getProperties(filepath, { caseStyle: this.options.caseStyle! });
        // 取目录最后一级作为属性前缀（如 'controller'）
        const dirName = directory.split(/[/\\]/).slice(-1)[0] || 'unknown';
        const exports = loadFile(fullpath);

        const item = this._processExport(exports, fullpath, properties, dirName);
        if (item) items.push(item);
      }
    }

    return items;
  }

  /**
   * 从预注册表解析模块
   *
   * 打包模式下，esbuild 插件将控制器/配置信息预注册到全局变量，
   * 此方法直接读取注册表，无需文件系统扫描。
   *
   * @returns 加载项列表
   */
  parseFromRegistry(): LoaderItem[] {
    const registry = this.options.registry;
    if (!registry) return [];

    const items: LoaderItem[] = [];
    debugLog('[parseFromRegistry] entries %d', registry.length);

    for (const entry of registry) {
      let exports = entry.module;
      // ESM 互操作：处理 __esModule 标记的模块
      if (exports && (exports as Record<string, unknown>).__esModule) {
        exports = 'default' in (exports as Record<string, unknown>)
          ? (exports as Record<string, unknown>).default
          : exports;
      }

      const fullpath = entry.fullpath;
      const properties = entry.properties;
      // 注册表条目路径中取倒数第二级目录名（如 'controller'）
      const dirName = fullpath.split(/[/\\]/).slice(-2, -1)[0] || 'controller';

      const item = this._processExport(exports, fullpath, properties, dirName);
      if (item) items.push(item);
    }

    return items;
  }

  /**
   * 异步加载文件并构建目标对象
   *
   * 使用 globby 异步扫描和 import() 动态加载。
   * 适用于 ESM 开发模式。
   *
   * @returns 按目录结构组织的嵌套属性对象
   */
  async loadAsync(): Promise<Record<string, unknown>> {
    const items = await this.parseAsync();
    return this._assignToTarget(items);
  }

  /**
   * 从文件系统异步解析文件
   *
   * 使用 globby 异步扫描和 fs.promises.stat 异步检查文件。
   * 适用于 ESM 开发模式。
   *
   * @returns 加载项列表
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
