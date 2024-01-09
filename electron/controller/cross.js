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
   * View process service information
   */
  info() {
    const pids = Cross.getPids();
    Log.info('cross pids:', pids);

    let num = 1;
    pids.forEach(pid => {
      let entity = Cross.getProc(pid);
      Log.info(`server-${num} name:${entity.name}`);
      Log.info(`server-${num} config:`, entity.config);
      num++;
    })

    return 'hello electron-egg';
  }

  /**
   * Get service url
   */  
  async getUrl(args) {
    const { name } = args;
    const goUrl = Cross.getUrl(name);

    const entity = Cross.getProcByName(name);
    entity.child.on('close', (code, signal) => {
      Log.info(`server close event code:${code}, signal: ${signal}`);

    })

    return goUrl;
  }

  /**
   * kill service
   * By default (modifiable), killing the process will exit the electron application.
   */  
  async killServer(args) {
    const { type, name } = args;
    if (type == 'all') {
      Cross.killAll();
    } else {
      Cross.killByName(name);
    }

    return;
  }

  /**
   * create service
   * In the default configuration, services can be started with applications. 
   * Developers can turn off the configuration and create it manually.
   */   
  async createServer(args) {
    const { service } = args;
    const entity = await Cross.run(service);
    Log.info('server name:', entity.name);
    Log.info('server config:', entity.config);
    Log.info('server url:', Cross.getUrl(entity.name));

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