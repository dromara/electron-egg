'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
const Addon = require('ee-core/addon');

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

    const result1 = await Services.get('example').test('electron');
    Log.info('service result1:', result1);

    Services.get('framework').test('electron');

    return 'hello electron-egg';
  }

  /**
   * test
   */
  async testUtils () {
    let mid = await Utils.machineIdSync(true);
    Log.info('mid 11111111:', mid);

    Utils.machineId().then((id) => {
      Log.info('mid 222222222:', id);
    });

    return;
  } 
  
  /**
   * test
   */
  async testService () {
    const serviceResult2 = await Services.get('example').test('electron');
    Log.info('service result2:', serviceResult2);

    return;
  }
  
  /**
   * test
   */
  async testAddon () {
    const trayResult2 = Addon.get('tray').hello();
    Log.info('addon result2:', trayResult2);

    return;
  } 

}

ExampleController.toString = () => '[class ExampleController]';
module.exports = ExampleController;  