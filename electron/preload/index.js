/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

const Jobs = require('ee-core/module/jobs');
const Utils = require('ee-core/module/utils');
const Log = require('ee-core/module/log');
const test = require('./test');

/**
 * 预加载模块入口
 * @param {Object} app - 全局app对象
 */
module.exports = async (app) => {

  //已实现的功能模块，可选择性使用和修改
  const trayAddon = app.addon.tray;
  const securityAddon = app.addon.security;
  const awakenAddon = app.addon.awaken;
  const autoUpdaterAddon = app.addon.autoUpdater;
  
  trayAddon.create();
  securityAddon.create();
  awakenAddon.create();
  autoUpdaterAddon.create();

  Log.info("[main] process type: ", Utils.processType());
  Log.info("[main] process cwd: ", process.cwd());

  test();

  let opt1 = {
    dev: true,
    type: 'child', // renderer 
    path: './jobs/example.js',
    childOptions: {}
  }
  let myJob = new Jobs();
  myJob.create('exampleJob', opt1);

  // let opt2 = {
  //   dev: true,
  //   type: 'renderer', // renderer 
  //   path: 'example.js',
  //   winOptions: {
  //     show: true
  //   },
  //   childOptions: {}
  // }
  // myJob.create('exampleJob', opt2);
}