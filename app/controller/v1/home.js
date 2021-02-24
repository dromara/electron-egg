'use strict';

const BaseController = require('../base');

class HomeController extends BaseController {

  async index() {
    const { ctx } = this;

    const data = {
      title: 'hello electron-egg'
    };

    await ctx.render('index.ejs', data);
  }
  
  async hello() {
    const { ctx } = this;

    const data = {
      title: 'hello'
    };

    this.sendSuccess(data);
  }

  async helloPage() {
    const { ctx } = this;

    const data = {
      title: 'hello'
    };

    await ctx.render('hello.ejs', data);
  }
}

module.exports = HomeController;
