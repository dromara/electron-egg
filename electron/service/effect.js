'use strict';

const { logger } = require('ee-core/log');

/**
 * effect
 * @class
 */
class EffectService {

  /**
   * hello
   */
  async hello(args) {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('EffectService obj:', obj);

    return obj;
  }

}
EffectService.toString = () => '[class EffectService]';

module.exports = {
  EffectService,
  effectService: new EffectService()
};  