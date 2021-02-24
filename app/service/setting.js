'use strict';

const BaseService = require('./base');

class SettingService extends BaseService {

  async autoLaunchEnable() {
    const callResult = await this.ipcCall('base.autoLaunchEnable');

    return callResult.data;
  }

  async autoLaunchDisable() {
    const callResult = await this.ipcCall('base.autoLaunchDisable');

    return callResult.data;
  }

  async autoLaunchIsEnabled() {
    const callResult = await this.ipcCall('base.autoLaunchIsEnabled');

    return callResult.data;
  }
}

module.exports = SettingService;