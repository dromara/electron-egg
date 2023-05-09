'use strict';

const { Service } = require('ee-core');

/**
 * os（service层为单例）
 * @class
 */
class OsService extends Service {

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

OsService.toString = () => '[class OsService]';
module.exports = OsService;  