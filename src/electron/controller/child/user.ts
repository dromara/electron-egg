'use strict';

/**
 * user
 * @class
 */
class UserController {

  /**
   * test
   */
  async test () {
    return 'hello electron-egg';
  }
}

UserController.toString = () => '[class UserController]';
module.exports = UserController;  