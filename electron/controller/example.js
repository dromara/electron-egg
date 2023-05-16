'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');

/**
 * example
 * @class
 */
class ExampleController extends Controller {

  constructor(ctx) {
    super(ctx);
  }


  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test () {
    const result = await this.service.example.test('electron');

    let tmpDir = Ps.getLogDir();
    Log.info('tmpDir:', tmpDir);

    return result;
  }
}

ExampleController.toString = () => '[class ExampleController]';
module.exports = ExampleController;  