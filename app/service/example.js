'use strict';

const BaseService = require('./base');

class ExampleService extends BaseService {
  async openLocalDir() {
    const self = this;

    await self.ipcCall('example.getPath');

    return true;
  }
}

module.exports = ExampleService;