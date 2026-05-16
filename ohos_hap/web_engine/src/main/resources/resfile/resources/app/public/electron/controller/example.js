'use strict';

/**
 * example
 * @class
 */
class ExampleController {

  /**
   * test
   */
  async test () {
    return 'hello electron-egg';
  }
}
ExampleController.toString = () => '[class ExampleController]';

module.exports = ExampleController;  