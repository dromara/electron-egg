'use strict';

const Service = require('ee-core').Service;

/**
 * 示例服务
 * @class
 */
class ExampleService extends Service {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * test
   */
  async test (args) {
    let obj = {
      status:'ok',
      params: args
    }

    return obj;
  }
}

ExampleService.toString = () => '[class ExampleService]';
module.exports = ExampleService;