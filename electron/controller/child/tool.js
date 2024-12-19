'use strict';

/**
 * tool
 * @class
 */
class ToolController {

  /**
   * test
   */
  async test () {
    return 'hello electron-egg';
  }
}

ToolController.toString = () => '[class ToolController]';
module.exports = ToolController;  