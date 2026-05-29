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

interface ConfigRegistryEntry {
  filename: string;
  module: unknown;
}

declare global {
  var __EE_CONFIG_REGISTRY__: ConfigRegistryEntry[] | undefined;
}

export class ConfigLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  load(): Config {
    this.timing.start('Load Config');

    const appConfig = this._AppConfig();
    const defaultConf = defaultConfig();
    const config = extend(true, defaultConf as Record<string, unknown>, appConfig) as Config;
    debugLog('[load] config: %o', config);

    this.timing.end('Load Config');
    return config;
  }

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

  private _loadConfig(dirpath: string, filename: string): Record<string, unknown> | null {
    const appInfo: AppInfo = {
      name: appName(),
      baseDir: getBaseDir(),
      electronDir: getElectronDir(),
      env: env(),
      root: getRootDir(),
    };

    if (globalThis.__EE_CONFIG_REGISTRY__) {
      // Bundled mode: load from registry
      const entry = globalThis.__EE_CONFIG_REGISTRY__.find((e) => e.filename === filename);
      if (!entry) return null;
      const mod = entry.module;
      debugLog('[_loadConfig] bundled filename: %s', filename);
      if (isFunction(mod)) {
        return (mod as (...args: unknown[]) => Record<string, unknown>)(appInfo);
      }
      return mod as Record<string, unknown>;
    }

    // Dev mode: load from filesystem
    const filepath = path.join(dirpath, 'config', filename);
    const config = loadFile(filepath, appInfo);
    debugLog('[_loadConfig] filepath: %s', filepath);
    if (!config) return null;

    return config as Record<string, unknown>;
  }
}