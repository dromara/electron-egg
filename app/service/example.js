'use strict';

const BaseService = require('./base');
const fs = require('fs');
const path = require('path');

class ExampleService extends BaseService {
  async openLocalDir(dir) {
    const self = this;

    await self.ipcCall('example.openDir', dir);

    return true;
  }

  async getSMMSToken() {
    const res = {
      code: 1000,
      message: 'unknown error',
    };

    try {
      //throw new Error('Sync Error');
      params = {
        username: '',
        password: ''
      };
      const url = 'https://sm.ms/api/v2/token';
      const response = await this.app.curl(url, {
        method: 'POST',
        contentType: 'application/json',
        data: params,
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      if (this.app.config.env === 'local') {
        this.app.logger.info('[ExampleService] [getSMMSToken]: info result:%j', result);
      }
      // this.app.logger.info('[OutapiService] [api]: result:%j', result);
      if (result.code !== 'success') {
        this.app.logger.error('[ExampleService] [getSMMSToken]: res error result:%j', result);
      }
      return result;
    } catch (e) {
      this.app.logger.error('[ExampleService] [getSMMSToken]:  ERROR ', e);
    }

    return res;
  }
  async uploadFileToSMMS(tmpFile) {
    const res = {
      code: 1000,
      message: 'unknown error',
    };

    try {
      //throw new Error('Sync Error');
      const headersObj = {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'pHVaIfVX8kgxsEL2THTYMVzJDYY3MMZU'
      };
      const url = 'https://sm.ms/api/v2/upload';
      const response = await this.app.curl(url, {
        method: 'POST',
        headers: headersObj,
        files: {
          smfile: tmpFile,
        },
        //contentType: 'application/json',
        //data: params,
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      if (this.app.config.env === 'local') {
        this.app.logger.info('[ExampleService] [uploadFileToSMMS]: info result:%j', result);
      }
      if (result.code !== 'success') {
        this.app.logger.error('[ExampleService] [uploadFileToSMMS]: res error result:%j', result);
      }
      return result;
    } catch (e) {
      this.app.logger.error('[ExampleService] [uploadFileToSMMS]:  ERROR ', e);
    }

    return res;
  }
}

module.exports = ExampleService;