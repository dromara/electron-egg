'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // home
  router.get('/', controller.v1.home.index);

  // hello
  //router.get('/', controller.v1.home.hello);

  // html
  router.get('/home', controller.v1.home.index);

  // 引入其他路由
  require('./setting')(app);
};
