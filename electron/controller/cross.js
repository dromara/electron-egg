'use strict';

const { Controller } = require('ee-core');
const Cross = require('ee-core/cross');
const Log = require('ee-core/log');
const HttpClient = require('ee-core/httpclient');

/**
 * Cross
 * @class
 */
class CrossController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  async test() {
    const pids = Cross.getPids();
    Log.info('cross pids:', pids);

    pids.forEach(pid => {
      let entity = Cross.getProc(pid);
      Log.info('server name:', entity.name);
      Log.info('server config:', entity.config);
      Log.info('server args:', entity.getArgsObj());
    })

    return 'hello electron-egg';
  }

  async getUrl(args) {
    const { name } = args;
    const goUrl = Cross.getUrl(name);

    const entity = Cross.getProcByName(name);
    entity.child.on('close', (code, signal) => {
      Log.info(`server close event code:${code}, signal: ${signal}`);

    })

    return goUrl;
  }

  async killServer(args) {
    const { name } = args;
    Cross.killByName(name);

    return;
  }

  async createServer(args) {
    const { name } = args;
    const entity = Cross.run(name);
    Log.info('server name:', entity.name);
    Log.info('server config:', entity.config);
    Log.info('server args:', entity.getArgsObj());
    Log.info('server url:', Cross.getUrl(name));

    return;
  }

  async killAllServer() {
    Cross.killAll();
    return;
  }

  /**
   * Access the api for the cross service
   */
  async requestApi(args) {
    const { name } = args;
    const hc = new HttpClient();
    const serverUrl = Cross.getUrl(name);
    console.log('Server Url:', serverUrl);

    const apiHello = serverUrl + '/api/hello'
    const options = {
      method: 'GET',
      data: {},
      dataType: 'json',
      timeout: 1000,  
    };
    const result = await hc.request(apiHello, options);

    return result.data;
  }
}

CrossController.toString = () => '[class CrossController]';
module.exports = CrossController;  