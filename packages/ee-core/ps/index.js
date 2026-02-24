'use strict';

const path = require('path');
const is = require('../utils/is');

// 当前进程的所有env
function allEnv() {
  return process.env;
}

// 当前环境 - local | prod
function env() {
  return process.env.EE_ENV;
}

// 是否生产环境
function isProd() {
  return (process.env.EE_ENV === 'prod');
}

// 是否为开发环境
function isDev() {
  if (process.env.EE_ENV === 'dev' || process.env.EE_ENV === 'local') {
    return true;
  }

  return false;
};

// 是否为渲染进程
function isRenderer() {
  return (typeof process === 'undefined' ||
    !process ||
    process.type === 'renderer');
};

// 是否为主进程
function isMain() {
  return ( typeof process !== 'undefined' &&
    process.type === 'browser');
};

// 是否为node子进程
function isForkedChild() {
  return (Number(process.env.ELECTRON_RUN_AS_NODE) === 1);
};

// 当前进程类型
function processType() {
  let type = '';
  if (isMain()) {
    type = 'browser';
  } else if (isRenderer()) {
    type = 'renderer';
  } else if (isForkedChild()) {
    type = 'child';
  }

  return type;
};

// app name
function appName() {
  return process.env.EE_APP_NAME;
}

// app version
function appVersion() {
  return process.env.EE_APP_VERSION;
}

// 获取数据存储路径
function getDataDir() {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  const dataDir = path.join(base, 'data');
  return dataDir;
}

// 获取日志存储路径 
function getLogDir() {
  const base = isDev() ? getBaseDir() : getUserHomeHiddenAppDir();
  const dir = path.join(base, 'logs');
  return dir;
}

// 获取bundle文件路径
function getBundleDir(basePath) {
  const base = basePath || process.cwd();
  const dir = path.join(base, 'public', 'electron');
  return dir;
}

// 获取electron 源码文件路径
function getElectronCodeDir(basePath) {
  const base = basePath || process.cwd();
  const dir = path.join(base, 'electron');
  return dir;
}

// 获取frontend 源码文件路径
function getFrontendCodeDir(basePath) {
  const base = basePath || process.cwd();
  const dir = path.join(base, 'frontend');
  return dir;
}

// 获取base目录
function getBaseDir() {
  return process.env.EE_BASE_DIR;
}

// 获取electron目录
function getElectronDir() {
  return process.env.EE_ELECTRON_DIR;
}

// 获取public目录
function getPublicDir() {
  const dir = path.join(getBaseDir(), "public");
  return dir;
}

// 获取 额外资源目录
function getExtraResourcesDir() {
  const execDir = getExecDir();
  const packaged = isPackaged();

  // 资源路径不同
  let dir = '';
  if (packaged) {
    // 打包后  execDir为 应用程序 exe\dmg\dep软件所在目录；打包前该值是项目根目录
    // windows和MacOs不一样
    dir = path.join(execDir, "resources", "extraResources");
    if (is.macOS()) {
      dir = path.join(execDir, "..", "Resources", "extraResources");
    }
  } else {
    // 打包前
    dir = path.join(execDir, "build", "extraResources");
  }
  return dir;
}

// 获取root目录  (dev-项目根目录，pro-app user data目录)
function getRootDir() {
  const appDir = isDev() ? getBaseDir() : getAppUserDataDir();
  return appDir;
}

// 获取 appUserData目录
function getAppUserDataDir() {
  return process.env.EE_APP_USER_DATA;
}

// 获取 exec目录
function getExecDir() {
  return process.env.EE_EXEC_DIR;
}

// 获取操作系统用户目录
function getUserHomeDir() {
  return process.env.EE_USER_HOME;
}

// 获取用户家目录中的隐藏的app目录
function getUserHomeHiddenAppDir() {
  const appnameDir = "." + appName();
  const dir = path.join(getUserHomeDir(), appnameDir);
  return dir;
}

// 获取用户家目录中的app目录
function getUserHomeAppDir() {
  const appnameDir = appName();
  const dir = path.join(getUserHomeDir(), appnameDir);
  return dir;
}

// 获取内置socket端口
function getSocketPort() {
  return parseInt(process.env.EE_SOCKET_PORT) || 0;
}

// 获取内置http端口
function getHttpPort() {
  return parseInt(process.env.EE_HTTP_PORT) || 0;
}

// 是否打包
function isPackaged() {
  return process.env.EE_IS_PACKAGED === 'true';
}

// 进程退出
function exit(code = 0) {
  return process.exit(code);
}

// 格式化message
function makeMessage(msg = {}) {
  let message = Object.assign({
    channel: '',
    event: '', 
    data: {}
  }, msg);

  return message;
}

// 退出ChildJob进程
function exitChildJob(code = 0) {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == 'childJob') {
      process.exit(code);
    }
  } catch (e) {
    process.exit(code);
  }
}

// 任务类型 ChildJob
function isChildJob() {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == 'childJob') {
      return true;
    }
  } catch (e) {
    return false;
  }
}

// 任务类型 ChildPoolJob
function isChildPoolJob() {
  try {
    let args = JSON.parse(process.argv[2]);
    if (args.type == 'childPoolJob') {
      return true;
    }
  } catch (e) {
    return false;
  }
}

// Get cmd parameter by name
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

module.exports = {
  allEnv,
  env,
  isProd,
  isDev,
  isRenderer,
  isMain,
  isForkedChild,
  processType,
  appName,
  appVersion,
  getDataDir,
  getLogDir,
  getBundleDir,
  getElectronCodeDir,
  getFrontendCodeDir,
  getRootDir,
  getBaseDir,
  getElectronDir,
  getPublicDir,
  getExtraResourcesDir,
  getAppUserDataDir,
  getExecDir,
  getUserHomeDir,
  getUserHomeAppDir,
  getUserHomeHiddenAppDir,
  getSocketPort,
  getHttpPort,
  isPackaged,
  exit,
  makeMessage,
  exitChildJob,
  isChildJob,
  isChildPoolJob,
  getArgumentByName
}