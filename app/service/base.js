'use strict';

const request = require('superagent');
const Service = require('egg').Service;

class BaseService extends Service {
  /*
   * ipc call
   */
  async ipcCall(method = '', data = {}) {
    if (!method) {
      return 'Method does not exist';
    }
    const res = {};
    const port = this.service.storage.getElectronIPCPort();
    const url  = 'localhost:' + port + '/send';
    try {
      res = await request.post(url)
        .send({ cmd: method, data: data });
      console.log(res);
    } catch (err) {
      console.error(err);
    }

    return res;
  }
}

module.exports = BaseService;
