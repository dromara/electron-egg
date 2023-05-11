'use strict';

const { Controller } = require('ee-core');

/**
 * 硬件设备 - 功能demo
 * @class
 */
class HardwareController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

}

HardwareController.toString = () => '[class HardwareController]';
module.exports = HardwareController;  