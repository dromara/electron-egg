'use strict';

/**
 * example
 * @class
 */
class FrameworkController {

  /**
   * test
   */
  async test () {
    return 'hello electron-egg';
  }
}

FrameworkController.toString = () => '[class FrameworkController]';
module.exports = FrameworkController;  