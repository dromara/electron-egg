'use strict';

const Service = require('egg').Service;

class BaseService extends Service {

  /*
   * ipc call
   */
  async ipcCall(method = '', ...params) {
    let result = {
      err: null,
      data: null
    };
    if (!method) {
      result.err = 'Method does not exist';
      return result;
    }

    try {
      result = await this.service.socket.call(method, params);
    } catch (err) {
      this.app.logger.error('[base] [ipcCall] request error:', err);
      result.err = 'request err';
    }
    this.app.logger.info('[base] [ipcCall] result:', result);

    return result;
  }

  /*
   * ipc call
   */
  // async ipcCall(method = '', ...params) {
  //   let result = {
  //     err: null,
  //     data: null
  //   };
  //   if (!method) {
  //     result.err = 'Method does not exist';
  //     return result;
  //   }

  //   const port = this.service.storage.getElectronIPCPort();
  //   const url  = 'http://localhost:' + port + '/send';
  //   try {
  //     const response = await request.post(url)
  //       .send({ cmd: method, params: params })
  //       .set('accept', 'json');
        
  //       result = JSON.parse(response.text);  
  //   } catch (err) {
  //     this.app.logger.error('[base] [ipcCall] request error:', err);
  //     result.err = 'request err';
  //   }
  //   this.app.logger.info('[base] [ipcCall] result:', result);

  //   return result;
  // }
}

module.exports = BaseService;
