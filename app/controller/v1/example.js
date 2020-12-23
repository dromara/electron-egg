'use strict';

const BaseController = require('../base'); 

class ExampleController extends BaseController {

  async openLocalDir() {
    const self = this;
    const { service } = this;

    const data = {
      title: 'example test'
    };

    await service.example.openLocalDir();

    self.sendSuccess(data);
  }
}

module.exports = ExampleController;
