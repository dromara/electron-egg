'use strict';

const Log = require('ee-core/log');

/**
 * job 中使用的 service 不要继承 const { Service } = require('ee-core')
 * 因为 Service 中会依赖 electron 的 api 导致错误
 * @class
 */
class UserService {

  /**
   * hello
   */
  async hello(args) {
    let obj = {
      status:'ok',
      params: args
    }
    Log.info('UserService obj:', obj);

    return obj;
  }

}

UserService.toString = () => '[class UserService]';
module.exports = UserService;  