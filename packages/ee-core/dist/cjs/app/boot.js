"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronEgg = void 0;
const debug_1 = __importDefault(require("debug"));
const path_1 = __importDefault(require("path"));
const exception_1 = require("../exception");
const app_1 = require("../electron/app");
const ps_1 = require("../ps");
const config_1 = require("../config");
const log_1 = require("../log");
const application_1 = require("./application");
const dir_1 = require("./dir");
const debugLog = (0, debug_1.default)('ee-core:app:boot');
class ElectronEgg {
    constructor() {
        const baseDir = app_1.electronApp.getAppPath();
        const { env } = process;
        const environmet = (0, ps_1.getArgumentByName)('env') || 'prod';
        const debugging = (0, ps_1.getArgumentByName)('debuger') === 'true' ? true : false;
        // Debugging source code
        let electronDir = (0, ps_1.getBundleDir)(baseDir);
        if (debugging) {
            electronDir = (0, ps_1.getElectronCodeDir)(baseDir);
        }
        const options = {
            env: environmet,
            baseDir,
            electronDir,
            appName: app_1.electronApp.getName(),
            userHome: app_1.electronApp.getPath('home'),
            appData: app_1.electronApp.getPath('appData'),
            appUserData: app_1.electronApp.getPath('userData'),
            appVersion: app_1.electronApp.getVersion(),
            isPackaged: app_1.electronApp.isPackaged,
            execDir: baseDir,
        };
        // exec directory (exe dmg dep) for prod
        if (environmet === 'prod' && options.isPackaged) {
            options.execDir = path_1.default.dirname(app_1.electronApp.getPath('exe'));
        }
        // normalize env
        env.EE_ENV = environmet;
        env.EE_APP_NAME = options.appName;
        env.EE_APP_VERSION = options.appVersion;
        env.EE_BASE_DIR = options.baseDir;
        env.EE_ELECTRON_DIR = options.electronDir;
        env.EE_USER_HOME = options.userHome;
        env.EE_APP_DATA = options.appData;
        env.EE_APP_USER_DATA = options.appUserData;
        env.EE_EXEC_DIR = options.execDir;
        env.EE_IS_PACKAGED = options.isPackaged.toString();
        env.EE_SOCKET_PORT = undefined;
        env.EE_HTTP_PORT = undefined;
        debugLog('[constructor] options:%j', options);
        this.init();
    }
    init() {
        // basic functions
        (0, exception_1.loadException)();
        (0, config_1.loadConfig)();
        (0, dir_1.loadDir)();
        (0, log_1.loadLog)();
    }
    register(eventName, handler) {
        return application_1.app.register(eventName, handler);
    }
    run() {
        application_1.app.run();
    }
}
exports.ElectronEgg = ElectronEgg;
//# sourceMappingURL=boot.js.map