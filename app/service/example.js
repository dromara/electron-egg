'use strict';

const BaseService = require('./base');

class ExampleService extends BaseService {
  async openLocalDir() {
    const self = this;

    await self.ipcCall('example.openDir', 'a', 'b', 'c');

    return true;
  }
}

module.exports = ExampleService;