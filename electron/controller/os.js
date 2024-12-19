'use strict';

/**
 * example
 * @class
 */
class OsController {

  /**
   * test
   */
  async test () {
    return 'hello electron-egg';
  }
}

OsController.toString = () => '[class OsController]';
module.exports = OsController;  