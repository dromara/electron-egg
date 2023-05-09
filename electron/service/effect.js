'use strict';

const { Service } = require('ee-core');

/**
 * effect（service层为单例）
 * @class
 */
class EffectService extends Service {

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

EffectService.toString = () => '[class EffectService]';
module.exports = EffectService;  