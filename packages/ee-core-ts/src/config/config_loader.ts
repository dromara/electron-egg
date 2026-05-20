import debug from 'debug';
import path from 'path';
import { appName, env, getElectronDir, getBaseDir, getRootDir } from '../ps/index.js';
import { extend } from '../utils/extend.js';
import { loadFile } from '../loader/index.js';
import { Timing } from '../core/utils/timing.js';
import defaultConfig from './default_config.js';
import type { AppInfo } from '../types/index.js';

const log = debug('ee-core:config:config_loader');

export class ConfigLoader {
  timing: Timing;

  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load config/config.xxx.js
   */
  load(): Record<string, unknown> {
    this.timing.start('Load Config');

    // Load Application config
    const appConfig = this._AppConfig();
    const defaultConf = defaultConfig();
    const config = extend(true, defaultConf, appConfig);
    log('[load] config: %o', config);

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
    const filepath = path.join(dirpath, 'config', filename);
    const config = loadFile(filepath, appInfo);
    log('[_loadConfig] filepath: %s', filepath);
    if (!config) return null;

    return config as Record<string, unknown>;
  }
}
