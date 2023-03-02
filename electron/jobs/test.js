const Log = require('ee-core/module/log');
const Utils = require('ee-core/module/utils');
const Ps = require('ee-core/module/ps');

exports.hello = function () {
  Log.info('[child-process] [jobs/test] hello -------- ');
}

exports.utilsMod = function () {
  let utilsApis = {
    getBaseDir: Ps.getBaseDir(),
    getEnv: Ps.getEnv(),
    isDev: Ps.isDev(),
    isRenderer: Ps.isRenderer(),
    isMain: Ps.isMain(),
    isForkedChild: Ps.isForkedChild(),
    getHomeDir: Ps.getHomeDir(),
    getStorageDir: Ps.getStorageDir(),
    getLogDir: Ps.getLogDir(),
    getRootDir: Ps.getRootDir(),
    getBaseDir: Ps.getBaseDir(),
    getAppUserDataDir: Ps.getAppUserDataDir(),
    getHomeDir: Ps.getHomeDir(),
    getUserHomeDir: Ps.getUserHomeDir(),
    getMainPort: Ps.getMainPort(),
    getSocketPort: Ps.getSocketPort(),
    getHttpPort: Ps.getHttpPort(),
    getExecDir: Ps.getExecDir(),
    getPackage: Utils.getPackage(),
    getEeConfig: Utils.getEeConfig(),
    getAppVersion: Utils.getAppVersion(),
    getAddonConfig: Utils.getAddonConfig(),
    getMainServerConfig: Utils.getMainServerConfig(),
    getHttpServerConfig: Utils.getHttpServerConfig(),
    getSocketServerConfig: Utils.getSocketServerConfig(),
    getSocketChannel: Utils.getSocketChannel(),
    getExtraResourcesDir: Ps.getExtraResourcesDir(),
  }
  Log.info('[child-process] [jobs/test] Utils -------- ', utilsApis);
}