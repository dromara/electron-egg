'use strict';

/**
 * school
 * @class
 */
class SchoolController {

  /**
   * test
   */
  async test () {
    return 'hello electron-egg';
  }
}

SchoolController.toString = () => '[class SchoolController]';
module.exports = SchoolController;  