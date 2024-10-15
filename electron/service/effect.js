'use strict';

const { Service } = require('ee-core');
const Log = require('ee-core/log');

/**
 * effect（service层为单例）
 * @class
 */
class EffectService extends Service {

  /**
   * hello
   */
  async hello(args) {
    let obj = {
      status:'ok',
      params: args
    }
    Log.info('EffectService obj:', obj);

    return obj;
  }

}

EffectService.toString = () => '[class EffectService]';
module.exports = EffectService;  