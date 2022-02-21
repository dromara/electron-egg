'use strict';

const Service = require('egg').Service;
const EeSocket = require('ee-core').Socket.EeSocket;
const socketClient = EeSocket.getClient();

class ExampleService extends Service {

  async testElectronApi(id = 0) {
    const res = await socketClient.call('controller.example.test', {name:"gsx"}, {age:12});

    return null;
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

  async autoLaunchEnable() {
    const callResult = await socketClient.call('controller.example.autoLaunchEnable');

    return callResult.data;
  }

  async autoLaunchDisable() {
    const callResult = await socketClient.call('controller.example.autoLaunchDisable');

    return callResult.data;
  }

  async autoLaunchIsEnabled() {
    const callResult = await socketClient.call('controller.example.autoLaunchIsEnabled');

    return callResult.data;
  }

  async openSoftware(softName) {
    const callResult = await socketClient.call('controller.example.openSoftware', softName);
    
    return callResult.data;
  }

  async messageShow() {
    await socketClient.call('controller.example.messageShow');

    return true;
  } 

  async messageShowConfirm() {
    await socketClient.call('controller.example.messageShowConfirm');

    return true;
  }   

  async loadExtension(filePath) {

    await socketClient.call('controller.example.loadExtension', filePath);

    return true;
  }
}

module.exports = ExampleService;