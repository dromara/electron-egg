'use strict';

const { Service } = require('ee-core');

/**
 * hardware（service层为单例）
 * @class
 */
class HardwareService extends Service {

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

HardwareService.toString = () => '[class HardwareService]';
module.exports = HardwareService;  