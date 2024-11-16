'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
<<<<<<< HEAD
=======
const Addon = require('ee-core/addon');
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c

/**
 * example
 * @class
 */
class ExampleController extends Controller {

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test () {
<<<<<<< HEAD
    const result = await Services.get('example').test('electron');
    Log.info('service result:', result);

    return 'hello electron-egg';
=======

    // const result1 = await Services.get('example').test('electron');
    // Log.info('service result1:', result1);

    Services.get('example').test('electron');

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
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
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