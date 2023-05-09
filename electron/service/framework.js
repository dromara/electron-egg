'use strict';

const { Service } = require('ee-core');

/**
 * framework
 * @class
 */
class FrameworkService extends Service {

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

FrameworkService.toString = () => '[class FrameworkService]';
module.exports = FrameworkService;  