'use strict';

/*
 *Egg插件
 */

// jwt登录状态验证插件
exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};

// 跨域插件
exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.ejs = {
  enable: true,
  package: 'egg-view-ejs',
};
