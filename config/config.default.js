'use strict';

const path = require('path');
const Utils = require('ee-core').Utils;
const eggConfig = Utils.getEggConfig();

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1552879336505_7432';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {};

  config.cluster = {
    listen: {
      port: eggConfig.port || 7068,
      hostname: eggConfig.hostname || '127.0.0.1',
    },
  };

  /* 跨域插件配置-start */
  config.security = {
    xframe: {
      enable: false,
    },
    ignore: '/api',
    // 跨域允许的域名列表-配置
    domainWhiteList: [
      '*',
      // 'http://127.0.0.1:8080'
    ],
    methodnoallow: { enable: false },
    // 安全配置
    csrf: {
      enable: false,
      ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    },
  };
  // 允许的跨域请求类型(GET,POST)
  config.cors = {
    origin: '*',
    allowMethods: 'GET,POST,HEAD,PUT,OPTIONS,DELETE,PATCH',
  };
  /* 跨域插件配置-end */

  // 获取真实ip
  config.maxProxyCount = 2;
  
  config.view = {
    root: [path.join(appInfo.baseDir, 'app/view')].join(','),
    mapping: {
      '.ejs': 'ejs',
    },
  };

  config.static = {
    // 静态化访问前缀,如：`http://127.0.0.1:7001/static/images/logo.png`
    prefix: '/', 
    dir: [path.join(appInfo.baseDir, 'app/public')], // `String` or `Array:[dir1, dir2, ...]` 静态化目录,可以设置多个静态化目录
    dynamic: true, // 如果当前访问的静态资源没有缓存，则缓存静态文件，和`preload`配合使用；
    preload: false,
    maxAge: 31536000, // in prod env, 0 in other envs
    buffer: true, // in prod env, false in other envs
  };

  config.ejs = {};

  config.multipart = {
    mode: 'file',
    fileExtensions: [ '.xlsx', '.crx' ] // 增加你需要的文件扩展名
  };

  return {
    ...config,
    ...userConfig,
  };
};
