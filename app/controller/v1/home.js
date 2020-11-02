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
  
}

module.exports = HomeController;
