import debug from "debug";
import path from "path";
import { appName, env, getElectronDir, getBaseDir, getRootDir } from "../ps";
import { extend } from "../utils/extend";
import { loadFile } from "../loader";
import { Timing } from "../core/utils/timing";
import defaultConfig from "./default_config";
const debugLog = debug("ee-core:config:config_loader");
class ConfigLoader {
  constructor() {
    this.timing = new Timing();
  }
  /**
   * Load config/config.xxx.js
   */
  load() {
    this.timing.start("Load Config", Date.now());
    const appConfig = this._AppConfig();
    const defaultConf = defaultConfig();
    const config = extend(true, defaultConf, appConfig);
    debugLog("[load] config: %o", config);
    this.timing.end("Load Config");
    return config;
  }
  _AppConfig() {
    const names = [
      "config.default",
      `config.${env()}`
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
      root: getRootDir()
    };
    const filepath = path.join(dirpath, "config", filename);
    const config = loadFile(filepath, appInfo);
    debugLog("[_loadConfig] filepath: %s", filepath);
    if (!config) return null;
    return config;
  }
}
export {
  ConfigLoader
};
