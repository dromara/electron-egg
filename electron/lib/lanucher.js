'use strict';

const path = require('path');
const startCluster = require('egg-cluster').startCluster;
const {app} = require('electron');

exports = module.exports;

/**
 * egg server start
 * 
 * @param {Object} argv
 * @return {Promise}
 */
exports.start = function (argv) {
    const { env } = process;

    let baseDir = app.getAppPath();
    argv.baseDir = baseDir;
    argv.framework = path.join(baseDir, 'node_modules/egg');

    const appName = app.getName();
    argv.title = argv.title || `egg-server-${appName}`;

    // normalize env
    env.NODE_ENV = 'production';

    // it makes env big but more robust
    env.PATH = env.Path = [
      // for nodeinstall
      path.join(baseDir, 'node_modules/.bin'),
      // support `.node/bin`, due to npm5 will remove `node_modules/.bin`
      path.join(baseDir, '.node/bin'),
      // adjust env for win
      env.PATH || env.Path,
    ].filter(x => !!x).join(path.delimiter);

    // cli argv -> process.env.EGG_SERVER_ENV -> `undefined` then egg will use `prod`
    if (argv.env) {
      // if undefined, should not pass key due to `spwan`, https://github.com/nodejs/node/blob/master/lib/child_process.js#L470
      env.EGG_SERVER_ENV = argv.env;
    }

    // remove unused properties from stringify, alias had been remove by `removeAlias`
    const ignoreKeys = [ '_', '$0', 'env', 'daemon', 'stdout', 'stderr', 'timeout', 'ignore-stderr', 'node' ];
    const clusterOptions = stringify(argv, ignoreKeys);
    const options = JSON.parse(clusterOptions);
    // console.log('[lanucher] options:', options)
    return new Promise((resolve, reject) => {
      startCluster(options, function(){
        resolve('success');
      });
    });
};

function stringify(obj, ignore) {
  const result = {};
  Object.keys(obj).forEach(key => {
    if (!ignore.includes(key)) {
      result[key] = obj[key];
    }
  });
  return JSON.stringify(result);
}