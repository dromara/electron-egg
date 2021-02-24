'use strict';

const AutoLaunchManager = require('../lib/AutoLaunch');

exports.autoLaunchEnable = function () {
  const autoLaunchManager = new AutoLaunchManager();
  const enable = autoLaunchManager.enable();
  return enable;
}

exports.autoLaunchDisable = function () {
  const autoLaunchManager = new AutoLaunchManager();
  const disable = autoLaunchManager.disable();
  return disable;
}

exports.autoLaunchIsEnabled = function () {
  const autoLaunchManager = new AutoLaunchManager();
  const isEnable = autoLaunchManager.isEnabled();
  return isEnable;
}