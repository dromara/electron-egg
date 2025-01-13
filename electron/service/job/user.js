'use strict';

const { logger } = require('ee-core/log');

// The service used in the job should not rely on Electron's API, as it may cause errors
class UserService {

  /**
   * hello
   */
  async hello(args) {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('UserService obj:', obj);

    return obj;
  }

}
UserService.toString = () => '[class UserService]';

module.exports = {
  UserService
};  