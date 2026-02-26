import path from "path";
import { macOS } from "../utils/is";
function allEnv() {
  return process.env;
}
function env() {
  return process.env.EE_ENV;
}
function isProd() {
  return process.env.EE_ENV === "prod";
}
function isDev() {
  if (process.env.EE_ENV === "dev" || process.env.EE_ENV === "local") {
    return true;
  }
  return false;
}
;
function isRenderer() {
  return typeof process === "undefined" || !process || process.type === "renderer";
}
;
function isMain() {
  return typeof process !== "undefined" && process.type === "browser";
}
;
function isForkedChild() {
  return Number(process.env.ELECTRON_RUN_AS_NODE) === 1;
}
;
function processType() {
  let type = "";
  if (isMain()) {
    type = "browser";
  } else if (isRenderer()) {
    type = "renderer";
  } else if (isForkedChild()) {
    type = "child";
  }
  return type;
}
;
function appName() {
  return process.env.EE_APP_NAME || "";
}
function appVersion() {
  return process.env.EE_APP_VERSION;
}
function getDataDir() {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  const dataDir = path.join(base, "data");
  return dataDir;
}
function getLogDir() {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  const dir = path.join(base, "logs");
  return dir;
}
function getBundleDir(basePath) {
  const base = basePath || process.cwd();
  const dir = path.join(base, "public", "electron");
  return dir;
}
function getElectronCodeDir(basePath) {
  const base = basePath || process.cwd();
  const dir = path.join(base, "electron");
  return dir;
}
function getFrontendCodeDir(basePath) {
  const base = basePath || process.cwd();
  const dir = path.join(base, "frontend");
  return dir;
}
function getBaseDir() {
  return process.env.EE_BASE_DIR || "";
}
function getElectronDir() {
  return process.env.EE_ELECTRON_DIR || "";
}
function getPublicDir() {
  const dir = path.join(getBaseDir(), "public");
  return dir;
}
function getExtraResourcesDir() {
  const execDir = getExecDir();
  const packaged = isPackaged();
  let dir = "";
  if (packaged) {
    dir = path.join(execDir, "resources", "extraResources");
    if (macOS()) {
      dir = path.join(execDir, "..", "Resources", "extraResources");
    }
  } else {
    dir = path.join(execDir, "build", "extraResources");
  }
  return dir;
}
function getRootDir() {
  const appDir = isDev() ? getBaseDir() : getAppUserDataDir();
  return appDir;
}
function getAppUserDataDir() {
  return process.env.EE_APP_USER_DATA;
}
function getExecDir() {
  return process.env.EE_EXEC_DIR || "";
}
function getUserHomeDir() {
  return process.env.EE_USER_HOME || "";
}
function getUserHomeHiddenAppDir() {
  const appnameDir = "." + appName();
  const dir = path.join(getUserHomeDir(), appnameDir);
  return dir;
}
function getUserHomeAppDir() {
  const appnameDir = appName();
  const dir = path.join(getUserHomeDir(), appnameDir);
  return dir;
}
function getSocketPort() {
  return parseInt(process.env.EE_SOCKET_PORT || "0") || 0;
}
function getHttpPort() {
  return parseInt(process.env.EE_HTTP_PORT || "0") || 0;
}
function isPackaged() {
  return process.env.EE_IS_PACKAGED === "true";
}
function exit(code = 0) {
  return process.exit(code);
}
function makeMessage(msg = {}) {
  let message = Object.assign({
    channel: "",
    event: "",
    data: {}
  }, msg);
  return message;
}
function exitChildJob(code = 0) {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == "childJob") {
      process.exit(code);
    }
  } catch (e) {
    process.exit(code);
  }
}
function isChildJob() {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == "childJob") {
      return true;
    }
  } catch (e) {
    return false;
  }
}
function isChildPoolJob() {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == "childPoolJob") {
      return true;
    }
  } catch (e) {
    return false;
  }
}
function getArgumentByName(name, args) {
  if (!args) {
    args = process.argv;
  }
  for (let i = 0; i < args.length; i++) {
    const item = args[i];
    const prefixKey = `--${name}=`;
    if (item.indexOf(prefixKey) !== -1) {
      return item.substring(prefixKey.length);
    }
  }
}
export {
  allEnv,
  appName,
  appVersion,
  env,
  exit,
  exitChildJob,
  getAppUserDataDir,
  getArgumentByName,
  getBaseDir,
  getBundleDir,
  getDataDir,
  getElectronCodeDir,
  getElectronDir,
  getExecDir,
  getExtraResourcesDir,
  getFrontendCodeDir,
  getHttpPort,
  getLogDir,
  getPublicDir,
  getRootDir,
  getSocketPort,
  getUserHomeAppDir,
  getUserHomeDir,
  getUserHomeHiddenAppDir,
  isChildJob,
  isChildPoolJob,
  isDev,
  isForkedChild,
  isMain,
  isPackaged,
  isProd,
  isRenderer,
  makeMessage,
  processType
};
