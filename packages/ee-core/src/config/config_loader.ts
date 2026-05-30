/**
 * @module config/config_loader
 * @description 配置加载器。负责加载和合并框架默认配置与业务自定义配置。
 *
 * 配置加载流程：
 * 1. 加载框架内置默认配置（defaultConfig）
 * 2. 加载业务配置：先加载 config.default（全量默认），再加载 config.{env}（环境特定）
 * 3. 深度合并：业务配置覆盖默认配置
 *
 * 支持两种加载模式：
 * - 打包模式：从 globalThis.__EE_CONFIG_REGISTRY__ 读取预注册的配置模块
 * - 开发模式：从文件系统按路径加载配置文件
 *
 * 配置文件支持函数导出，函数会接收 appInfo 参数，可根据环境动态返回配置。
 */
import debug from 'debug';
import path from 'path';
import { appName, env, getElectronDir, getBaseDir, getRootDir } from '../ps/index.js';
import { extend } from '../utils/extend.js';
import { loadFile } from '../loader/index.js';
import { isFunction } from '../utils/type_check.js';
import { Timing } from '../core/utils/timing.js';
import defaultConfig from './default_config.js';
import type { AppInfo, Config } from '../types/index.js';

const debugLog = debug('ee-core:config:config_loader');

/** 打包模式下配置注册表条目的结构 */
interface ConfigRegistryEntry {
  /** 配置文件名（不含扩展名），如 'config.default'、'config.prod' */
  filename: string;
  /** 配置模块，可以是对象或函数（函数接收 appInfo 参数） */
  module: unknown;
}

declare global {
  var __EE_CONFIG_REGISTRY__: ConfigRegistryEntry[] | undefined;
}

/**
 * ConfigLoader 配置加载器
 *
 * 将默认配置与业务配置深度合并，生成最终运行时配置。
 * 加载顺序：defaultConfig（框架内置） → config.default（业务默认） → config.{env}（环境特定）
 * 后加载的配置覆盖先加载的同名属性。
 */
export class ConfigLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * 加载并合并配置
   *
   * @returns 合并后的完整运行时配置
   */
  load(): Config {
    this.timing.start('Load Config');

    // 加载业务自定义配置（config.default + config.{env}）
    const appConfig = this._AppConfig();
    // 加载框架默认配置
    const defaultConf = defaultConfig();
    // 深度合并：业务配置覆盖默认配置
    const config = extend(true, defaultConf as Record<string, unknown>, appConfig) as Config;
    debugLog('[load] config: %o', config);

    this.timing.end('Load Config');
    return config;
  }

  /**
   * 加载业务自定义配置
   *
   * 按顺序加载 config.default 和 config.{env}，后者覆盖前者。
   * 开发环境加载 config.local，生产环境加载 config.prod。
   *
   * @returns 合并后的业务配置
   */
  private _AppConfig(): Record<string, unknown> {
    const names = ['config.default', `config.${env()}`];
    const target: Record<string, unknown> = {};
    for (const filename of names) {
      const config = this._loadConfig(getElectronDir(), filename);
      if (config) {
        extend(true, target, config);
      }
    }
    return target;
  }

  /**
   * 加载单个配置文件
   *
   * 支持两种模式：
   * - 打包模式：从 __EE_CONFIG_REGISTRY__ 查找对应文件名的配置模块
   * - 开发模式：从文件系统 loadFile() 加载
   *
   * 配置文件可导出函数，函数接收 appInfo 参数用于动态配置。
   *
   * @param dirpath - 配置文件所在目录（electron 目录）
   * @param filename - 配置文件名（不含扩展名）
   * @returns 配置对象，加载失败返回 null
   */
  private _loadConfig(dirpath: string, filename: string): Record<string, unknown> | null {
    // 构建 appInfo 供配置函数使用
    const appInfo: AppInfo = {
      name: appName(),
      baseDir: getBaseDir(),
      electronDir: getElectronDir(),
      env: env(),
      root: getRootDir(),
    };

    if (globalThis.__EE_CONFIG_REGISTRY__) {
      // 打包模式：从注册表查找配置模块
      const entry = globalThis.__EE_CONFIG_REGISTRY__.find((e) => e.filename === filename);
      if (!entry) return null;
      const mod = entry.module;
      debugLog('[_loadConfig] bundled filename: %s', filename);
      // 配置文件可导出函数，接收 appInfo 动态生成配置
      if (isFunction(mod)) {
        return (mod as (...args: unknown[]) => Record<string, unknown>)(appInfo);
      }
      return mod as Record<string, unknown>;
    }

    // 开发模式：从文件系统加载
    const filepath = path.join(dirpath, 'config', filename);
    const config = loadFile(filepath, appInfo);
    debugLog('[_loadConfig] filepath: %s', filepath);
    if (!config) return null;

    return config as Record<string, unknown>;
  }
}
