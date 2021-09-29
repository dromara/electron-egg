'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // open local dir
  router.post('/api/v1/example/openLocalDir', controller.v1.example.openLocalDir);
  // executeJS
  router.post('/api/v1/example/executeJS', controller.v1.example.executeJS);
  // upload file
  router.post('/api/v1/example/uploadFile', controller.v1.example.uploadFile);
  // get ws url
  router.post('/api/v1/example/getWsUrl', controller.v1.example.getWsUrl);
  // add test data
  router.post('/api/v1/example/addTestData', controller.v1.example.addTestData);
  // delete test data
  router.post('/api/v1/example/delTestData', controller.v1.example.delTestData);
  // update test data
  router.post('/api/v1/example/updateTestData', controller.v1.example.updateTestData);
  // get test data
  router.post('/api/v1/example/getTestData', controller.v1.example.getTestData);
  // set shortcut
  router.post('/api/v1/example/setShortcut', controller.v1.example.setShortcut);
  // open launch
  router.post('/api/v1/example/autoLaunchEnable', controller.v1.example.autoLaunchEnable);
  // close launch 
  router.post('/api/v1/example/autoLaunchDisable', controller.v1.example.autoLaunchDisable);
  // is launch 
  router.post('/api/v1/example/autoLaunchIsEnabled', controller.v1.example.autoLaunchIsEnabled);
  // open software
  router.post('/api/v1/example/openSoftware', controller.v1.example.openSoftware);
  // select file dir
  router.post('/api/v1/example/selectFileDir', controller.v1.example.selectFileDir);
  // test some electron api
  router.post('/api/v1/example/testElectronApi', controller.v1.example.testElectronApi);
  // message show
  router.post('/api/v1/example/messageShow', controller.v1.example.messageShow);
  // message show confirm
  router.post('/api/v1/example/messageShowConfirm', controller.v1.example.messageShowConfirm);

};