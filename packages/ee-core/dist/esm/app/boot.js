import debug from "debug";
import path from "path";
import { loadException } from "../exception";
import { electronApp } from "../electron/app";
import { getArgumentByName, getBundleDir, getElectronCodeDir } from "../ps";
import { loadConfig } from "../config";
import { loadLog } from "../log";
import { app } from "./application";
import { loadDir } from "./dir";
const debugLog = debug("ee-core:app:boot");
class ElectronEgg {
  constructor() {
    const baseDir = electronApp.getAppPath();
    const { env } = process;
    const environmet = getArgumentByName("env") || "prod";
    const debugging = getArgumentByName("debuger") === "true" ? true : false;
    let electronDir = getBundleDir(baseDir);
    if (debugging) {
      electronDir = getElectronCodeDir(baseDir);
    }
    const options = {
      env: environmet,
      baseDir,
      electronDir,
      appName: electronApp.getName(),
      userHome: electronApp.getPath("home"),
      appData: electronApp.getPath("appData"),
      appUserData: electronApp.getPath("userData"),
      appVersion: electronApp.getVersion(),
      isPackaged: electronApp.isPackaged,
      execDir: baseDir
    };
    if (environmet === "prod" && options.isPackaged) {
      options.execDir = path.dirname(electronApp.getPath("exe"));
    }
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
    env.EE_SOCKET_PORT = void 0;
    env.EE_HTTP_PORT = void 0;
    debugLog("[constructor] options:%j", options);
    this.init();
  }
  init() {
    loadException();
    loadConfig();
    loadDir();
    loadLog();
  }
  register(eventName, handler) {
    return app.register(eventName, handler);
  }
  run() {
    app.run();
  }
}
export {
  ElectronEgg
};
