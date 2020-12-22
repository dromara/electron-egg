'use strict';

const BaseController = require('../base');

class SettingController extends BaseController {

  async autoLaunchEnable() {
    const self = this;
    const { ctx } = this;

    const data = {
      title: 'hello electron-egg'
    };

    self.sendSuccess(data);
  }
  
  async autoLaunchDisable() {
    const self = this;
    const { ctx } = this;

    const data = {
      title: 'hello'
    };

    self.sendSuccess(data);
  }
}

module.exports = SettingController;
