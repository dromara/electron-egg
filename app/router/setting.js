'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // open launch
  router.post('/api/v1/setting/autoLaunchEnable', controller.v1.setting.autoLaunchEnable);
  // close launch 
  router.post('/api/v1/setting/autoLaunchDisable', controller.v1.setting.autoLaunchDisable);
  // is launch 
  router.post('/api/v1/setting/autoLaunchIsEnabled', controller.v1.setting.autoLaunchIsEnabled);
};