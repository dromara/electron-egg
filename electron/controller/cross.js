'use strict';

const { Controller } = require('ee-core');
const Cross = require('ee-core/cross');
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

  /**
   * Access the api for the go service
   */
  async requestGoApi() {

    const hc = new HttpClient();
    const goUrl = Cross.getUrl('go');
    console.log('goUrl:', goUrl);

    const apiHello = goUrl + '/api/hello'
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