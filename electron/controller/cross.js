'use strict';

const { Controller } = require('ee-core');
const Cross = require('ee-core/cross');
const Log = require('ee-core/log');
const HttpClient = require('ee-core/httpclient');
const Services = require('ee-core/services');

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
    const serverUrl = Cross.getUrl(name);
    return serverUrl;
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
   */   
  async createServer(args) {
    const { program } = args;
    if (program == 'go') {
      Services.get('cross').createGoServer();
    } else if (program == 'java') {
      Services.get('cross').createJavaServer();
    }

    return;
  }

  /**
   * Access the api for the cross service
   */
  async requestApi(args) {
    const { name, urlPath, params} = args;
    const hc = new HttpClient();
    const serverUrl = Cross.getUrl(name);
    console.log('Server Url:', serverUrl);

    const apiHello = serverUrl + urlPath;
    const options = {
      method: 'GET',
      data: params || {},
      dataType: 'json',
      timeout: 1000,  
    };
    const result = await hc.request(apiHello, options);

    return result.data;
  }
}

CrossController.toString = () => '[class CrossController]';
module.exports = CrossController;  