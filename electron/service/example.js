'use strict';

const { Service } = require('ee-core');
const Log = require('ee-core/log');

/**
 * 示例服务
 * @class
 */
class ExampleService extends Service {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * test
   */
  async test (args) {
    let obj = {
      status:'ok',
      params: args
    }

    return obj;
  }

  /**
   * 上传到smms
   */
  async uploadFileToSMMS(tmpFile) {
    const res = {
      code: 1000,
      message: 'unknown error',
    };

    try {
      const headersObj = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'aaaaaaaaaaaaa' // 请修改这个token，用你自己的账号token
      };
      const url = 'https://sm.ms/api/v2/upload';
      const response = await this.app.curl(url, {
        method: 'POST',
        headers: headersObj,
        files: {
          smfile: tmpFile,
        },
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      if (this.app.config.env === 'local') {
        Log.info('[ExampleService] [uploadFileToSMMS]: info result:%j', result);
      }
      if (result.code !== 'success') {
        Log.error('[ExampleService] [uploadFileToSMMS]: res error result:%j', result);
      }
      return result;
    } catch (e) {
      Log.error('[ExampleService] [uploadFileToSMMS]:  ERROR ', e);
    }

    return res;
  }    
}

ExampleService.toString = () => '[class ExampleService]';
module.exports = ExampleService;