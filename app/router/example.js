'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // open local dir
  router.post('/api/v1/example/openLocalDir', controller.v1.example.openLocalDir);
  // upload file
  router.post('/api/v1/example/uploadFile', controller.v1.example.uploadFile);
};