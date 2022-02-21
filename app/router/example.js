'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // upload file
  router.post('/api/example/uploadFile', controller.example.uploadFile);
  // test some electron api
  router.post('/api/example/testElectronApi', controller.example.testElectronApi);
  // test2
  router.post('/api/example/test2', controller.example.test2);
  // message show
  router.post('/api/example/messageShow', controller.example.messageShow);
  // message show confirm
  router.post('/api/example/messageShowConfirm', controller.example.messageShowConfirm);
  // upload chrome extension
  router.post('/api/example/uploadExtension', controller.example.uploadExtension);
  // db operation
  router.post('/api/example/dbOperation', controller.example.dbOperation);
};