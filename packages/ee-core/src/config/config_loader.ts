/**
 * @module config/config_loader
 * @description Configuration loader. Responsible for loading and merging framework default configuration
 * with business custom configuration.
 *
 * Configuration loading flow:
 * 1. Load framework built-in default configuration (defaultConfig)
 * 2. Load business configuration: first load config.default (full defaults), then load config.{env} (environment-specific)
 * 3. Deep merge: business configuration overrides default configuration
 *
 * Supports two loading modes:
 * - Bundle mode: Reads pre-registered configuration modules from globalThis.__EE_CONFIG_REGISTRY__
 * - Dev mode: Loads configuration files from the filesystem by path
 *
 * Configuration files support function exports. The function receives an appInfo parameter and can dynamically return configuration based on environment.
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

/** Structure of a configuration registry entry in bundle mode */
interface ConfigRegistryEntry {
  /** Configuration filename (without extension), e.g. 'config.default', 'config.prod' */
  filename: string;
  /** Configuration module, can be an object or function (function receives appInfo parameter) */
  module: unknown;
}

declare global {
  var __EE_CONFIG_REGISTRY__: ConfigRegistryEntry[] | undefined;
}

/**
 * ConfigLoader — Configuration loader
 *
 * Deep merges default configuration with business configuration to produce the final runtime configuration.
 * Loading order: defaultConfig (framework built-in) -> config.default (business defaults) -> config.{env} (environment-specific)
 * Later-loaded configuration overrides same-named properties of earlier-loaded configuration.
 */
export class ConfigLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load and merge configuration
   *
   * @returns Merged complete runtime configuration
   */
  load(): Config {
    this.timing.start('Load Config');

    // Load business custom configuration (config.default + config.{env})
    const appConfig = this._AppConfig();
    // Load framework default configuration
    const defaultConf = defaultConfig();
    // Deep merge: business configuration overrides default configuration
    const config = extend(true, defaultConf, appConfig) as Config;
    debugLog('[load] config: %o', config);

    this.timing.end('Load Config');
    return config;
  }

  /**
   * Load business custom configuration
   *
   * Loads config.default and config.{env} in order; the latter overrides the former.
   * In development, loads config.local; in production, loads config.prod.
   *
   * @returns Merged business configuration
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
   * Load a single configuration file
   *
   * Supports two modes:
   * - Bundle mode: Finds the configuration module by filename from __EE_CONFIG_REGISTRY__
   * - Dev mode: Loads from filesystem via loadFile()
   *
   * Configuration files can export functions; the function receives an appInfo parameter for dynamic configuration.
   *
   * @param dirpath - Directory containing the configuration file (electron directory)
   * @param filename - Configuration filename (without extension)
   * @returns Configuration object, or null if loading fails
   */
  private _loadConfig(dirpath: string, filename: string): Record<string, unknown> | null {
    // Build appInfo for use by configuration functions
    const appInfo: AppInfo = {
      name: appName(),
      baseDir: getBaseDir(),
      electronDir: getElectronDir(),
      env: env(),
      root: getRootDir(),
    };

    if (globalThis.__EE_CONFIG_REGISTRY__) {
      // Bundle mode: find configuration module from registry
      const entry = globalThis.__EE_CONFIG_REGISTRY__.find((e) => e.filename === filename);
      if (!entry) return null;
      // ESM interop: esbuild wraps config modules as { __esModule: true, default: fn }.
      // Unwrap .default only when the __esModule marker is present, matching FileLoader.parseFromRegistry().
      let mod = entry.module;
      if (mod && (mod as Record<string, unknown>).__esModule && 'default' in (mod as Record<string, unknown>)) {
        mod = (mod as { default: unknown }).default;
      }
      debugLog('[_loadConfig] bundled filename: %s', filename);
      // Configuration file may export a function, receiving appInfo to dynamically generate configuration
      if (isFunction(mod)) {
        return (mod as (...args: unknown[]) => Record<string, unknown>)(appInfo);
      }
      return mod as Record<string, unknown>;
    }

    // Dev mode: load from filesystem
    // Silently skip if file not found (e.g. child process where bundle dir lacks config files)
    const filepath = path.join(dirpath, 'config', filename);
    let config: unknown;
    try {
      config = loadFile(filepath, appInfo);
    } catch {
      debugLog('[_loadConfig] file not found, skipping: %s', filepath);
      return null;
    }
    debugLog('[_loadConfig] filepath: %s', filepath);
    if (!config) return null;

    return config as Record<string, unknown>;
  }
}
