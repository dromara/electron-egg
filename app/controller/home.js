'use strict';

const BaseController = require('./base');

class HomeController extends BaseController {

  /**
   * 单页应用入口（vue、react等）
   */
  async index() {
    const { ctx } = this;

    const data = {
      title: 'hello ee'
    };

    await ctx.render('index.ejs', data);
  }
}

module.exports = HomeController;
