'use strict';

const BaseService = require('./base');

class ExampleService extends BaseService {
  async openLocalDir(dir) {
    const self = this;

    await self.ipcCall('example.openDir', dir);

    return true;
  }
}

module.exports = ExampleService;