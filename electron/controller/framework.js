'use strict';


/**
 * electron-egg framework - 功能demo
 * @class
 */
class FrameworkController extends Controller {

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

    // let tmpDir = Ps.getLogDir();
    // Log.info('tmpDir:', tmpDir);

    let mid = await Utils.machineIdSync(true);
    Log.info('mid 11111111:', mid);

    Utils.machineId().then((id) => {
      Log.info('mid 222222222:', id);
    });

    return result;
  }

}

FrameworkController.toString = () => '[class FrameworkController]';
module.exports = FrameworkController;  