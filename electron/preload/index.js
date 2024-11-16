/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/
const Addon = require('ee-core/addon');
<<<<<<< HEAD

/**
* 预加载模块入口
*/
module.exports = async () => {

  // 示例功能模块，可选择性使用和修改
  Addon.get('tray').create();
  Addon.get('security').create();
=======
const Services = require('ee-core/services');

/**
 * 预加载模块入口
 */
module.exports = async () => {

  // 已实现的功能模块，可选择性使用和修改
  Addon.get('tray').create();
  Addon.get('security').create();
  Addon.get('awaken').create();
  Addon.get('autoUpdater').create();

  //Services.get('cross').createGoServer();
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
}