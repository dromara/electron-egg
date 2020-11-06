'use strict';

const path = require('path');
const startCluster = require('egg-cluster').startCluster;
const {app} = require('electron');

exports = module.exports;

exports.start = function (argv) {
    const { env } = process;

    let baseDir = app.getAppPath();
    argv.baseDir = baseDir;
    argv.framework = path.join(baseDir, 'node_modules/egg');

    const pkgInfo = require(path.join(baseDir, 'package.json'));
    argv.title = argv.title || `egg-server-${pkgInfo.name}`;

    // normalize env
    env.HOME = baseDir;
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

    // for alinode
    env.ENABLE_NODE_LOG = 'YES';
    env.NODE_LOG_DIR = env.NODE_LOG_DIR || path.join(baseDir, 'logs/alinode');

    // cli argv -> process.env.EGG_SERVER_ENV -> `undefined` then egg will use `prod`
    if (argv.env) {
      // if undefined, should not pass key due to `spwan`, https://github.com/nodejs/node/blob/master/lib/child_process.js#L470
      env.EGG_SERVER_ENV = argv.env;
    }

    // remove unused properties from stringify, alias had been remove by `removeAlias`
    const ignoreKeys = [ '_', '$0', 'env', 'daemon', 'stdout', 'stderr', 'timeout', 'ignore-stderr', 'node' ];
    const clusterOptions = stringify(argv, ignoreKeys);
    const options = JSON.parse(clusterOptions);
    // console.log('options:', {
    //   argv,
    //   options
    // });

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