"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const ps_1 = require("../ps");
const extend_1 = require("../utils/extend");
const loader_1 = require("../loader");
const timing_1 = require("../core/utils/timing");
const default_config_1 = __importDefault(require("./default_config"));
const debugLog = (0, debug_1.default)('ee-core:config:config_loader');
class ConfigLoader {
    constructor() {
        this.timing = new timing_1.Timing();
    }
    /**
     * Load config/config.xxx.js
     */
    load() {
        this.timing.start('Load Config', Date.now());
        // Load Application config
        const appConfig = this._AppConfig();
        const defaultConf = (0, default_config_1.default)();
        const config = (0, extend_1.extend)(true, defaultConf, appConfig);
        debugLog("[load] config: %o", config);
        this.timing.end('Load Config');
        return config;
    }
    _AppConfig() {
        const names = [
            'config.default',
            `config.${(0, ps_1.env)()}`,
        ];
        const target = {};
        for (const filename of names) {
            const config = this._loadConfig((0, ps_1.getElectronDir)(), filename);
            (0, extend_1.extend)(true, target, config);
        }
        return target;
    }
    _loadConfig(dirpath, filename) {
        const appInfo = {
            name: (0, ps_1.appName)(),
            baseDir: (0, ps_1.getBaseDir)(),
            electronDir: (0, ps_1.getElectronDir)(),
            env: (0, ps_1.env)(),
            root: (0, ps_1.getRootDir)(),
        };
        const filepath = path_1.default.join(dirpath, 'config', filename);
        const config = (0, loader_1.loadFile)(filepath, appInfo);
        debugLog("[_loadConfig] filepath: %s", filepath);
        if (!config)
            return null;
        return config;
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config_loader.js.map