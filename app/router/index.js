'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // home
  router.get('/', controller.home.index);

  // html
  router.get('/home', controller.home.index);

  // 引入其他路由
  require('./example')(app);
};
