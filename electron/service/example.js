'use strict';

const { Service } = require('ee-core');

/**
 * 示例服务（service层为单例）
 * @class
 */
class ExampleService extends Service {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * test
   */
  async test(args) {
    let obj = {
      status:'ok',
      params: args
    }

    return obj;
  }
}

ExampleService.toString = () => '[class ExampleService]';
module.exports = ExampleService;