'use strict';

const BaseController = require('../base');

class SettingController extends BaseController {

  async autoLaunchEnable() {
    const { service } = this;
    const data = {};

    await service.setting.autoLaunchEnable();

    this.sendSuccess(data);
  }
  
  async autoLaunchDisable() {
    const { service } = this;
    const data = {};
    
    await service.setting.autoLaunchDisable();

    this.sendSuccess(data);
  }

  async autoLaunchIsEnabled() {
    const { service } = this;

    const data = {
      isEnabled: null
    };

    const isEnabled = await service.setting.autoLaunchIsEnabled();
    data.isEnabled = isEnabled;

    this.sendSuccess(data);
  }
}

module.exports = SettingController;
