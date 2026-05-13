'use strict';

const debug = require('debug')('ee-core:config:config_loader');
const path = require('path');
const { appName, env, getElectronDir, getBaseDir, getRootDir } = require('../ps');
const { extend } = require('../utils/extend');
const { loadFile } = require('../loader');
const { Timing } = require('../core/utils/timing');
const defaultConfig = require('./default_config');

class ConfigLoader {
  constructor() {
    this.timing = new Timing();
  }

  /**
   * Load config/config.xxx.js
   */
  load() {
    this.timing.start('Load Config');

    // Load Application config
    const appConfig = this._AppConfig();
    // debug("[load] appConfig: %O", appConfig);

    const defaultConf = defaultConfig();
    const config = extend(true, defaultConf, appConfig);
    debug("[load] config: %o", config);

    this.timing.end('Load Config');
    return config;
  }

  _AppConfig() {
    const names = [
      'config.default',
      `config.${env()}`,
    ];
    const target = {};
    for (const filename of names) {
      const config = this._loadConfig(getElectronDir(), filename);
      extend(true, target, config);
    }
    return target;
  }

  _loadConfig(dirpath, filename) {
    const appInfo = {
      name: appName(),
      baseDir: getBaseDir(),
      electronDir: getElectronDir(),
      env: env(),
      root: getRootDir(),
    }
    const filepath = path.join(dirpath, 'config', filename);
    const config = loadFile(filepath, appInfo);
    debug("[_loadConfig] filepath: %s", filepath);
    if (!config) return null;

    return config;
  }
}

module.exports = {
  ConfigLoader
};