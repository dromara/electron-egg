'use strict';

const BaseController = require('./base');

class TestController extends BaseController {
  async index() {
    const { app, ctx, service } = this;
    const query = ctx.request.query;
    console.log('env:%j', app.config.env);
    const res = 0;
    const data = {
      env: app.config.env,
    };



    console.log('res:%j', res);
    this.sendSuccess(data, 'ok');
  }
}

module.exports = TestController;
