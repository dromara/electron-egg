'use strict';

const { logger } = require('ee-core/log');

/**
 * 示例服务
 * @class
 */
class ExampleService {

  /**
   * test
   */
  async test(args) {
    let obj = {
      status:'ok',
      params: args
    }

    logger.info('ExampleService obj:', obj);

    return obj;
  }
}
ExampleService.toString = () => '[class ExampleService]';

module.exports = {
  ExampleService,
  exampleService: new ExampleService()
};