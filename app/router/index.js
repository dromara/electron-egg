'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.v1.home.index);
  // html
  router.get('/home', controller.v1.home.index);
};
