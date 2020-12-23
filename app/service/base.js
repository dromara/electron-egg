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
    let result = {
      code: 0,
      data: null
    };
    const port = this.service.storage.getElectronIPCPort();
    const url  = 'localhost:' + port + '/send';

    try {
      const response = await request.post(url)
        .send({ cmd: method, data: data })
        .set('accept', 'json');
        
        result = JSON.parse(response.text);  
    } catch (err) {
      ELog.error('[base] [ipcCall] request error:', err);
      result.code = -10;
    }

    return result;
  }
}

module.exports = BaseService;
