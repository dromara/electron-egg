'use strict';

const BaseController = require('../base');

class SettingController extends BaseController {

  async autoLaunchEnable() {
    const { ctx } = this;

    const data = {
      title: 'hello electron-egg'
    };

    await ctx.render('index.ejs', data);
  }
  
  async autoLaunchDisable() {
    const { ctx } = this;

    const data = {
      title: 'hello'
    };

    await ctx.render('hello.ejs', data);
  }
}

module.exports = SettingController;
