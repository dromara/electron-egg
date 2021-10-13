'use strict';

const BaseService = require('./base');

class ExampleService extends BaseService {
  async openLocalDir(dir) {
    const self = this;

    await self.ipcCall('example.openDir', dir);

    return true;
  }

  async executeJS(str) {
    const self = this;
    let result = await self.ipcCall('example.executeJS', str);
    return result;
  }

  async setShortcut(shortcutStr) {
    const self = this;
    let result = await self.ipcCall('example.setShortcut', shortcutStr);
    return result;
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
    const callResult = await this.ipcCall('example.autoLaunchEnable');

    return callResult.data;
  }

  async autoLaunchDisable() {
    const callResult = await this.ipcCall('example.autoLaunchDisable');

    return callResult.data;
  }

  async autoLaunchIsEnabled() {
    const callResult = await this.ipcCall('example.autoLaunchIsEnabled');

    return callResult.data;
  }

  async openSoftware(softName) {
    const callResult = await this.ipcCall('example.openSoftware', softName);
    
    return callResult.data;
  }

  async selectDir() {
    const result = await this.ipcCall('example.selectDir');
    if (!result.data) {
      return '';
    }

    return result.data;
  }

  async testElectronApi(id = 0) {
    await this.ipcCall('example.testElectronApi');

    return null;
  }

  async messageShow() {
    await this.ipcCall('example.messageShow');

    return true;
  } 

  async messageShowConfirm() {
    await this.ipcCall('example.messageShowConfirm');

    return true;
  }   

  async loadExtension(filePath) {
    const self = this;

    await self.ipcCall('example.loadExtension', filePath);

    return true;
  }
}

module.exports = ExampleService;