'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // upload file
  router.post('/api/example/uploadFile', controller.example.uploadFile);
  // open launch
  router.post('/api/example/autoLaunchEnable', controller.example.autoLaunchEnable);
  // close launch 
  router.post('/api/example/autoLaunchDisable', controller.example.autoLaunchDisable);
  // is launch 
  router.post('/api/example/autoLaunchIsEnabled', controller.example.autoLaunchIsEnabled);
  // open software
  router.post('/api/example/openSoftware', controller.example.openSoftware);
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